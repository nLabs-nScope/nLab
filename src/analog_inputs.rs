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
                if let Some(analog_input) = nscope.channel(ch) {
                    let channel_status = analog_input.to_object(&mut cx)?;
                    ch_status.set(&mut cx, channel_name.as_str(), channel_status)?;
                }
            }
        }
    }

    Ok(ch_status)
}

pub fn get_sampling_channels(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let nscope_handle = js_nscope_handle.borrow();

    let mut num_channels_on: usize = 0;

    if let Some(nscope) = &nscope_handle.device {
        if nscope.is_connected() {
            for ch in 1..=4 {
                if let Some(analog_input) = nscope.channel(ch) {
                    if analog_input.is_on() {
                        num_channels_on += 1;
                    }
                }
            }
        }
    }

    match num_channels_on {
        0..=1 => Ok(cx.number(1)),
        2 => Ok(cx.number(2)),
        3..=4 => Ok(cx.number(4)),
        _ => Ok(cx.number(4))
    }
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

pub fn set_ch_range(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let vmin = cx.argument::<JsNumber>(2)?.value(&mut cx);
    let vmax = cx.argument::<JsNumber>(3)?.value(&mut cx);
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

            let vmid = (vmin + vmax) / 2.0;
            let range = (vmax - vmin).clamp(0.5, 10.0);
            let lower_end = (vmid - range / 2.0).clamp(-5.0, 5.0 - range);
            let upper_end = lower_end + range;
            scope_channel.set_range(lower_end, upper_end);
        }
    }

    Ok(cx.null())
}