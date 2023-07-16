import {getId, isEmpty} from './Utils.js';

let time_per_div = [
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

getId("horizontal-slider").oninput = function () {
    getId("time-per-div").textContent = time_per_div[this.value][0]
    getId("sample-rate").textContent = time_per_div[this.value][1]
    let num_samples = time_per_div[this.value][2];
    let sample_rate = time_per_div[this.value][3];
    nscope.setTimingParameters(nScope, sample_rate, num_samples);
}

export function initTiming() {
    getId("horizontal-slider").value = 0;
    getId("horizontal-slider").dispatchEvent(new Event('input'));
}