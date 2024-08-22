import {getId} from "./Utils";
const log = window.electron_log.scope("save-file");

function getTracesFromData(data) {

}

getId('save-traces').onclick = async () => {
    log.info("Saving traces to file");
    let graph_data = getId('scope-graph').data;
    const filePath = await window.ipcRenderer.invoke('save-data', graph_data);
    log.info('Screenshot saved to:', filePath);
}