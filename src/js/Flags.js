import {getId, isEmpty, idFromCh} from './Utils.js'
import {colors, text_colors, ranges} from './Axes.js'
import {setAnalogInputRange} from "./AnalogInputs.js";
import {adjustTriggerLevel} from './Trigger'


function drawChannelFlag(ch, visible) {
    return {
        type: 'path',
        label: {
            text: `${idFromCh(ch)}`,
            font: {
                color: text_colors[ch],
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
        yref: `y${idFromCh(ch) + 1}`,
        fillcolor: colors[ch],
        line: {
            width: 0
        },
        visible: visible
    }
}

function drawChannelZeroLine(ch, visible) {
    return {
        type: 'line',
        // layer: 'below',
        x0: 0,
        y0: 0,
        x1: 12,
        y1: 0,
        yref: `y${idFromCh(ch) + 1}`,
        line: {
            color: colors[ch],
            width: 1.5,
            dash: 'dot'
        },
        visible: visible
    }
}

function drawTriggerShapes(triggerState) {
    return [
        { // Flag shape
            type: 'path',
            label: {
                text: "T",
                font: {
                    color: text_colors[triggerState.source],
                    size: 10,
                },
                textposition: 'middle left',
                xanchor: 'right',
                padding: 10,
            },
            path: 'M 0 0 L -10 7 L -26 7 L -26 -7 L -10 -7 Z',
            xsizemode: 'pixel',
            ysizemode: 'pixel',
            xanchor: 0,
            yanchor: triggerState.level,
            yref: `y${idFromCh(triggerState.source) + 1}`,
            fillcolor: colors[triggerState.source],
            line: {
                width: 2,
                color: colors["Trigger"],
            },
            visible: triggerState.isOn
        },
        { // Horizontal Line
            type: 'line',
            layer: 'above',
            x0: 0,
            y0: triggerState.level,
            x1: 12,
            y1: triggerState.level,
            yref: `y${idFromCh(triggerState.source) + 1}`,
            line: {
                color: colors["Trigger"],
                width: 1.0,
                dash: 'dot',
            },
            visible: triggerState.isOn
        },
        {
            type: 'line',
            layer: 'above',
            x0: 1,
            y0: -5,
            x1: 1,
            y1: 5,
            line: {
                color: colors["Trigger"],
                width: 1.0,
                dash: 'dot',
            },
            visible: triggerState.isOn
        },
    ]
}

export function drawShapes(triggerState, chState) {

    let shapes = []

    if (isEmpty(chState)) {
        for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
            shapes.push(drawChannelFlag(ch, false));
        }
        for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
            shapes.push(drawChannelZeroLine(ch, false));
        }
    } else {
        for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
            shapes.push(drawChannelFlag(ch, chState[ch].isOn));
        }
        for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
            shapes.push(drawChannelZeroLine(ch, chState[ch].isOn));
        }
    }

    return shapes.concat(drawTriggerShapes(triggerState));
}

let current_drag = null;

function attachEventListeners() {
    let gd = getId('scope-graph')

    // Add mousedown handlers for each channel flag
    for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
        let shapeIndex = idFromCh(ch) - 1
        let axisIndex = `${idFromCh(ch) + 1}`
        let shape = document.querySelector(`.shapelayer .shape-group[data-index="${shapeIndex}"]`);
        if (shape) {
            shape.style.cursor = "grab";
            shape.addEventListener('mousedown', (event) => {
                current_drag = {
                    "adjust": ch,
                    "startX": event.pageX,
                    "startY": event.pageY,
                    "yaxis": gd._fullLayout[`yaxis${axisIndex}`],
                    "startZP": gd._fullLayout[`yaxis${axisIndex}`].r2p(0),
                };
            });
        }
    }

    // Add a mousedown handler for the trigger flag
    let shapeIndex = 8; // Number of scope channels * 2
    let triggerState = nlab.getTriggerStatus(nLab);
    let axisIndex = `${idFromCh(triggerState.source) + 1}`
    let shape = document.querySelector(`.shapelayer .shape-group[data-index="${shapeIndex}"]`);
    if (shape) {
        shape.style.cursor = "grab";
        shape.addEventListener('mousedown', (event) => {
            current_drag = {
                "adjust": "Trigger",
                "startX": event.pageX,
                "startY": event.pageY,
                "yaxis": gd._fullLayout[`yaxis${axisIndex}`],
                "startZP": gd._fullLayout[`yaxis${axisIndex}`].r2p(triggerState.level),
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
        document.body.setAttribute('style', 'cursor: grab !important');

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
        } else if (current_drag.adjust === "Trigger") {
            let delta = event.pageY - current_drag.startY;
            let new_trigger_pixel = current_drag.startZP + delta;
            if (new_trigger_pixel < 10) {
                new_trigger_pixel = 10;
            } else if (new_trigger_pixel > current_drag.yaxis._length - 10) {
                new_trigger_pixel = current_drag.yaxis._length - 10;
            }

            let new_trigger_level = current_drag.yaxis.p2r(new_trigger_pixel);
            if (new_trigger_level < -4.5) {
                new_trigger_level = -4.5;
            } else if (new_trigger_level > 4.5) {
                new_trigger_level = 4.5;
            }

            adjustTriggerLevel(new_trigger_level);
        }

    });
    window.addEventListener('mouseup', (event) => {
        if (current_drag) {

            if (Math.abs(event.pageY - current_drag.startY) < 2) {
                current_drag = null;
                document.body.removeAttribute('style');
                return;
            }

            if (["Ch1", "Ch2", "Ch3", "Ch4"].includes(current_drag.adjust)) {
                setAnalogInputRange(current_drag.adjust);
                nlab.restartTraces(nLab);
            }
            if (current_drag.adjust === "Trigger") {
                nlab.reTriggerIfNotTriggered(nLab);
            }
            current_drag = null;
            document.body.removeAttribute('style');
        }
    });
}

