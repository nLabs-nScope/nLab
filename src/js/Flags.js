export function drawShapes(trigger_status) {



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
            visible: trigger_status.isOn
        },
        { // Shape 1 is the horizontal trigger line
            type: 'line',
            layer: 'below',
            x0: 0,
            y0: trigger_status.level,
            x1: 12,
            y1: trigger_status.level,
            line: {
                color: 'rgba(255,255,255,1)',
                width: 3.0,
                dash: 'dash'
            },
            visible: trigger_status.isOn
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
            yanchor: trigger_status.level,
            fillcolor: 'rgba(255,255,255,1)',
            line: {
                width: 0
            },
            visible: trigger_status.isOn
        },
    ]
}