use std::sync::mpsc::TryRecvError;

use neon::prelude::*;

use crate::{JsNscopeHandle, NscopeTraces, Objectify, RunState};

impl Objectify for NscopeTraces {
    fn to_object<'a>(&self, cx: &mut FunctionContext<'a>) -> JsResult<'a, JsObject> {
        let obj = cx.empty_object();

        let x_data = JsArray::new(cx, nscope::Sample::num_channels());
        let y_data = JsArray::new(cx, nscope::Sample::num_channels());

        for ch in 0u32..nscope::Sample::num_channels() {
            let empty_array = JsArray::new(cx, self.samples.len() as u32);
            x_data.set(cx, ch, empty_array)?;
            let empty_array = JsArray::new(cx, self.samples.len() as u32);
            y_data.set(cx, ch, empty_array)?;
        }

        for (idx, sample) in self.samples.iter().enumerate() {
            for ch in 0usize..nscope::Sample::num_channels() as usize {
                let x_array: Handle<JsArray> = x_data.get(cx, ch as u32).unwrap();
                let t = cx.number(idx as f64 / 100.0f64);
                x_array.set(cx, idx as u32, t)?;

                if let Some(data) = sample.data[ch] {
                    let y_array: Handle<JsArray> = y_data.get(cx, ch as u32).unwrap();
                    let y = cx.number(data);
                    y_array.set(cx, idx as u32, y)?;
                }
            }
        }

        obj.set(cx, "x", x_data)?;
        obj.set(cx, "y", y_data)?;

        Ok(obj)
    }
}

pub fn get_traces(mut cx: FunctionContext) -> JsResult<JsObject> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let mut nscope_handle = js_nscope_handle.borrow_mut();

    if nscope_handle.device.is_none() {
        return Ok(cx.empty_object());
    }

    if !nscope_handle.get_device().is_connected() {
        return Ok(cx.empty_object());
    }

    if nscope_handle.receiver.is_none() {
        if nscope_handle.run_state != RunState::Stopped {
            nscope_handle.receiver = Some(nscope_handle.get_device().request(1000.0, 1200));
            nscope_handle.traces.current_head = 0;
            println!("New Request!");
        }
        if nscope_handle.run_state == RunState::Single {
            nscope_handle.run_state = RunState::Stopped;
        }
    }

    if nscope_handle.receiver.is_some() {
        loop {
            match nscope_handle.rx().try_recv() {
                Ok(sample) => {
                    let idx = nscope_handle.traces.current_head;
                    println!("{}: {:?}", idx, sample.data);
                    nscope_handle.traces.samples[idx] = sample;
                    nscope_handle.traces.current_head += 1;
                }
                Err(TryRecvError::Empty) => { break; }
                Err(TryRecvError::Disconnected) => {
                    nscope_handle.receiver = None;
                    break;
                }
            }
        }
    }
    let channel_data = nscope_handle.traces.to_object(&mut cx).unwrap();
    Ok(channel_data)
}