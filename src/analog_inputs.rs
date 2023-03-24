use neon::prelude::*;
use nscope::AnalogInput;

use crate::{JsNscopeHandle, Objectify};

impl Objectify for AnalogInput {
    fn to_object<'a>(&self, cx: &mut FunctionContext<'a>) -> JsResult<'a, JsObject> {
        let obj = cx.empty_object();

        let is_on = cx.boolean(self.is_on());
        obj.set(cx, "isOn", is_on)?;

        Ok(obj)
    }
}

pub fn get_ch_status(mut cx: FunctionContext) -> JsResult<JsObject> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let nscope_handle = js_nscope_handle.borrow();

    let ch_status = cx.empty_object();

    if let Some(nscope) = &nscope_handle.device {
        if nscope.is_connected() {
            for ch in 1..=4 {
                let channel_name = format!("Ch{}", ch);
                if let Some(pulse_output) = nscope.channel(ch) {
                    let channel_status = pulse_output.to_object(&mut cx)?;
                    ch_status.set(&mut cx, channel_name.as_str(), channel_status)?;
                }
            }
        }
    }

    Ok(ch_status)
}

pub fn set_ch_on(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let turn_on = cx.argument::<JsBoolean>(2)?.value(&mut cx);
    let mut nscope_handle = js_nscope_handle.borrow_mut();

    if let Some(nscope) = &mut nscope_handle.device {
        if nscope.is_connected() {
            let scope_channel = match channel.as_str() {
                "Ch1" => &mut nscope.ch1,
                "Ch2" => &mut nscope.ch2,
                "Ch3" => &mut nscope.ch3,
                "Ch4" => &mut nscope.ch4,
                _ => panic!("Invalid channel string"),
            };
            if turn_on {
                scope_channel.turn_on();
            } else {
                scope_channel.turn_off();
            }
        }
    }

    Ok(cx.null())
}