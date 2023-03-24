use neon::prelude::*;
use std::cell::RefCell;
use std::sync::mpsc::Receiver;
use nscope::Sample;
use crate::RunState::Run;

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
    receiver: Option<Receiver<nscope::Sample>>,
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

    fn rx(&self) -> &Receiver<nscope::Sample> {
        self.receiver.as_ref().unwrap()
    }
}

// This thing creates an empty nscope handle for JS
fn new_nscope(mut cx: FunctionContext) -> JsResult<JsNscopeHandle> {
    let nscope_handle = NscopeHandle{
        bench: nscope::LabBench::new().expect("Creating LabBench"),
        device: None,
        run_state: Run,
        receiver: None,
        traces: NscopeTraces{
            samples: vec![Sample::default(); 1200],
            current_head: 0,
        }
    };
    Ok(cx.boxed(RefCell::new(nscope_handle)))
}
 

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("version", version_string)?;
    cx.export_function("new_nscope", new_nscope)?;
    cx.export_function("monitor_nscope", monitor::monitor_nscope)?;
    cx.export_function("get_traces", traces::get_traces)?;

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
