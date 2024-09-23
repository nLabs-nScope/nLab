import {getId, isEmpty} from './Utils.js';
import * as precisionInput from './PrecisionInput'

function valToDuty(val) {
    val = parseFloat(val);
    return val;
}

function dutyToVal(duty) {
    return duty;
}

function dutyToString(duty) {
    let dutyString = {};
    dutyString.number = duty.toFixed(0);
    dutyString.unit = '%';
    return dutyString;
}

function valToFreq(val) {
    val = parseFloat(val);
    let freq = Math.pow(10, val / 100.0 * Math.log10(20000));
    return freq;
}

function freqToVal(freq) {
    let val = Math.log10(freq) / Math.log10(20000) * 100.0;
    return val;
}

function freqToString(freq) {

    let freqString = {};
    if (freq < 10) {
        freqString.number = freq.toPrecision(2);
        freqString.unit = "Hz";
    } else if (freq < 1000) {
        freqString.number = freq.toPrecision(3);
        freqString.unit = "Hz";
    } else if (freq < 1000000) {
        freqString.number = (freq / 1000).toPrecision(3);
        freqString.unit = "kHz";
    } else {
        freqString.number = (freq / 1000000).toPrecision(3);
        freqString.unit = "MHz";
    }
    return freqString;
}

let sliders_free = {
    "P1-freq": true,
    "P2-freq": true,
    "P1-duty": true,
    "P2-duty": true,
}

export function update(pxState) {

    if (isEmpty(pxState)) {
        for (let ch of ["P1", "P2"]) {
            getId(`${ch}-controls`).classList.add("disabled");
        }
        return;
    }

    for (let ch of ["P1", "P2"]) {
        getId(`${ch}-controls`).classList.remove("disabled");

        if (pxState[ch].isOn) {
            getId(`${ch}-onoff`).classList.add("active");
        } else {
            getId(`${ch}-onoff`).classList.remove("active")
        }

        let freqString = freqToString(pxState[ch].frequency);
        let dutyString = dutyToString(pxState[ch].duty);

        getId(`${ch}-status`).innerHTML = freqString.number + ' ' + freqString.unit + ' ' + dutyString.number + ' ' + dutyString.unit;

        let freqLabel = getId(`${ch}-freq`).labels[0];
        let dutyLabel = getId(`${ch}-duty`).labels[0];

        if (precisionInput.isNotEditable(freqLabel)) {
            freqLabel.textContent = freqString.number;
            freqLabel.nextElementSibling.textContent = freqString.unit;
        }

        if (precisionInput.isNotEditable(dutyLabel)) {
            dutyLabel.textContent = dutyString.number;
            dutyLabel.nextElementSibling.textContent = dutyString.unit;
        }

        if (sliders_free[`${ch}-freq`]) {
            getId(`${ch}-freq`).value = freqToVal(pxState[ch].frequency);
        }

        if (sliders_free[`${ch}-duty`]) {
            getId(`${ch}-duty`).value = dutyToVal(pxState[ch].duty);
        }
    }

}

export function initInput() {
    let pxState = nlab.getPxStatus(nLab);
    update(pxState);
}

for (let ch of ["P1", "P2"]) {

    getId(`${ch}-onoff`).onclick = function () {
        let checked = this.classList.contains("active");
        nlab.setPxOn(nLab, ch, checked);
    }

    getId(`${ch}-freq`).onchange = getId(`${ch}-freq`).oninput = function () {
        sliders_free[`${ch}-freq`] = false;
        let label = this.labels[0];
        let frequency = valToFreq(this.value);
        nlab.setPxFrequency(nLab, ch, frequency)
        let freqString = freqToString(frequency);
        label.textContent = freqString.number;
        label.nextElementSibling.textContent = freqString.unit;
    }

    getId(`${ch}-freq`).addEventListener('mouseup', function () {
        sliders_free[`${ch}-freq`] = true;
    });

    getId(`${ch}-duty`).onchange = getId(`${ch}-duty`).oninput = function () {
        sliders_free[`${ch}-duty`] = false;
        let label = this.labels[0];
        let duty = valToDuty(this.value);
        nlab.setPxDuty(nLab, ch, duty)
        let dutyString = dutyToString(duty);
        label.textContent = dutyString.number;
        label.nextElementSibling.textContent = dutyString.unit;
    }

    getId(`${ch}-duty`).addEventListener('mouseup', function () {
        sliders_free[`${ch}-duty`] = true;
    });

    let freqLabel = getId(`${ch}-freq`).labels[0];
    precisionInput.setup(freqLabel, (label)=> {
        let frequency = parseFloat(label.innerHTML);
        // TODO: handle this in the driver layer
        frequency = Math.max(1, Math.min(20000, frequency));
        nlab.setPxFrequency(nLab, ch, frequency);
    });

    let dutyLabel = getId(`${ch}-duty`).labels[0];
    precisionInput.setup(dutyLabel, (label) => {
        let duty = parseFloat(label.innerHTML);
        // TODO: handle this in the driver layer
        duty = Math.max(0, Math.min(100, duty));
        nlab.setPxDuty(nLab, ch, duty);
    });

}