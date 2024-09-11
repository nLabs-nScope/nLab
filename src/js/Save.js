import {getId} from "./Utils";
import {getSampleRate} from "./Timing";
import {clearTransientMessage, showTransientMessage} from "./Message";
import electron_log from 'electron-log/renderer';

const log = electron_log.scope("save-file");

function getTracesFromData(data) {
    let channels = []
    let raw_data = data.slice(0, 4).map((d) => {
        return d.y
    });

    for (let ch = 0; ch < 4; ch++) {
        let ch_name = `Ch${ch + 1} (V)`
        let ch_data = raw_data[ch];

        const nulls = [];
        [...ch_data].forEach((value, index) => {
            if (value === null || value === undefined) {
                nulls.push(index);
            }
        });

        if (nulls.length !== ch_data.length) {
            channels.push([ch_name, ...ch_data]);
        }
    }

    let time_length = channels.reduce((longest, current) => {
        return current.length > longest ? current.length : longest;
    }, []) - 1;
    let sample_rate = getSampleRate();
    if (time_length <= 0) {
        return null;
    }
    log.info(`Logging ${time_length} samples at ${sample_rate} Hz`);
    let time = ['Time (s)', ...Array.from({length: time_length}, (_, i) => i / sample_rate)];
    return [time, ...channels];
}

async function save() {
    log.info("Saving traces to file");
    let graph_data = getId('scope-graph').data;
    let csv_data = getTracesFromData(graph_data);
    clearTransientMessage();
    const path = await window.ipcRenderer.invoke('save-data', csv_data);
    showTransientMessage(`Saved to ${path}`);
}

getId('save-traces').onclick = async () => {
    save();
}

window.ipcRenderer.on('save-hotkey', () => {
    save();
});

