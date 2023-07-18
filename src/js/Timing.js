import {getId, isEmpty} from './Utils.js';

let time_per_div_4 = [
    ["1.0 s/div", "4800 pts\n400 Sa/s", 4800, 400.0],
    ["0.5 s/div", "4800 pts\n800 Sa/s", 4800, 800.0],
    ["0.2 s/div", "4800 pts\n2k Sa/s", 4800, 2000.0],
    ["0.1 s/div", "2400 pts\n2k Sa/s", 2400, 2000.0],
    ["50 ms/div", "2400 pts\n4k Sa/s", 2400, 4000.0],
    ["20 ms/div", "600 pts\n2.5k Sa/s", 600, 2500.0],
    ["10 ms/div", "600 pts\n5k Sa/s", 600, 5000.0],
    ["5 ms/div", "600 pts\n10k Sa/s", 600, 10000.0],
    ["2 ms/div", "600 pts\n25k Sa/s", 600, 25000.0],
    ["1 ms/div", "600 pts\n50k Sa/s", 600, 50000.0],
    ["0.5 ms/div", "600 pts\n100k Sa/s", 600, 100000.0],
    ["0.2 ms/div", "600 pts\n250k Sa/s", 600, 250000.0],
    ["0.1 ms/div", "600 pts\n500k Sa/s", 600, 500000.0],
    ["50 µs/div", "600 pts\n1M Sa/s", 600, 1000000.0],
    ["20 µs/div", "240 pts\n1M Sa/s", 240, 1000000.0],
    ["10 µs/div", "120 pts\n1M Sa/s", 120, 1000000.0]
]
let time_per_div_2 = [
    ["1.0 s/div", "9600 pts\n800 Sa/s", 9600, 800.0],
    ["0.5 s/div", "9600 pts\n1.6k Sa/s", 9600, 1600.0],
    ["0.2 s/div", "9600 pts\n4 Sa/s", 9600, 4000.0],
    ["0.1 s/div", "4800 pts\n4k Sa/s", 4800, 4000.0],
    ["50 ms/div", "4800 pts\n8k Sa/s", 4800, 8000.0],
    ["20 ms/div", "1200 pts\n5k Sa/s", 1200, 5000.0],
    ["10 ms/div", "1200 pts\n10k Sa/s", 1200, 10000.0],
    ["5 ms/div", "1200 pts\n20k Sa/s", 1200, 20000.0],
    ["2 ms/div", "1200 pts\n50k Sa/s", 1200, 50000.0],
    ["1 ms/div", "1200 pts\n100k Sa/s", 1200, 100000.0],
    ["0.5 ms/div", "1200 pts\n200k Sa/s", 1200, 200000.0],
    ["0.2 ms/div", "1200 pts\n500k Sa/s", 1200, 500000.0],
    ["0.1 ms/div", "1200 pts\n1M Sa/s", 1200, 1000000.0],
    ["50 µs/div", "1200 pts\n2M Sa/s", 1200, 2000000.0],
    ["20 µs/div", "480 pts\n2M Sa/s", 480, 2000000.0],
    ["10 µs/div", "240 pts\n2M Sa/s", 240, 2000000.0]
]
let time_per_div_1 = [
    ["1.0 s/div", "19.2k pts\n1.6k Sa/s", 19200, 1600.0],
    ["0.5 s/div", "19.2k pts\n3.2k Sa/s", 19200, 3200.0],
    ["0.2 s/div", "19.2k pts\n8k Sa/s", 19200, 8000.0],
    ["0.1 s/div", "9600 pts\n8k Sa/s", 9600, 8000.0],
    ["50 ms/div", "9600 pts\n16k Sa/s", 9600, 16000.0],
    ["20 ms/div", "2400 pts\n10k Sa/s", 2400, 10000.0],
    ["10 ms/div", "2400 pts\n20k Sa/s", 2400, 20000.0],
    ["5 ms/div", "2400 pts\n40k Sa/s", 2400, 40000.0],
    ["2 ms/div", "2400 pts\n100k Sa/s", 2400, 100000.0],
    ["1 ms/div", "2400 pts\n200k Sa/s", 2400, 200000.0],
    ["0.5 ms/div", "2400 pts\n400k Sa/s", 2400, 400000.0],
    ["0.2 ms/div", "2400 pts\n1M Sa/s", 2400, 1000000.0],
    ["0.1 ms/div", "2400 pts\n2M Sa/s", 2400, 2000000.0],
    ["50 µs/div", "2400 pts\n4M Sa/s", 2400, 4000000.0],
    ["20 µs/div", "960 pts\n1M Sa/s", 960, 4000000.0],
    ["10 µs/div", "480 pts\n1M Sa/s", 480, 4000000.0]
]

let time_per_div = {
    "1": time_per_div_1,
    "2": time_per_div_2,
    "4": time_per_div_4,
}

export function initTiming() {
    getId("horizontal-slider").value = 0;
    getId("horizontal-slider").dispatchEvent(new Event('input'));
}

export function setTiming() {
    let time_slider_idx = getId("horizontal-slider").value
    let num_channels = nscope.getSamplingChannels(nScope)


    getId("time-per-div").textContent = time_per_div[num_channels][time_slider_idx][0]
    getId("sample-rate").textContent = time_per_div[num_channels][time_slider_idx][1]
    let num_samples = time_per_div[num_channels][time_slider_idx][2];
    let sample_rate = time_per_div[num_channels][time_slider_idx][3];
    nscope.setTimingParameters(nScope, sample_rate, num_samples);
}

getId("horizontal-slider").oninput = setTiming;
