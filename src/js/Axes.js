import { idFromCh } from './Utils.js'

export function getCSSVar(name) {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export const colors = {
    get Ch1() { return getCSSVar('--ch1-color') },
    get Ch2() { return getCSSVar('--ch2-color') },
    get Ch3() { return getCSSVar('--ch3-color') },
    get Ch4() { return getCSSVar('--ch4-color') },
    get Trigger() { return getCSSVar('--trigger-color') },
};

export const text_colors = {
    get Ch1() { return getCSSVar('--ch1-text') },
    get Ch2() { return getCSSVar('--ch2-text') },
    get Ch3() { return getCSSVar('--ch3-text') },
    get Ch4() { return getCSSVar('--ch4-text') },
    get Trigger() { return getCSSVar('--trigger-text') },
}

export var ranges = {
    "Ch1": [-5, 5],
    "Ch2": [-5, 5],
    "Ch3": [-5, 5],
    "Ch4": [-5, 5],
};


export function channel_axis(ch) {
    return {
        overlaying: 'y',
        range: ranges[ch],
        fixedrange: true,
        tickfont: { color: colors[ch] },
        showticklabels: false,
        zeroline: false,
        showgrid: false,
        position: (idFromCh(ch) - 1) / 3.0,
    }
}

export function update() {
    return {
        yaxis2: channel_axis("Ch1"),
        yaxis3: channel_axis("Ch2"),
        yaxis4: channel_axis("Ch3"),
        yaxis5: channel_axis("Ch4"),
    }
}