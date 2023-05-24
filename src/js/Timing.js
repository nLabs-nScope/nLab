import {getId, isEmpty} from './Utils.js';

let time_per_div = [
    ["1.0 s/div", "4800 pts\n400 Sa/s"],
    ["0.5 s/div", "4800 pts\n800 Sa/s"],
    ["0.2 s/div", "4800 pts\n2k Sa/s"],
    ["0.1 s/div", "2400 pts\n2k Sa/s"],
    ["50 ms/div", "2400 pts\n4k Sa/s"],
    ["20 ms/div", "600 pts\n2.5k Sa/s"],
    ["10 ms/div", "600 pts\n5k Sa/s"],
    ["5 ms/div", "600 pts\n10k Sa/s"],
    ["2 ms/div", "600 pts\n25k Sa/s"],
    ["1 ms/div", "600 pts\n50k Sa/s"],
    ["0.5 ms/div", "600 pts\n100k Sa/s"],
    ["0.2 ms/div", "600 pts\n250k Sa/s"],
    ["0.1 ms/div", "600 pts\n500k Sa/s"],
    ["50 µs/div", "600 pts\n1M Sa/s"],
    ["20 µs/div", "240 pts\n1M Sa/s"],
    ["10 µs/div", "120 pts\n1M Sa/s"]
]

getId("horizontal-slider").oninput = function () {
    getId("time-per-div").textContent = time_per_div[this.value][0]
    getId("sample-rate").textContent = time_per_div[this.value][1]
}

export function initTiming() {
    // console.log("Running!");
    getId("horizontal-slider").value = 0;
    getId("horizontal-slider").dispatchEvent(new Event('input'));
}