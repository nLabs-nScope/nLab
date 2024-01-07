use neon::prelude::*;
use crate::JsNscopeHandle;

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
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let mut nscope_handle = js_nscope_handle.borrow_mut();

    // If we have a scope already, check to see if it's disconnected
    if let Some(scope) = &nscope_handle.device {
        if !scope.is_connected() {
            nscope_handle.device = None
        }
    }

    // If we are in dfu mode already, check to see if we still are
    if let Some(dfu) = nscope_handle.dfu_link.take() {
        nscope_handle.requested_dfu = false;
        nscope_handle.dfu_link = dfu.validate();
    }

    // If we have no scope, and we're not in DFU mode then try to connect to something
    if nscope_handle.device.is_none() && nscope_handle.dfu_link.is_none() {
        nscope_handle.bench.refresh();

        if let Ok(mut scope) = nscope_handle.bench.open_first_available(true) {
            scope.ch1.turn_on();
            scope.ch2.turn_off();
            scope.ch3.turn_off();
            scope.ch4.turn_off();
            nscope_handle.device = Some(scope);
        } else if let Some(link) = nscope_handle.bench.get_first_in_dfu() {
            nscope_handle.dfu_link = Some(link);
        } else if let Some(link) = nscope_handle.bench.get_first_needing_update() {
            if link.request_dfu().is_ok() {
                nscope_handle.requested_dfu = true;
            }

        }
    }

    // Finally, let's retrieve the power status from the scope if we can
    let power_status = cx.empty_object();

    if let Some(scope) = &nscope_handle.device {
        let status = scope.power_status().expect("Cannot retrieve power status");

        let state = cx.string(format!("{:?}", status.state));
        let usage = cx.number(status.usage);

        power_status.set(&mut cx, "state", state)?;
        power_status.set(&mut cx, "usage", usage)?;
    } else if nscope_handle.dfu_link.is_some() || nscope_handle.requested_dfu {
        let state = cx.string("DFU");
        power_status.set(&mut cx, "state", state)?;
    }
    Ok(power_status)
}
