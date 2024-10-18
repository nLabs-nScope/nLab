use neon::prelude::*;
use crate::JsNlabHandle;
use log::{info, trace};

pub fn is_connected(mut cx: FunctionContext) -> JsResult<JsBoolean> {
    let js_nlab_handle = cx.argument::<JsNlabHandle>(0)?;
    let nlab_handle = js_nlab_handle.borrow();

    if let Some(nlab) = &nlab_handle.device {
        if nlab.is_connected() {
            return Ok(cx.boolean(true));
        }
    }

    Ok(cx.boolean(false))
}

pub fn monitor_nlab(mut cx: FunctionContext) -> JsResult<JsObject> {
    trace!("monitoring nLab");
    let js_nlab_handle = cx.argument::<JsNlabHandle>(0)?;
    trace!("got a js nlab handle");
    let mut nlab_handle = js_nlab_handle.borrow_mut();
    trace!("got a native nlab handle");

    // If we have a scope already, check to see if it's disconnected
    if let Some(scope) = &nlab_handle.device {
        trace!("found a scope");
        if !scope.is_connected() {
            info!("scope disconnected");
            nlab_handle.device = None
        }
    }

    // If we are in dfu mode already, check to see if we still are
    if let Some(dfu) = nlab_handle.dfu_link.take() {
        trace!("found a scope in DFU mode");
        nlab_handle.requested_dfu = false;
        nlab_handle.dfu_link = dfu.validate();
    }

    // If we have no scope, and we're not in DFU mode then try to connect to something
    if nlab_handle.device.is_none() && nlab_handle.dfu_link.is_none() {
        trace!("Found no scopes, searching...");
        nlab_handle.bench.refresh();

        if let Ok(mut scope) = nlab_handle.bench.open_first_available(true) {
            info!("scope connected");
            scope.ch1.turn_on();
            scope.ch2.turn_off();
            scope.ch3.turn_off();
            scope.ch4.turn_off();
            nlab_handle.device = Some(scope);
        } else if let Some(link) = nlab_handle.bench.get_first_in_dfu() {
            info!("scope connected in DFU mode");
            nlab_handle.dfu_link = Some(link);
        } else if let Some(link) = nlab_handle.bench.get_first_needing_update() {
            info!("scope connected and needs DFU");
            if link.request_dfu().is_ok() {
                nlab_handle.requested_dfu = true;
            }

        }
    }

    // Finally, let's retrieve the power status from the scope if we can
    let power_status = cx.empty_object();

    if let Some(scope) = &nlab_handle.device {
        trace!("Getting power status from connected scope");
        if let Ok(status) = scope.power_status() {
            let state = cx.string(format!("{:?}", status.state));
            let usage = cx.number(status.usage);

            power_status.set(&mut cx, "state", state)?;
            power_status.set(&mut cx, "usage", usage)?;
        }
    } else if nlab_handle.dfu_link.is_some() || nlab_handle.requested_dfu {
        trace!("Scope is currently in DFU");
        let state = cx.string("DFU");
        power_status.set(&mut cx, "state", state)?;
    }
    Ok(power_status)
}
