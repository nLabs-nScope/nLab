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
import * as trigger from './js/Trigger'

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
        zeroline: false,
        dtick: 1,
        fixedrange: true,
        range: [-5, 5],
        linecolor: 'rgba(255,255,255,1)',
        linewidth: 1,
        mirror: true
    },
    shapes: [
    { // Shape 0 is the vertical trigger line
        type: 'line',
        layer: 'below',
        x0: 1,
        y0: -5,
        x1: 1,
        y1: 5,
        line: {
            color: 'rgba(255,255,255,1)',
            width: 3.0,
            dash: 'dash'
        },
    },
    { // Shape 1 is the vertical trigger line
        type: 'line',
        layer: 'below',
        x0: 0,
        y0: 0,
        x1: 12,
        y1: 0,
        line: {
            color: 'rgba(255,255,255,1)',
            width: 3.0,
            dash: 'dash'
        },
    },
    { // Shape 2 is the triangle
        type: 'path',
        label: {
            text: "T",
            font: {
                color: 'rgba(0,0,0,1)',
                size: 14,
            },
            textposition: 'middle left',
            xanchor: 'left',
            padding: 8,
        },
        path: 'M 0 0 L 10 10 L 25 10 L 25 -10 L 10 -10 Z',
        xsizemode: 'pixel',
        ysizemode: 'pixel',
        xanchor: 12,
        yanchor: 0,
        fillcolor: 'rgba(255,255,255,1)',
        line: {
            width: 0
        }
    },
    ]
};

let traces = [];
export const colors = [
    'rgb(233,102,86)',
    'rgb(52,210,146)',
    'rgb(58,176,226)',
    'rgb(246,216,97)'
];
for (let ch = 0; ch < 4; ch++) {
    traces.push(
        {
            x: [],
            y: [],
            line: {color: colors[ch], width: 2}
        })
}

function updatePlot() {

    let layout_data = {};

    // Add the trigger shapes
    let trigger_status = nscope.getTriggerStatus(nScope);
    if (trigger_status.isOn) {
        layout_data = {
            'shapes[0].visible': true,
            'shapes[1].visible': true,
            'shapes[2].visible': true,
        }
    } else {
        layout_data = {
            'shapes[0].visible': false,
            'shapes[1].visible': false,
            'shapes[2].visible': false,
        }
    }

    layout_data['shapes[1].y0'] = trigger_status.level;
    layout_data['shapes[1].y1'] = trigger_status.level;
    layout_data['shapes[2].yanchor'] = trigger_status.level;


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

    window.requestAnimationFrame(monitorScope);
}

monitorScope();
pulseOutputs.initInput();
analogOutputs.initInput();
timing.initTiming();
updatePlot();

version_display.innerHTML = packageInfo.version;
//nscope.version();
