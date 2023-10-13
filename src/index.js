import './scss/custom_bootstrap.scss'
import './css/nscope.css'
import './css/plotly.css'
import packageInfo from '../package.json'
import bootstrap from 'bootstrap'

import * as powerStatus from './js/PowerStatus.js'
import * as pulseOutputs from './js/PulseOutputs.js'
import * as analogOutputs from './js/AnalogOutputs.js'
import * as analogInputs from './js/AnalogInputs.js'
import * as runState from './js/RunState.js'
import * as timing from './js/Timing.js'
import * as trigger from './js/Trigger.js'
import * as flags from './js/Flags.js'
import * as axes from './js/Axes.js'
import {idFromCh} from './js/Utils.js'

const Plotly = require('plotly.js-basic-dist');


for (let dropdown of document.getElementsByClassName("dropdown-menu clickable")) {
    dropdown.onclick = function (evt) {
        evt.stopPropagation();
    }
}

for (let label of document.getElementsByTagName("label")) {
    label.onkeydown = function (evt) {
        return false; // TODO, this function doesn't work
        // console.log(evt.key);
        // return evt.key != "Enter";
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
            line: {color: axes.colors[ch], width: 2},
            yaxis: `y${idFromCh(ch) + 1}`
        })
}

traces.push({
    x: [],
    y: [],
    yaxis: "y1"
})

var layout = {
    margin: {
        l: 30,
        t: 1,
        r: 30,
        b: 0
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    hovermode: false,
    showlegend: false,
    xaxis: {
        showticklabels: false,
        zeroline: false,
        dtick: 1,
        fixedrange: true,
        range: [0, 12],
        linecolor: 'rgba(255,255,255,1)',
        linewidth: 1,
        mirror: true
    },
    yaxis: {
        showticklabels: false,
        zeroline: true,
        zerolinecolor: '#FFFFFF',
        zerolinewidth: 3,
        dtick: 1,
        fixedrange: true,
        range: [-5, 5],
        linecolor: 'rgba(255,255,255,1)',
        linewidth: 1,
        mirror: true
    },
    yaxis2: axes.channel_axis("Ch1"),
    yaxis3: axes.channel_axis("Ch2"),
    yaxis4: axes.channel_axis("Ch3"),
    yaxis5: axes.channel_axis("Ch4"),
    shapes: []
};


function updatePlot() {

    // Add the trigger shapes
    let triggerState = nscope.getTriggerStatus(nScope);
    let chState = nscope.getChStatus(nScope);

    let shapes = flags.drawShapes(triggerState, chState);

    // Update the axes

    let y_axes = axes.update(chState);

    let layout_data = {
        shapes: shapes,
        ...y_axes,
    }

    // Update the traces
    let trace_data = nscope.getTraces(nScope);

    Plotly.update('scope-graph', trace_data, layout_data);

    window.requestAnimationFrame(updatePlot);


}

Plotly.newPlot('scope-graph', traces, layout, config);

function monitorScope() {

    let powerState = nscope.monitorNscope(nScope);
    powerStatus.update(powerState);

    let chState = nscope.getChStatus(nScope);
    analogInputs.update(chState);

    let triggerState = nscope.getTriggerStatus(nScope);
    trigger.update(triggerState);

    let pxState = nscope.getPxStatus(nScope);
    pulseOutputs.update(pxState);

    let axState = nscope.getAxStatus(nScope);
    analogOutputs.update(axState);

    let currentRunState = nscope.getRunState(nScope);
    runState.update(currentRunState);

    timing.update();

    window.requestAnimationFrame(monitorScope);
}

monitorScope();
pulseOutputs.initInput();
analogOutputs.initInput();
timing.initTiming();
flags.initDragEvents();
updatePlot();

version_display.innerHTML = packageInfo.version;
//nscope.version();
