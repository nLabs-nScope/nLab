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
                let t = cx.number(idx as f64 * 12.0 / self.num_samples as f64);
                x_array.set(cx, idx as u32, t)?;

                if let Some(data) = sample.data[ch] {
                    let y_array: Handle<JsArray> = y_data.get(cx, ch as u32).unwrap();
                    let y = cx.number(data * self.channel_gains[ch]);
                    y_array.set(cx, idx as u32, y)?;
                }
            }
        }

        obj.set(cx, "x", x_data)?;
        obj.set(cx, "y", y_data)?;

        Ok(obj)
    }
}

impl NscopeTraces {
    pub(crate) fn clear(&mut self) {
        for s in &mut self.samples {
            s.clear()
        }
        self.current_head = 0;
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

    if nscope_handle.request_handle.is_none() {
        if nscope_handle.run_state != RunState::Stopped {
            nscope_handle.request_handle = Some(nscope_handle.get_device().request(
                nscope_handle.sample_rate,
                nscope_handle.traces.num_samples as u32,
                Some(nscope_handle.trigger)
            ));
            nscope_handle.traces.current_head = 0;
            for idx in 0..nscope_handle.traces.trace_gap() {
                nscope_handle.traces.samples[idx].clear();
            }
        }
    }

    if nscope_handle.request_handle.is_some() {
        loop {
            match nscope_handle.receiver().try_recv() {
                Ok(sample) => {
                    let idx = nscope_handle.traces.current_head;
                    let trace_gap = nscope_handle.traces.trace_gap();
                    nscope_handle.traces.samples[idx] = sample;
                    if idx + trace_gap < nscope_handle.traces.samples.len() {
                        nscope_handle.traces.samples[idx + trace_gap].clear();
                    }
                    nscope_handle.traces.current_head += 1;
                }
                Err(TryRecvError::Empty) => { break; }
                Err(TryRecvError::Disconnected) => {

                    // If we've ended a stream and we're single, this should have stopped.
                    if nscope_handle.run_state == RunState::Single {
                        nscope_handle.run_state = RunState::Stopped;
                    }
                    nscope_handle.request_handle = None;
                    break;
                }
            }
        }
    }

    let channel_data = nscope_handle.traces.to_object(&mut cx).unwrap();
    Ok(channel_data)
}