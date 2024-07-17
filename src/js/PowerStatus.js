import {getId, clamp} from './Utils.js'
import electron_log from 'electron-log/renderer';

const log = electron_log.scope("status");

import '../css/power_status.css'

function hide(id) {
    let element = getId(id);
    element.classList.add("hidden");
}

function show(id) {
    let element = getId(id);
    element.classList.remove("hidden");
}

function message(msg_content) {
    let msg = getId('scope-message');
    if (msg_content == null) {
        hide('scope-message');
        show('scope-graph');
    } else {
        msg.innerHTML = msg_content
        show('scope-message');
        hide('scope-graph');
    }
}

let previous_state = 'Unknown';

export function update(powerState) {
    if (previous_state !== powerState.state) {
        log.info(`nScope state transition ${previous_state} -> ${powerState.state}`)
    }
    switch (powerState.state) {
        case "PowerOff":
        case "Startup": {
            hide('usb-status-bar');
            hide('usb-status');
            hide('nscope-usb-power-fault');
            hide('nscope-usb-disconnected');
            show('nscope-usb-power-off');
            message('nScope is asleep');
            update.percentage = null;
            break;
        }
        case "PowerOn": {
            hide('nscope-usb-power-off');
            hide('nscope-usb-power-fault');
            hide('nscope-usb-disconnected');

            message(null);
            show('usb-status-bar');
            show('usb-status');
            var percentage = powerState.usage * 100 / 2.5;
            update.percentage = (update.percentage || 0.0) * 0.8 + percentage * 0.2;

            getId('nscope-power-usage').style.width = `${clamp(update.percentage, 0, 100)}%`;

            if (update.percentage > 98) {
                getId('usb-status-bar').classList.remove('btn-outline-success');
                getId('usb-status').classList.remove('btn-success');
                getId('usb-status-bar').classList.add('btn-outline-warning');
                getId('usb-status').classList.add('btn-warning');
            } else {
                getId('usb-status-bar')
                getId('usb-status-bar').classList.add('btn-outline-success');
                getId('usb-status').classList.add('btn-success');
                getId('usb-status-bar').classList.remove('btn-outline-warning');
                getId('usb-status').classList.remove('btn-warning');
            }


            getId('usb-status-bar').innerHTML = `${(update.percentage / 100 * 2.5).toFixed(2)} W`;
            getId('usb-status').innerHTML = `${(update.percentage / 100 * 2.5).toFixed(2)} W`;

            if (previous_state !== "PowerOn") {
                nscope.restartTraces(nScope);
            }
            break;
        }
        case "Shorted": {
            hide('usb-status-bar');
            hide('usb-status');
            hide('nscope-usb-power-off');
            hide('nscope-usb-disconnected');

            show('nscope-usb-power-fault');
            message('nScope detected a power fault');
            update.percentage = null;
            break;
        }
        case "Overcurrent": {
            hide('usb-status-bar');
            hide('usb-status');
            hide('nscope-usb-power-off');
            hide('nscope-usb-disconnected');

            show('nscope-usb-power-fault');
            message('nScope detected an overcurrent event');
            update.percentage = null;
            break;
        }
        case "DFU": {
            hide('usb-status-bar');
            hide('usb-status');
            hide('nscope-usb-power-fault');
            hide('nscope-usb-disconnected');
            show('nscope-usb-power-off');
            message('nScope is updating firmware');
            update.percentage = null;
            if (previous_state !== "DFU") {
                setTimeout(() => {
                    nscope.updateFirmware(nScope);
                }, 1000);
            }
            break;
        }
        default: {
            hide('usb-status-bar');
            hide('usb-status');
            hide('nscope-usb-power-off');
            hide('nscope-usb-power-fault');


            show('nscope-usb-disconnected');
            message('Waiting to connect to nScope');
            update.percentage = null;
            break;
        }
    }
    previous_state = powerState.state;
}