
export const colors = [
    'rgb(233,102,86)',
    'rgb(52,210,146)',
    'rgb(58,176,226)',
    'rgb(246,216,97)'
];
export function channel_axis(ch, gain) {
    return {
        overlaying: 'y',
        range: [-5/gain, 5/gain],
        fixedrange: true,
        tickfont: {color: colors[ch-1]},
        // showticklabels: false,
        zeroline: false,
        showgrid: false,
        position: (ch-1)/3.0,
    }
}

export function update(chState) {
    return {
        yaxis2: channel_axis(1, chState["Ch1"].gain),
        yaxis3: channel_axis(2, chState["Ch2"].gain),
        yaxis4: channel_axis(3, chState["Ch3"].gain),
        yaxis5: channel_axis(4, chState["Ch4"].gain),
    }
}