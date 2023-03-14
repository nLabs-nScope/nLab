use neon::prelude::*;
use std::cell::RefCell;

mod monitor;
mod pulse_output;
mod analog_output;

fn version_string(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string(format!("{}", nscope::version())))
}

trait Objectify {
    fn to_object<'a>(&self, cx: &mut FunctionContext<'a>) -> JsResult<'a, JsObject>;
}

pub struct NscopeHandle {
    bench: nscope::LabBench,
    scope: Option<nscope::Nscope>,
}

type JsNscopeHandle = JsBox<RefCell<NscopeHandle>>;

impl Finalize for NscopeHandle {
    // TODO, probably clean up nScope and lab bench?
}

// This thing creates an empty nscope handle for JS
fn new_nscope(mut cx: FunctionContext) -> JsResult<JsNscopeHandle> {
    let bench = nscope::LabBench::new().expect("Creating LabBench");
    let scope = None;
    let nscope_handle = NscopeHandle{bench, scope};
    Ok(cx.boxed(RefCell::new(nscope_handle)))
}
 

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("version", version_string)?;
    cx.export_function("new_nscope", new_nscope)?;
    cx.export_function("monitor_nscope", monitor::monitor_nscope)?;


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

    Ok(())
}
