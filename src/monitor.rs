use neon::prelude::*;
use crate::JsNscopeHandle;
use log::{info, trace};

pub fn is_connected(mut cx: FunctionContext) -> JsResult<JsBoolean> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let nscope_handle = js_nscope_handle.borrow();

    if let Some(nscope) = &nscope_handle.device {
        if nscope.is_connected() {
            return Ok(cx.boolean(true));
        }
    }

    Ok(cx.boolean(false))
}

pub fn monitor_nscope(mut cx: FunctionContext) -> JsResult<JsObject> {
    trace!("monitoring nScope");
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    trace!("got a js nscope handle");
    let mut nscope_handle = js_nscope_handle.borrow_mut();
    trace!("got a native nscope handle");

    // If we have a scope already, check to see if it's disconnected
    if let Some(scope) = &nscope_handle.device {
        trace!("found a scope");
        if !scope.is_connected() {
            info!("scope disconnected");
            nscope_handle.device = None
        }
    }

    // If we are in dfu mode already, check to see if we still are
    if let Some(dfu) = nscope_handle.dfu_link.take() {
        trace!("found a scope in DFU mode");
        nscope_handle.requested_dfu = false;
        nscope_handle.dfu_link = dfu.validate();
    }

    // If we have no scope, and we're not in DFU mode then try to connect to something
    if nscope_handle.device.is_none() && nscope_handle.dfu_link.is_none() {
        trace!("Found no scopes, searching...");
        nscope_handle.bench.refresh();

        if let Ok(mut scope) = nscope_handle.bench.open_first_available(true) {
            info!("scope connected");
            scope.ch1.turn_on();
            scope.ch2.turn_off();
            scope.ch3.turn_off();
            scope.ch4.turn_off();
            nscope_handle.device = Some(scope);
        } else if let Some(link) = nscope_handle.bench.get_first_in_dfu() {
            info!("scope connected in DFU mode");
            nscope_handle.dfu_link = Some(link);
        } else if let Some(link) = nscope_handle.bench.get_first_needing_update() {
            info!("scope connected and needs DFU");
            if link.request_dfu().is_ok() {
                nscope_handle.requested_dfu = true;
            }

        }
    }

    // Finally, let's retrieve the power status from the scope if we can
    let power_status = cx.empty_object();

    if let Some(scope) = &nscope_handle.device {
        trace!("Getting power status from connected scope");
        if let Ok(status) = scope.power_status() {
            let state = cx.string(format!("{:?}", status.state));
            let usage = cx.number(status.usage);

            power_status.set(&mut cx, "state", state)?;
            power_status.set(&mut cx, "usage", usage)?;
        }
    } else if nscope_handle.dfu_link.is_some() || nscope_handle.requested_dfu {
        trace!("Scope is currently in DFU");
        let state = cx.string("DFU");
        power_status.set(&mut cx, "state", state)?;
    }
    Ok(power_status)
}
