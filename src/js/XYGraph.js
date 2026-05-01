import { getId, idFromCh } from './Utils.js';
import * as extraGraph from './ExtraGraph'
import * as timing from './Timing.js'
import Plotly from "plotly.js-basic-dist";
import * as axes from "./Axes";
import * as bootstrap from 'bootstrap';

let xy_offsets = {
    "Ch1": 0,
    "Ch2": 0,
    "Ch3": 0,
    "Ch4": 0,
};

let shifted_x = new Float32Array(5000);
let shifted_y = new Float32Array(5000);


let xy_active = false;
export function isActive() { return xy_active; }
let x_source_channel = null;
let y_source_channel = null;

export function getXYChannels() {
    if (!xy_active) return [];
    let channels = [];
    if (x_source_channel) channels.push(`Ch${x_source_channel}`);
    if (y_source_channel) channels.push(`Ch${y_source_channel}`);
    return channels;
}
function set_source_channels() {
    const xChecked = document.querySelector('input[name="xy-graph-x-source"]:checked');
    const yChecked = document.querySelector('input[name="xy-graph-y-source"]:checked');

    x_source_channel = idFromCh(xChecked?.id.replace('x-source-', '')) || null;
    y_source_channel = idFromCh(yChecked?.id.replace('y-source-', '')) || null;
}

function handle_graph_view_change(id) {
    switch (id) {
        case "xy-graph-view-horizontal":
            extraGraph.view_horizontal_split_extra_graph();
            break;
        case "xy-graph-view-vertical":
            extraGraph.view_vertical_split_extra_graph();
            break;
        case "xy-graph-view-full":
            extraGraph.view_full_extra_graph();
            break;
    }
}

getId('xy-graph-view-on').onclick = function () {
    let button_collapsed = this.classList.contains('collapsed');
    if (button_collapsed) {
        hide_xy_graph();
    } else {
        show_xy_graph();
    }
}

export function show_xy_graph() {
    if (xy_active) return;
    xy_active = true;
    set_source_channels();
    
    extraGraph.set_update_function(update_plot);

    const selected_view = document.querySelector('#xy-graph-view input[name="xy-graph-view"]:checked');
    if (selected_view) {
        handle_graph_view_change(selected_view.id);
    } else {
        console.log("No valid xy-graph-view selected");
    }

    void getId('scope-graph-extra').offsetWidth;
    init_plot();

    if (x_source_channel) ensureChannelOn(`Ch${x_source_channel}`);
    if (y_source_channel) ensureChannelOn(`Ch${y_source_channel}`);
    timing.setExtraLabelFormatter((text) => {
            const match = text.match(/([\d.]+)\s*(s|ms|µs)\/div/);
            if (!match) return text.replace('/div', '');

            let value = parseFloat(match[1]);
            const unit = match[2];

            let valueInUs = value;
            if (unit === 's') valueInUs *= 1000000;
            else if (unit === 'ms') valueInUs *= 1000;

            let totalUs = valueInUs * 12;

            if (totalUs >= 1000000) {
                return (totalUs / 1000000).toFixed(1).replace(/\.0$/, '') + ' s';
            } else if (totalUs >= 1000) {
                return (totalUs / 1000).toFixed(0) + ' ms';
            } else {
                return totalUs.toFixed(0) + ' µs';
            }
        });
        getId('extra-graphs-button').classList.add('active');
    }

export function hide_xy_graph() {
    xy_active = false;
    timing.setExtraLabelFormatter(null);
    extraGraph.hide_extra_graph();
    extraGraph.clear_update_function();
    destroy_plot();
    getId('extra-graphs-button').classList.remove('active');
}

for (let button of document.querySelectorAll("input[name=xy-graph-view]")) {
    button.onchange = function () {
        handle_graph_view_change(this.id);
    }
}

let prevXCh = 'Ch1';
let prevYCh = 'Ch2';

function ensureChannelOn(ch) {
    let btn = getId(`${ch}-onoff`);
    if (btn && !btn.classList.contains('active')) {
        btn.classList.add('active');
        nlab.setChOn(nLab, ch, true);
    }
}

for (let button of document.querySelectorAll("input[name=xy-graph-x-source]")) {
    button.onchange = function () {
        let newX = this.id.replace('x-source-', '');
        let currentY = document.querySelector('input[name="xy-graph-y-source"]:checked');
        if (currentY && currentY.id.replace('y-source-', '') === newX) {
            let swapBtn = document.getElementById('y-source-' + prevXCh);
            if (swapBtn) swapBtn.checked = true;
            prevYCh = prevXCh;
        }
        prevXCh = newX;
        set_source_channels();
        if (xy_active) ensureChannelOn(newX);
    }
}
for (let button of document.querySelectorAll("input[name=xy-graph-y-source]")) {
    button.onchange = function () {
        let newY = this.id.replace('y-source-', '');
        let currentX = document.querySelector('input[name="xy-graph-x-source"]:checked');
        if (currentX && currentX.id.replace('x-source-', '') === newY) {
            let swapBtn = document.getElementById('x-source-' + prevYCh);
            if (swapBtn) swapBtn.checked = true;
            prevXCh = prevYCh;
        }
        prevYCh = newY;
        set_source_channels();
        if (xy_active) ensureChannelOn(newY);
    }
}

function init_plot() {
    let traces = [{
        x: [0],
        y: [0],
        line: { color: 'rgba(0,0,0,0)' },
        xaxis: 'x',
        yaxis: 'y',
        hoverinfo: 'skip'
    }, {
        x: [],
        y: [],
        line: { color: 'rgb(255,255,255)', width: 1 },
        xaxis: 'x2',
        yaxis: 'y2'
    }]
    let config = {
        responsive: true,
        displayModeBar: false
    }
    let layout = {
        margin: {
            l: 30,
            t: 10,
            r: 30,
            b: 30,
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
            range: [-5, 5],
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
        xaxis2: {
            overlaying: 'x',
            anchor: 'y',
            showgrid: false,
            zeroline: false,
            showticklabels: false,
            fixedrange: true,
            range: [-5, 5],
        },
        yaxis2: {
            overlaying: 'y',
            anchor: 'x',
            showgrid: false,
            zeroline: false,
            showticklabels: false,
            fixedrange: true,
            range: [-5, 5],
        },
        shapes: get_shapes()
    };
    Plotly.newPlot('scope-graph-extra', traces, layout, config);
    let gd = getId('scope-graph-extra');
    gd.on('plotly_afterplot', attachXYEventListeners);
}

function destroy_plot() {
    Plotly.purge('scope-graph-extra');
}

function get_shapes() {
    if (!x_source_channel || !y_source_channel) return [];

    let chX = `Ch${x_source_channel}`;
    let chY = `Ch${y_source_channel}`;

    let hook_X = xy_offsets[chX];
    let hook_Y = xy_offsets[chY];

    let shapeX = {
        type: 'path',
        label: {
            text: `${x_source_channel}`,
            font: { color: axes.text_colors[chX], size: 12 },
            textposition: 'bottom center',
            padding: 2,
        },
        path: 'M 0 0 L 7 -10 L 7 -26 L -7 -26 L -7 -10 Z',
        xsizemode: 'pixel',
        ysizemode: 'pixel',
        xanchor: hook_X,
        xref: 'x',
        yanchor: 0,
        yref: 'paper',
        fillcolor: axes.colors[chX],
        line: { width: 0 },
    };

    let lineX = {
        type: 'line',
        x0: hook_X,
        y0: 0,
        x1: hook_X,
        y1: 1,
        xref: 'x',
        yref: 'paper',
        line: {
            color: axes.colors[chX],
            width: 1.5,
            dash: 'dot'
        }
    };

    let shapeY = {
        type: 'path',
        label: {
            text: `${y_source_channel}`,
            font: { color: axes.text_colors[chY], size: 12 },
            textposition: 'middle left',
            xanchor: 'left',
            padding: 10,
        },
        path: 'M 0 0 L 10 7 L 26 7 L 26 -7 L 10 -7 Z',
        xsizemode: 'pixel',
        ysizemode: 'pixel',
        xanchor: 1,
        xref: 'paper',
        yanchor: hook_Y,
        yref: 'y',
        fillcolor: axes.colors[chY],
        line: { width: 0 },
    };

    let lineY = {
        type: 'line',
        x0: 0,
        y0: hook_Y,
        x1: 1,
        y1: hook_Y,
        xref: 'paper',
        yref: 'y',
        line: {
            color: axes.colors[chY],
            width: 1.5,
            dash: 'dot'
        }
    };

    return [shapeX, lineX, shapeY, lineY];
}

function update_plot(trace_data) {
    if (!x_source_channel || !y_source_channel) return;
    let gd = getId('scope-graph-extra');
    if (!gd || !gd._fullLayout || gd.classList.contains('d-none')) return;

    let chX = `Ch${x_source_channel}`;
    let chY = `Ch${y_source_channel}`;

    let hook_X = xy_offsets[chX];
    let hook_Y = xy_offsets[chY];

    let spanX = axes.ranges[chX][1] - axes.ranges[chX][0];
    let spanY = axes.ranges[chY][1] - axes.ranges[chY][0];

    let scale_x = 10.0 / spanX;
    let scale_y = 10.0 / spanY;

    let raw_x = trace_data.y[x_source_channel - 1] || [];
    let raw_y = trace_data.y[y_source_channel - 1] || [];
    let len = Math.min(raw_x.length, shifted_x.length);
    for (let i = 0; i < len; i++) {
        if (raw_x[i] === null || raw_y[i] === null) {
            shifted_x[i] = NaN;
            shifted_y[i] = NaN;
        } else {
            shifted_x[i] = hook_X + raw_x[i] * scale_x;
            shifted_y[i] = hook_Y + raw_y[i] * scale_y;
        }
    }

    let layout_update = {
        shapes: get_shapes(),
    };

    Plotly.update('scope-graph-extra', {
        x: [shifted_x.subarray(0, len)],
        y: [shifted_y.subarray(0, len)],
        xaxis: ['x2'],
        yaxis: ['y2']
    }, layout_update, [1]);
}

let xy_current_drag = null;

function attachXYEventListeners() {
    let gd = getId('scope-graph-extra');
    if (!gd) return;

    let shapeX = document.querySelector('#scope-graph-extra .shapelayer .shape-group[data-index="0"]');
    if (shapeX) {
        shapeX.style.cursor = "grab";
        shapeX.onmousedown = (event) => {
            if (!gd._fullLayout || !gd._fullLayout.xaxis) return;
            xy_current_drag = {
                adjust: `Ch${x_source_channel}`,
                axisObj: gd._fullLayout.xaxis,
                startX: event.pageX,
                startOffset: xy_offsets[`Ch${x_source_channel}`],
                isX: true
            };
        };
    }

    let shapeY = document.querySelector('#scope-graph-extra .shapelayer .shape-group[data-index="2"]');
    if (shapeY) {
        shapeY.style.cursor = "grab";
        shapeY.onmousedown = (event) => {
            if (!gd._fullLayout || !gd._fullLayout.yaxis) return;
            xy_current_drag = {
                adjust: `Ch${y_source_channel}`,
                axisObj: gd._fullLayout.yaxis,
                startY: event.pageY,
                startOffset: xy_offsets[`Ch${y_source_channel}`],
                isX: false
            };
        };
    }
}

window.addEventListener('mousemove', (event) => {
    if (!xy_current_drag) return;
    document.body.setAttribute('style', 'cursor: grab !important');

    let delta_pixels;
    let px_per_unit = xy_current_drag.axisObj.r2p(1) - xy_current_drag.axisObj.r2p(0);

    if (xy_current_drag.isX) {
        delta_pixels = event.pageX - xy_current_drag.startX;
    } else {
        delta_pixels = event.pageY - xy_current_drag.startY;
    }

    let delta_data = delta_pixels / px_per_unit;
    let offset = xy_current_drag.startOffset + delta_data;

    if (offset < -4.9) offset = -4.9;
    else if (offset > 4.9) offset = 4.9;

    xy_offsets[xy_current_drag.adjust] = offset;
});

window.addEventListener('mouseup', (event) => {
    if (xy_current_drag) {
        let moved = xy_current_drag.isX ?
            Math.abs(event.pageX - xy_current_drag.startX) >= 2 :
            Math.abs(event.pageY - xy_current_drag.startY) >= 2;

        if (moved) {
            nlab.restartTraces(nLab);
        }

        xy_current_drag = null;
        document.body.removeAttribute('style');
    }
});

