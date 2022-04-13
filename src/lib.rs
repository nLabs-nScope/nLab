use neon::prelude::*;
use nscope::ver;

fn version_string(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string(format!("{}", ver())))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("version",  version_string)?;
    Ok(())
}
