import {getId, isEmpty} from './Utils.js';

let time_per_div_4 = [
    ["1 s/div", "4800 pts\n400 Sa/s", 4800, 400.0],
    ["500 ms/div", "4800 pts\n800 Sa/s", 4800, 800.0],
    ["200 ms/div", "4800 pts\n2k Sa/s", 4800, 2000.0],
    ["100 ms/div", "2400 pts\n2k Sa/s", 2400, 2000.0],
    ["50 ms/div", "1500 pts\n4k Sa/s", 2400, 2500.0],
    ["20 ms/div", "600 pts\n2.5k Sa/s", 600, 2500.0],
    ["10 ms/div", "600 pts\n5k Sa/s", 600, 5000.0],
    ["5 ms/div", "600 pts\n10k Sa/s", 600, 10000.0],
    ["2 ms/div", "600 pts\n25k Sa/s", 600, 25000.0],
    ["1 ms/div", "600 pts\n50k Sa/s", 600, 50000.0],
    ["500 µs/div", "600 pts\n100k Sa/s", 600, 100000.0],
    ["200 µs/div", "600 pts\n250k Sa/s", 600, 250000.0],
    ["100 µs/div", "600 pts\n500k Sa/s", 600, 500000.0],
    ["50 µs/div", "600 pts\n1M Sa/s", 600, 1000000.0],
    ["20 µs/div", "240 pts\n1M Sa/s", 240, 1000000.0],
    ["10 µs/div", "120 pts\n1M Sa/s", 120, 1000000.0],
]
let time_per_div_2 = [
    ["1 s/div", "9600 pts\n800 Sa/s", 9600, 800.0],
    ["500 ms/div", "9600 pts\n1.6k Sa/s", 9600, 1600.0],
    ["200 ms/div", "9600 pts\n4 Sa/s", 9600, 4000.0],
    ["100 ms/div", "4800 pts\n4k Sa/s", 4800, 4000.0],
    ["50 ms/div", "3000 pts\n5k Sa/s", 3000, 5000.0],
    ["20 ms/div", "1200 pts\n5k Sa/s", 1200, 5000.0],
    ["10 ms/div", "1200 pts\n10k Sa/s", 1200, 10000.0],
    ["5 ms/div", "1200 pts\n20k Sa/s", 1200, 20000.0],
    ["2 ms/div", "1200 pts\n50k Sa/s", 1200, 50000.0],
    ["1 ms/div", "1200 pts\n100k Sa/s", 1200, 100000.0],
    ["500 µs/div", "1200 pts\n200k Sa/s", 1200, 200000.0],
    ["200 µs/div", "1200 pts\n500k Sa/s", 1200, 500000.0],
    ["100 µs/div", "1200 pts\n1M Sa/s", 1200, 1000000.0],
    ["50 µs/div", "1200 pts\n2M Sa/s", 1200, 2000000.0],
    ["20 µs/div", "480 pts\n2M Sa/s", 480, 2000000.0],
    ["10 µs/div", "240 pts\n2M Sa/s", 240, 2000000.0]
]
let time_per_div_1 = [
    ["1 s/div", "19.2k pts\n1.6k Sa/s", 19200, 1600.0],
    ["500 ms/div", "19.2k pts\n3.2k Sa/s", 19200, 3200.0],
    ["200 ms/div", "19.2k pts\n8k Sa/s", 19200, 8000.0],
    ["100 ms/div", "9600 pts\n8k Sa/s", 9600, 8000.0],
    ["50 ms/div", "6000 pts\n10k Sa/s", 6000, 10000.0],
    ["20 ms/div", "2400 pts\n10k Sa/s", 2400, 10000.0],
    ["10 ms/div", "2400 pts\n20k Sa/s", 2400, 20000.0],
    ["5 ms/div", "2400 pts\n40k Sa/s", 2400, 40000.0],
    ["2 ms/div", "2400 pts\n100k Sa/s", 2400, 100000.0],
    ["1 ms/div", "2400 pts\n200k Sa/s", 2400, 200000.0],
    ["500 µs/div", "2400 pts\n400k Sa/s", 2400, 400000.0],
    ["200 µs/div", "2400 pts\n1M Sa/s", 2400, 1000000.0],
    ["100 µs/div", "2400 pts\n2M Sa/s", 2400, 2000000.0],
    ["50 µs/div", "2400 pts\n4M Sa/s", 2400, 4000000.0],
    ["20 µs/div", "960 pts\n4M Sa/s", 960, 4000000.0],
    ["10 µs/div", "480 pts\n4M Sa/s", 480, 4000000.0],
]

// We need to pick different timing characteristics for different sampling multiplex setups
let time_per_div = {
    "1": time_per_div_1,
    "2": time_per_div_2,
    "4": time_per_div_4,
}

let time_per_div_v2 = [
    ["1 s/div", "19.2k pts\n1.6k Sa/s", 19200, 1600.0],
    ["500 ms/div", "19.2k pts\n3.2k Sa/s", 19200, 3200.0],
    ["200 ms/div", "19.2k pts\n8k Sa/s", 19200, 8000.0],
    ["100 ms/div", "9600 pts\n8k Sa/s", 9600, 8000.0],
    ["50 ms/div", "6000 pts\n10k Sa/s", 6000, 10000.0],
    ["20 ms/div", "2400 pts\n10k Sa/s", 2400, 10000.0],
    ["10 ms/div", "2400 pts\n20k Sa/s", 2400, 20000.0],
    ["5 ms/div", "2400 pts\n40k Sa/s", 2400, 40000.0],
    ["2 ms/div", "2400 pts\n100k Sa/s", 2400, 100000.0],
    ["1 ms/div", "2400 pts\n200k Sa/s", 2400, 200000.0],
    ["500 µs/div", "2400 pts\n400k Sa/s", 2400, 400000.0],
    ["200 µs/div", "2400 pts\n1M Sa/s", 2400, 1000000.0],
    ["100 µs/div", "2400 pts\n2M Sa/s", 2400, 2000000.0],
    ["50 µs/div", "1200 pts\n4M Sa/s", 1200, 2000000.0],
    ["20 µs/div", "480 pts\n4M Sa/s", 480, 2000000.0],
]

export function initTiming() {
    getId("horizontal-slider").value = 2;
    getId("horizontal-slider").dispatchEvent(new Event('input'));
}

export function setTiming() {
    let time_slider_idx = getId("horizontal-slider").value
    let sampling_multiplex = nscope.getSamplingMultiplex(nScope)

    let num_samples = 0;
    let sample_rate = 0;

    if (nscope.version(nScope) < 0x0200) {
        getId("time-per-div").textContent = time_per_div[sampling_multiplex][time_slider_idx][0]
        getId("sample-rate").textContent = time_per_div[sampling_multiplex][time_slider_idx][1]
        num_samples = time_per_div[sampling_multiplex][time_slider_idx][2];
        sample_rate = time_per_div[sampling_multiplex][time_slider_idx][3];
    } else {
        getId("time-per-div").textContent = time_per_div_v2[time_slider_idx][0]
        getId("sample-rate").textContent = time_per_div_v2[time_slider_idx][1]
        num_samples = time_per_div_v2[time_slider_idx][2];
        sample_rate = time_per_div_v2[time_slider_idx][3];
    }

    let seconds_per_div = num_samples / 12 / sample_rate;
    nscope.setTriggerDelay(nScope, seconds_per_div * 1_000_000);
    nscope.setTimingParameters(nScope, sample_rate, num_samples);
}

export function update() {
    if (nscope.isConnected(nScope)) {
        getId("horizontal-info").classList.remove("disabled");
        getId("horizontal-slider").classList.remove("disabled");
    } else {
        getId("horizontal-info").classList.add("disabled");
        getId("horizontal-slider").classList.add("disabled");
    }

    if (nscope.version(nScope) >= 0x0200 && getId("horizontal-slider").max == time_per_div_1.length - 1) {
        getId("horizontal-slider").max = time_per_div_v2.length - 1
        console.log(`setting max to ${time_per_div_v2.length - 1}`)
    } else if (nscope.version(nScope) < 0x0200 && getId("horizontal-slider").max == time_per_div_v2.length - 1) {
        getId("horizontal-slider").max = time_per_div_1.length - 1
        console.log(`setting max to ${time_per_div_1.length - 1}`)
    }
}

getId("horizontal-slider").oninput = setTiming;
