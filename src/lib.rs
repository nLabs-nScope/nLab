use std::cell::RefCell;
use std::sync::mpsc::Receiver;
use log::info;

use neon::prelude::*;
use nscope;
use nscope::Trigger;

use crate::RunState::{Run, Single, Stopped};

mod monitor;
mod pulse_output;
mod analog_output;
mod analog_inputs;
mod traces;
mod trigger;

fn version(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let js_nlab_handle = cx.argument::<JsNscopeHandle>(0)?;
    let nlab_handle = js_nlab_handle.borrow();

    if let Some(nlab) = &nlab_handle.device {
        if nlab.is_connected() {
            if let Ok(version) = nlab.version() {
                return Ok(cx.number(version));
            }
        }
    }

    Ok(cx.number(-1))
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
    num_samples: usize,
    current_head: usize,
}

impl NscopeTraces {
    fn trace_gap(&self) -> usize {
        self.num_samples / 120
    }
}

struct NscopeHandle {
    bench: nscope::LabBench,
    dfu_link: Option<nscope::NscopeLink>,
    requested_dfu: bool,
    device: Option<nscope::Nscope>,
    run_state: RunState,
    trigger: Trigger,
    sample_rate: f64,
    sweep_handle: Option<nscope::SweepHandle>,
    traces: NscopeTraces,
}

type JsNscopeHandle = JsBox<RefCell<NscopeHandle>>;

impl Finalize for NscopeHandle {
    // TODO, probably clean up nLab and lab bench?
}

impl NscopeHandle {
    fn get_device(&self) -> &nscope::Nscope {
        self.device.as_ref().unwrap()
    }

    fn stop_request(&self) {
        if let Some(rq) = self.sweep_handle.as_ref() {
            rq.stop();
        }
    }

    fn receiver(&self) -> &Receiver<nscope::Sample> {
        &self.sweep_handle.as_ref().unwrap().receiver
    }
}

// This thing creates an empty nlab handle for JS
fn new_nlab(mut cx: FunctionContext) -> JsResult<JsNscopeHandle> {
    let nlab_handle = NscopeHandle {
        bench: nscope::LabBench::new().expect("Creating LabBench"),
        dfu_link: None,
        requested_dfu: false,
        device: None,
        run_state: Run,
        trigger: Trigger::default(),
        sample_rate: 400.0,
        sweep_handle: None,
        traces: NscopeTraces {
            samples: vec![nscope::Sample::default(); 4800],
            num_samples: 4800,
            current_head: 0,
        },
    };
    Ok(cx.boxed(RefCell::new(nlab_handle)))
}

fn update_firmware(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nlab_handle = cx.argument::<JsNscopeHandle>(0)?;
    let nlab_handle = js_nlab_handle.borrow_mut();

    if let Some(link) = &nlab_handle.dfu_link {
        link.update().unwrap();
    }
    Ok(cx.null())
}

fn set_run_control(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nlab_handle = cx.argument::<JsNscopeHandle>(0)?;
    let state = cx.argument::<JsString>(1)?.value(&mut cx);
    let mut nlab_handle = js_nlab_handle.borrow_mut();

    nlab_handle.run_state = match state.as_str() {
        "run" => {
            if nlab_handle.sweep_handle.is_none() {
                nlab_handle.traces.clear();
            }
            Run
        }
        "single" => {
            if nlab_handle.sweep_handle.is_some() {
                nlab_handle.stop_request();
            }
            nlab_handle.traces.clear();
            Single
        }
        "stop" => {
            nlab_handle.stop_request();
            Stopped
        }
        _ => panic!("Invalid run control string"),
    };

    Ok(cx.null())
}

fn get_run_control(mut cx: FunctionContext) -> JsResult<JsString> {
    let js_nlab_handle = cx.argument::<JsNscopeHandle>(0)?;
    let nlab_handle = js_nlab_handle.borrow_mut();

    let string = match nlab_handle.run_state {
        Stopped => { "stop" }
        Single => { "single" }
        Run => { "run" }
    };
    let run_state = cx.string(string);
    Ok(run_state)
}

fn set_timing_parameters(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nlab_handle = cx.argument::<JsNscopeHandle>(0)?;
    let sample_rate = cx.argument::<JsNumber>(1)?.value(&mut cx);
    let num_samples = cx.argument::<JsNumber>(2)?.value(&mut cx);
    let mut nlab_handle = js_nlab_handle.borrow_mut();

    nlab_handle.sample_rate = sample_rate;
    nlab_handle.traces.num_samples = num_samples as usize;
    if nlab_handle.sweep_handle.is_some() {
        nlab_handle.stop_request();
        nlab_handle.traces.clear();
    }

    Ok(cx.null())
}

fn restart_traces(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nlab_handle = cx.argument::<JsNscopeHandle>(0)?;
    let mut nlab_handle = js_nlab_handle.borrow_mut();

    if nlab_handle.sweep_handle.is_some() {
        nlab_handle.stop_request();
        nlab_handle.traces.clear();
    }

    Ok(cx.null())
}

fn restrigger_if_not_triggered(mut cx: FunctionContext) -> JsResult<JsNull> {
    let js_nlab_handle = cx.argument::<JsNscopeHandle>(0)?;
    let nlab_handle = js_nlab_handle.borrow();


    if nlab_handle.sweep_handle.is_some() && nlab_handle.traces.current_head == 0 {
        nlab_handle.stop_request();
    }

    Ok(cx.null())
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    let mut builder = env_logger::Builder::from_env("NSCOPE_LOG");
    let _ = builder.try_init();
    info!("initializing nLab js interface");

    cx.export_function("version", version)?;
    cx.export_function("newNscope", new_nlab)?;
    cx.export_function("monitorNscope", monitor::monitor_nlab)?;
    cx.export_function("isConnected", monitor::is_connected)?;
    cx.export_function("updateFirmware", update_firmware)?;
    cx.export_function("setRunState", set_run_control)?;
    cx.export_function("getRunState", get_run_control)?;
    cx.export_function("setTimingParameters", set_timing_parameters)?;
    cx.export_function("getTraces", traces::get_traces)?;
    cx.export_function("restartTraces", restart_traces)?;
    cx.export_function("reTriggerIfNotTriggered", restrigger_if_not_triggered)?;

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
    cx.export_function("setChRange", analog_inputs::set_ch_range)?;
    cx.export_function("getSamplingMultiplex", analog_inputs::get_sampling_multiplex)?;

    cx.export_function("getTriggerStatus", trigger::get_trigger_status)?;
    cx.export_function("setTriggerOn", trigger::set_trigger_on)?;
    cx.export_function("setTriggerDelay", trigger::set_trigger_delay)?;
    cx.export_function("setTriggerSource", trigger::set_trigger_source)?;
    cx.export_function("setTriggerLevel", trigger::set_trigger_level)?;
    cx.export_function("setTriggerType", trigger::set_trigger_type)?;

    info!("completed exporting js interface");
    Ok(())
}
