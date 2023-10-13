import {getId, isEmpty} from './Utils.js'
import {colors, ranges} from './Axes.js'


export function drawShapes(triggerState, chState) {

    let draw_ch_flags = {}
    if (isEmpty(chState)) {
        for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
            draw_ch_flags[ch] = false;
        }
    } else {
        for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
            draw_ch_flags[ch] = chState[ch].isOn;
        }
    }

    return [
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
            visible: triggerState.isOn
        },
        { // Shape 1 is the horizontal trigger line
            type: 'line',
            layer: 'below',
            x0: 0,
            y0: triggerState.level,
            x1: 12,
            y1: triggerState.level,
            line: {
                color: 'rgba(255,255,255,1)',
                width: 3.0,
                dash: 'dash'
            },
            visible: triggerState.isOn
        },
        { // Shape 2 is the triangle
            type: 'path',
            label: {
                text: "T",
                font: {
                    color: 'rgba(0,0,0,1)',
                    size: 12,
                },
                textposition: 'middle left',
                xanchor: 'left',
                padding: 10,
            },
            path: 'M 0 0 L 10 7 L 26 7 L 26 -7 L 10 -7 Z',
            xsizemode: 'pixel',
            ysizemode: 'pixel',
            xanchor: 12,
            yanchor: triggerState.level,
            fillcolor: 'rgba(255,255,255,1)',
            line: {
                width: 0
            },
            visible: triggerState.isOn
        },
        { // Shape 3 is new
            type: 'path',
            label: {
                text: "1",
                font: {
                    color: 'rgba(255,255,255,1)',
                    size: 12,
                },
                textposition: 'middle left',
                xanchor: 'left',
                padding: 10,
            },
            path: 'M 0 0 L 10 7 L 26 7 L 26 -7 L 10 -7 Z',
            xsizemode: 'pixel',
            ysizemode: 'pixel',
            xanchor: 12,
            yanchor: 0,
            yref: 'y2',
            fillcolor: colors["Ch1"],
            line: {
                width: 0
            },
            visible: draw_ch_flags["Ch1"]
        },
    ]
}

let current_drag = null;

function attachEventListeners() {
    let gd = getId('scope-graph')
    let shape = document.querySelector('.shapelayer .shape-group[data-index="3"]');
    if (shape) {
        shape.addEventListener('mousedown', (event) => {
            current_drag = {
                "adjust": "Ch1",
                "startX": event.pageX,
                "startY": event.pageY,
                "yaxis": gd._fullLayout.yaxis2,
                "startZP": gd._fullLayout.yaxis2.r2p(0),
            };
        });
    }
}

export function initDragEvents() {
    let gd = getId('scope-graph')
    gd.on('plotly_afterplot', attachEventListeners)

    window.addEventListener('mousemove', (event) => {
        if (current_drag == null) {
            return;
        }
        if (["Ch1", "Ch2", "Ch3", "Ch4"].includes(current_drag.adjust)) {
            let delta = event.pageY - current_drag.startY;
            let new_zero_pixel = current_drag.startZP + delta;
            if (new_zero_pixel < 10) {
                new_zero_pixel = 10;
            } else if (new_zero_pixel > current_drag.yaxis._length - 10) {
                new_zero_pixel = current_drag.yaxis._length - 10;
            }

            let new_center = current_drag.yaxis.p2r(new_zero_pixel);
            let range = current_drag.yaxis.range;
            ranges[current_drag.adjust] = [
                range[0] - new_center,
                range[1] - new_center
            ]
        }

    });
    window.addEventListener('mouseup', (event) => {
        if (current_drag) {
            current_drag = null;
        }
    });
}

