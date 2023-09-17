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

    // If we have no scope, then try to connect
    if nscope_handle.device.is_none() {
        nscope_handle.bench.refresh();
        if let Ok(mut scope) = nscope_handle.bench.open_first_available(true) {
            scope.ch1.turn_on();
            scope.ch2.turn_off();
            scope.ch3.turn_off();
            scope.ch4.turn_off();
            nscope_handle.device = Some(scope);
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
    }

    Ok(power_status)
}
