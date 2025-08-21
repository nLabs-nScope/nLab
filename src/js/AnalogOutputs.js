import {getId, isEmpty} from './Utils.js';
import * as precisionInput from './PrecisionInput'

function valToAmplitude(val) {
    val = parseFloat(val);
    return val / 100.0 * 4 + 0.5;
}

function amplitudeToVal(amplitude) {
    return (amplitude - 0.5) / 4.0 * 100.0;
}

function amplitudeToString(amplitude) {
    let amplitudeString = {};
    if (amplitude < 1.01) {
        amplitudeString.number = amplitude.toPrecision(1);
    } else {
        amplitudeString.number = amplitude.toPrecision(2);
    }
    amplitudeString.unit = 'V';
    return amplitudeString;
}

function valToFreq(val) {
    val = parseFloat(val);
    let freq = Math.pow(10, val / 100.0 * (Math.log10(20000) + 1) - 1);
    return freq;
}

function freqToVal(freq) {
    let val = (Math.log10(freq) + 1) / Math.log10(20000) * 100.0;
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
    "A1-freq": true,
    "A2-freq": true,
    "A1-amplitude": true,
    "A2-amplitude": true,
}

export function update(axState) {

    if (isEmpty(axState)) {
        for (let ch of ["A1", "A2"]) {
            getId(`${ch}-controls`).classList.add("disabled");
        }
        return;
    }

    for (let ch of ["A1", "A2"]) {
        getId(`${ch}-controls`).classList.remove("disabled");
        if (axState[ch].isOn) {
            getId(`${ch}-onoff`).classList.add("active");
        } else {
            getId(`${ch}-onoff`).classList.remove("active")
        }

        let freqString = freqToString(axState[ch].frequency);
        let amplitudeString = amplitudeToString(axState[ch].amplitude);

        getId(`${ch}-status`).innerHTML = freqString.number + ' ' + freqString.unit + ' ' + amplitudeString.number + ' ' + amplitudeString.unit;

        let freqLabel = getId(`${ch}-freq`).labels[0];
        if (precisionInput.isNotEditable(freqLabel)) {
            freqLabel.textContent = freqString.number;
            freqLabel.nextElementSibling.textContent = freqString.unit;
        }

        let amplitudeLabel = getId(`${ch}-amplitude`).labels[0];
        if (precisionInput.isNotEditable(amplitudeLabel)) {
            amplitudeLabel.textContent = amplitudeString.number;
            amplitudeLabel.nextElementSibling.textContent = amplitudeString.unit;
        }

        if (sliders_free[`${ch}-freq`]) {
            getId(`${ch}-freq`).value = freqToVal(axState[ch].frequency);
        }

        if (sliders_free[`${ch}-amplitude`]) {
            getId(`${ch}-amplitude`).value = amplitudeToVal(axState[ch].amplitude);
        }

        document.querySelector(`input[name=${ch}-waveType][value=${axState[ch].waveType}]`).checked = true;
        document.querySelector(`input[name=${ch}-polarity][value=${axState[ch].polarity}]`).checked = true;
    }

}

export function initInput() {
    let axState = nlab.getAxStatus(nLab);
    update(axState);
}

for (let ch of ["A1", "A2"]) {

    getId(`${ch}-onoff`).onclick = function () {
        let checked = this.classList.contains("active");
        nlab.setAxOn(nLab, ch, checked);
    }

    getId(`${ch}-freq`).oninput = getId(`${ch}-freq`).onchange = function () {
        sliders_free[`${ch}-freq`] = false;
        let label = this.labels[0];
        let frequency = valToFreq(this.value);
        nlab.setAxFrequency(nLab, ch, frequency)
        let freqString = freqToString(frequency);
        label.textContent = freqString.number;
        label.nextElementSibling.textContent = freqString.unit;
    }

    getId(`${ch}-freq`).addEventListener('mouseup', function () {
        sliders_free[`${ch}-freq`] = true;
    });

    getId(`${ch}-amplitude`).oninput = getId(`${ch}-amplitude`).onchange = function () {
        sliders_free[`${ch}-amplitude`] = false;
        let label = this.labels[0];
        let amplitude = valToAmplitude(this.value);
        nlab.setAxAmplitude(nLab, ch, amplitude)
        let amplitudeString = amplitudeToString(amplitude);
        label.textContent = amplitudeString.number;
        label.nextElementSibling.textContent = amplitudeString.unit;
    }

    getId(`${ch}-amplitude`).addEventListener('mouseup', function () {
        sliders_free[`${ch}-amplitude`] = true;
    });

    for (let button of document.querySelectorAll(`input[name=${ch}-waveType]`)) {
        button.onchange = function () {
            let wave = this.value;
            nlab.setAxWaveType(nLab, ch, wave);
        }
    }

    for (let button of document.querySelectorAll(`input[name=${ch}-polarity]`)) {
        button.onchange = function () {
            let wave = this.value;
            nlab.setAxPolarity(nLab, ch, wave);
        }
    }

    let freqLabel = getId(`${ch}-freq`).labels[0];
    precisionInput.setup(freqLabel, (label)=> {
        let frequency = parseFloat(label.innerHTML);
        // TODO: handle this in the driver layer
        frequency = Math.max(0.1, Math.min(20000, frequency));
        nlab.setAxFrequency(nLab, ch, frequency);
    });

    let amplitudeLabel = getId(`${ch}-amplitude`).labels[0];
    precisionInput.setup(amplitudeLabel, (label) => {
        let amplitude = parseFloat(label.innerHTML);
        // TODO: handle this in the driver layer
        amplitude = Math.max(0, Math.min(4.5, amplitude));
        nlab.setAxAmplitude(nLab, ch, amplitude);
    });

}