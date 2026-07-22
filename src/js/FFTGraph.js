import { getId } from './Utils.js';
import * as extraGraph from './ExtraGraph'
import * as timing from './Timing.js'
import Plotly from "plotly.js-basic-dist";
import * as axes from "./Axes";
const FFT = require('fft.js');

let fft_active = false;
export function isActive() { return fft_active; }

let is_log_scale = true;

function handle_graph_view_change(id) {
    switch (id) {
        case "fft-graph-view-horizontal":
            extraGraph.view_horizontal_split_extra_graph();
            break;
        case "fft-graph-view-vertical":
            extraGraph.view_vertical_split_extra_graph();
            break;
        case "fft-graph-view-full":
            extraGraph.view_full_extra_graph();
            break;
    }
}

let collapseFFT = getId('collapseFFT');
if (collapseFFT) {
    collapseFFT.addEventListener('show.bs.collapse', function () {
        show_fft_graph();
        // Collapse XY if it is open
        let collapseOne = getId('collapseOne');
        if (collapseOne && collapseOne.classList.contains('show')) {
            let bsCollapse = bootstrap.Collapse.getInstance(collapseOne) || new bootstrap.Collapse(collapseOne, {toggle: false});
            bsCollapse.hide();
        }
    });
    collapseFFT.addEventListener('hide.bs.collapse', function () {
        hide_fft_graph();
    });
}

export function show_fft_graph() {
    if (fft_active) return;
    fft_active = true;
    
    is_log_scale = getId('fft-scale-log').checked;

    extraGraph.set_update_function(update_plot);

    const selected_view = document.querySelector('#fft-graph-view input[name="fft-graph-view"]:checked');
    if (selected_view) {
        handle_graph_view_change(selected_view.id);
    }

    void getId('scope-graph-extra').offsetWidth;
    init_plot();

    timing.setExtraLabelFormatter((text) => {
        // We can just return Frequency Domain here
        return "Frequency Domain";
    });
    getId('extra-graphs-button').classList.add('active');
}

export function hide_fft_graph() {
    fft_active = false;
    timing.setExtraLabelFormatter(null);
    extraGraph.hide_extra_graph();
    extraGraph.clear_update_function();
    destroy_plot();
    getId('extra-graphs-button').classList.remove('active');
}

for (let button of document.querySelectorAll("input[name=fft-graph-view]")) {
    button.onchange = function () {
        handle_graph_view_change(this.id);
    }
}

for (let button of document.querySelectorAll("input[name=fft-graph-scale]")) {
    button.onchange = function () {
        is_log_scale = getId('fft-scale-log').checked;
        if (fft_active) {
            let layout_update = {
                'yaxis.title.text': is_log_scale ? 'Magnitude (dB)' : 'Magnitude (Linear)',
                'yaxis.range': is_log_scale ? [-100, 20] : [0, 5]
            };
            Plotly.relayout('scope-graph-extra', layout_update);
        }
    }
}

function init_plot() {
    let traces = [
        { x: [], y: [], line: { color: axes.colors["Ch1"], width: 1 }, name: 'Ch1', xaxis: 'x', yaxis: 'y', showlegend: false },
        { x: [], y: [], line: { color: axes.colors["Ch2"], width: 1 }, name: 'Ch2', xaxis: 'x', yaxis: 'y', showlegend: false },
        { x: [], y: [], line: { color: axes.colors["Ch3"], width: 1 }, name: 'Ch3', xaxis: 'x', yaxis: 'y', showlegend: false },
        { x: [], y: [], line: { color: axes.colors["Ch4"], width: 1 }, name: 'Ch4', xaxis: 'x', yaxis: 'y', showlegend: false },
    ];
    let config = {
        responsive: true,
        displayModeBar: false
    }
    let layout = {
        margin: {
            l: 45,
            t: 20,
            r: 30,
            b: 40,
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        hovermode: false,
        showlegend: false,
        xaxis: {
            title: {
                text: 'Frequency (Hz)',
                font: { size: 12, color: 'rgba(255,255,255,0.7)' },
                standoff: 10
            },
            showticklabels: true,
            tickfont: { color: 'rgba(255,255,255,0.7)', size: 10 },
            zeroline: false,
            showgrid: true,
            gridcolor: 'rgba(100,100,100,0.5)',
            linecolor: 'rgba(100,100,100,1)',
            linewidth: 1,
            mirror: true
        },
        yaxis: {
            title: {
                text: is_log_scale ? 'Magnitude (dB)' : 'Magnitude (Linear)',
                font: { size: 12, color: 'rgba(255,255,255,0.7)' },
                standoff: 10
            },
            showticklabels: true,
            tickfont: { color: 'rgba(255,255,255,0.7)', size: 10 },
            zeroline: false,
            showgrid: true,
            gridcolor: 'rgba(100,100,100,0.5)',
            linecolor: 'rgba(100,100,100,1)',
            linewidth: 1,
            mirror: true,
            autorange: false,
            range: is_log_scale ? [-100, 20] : [0, 5]
        }
    };
    Plotly.newPlot('scope-graph-extra', traces, layout, config);
}

function destroy_plot() {
    Plotly.purge('scope-graph-extra');
}

function get_next_power_of_two(num) {
    if (num <= 0) return 1;
    let power = 1;
    while (power < num) power *= 2;
    // We want the largest power of 2 that is <= num, since we just truncate the data
    if (power > num) return power / 2;
    return power;
}

let fft_cache = {};
let last_x = [[], [], [], []];
let last_y = [[], [], [], []];

function update_plot(trace_data) {
    let gd = getId('scope-graph-extra');
    if (!gd || !gd._fullLayout || gd.classList.contains('d-none')) return;

    let sample_rate = timing.getSampleRate();
    
    let x_arrays = [];
    let y_arrays = [];

    for (let ch_idx = 0; ch_idx < 4; ch_idx++) {
        let ch = `Ch${ch_idx + 1}`;
        let raw_y = trace_data.y[ch_idx];
        
        // Check if channel is active (has data)
        let ch_btn = getId(`${ch}-onoff`);
        let is_active = ch_btn && ch_btn.classList.contains('active');

        if (!is_active || !raw_y || raw_y.length === 0) {
            x_arrays.push([]);
            y_arrays.push([]);
            continue;
        }

        let num_samples = raw_y.length;
        let n = get_next_power_of_two(num_samples);
        if (n < 4) {
            x_arrays.push([]);
            y_arrays.push([]);
            continue;
        }

        // Initialize or retrieve FFT instance for this size
        if (!fft_cache[n]) {
            fft_cache[n] = new FFT(n);
        }
        let f = fft_cache[n];

        // Check if the first n elements contain any gaps (null or undefined)
        // This indicates the sweep is still ongoing in this region
        let has_gap = false;
        for (let i = 0; i < n; i++) {
            if (raw_y[i] === null || raw_y[i] === undefined) {
                has_gap = true;
                break;
            }
        }

        // If there's a gap, hold the previous FFT frame to prevent jitter
        if (has_gap) {
            x_arrays.push(last_x[ch_idx]);
            y_arrays.push(last_y[ch_idx]);
            continue;
        }

        let input = new Array(n);
        for (let i = 0; i < n; i++) {
            // Apply Hanning window
            let multiplier = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
            input[i] = raw_y[i] * multiplier;
        }

        let out = f.createComplexArray();
        f.realTransform(out, input);

        let half_n = n / 2;
        let freqs = new Float32Array(half_n);
        let mags = new Float32Array(half_n);

        for (let i = 0; i < half_n; i++) {
            freqs[i] = (i * sample_rate) / n;
            
            let real = out[2 * i];
            let imag = out[2 * i + 1];
            let mag = Math.sqrt(real * real + imag * imag) / n;
            if (i > 0) mag *= 2; 

            if (is_log_scale) {
                mag = 20 * Math.log10(mag + 1e-12);
            }

            mags[i] = mag;
        }

        last_x[ch_idx] = freqs;
        last_y[ch_idx] = mags;

        x_arrays.push(freqs);
        y_arrays.push(mags);
    }

    Plotly.update('scope-graph-extra', {
        x: x_arrays,
        y: y_arrays
    });
}
