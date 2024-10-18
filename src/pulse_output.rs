use neon::prelude::*;
use nlabapi::PulseOutput;

use crate::{JsNscopeHandle, Objectify};

impl Objectify for PulseOutput {
    fn to_object<'a>(&self, cx: &mut FunctionContext<'a>) -> JsResult<'a, JsObject> {
        let obj = cx.empty_object();

        let is_on = cx.boolean(self.is_on());
        obj.set(cx, "isOn", is_on)?;

        let frequency = cx.number(self.frequency());
        obj.set(cx, "frequency", frequency)?;

        let duty = cx.number(self.duty() * 100.);
        obj.set(cx, "duty", duty)?;

        Ok(obj)
    }
}

pub fn get_px_status(mut cx: FunctionContext) -> JsResult<JsObject> {
    let js_nlab_handle = cx.argument::<JsNscopeHandle>(0)?;
    let nlab_handle = js_nlab_handle.borrow();

    let px_status = cx.empty_object();

    if let Some(nlab) = &nlab_handle.device {
        if nlab.is_connected() {
            for ch in 1..=2 {
                let channel_name = format!("P{}", ch);
                if let Some(pulse_output) = nlab.pulse_output(ch) {
                    let channel_status = pulse_output.to_object(&mut cx)?;
                    px_status.set(&mut cx, channel_name.as_str(), channel_status)?;
                }
            }
        }
    }

    Ok(px_status)
}

pub fn set_px_on(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nlab_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let turn_on = cx.argument::<JsBoolean>(2)?.value(&mut cx);
    let nlab_handle = js_nlab_handle.borrow();

    if let Some(nlab) = &nlab_handle.device {
        if nlab.is_connected() {
            let pulse_output = match channel.as_str() {
                "P1" => &nlab.p1,
                "P2" => &nlab.p2,
                _ => panic!("Invalid channel string")
            };
            if turn_on {
                pulse_output.turn_on();
            } else {
                pulse_output.turn_off();
            }
        }
    }

    Ok(cx.null())
}

pub fn set_px_frequency_hz(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nlab_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let frequency = cx.argument::<JsNumber>(2)?.value(&mut cx);
    let nlab_handle = js_nlab_handle.borrow();

    if let Some(nlab) = &nlab_handle.device {
        if nlab.is_connected() {
            let pulse_output = match channel.as_str() {
                "P1" => &nlab.p1,
                "P2" => &nlab.p2,
                _ => panic!("Invalid channel string")
            };
            pulse_output.set_frequency(frequency);
        }
    }

    Ok(cx.null())
}

pub fn set_px_duty(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nlab_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let duty = cx.argument::<JsNumber>(2)?.value(&mut cx) / 100.;
    let nlab_handle = js_nlab_handle.borrow();

    if let Some(nlab) = &nlab_handle.device {
        if nlab.is_connected() {
            let pulse_output = match channel.as_str() {
                "P1" => &nlab.p1,
                "P2" => &nlab.p2,
                _ => panic!("Invalid channel string")
            };
            pulse_output.set_duty(duty);
        }
    }

    Ok(cx.null())
}