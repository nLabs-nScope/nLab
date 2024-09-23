const log = window.electron_log.scope("renderer");
log.info('nLab renderer process start');

import './scss/custom_bootstrap.scss'
import './css/nlab.css'
import './css/plotly.css'
import packageInfo from '../package.json'
import 'bootstrap'
import '@fortawesome/fontawesome-free/css/all.min.css';
log.info('completed importing styles')

import * as powerStatus from './js/PowerStatus.js'
import * as pulseOutputs from './js/PulseOutputs.js'
import * as analogOutputs from './js/AnalogOutputs.js'
import * as analogInputs from './js/AnalogInputs.js'
import * as runState from './js/RunState.js'
import * as timing from './js/Timing.js'
import * as trigger from './js/Trigger.js'
import * as flags from './js/Flags.js'
import * as axes from './js/Axes.js'
import * as message from './js/Message.js'
import {getId, idFromCh} from './js/Utils.js'

require('./js/Save.js');
log.info("completed importing internals");

const Plotly = require('plotly.js-basic-dist');
log.info("completed importing plotly");

for (let dropdown of document.getElementsByClassName("dropdown-menu clickable")) {
    dropdown.onclick = function (evt) {
        evt.stopPropagation();
    }
}

var config = {
    // edits: {
    //     shapePosition: true,
    // },
    responsive: true,
    displayModeBar: false
}

let traces = [];

for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
    traces.push(
        {
            x: [],
            y: [],
            line: {color: axes.colors[ch], width: 1},
            yaxis: `y${idFromCh(ch) + 1}`
        })
}

traces.push({
    x: [],
    y: [],
    yaxis: "y1"
})
log.info("completed creating traces");

var layout = {
    margin: {
        l: 30,
        t: 10,
        r: 30,
        b: 1
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    hovermode: false,
    showlegend: false,
    xaxis: {
        showticklabels: false,
        zeroline: false,
        dtick: 1,
        showgrid: true,
        fixedrange: true,
        range: [0, 12],
        gridcolor: 'rgba(100,100,100,1)',
        linecolor: 'rgba(100,100,100,1)',
        linewidth: 1,
        mirror: true
    },
    yaxis: {
        showticklabels: false,
        zeroline: false,
        showgrid: true,
        dtick: 1,
        fixedrange: true,
        range: [-5, 5],
        gridcolor: 'rgba(100,100,100,1)',
        linecolor: 'rgba(100,100,100,1)',
        linewidth: 1,
        mirror: true
    },
    yaxis2: axes.channel_axis("Ch1"),
    yaxis3: axes.channel_axis("Ch2"),
    yaxis4: axes.channel_axis("Ch3"),
    yaxis5: axes.channel_axis("Ch4"),
    shapes: []
};
log.info("completed graph layout");



let trace_data = {};
function updatePlot() {

    log.debug("updating plot");

    log.debug("adding channel flags");
    let triggerState = nlab.getTriggerStatus(nLab);
    let chState = nlab.getChStatus(nLab);

    let shapes = flags.drawShapes(triggerState, chState);

    // Update the axes
    log.debug("updating y-axes");
    let y_axes = axes.update();

    log.debug("creating new layout");
    let layout_data = {
        shapes: shapes,
        ...y_axes,
    }

    // Update the traces
    log.debug("update the traces");
    trace_data = nlab.getTraces(nLab, trace_data);

    log.debug("updating the graph");
    Plotly.update('scope-graph', trace_data, layout_data);

    window.requestAnimationFrame(updatePlot);


}

Plotly.newPlot('scope-graph', traces, layout, config);
log.info("completed graph creation");

function monitorScope() {

    log.debug("monitoring scope");
    let powerState = nlab.monitorNscope(nLab);
    log.debug("monitoring scope");
    powerStatus.update(powerState);

    log.debug("getting channel status");
    let chState = nlab.getChStatus(nLab);
    analogInputs.update(chState);

    log.debug("getting trigger status");
    let triggerState = nlab.getTriggerStatus(nLab);
    trigger.update(triggerState);

    log.debug("getting px status");
    let pxState = nlab.getPxStatus(nLab);
    pulseOutputs.update(pxState);

    log.debug("getting ax status");
    let axState = nlab.getAxStatus(nLab);
    analogOutputs.update(axState);

    log.debug("getting run state");
    let currentRunState = nlab.getRunState(nLab);
    runState.update(currentRunState);

    log.debug("updating timing status");
    timing.update();

    if (nlab.isConnected(nLab)) {
        getId('save-traces').classList.remove("disabled");
    } else {
        getId('save-traces').classList.add("disabled");
    }

    window.requestAnimationFrame(monitorScope);
}

monitorScope();
pulseOutputs.initInput();
analogOutputs.initInput();
timing.initTiming();
flags.initDragEvents();
updatePlot();

getId('version-display').innerHTML = `v${packageInfo.version}`;
