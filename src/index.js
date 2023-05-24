import './scss/custom_bootstrap.scss'
import './css/nscope.css'
import bootstrap from 'bootstrap'

import * as powerStatus from './js/PowerStatus.js'
import * as pulseOutputs from './js/PulseOutputs.js'
import * as analogOutputs from './js/AnalogOutputs.js'
import * as analogInputs from './js/AnalogInputs.js'
import * as runState from './js/RunState.js'
import * as timing from './js/Timing.js'

const Plotly = require('plotly.js-basic-dist');


for(let dropdown of document.getElementsByClassName("dropdown-menu clickable")) {
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


var layout = {
    margin: {
        l: 20,
        t: 1,
        r: 20,
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
    }
};

let traces = [];
const colors = [
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

    let trace_data = nscope.getTraces(nScope);
    Plotly.restyle('glcanvas-div', trace_data);
    window.requestAnimationFrame(updatePlot);
}

Plotly.newPlot('glcanvas-div', traces, layout, {responsive: true, displayModeBar: false});


function monitorScope() {

    let powerState = nscope.monitorNscope(nScope);
    powerStatus.update(powerState);

    let chState = nscope.getChStatus(nScope);
    analogInputs.update(chState);

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

version.innerHTML = nscope.version();