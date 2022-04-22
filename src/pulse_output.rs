use neon::prelude::*;
use nscope::PulseOutput;

use crate::{JsNscopeHandle, Objectify};

impl Objectify for PulseOutput {
    fn to_object<'a>(&self, cx: &mut FunctionContext<'a>) -> JsResult<'a, JsObject> {
        let obj = cx.empty_object();

        let is_on = cx.boolean(self.is_on);
        obj.set(cx, "isOn", is_on)?;

        let frequency = cx.number(self.frequency);
        obj.set(cx, "frequency", frequency)?;

        let duty = cx.number(self.duty * 100.);
        obj.set(cx, "duty", duty)?;

        Ok(obj)
    }
}

pub fn get_px_status(mut cx: FunctionContext) -> JsResult<JsObject> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let nscope_handle = js_nscope_handle.borrow();

    let px_status = cx.empty_object();

    if let Some(nscope) = &nscope_handle.scope {
        if nscope.is_connected() {
            for ch in 0..2 {
                let channel_name = format!("P{}", ch + 1);
                let pulse_output = nscope.get_px(ch);

                let channel_status = pulse_output.to_object(&mut cx)?;
                px_status.set(&mut cx, channel_name.as_str(), channel_status)?;
            }
        }
    }

    Ok(px_status)
}

pub fn set_px_on(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let turn_on = cx.argument::<JsBoolean>(2)?.value(&mut cx);
    let nscope_handle = js_nscope_handle.borrow();

    if let Some(nscope) = &nscope_handle.scope {
        if nscope.is_connected() {

            let ch = match channel.as_str() {
                "P1" => 0,
                "P2" => 1,
                _ => panic!("Invalid channel string")
            };
            nscope.set_px_on(ch, turn_on);
        }
    }

    Ok(cx.null())
}

pub fn set_px_frequency_hz(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let frequeny = cx.argument::<JsNumber>(2)?.value(&mut cx);
    let nscope_handle = js_nscope_handle.borrow();

    if let Some(nscope) = &nscope_handle.scope {
        if nscope.is_connected() {

            let ch = match channel.as_str() {
                "P1" => 0,
                "P2" => 1,
                _ => panic!("Invalid channel string")
            };
            nscope.set_px_frequency_hz(ch, frequeny);
        }
    }

    Ok(cx.null())
}

pub fn set_px_duty(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let duty = cx.argument::<JsNumber>(2)?.value(&mut cx) / 100.;
    let nscope_handle = js_nscope_handle.borrow();

    if let Some(nscope) = &nscope_handle.scope {
        if nscope.is_connected() {

            let ch = match channel.as_str() {
                "P1" => 0,
                "P2" => 1,
                _ => panic!("Invalid channel string")
            };
            nscope.set_px_duty(ch, duty);
        }
    }

    Ok(cx.null())
}