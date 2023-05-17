use std::cell::RefCell;
use std::sync::mpsc::Receiver;

use neon::prelude::*;
use nscope;
use nscope::RequestHandle;

use crate::RunState::{Run, Single, Stopped};

mod monitor;
mod pulse_output;
mod analog_output;
mod analog_inputs;
mod traces;

fn version_string(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string(format!("{}", nscope::version())))
}

trait Objectify {
    fn to_object<'a>(&self, cx: &mut FunctionContext<'a>) -> JsResult<'a, JsObject>;
}

#[derive(Eq, PartialEq)]
enum RunState {
    Stopped,
    Single,
    Run,
}

struct NscopeTraces {
    samples: Vec<nscope::Sample>,
    current_head: usize,
}

struct NscopeHandle {
    bench: nscope::LabBench,
    device: Option<nscope::Nscope>,
    run_state: RunState,
    request_handle: Option<nscope::RequestHandle>,
    traces: NscopeTraces,
}

type JsNscopeHandle = JsBox<RefCell<NscopeHandle>>;

impl Finalize for NscopeHandle {
    // TODO, probably clean up nScope and lab bench?
}

impl NscopeHandle {
    fn get_device(&self) -> &nscope::Nscope {
        self.device.as_ref().unwrap()
    }

    fn request_handle(&self) -> &RequestHandle {
        self.request_handle.as_ref().unwrap()
    }

    fn stop_request(&self) {
        if let Some(rq) = self.request_handle.as_ref() {
            rq.stop();
        }
    }

    fn receiver(&self) -> &Receiver<nscope::Sample> {
        &self.request_handle.as_ref().unwrap().receiver
    }
}

// This thing creates an empty nscope handle for JS
fn new_nscope(mut cx: FunctionContext) -> JsResult<JsNscopeHandle> {
    let nscope_handle = NscopeHandle {
        bench: nscope::LabBench::new().expect("Creating LabBench"),
        device: None,
        run_state: Run,
        request_handle: None,
        traces: NscopeTraces {
            samples: vec![nscope::Sample::default(); 1200],
            current_head: 0,
        },
    };
    Ok(cx.boxed(RefCell::new(nscope_handle)))
}

fn set_run_control(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let state = cx.argument::<JsString>(1)?.value(&mut cx);
    let mut nscope_handle = js_nscope_handle.borrow_mut();

    nscope_handle.run_state = match state.as_str() {
        "run" => {
            if nscope_handle.request_handle.is_none() {
                nscope_handle.stop_request();
                nscope_handle.traces.clear();
            }
            Run
        }
        "single" => {
            if nscope_handle.request_handle.is_none() {
                nscope_handle.traces.clear();
            }
            Single
        }
        "stop" => Stopped,
        _ => panic!("Invalid run control string"),
    };

    Ok(cx.null())
}

fn get_run_control(mut cx: FunctionContext) -> JsResult<JsString> {
    let js_nscope_handle = cx.argument::<JsNscopeHandle>(0)?;
    let nscope_handle = js_nscope_handle.borrow_mut();

    let string = match nscope_handle.run_state {
        Stopped => { "stop" }
        Single => { "single" }
        Run => { "run" }
    };
    let run_state = cx.string(string);
    Ok(run_state)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("version", version_string)?;
    cx.export_function("newNscope", new_nscope)?;
    cx.export_function("monitorNscope", monitor::monitor_nscope)?;
    cx.export_function("setRunState", set_run_control)?;
    cx.export_function("getRunState", get_run_control)?;
    cx.export_function("getTraces", traces::get_traces)?;

    cx.export_function("getPxStatus", pulse_output::get_px_status)?;
    cx.export_function("setPxOn", pulse_output::set_px_on)?;
    cx.export_function("setPxFrequency", pulse_output::set_px_frequency_hz)?;
    cx.export_function("setPxDuty", pulse_output::set_px_duty)?;

    cx.export_function("getAxStatus", analog_output::get_ax_status)?;
    cx.export_function("setAxOn", analog_output::set_ax_on)?;
    cx.export_function("setAxFrequency", analog_output::set_ax_frequency_hz)?;
    cx.export_function("setAxAmplitude", analog_output::set_ax_amplitude)?;
    cx.export_function("setAxWaveType", analog_output::set_ax_wave_type)?;
    cx.export_function("setAxPolarity", analog_output::set_ax_polarity)?;

    cx.export_function("getChStatus", analog_inputs::get_ch_status)?;
    cx.export_function("setChOn", analog_inputs::set_ch_on)?;

    Ok(())
}
