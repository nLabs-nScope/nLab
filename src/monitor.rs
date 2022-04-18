use neon::prelude::*;

use crate::JsNscopeHandle;

pub(crate) fn monitor_nscope(mut cx: FunctionContext) -> JsResult<JsObject> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let mut nscope_handle = js_nscope_handle.borrow_mut();


    // If we have a scope already, check to see if it's disconnected
    if let Some(scope) = &nscope_handle.scope {
        if !scope.is_connected() {
            nscope_handle.scope = None
        }
    }

    // If we have no scope, then try to connect
    if nscope_handle.scope.is_none() {
        nscope_handle.bench.refresh();
        if let Ok(scope) = nscope_handle.bench.open_first_available() {
            nscope_handle.scope = Some(scope);
        }
    }
    
    // Finally, let's retrieve the power status from the scope if we can
    let power_status = cx.empty_object();

    if let Some(scope) = &nscope_handle.scope {
        let status = scope.power_status().expect("hello");

        let state = cx.string(format!("{:?}",status.state));
        let usage = cx.number(status.usage);

        power_status.set(&mut cx, "state", state)?;
        power_status.set(&mut cx, "usage", usage)?;
    }

    Ok(power_status)
}
