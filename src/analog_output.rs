use std::str::FromStr;
use neon::prelude::*;
use nscope::{AnalogOutput, AnalogSignalPolarity, AnalogWaveType};

use crate::{JsNscopeHandle, Objectify};

impl Objectify for AnalogOutput {
    fn to_object<'a>(&self, cx: &mut FunctionContext<'a>) -> JsResult<'a, JsObject> {
        let obj = cx.empty_object();

        let is_on = cx.boolean(self.is_on());
        obj.set(cx, "isOn", is_on)?;

        let frequency = cx.number(self.frequency());
        obj.set(cx, "frequency", frequency)?;

        let amplitude = cx.number(self.amplitude());
        obj.set(cx, "amplitude", amplitude)?;

        let wave_type = cx.string(format!("{:?}", self.wave_type()));
        obj.set(cx, "waveType", wave_type)?;

        let polarity = cx.string(format!("{:?}", self.polarity()));
        obj.set(cx, "polarity", polarity)?;

        Ok(obj)
    }
}

pub fn get_ax_status(mut cx: FunctionContext) -> JsResult<JsObject> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let nscope_handle = js_nscope_handle.borrow();

    let ax_status = cx.empty_object();

    if let Some(nscope) = &nscope_handle.device {
        if nscope.is_connected() {
            for ch in 1..=2 {
                let channel_name = format!("A{}", ch);
                if let Some(analog_output) = nscope.analog_output(ch) {
                    let channel_status = analog_output.to_object(&mut cx)?;
                    ax_status.set(&mut cx, channel_name.as_str(), channel_status)?;
                }
            }
        }
    }

    Ok(ax_status)
}

pub fn set_ax_on(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let turn_on = cx.argument::<JsBoolean>(2)?.value(&mut cx);
    let nscope_handle = js_nscope_handle.borrow();

    if let Some(nscope) = &nscope_handle.device {
        if nscope.is_connected() {
            let analog_output = match channel.as_str() {
                "A1" => &nscope.a1,
                "A2" => &nscope.a2,
                _ => panic!("Invalid channel string"),
            };
            if turn_on {
                analog_output.turn_on();
            } else {
                analog_output.turn_off();
            }
        }
    }

    Ok(cx.null())
}

pub fn set_ax_frequency_hz(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let frequency = cx.argument::<JsNumber>(2)?.value(&mut cx);
    let nscope_handle = js_nscope_handle.borrow();

    if let Some(nscope) = &nscope_handle.device {
        if nscope.is_connected() {
            let analog_output = match channel.as_str() {
                "A1" => &nscope.a1,
                "A2" => &nscope.a2,
                _ => panic!("Invalid channel string"),
            };
            analog_output.set_frequency(frequency);
        }
    }

    Ok(cx.null())
}

pub fn set_ax_amplitude(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let amplitude = cx.argument::<JsNumber>(2)?.value(&mut cx);
    let nscope_handle = js_nscope_handle.borrow();

    if let Some(nscope) = &nscope_handle.device {
        if nscope.is_connected() {
            let analog_output = match channel.as_str() {
                "A1" => &nscope.a1,
                "A2" => &nscope.a2,
                _ => panic!("Invalid channel string"),
            };
            analog_output.set_amplitude(amplitude);
        }
    }

    Ok(cx.null())
}

pub fn set_ax_wave_type(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let wave_type = cx.argument::<JsString>(2)?.value(&mut cx);
    let nscope_handle = js_nscope_handle.borrow();

    if let Some(nscope) = &nscope_handle.device {
        if nscope.is_connected() {
            let analog_output = match channel.as_str() {
                "A1" => &nscope.a1,
                "A2" => &nscope.a2,
                _ => panic!("Invalid channel string"),
            };
            if let Ok(wave_type) = AnalogWaveType::from_str(wave_type.as_str()) {
                analog_output.set_wave_type(wave_type);
            }
        }
    }

    Ok(cx.null())
}

pub fn set_ax_polarity(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let channel = cx.argument::<JsString>(1)?.value(&mut cx);
    let polarity = cx.argument::<JsString>(2)?.value(&mut cx);
    let nscope_handle = js_nscope_handle.borrow();

    if let Some(nscope) = &nscope_handle.device {
        if nscope.is_connected() {
            let analog_output = match channel.as_str() {
                "A1" => &nscope.a1,
                "A2" => &nscope.a2,
                _ => panic!("Invalid channel string"),
            };
            if let Ok(polarity) = AnalogSignalPolarity::from_str(polarity.as_str()) {
                analog_output.set_polarity(polarity);
            }
        }
    }

    Ok(cx.null())
}

