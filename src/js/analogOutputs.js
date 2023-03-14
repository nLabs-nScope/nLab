import {getId, isEmpty} from './Utils.js';

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
    let freq = Math.pow(10, val / 100.0 * 5.3 - 1);
    return freq;
}

function freqToVal(freq) {
    let val = (Math.log10(freq) + 1) / 4.3 * 100.0;
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

export function initInput() {

    let axState = nscope.getAxStatus(nScope);

    for (let ch of ["A1", "A2"]) {

        let freqString = freqToString(axState[ch].frequency);
        let amplitudeString = amplitudeToString(axState[ch].amplitude);

        let freqLabel = getId(`${ch}-freq`).labels[0];
        let amplitudeLabel = getId(`${ch}-amplitude`).labels[0];

        freqLabel.textContent = freqString.number;
        freqLabel.nextElementSibling.textContent = freqString.unit;

        amplitudeLabel.textContent = amplitudeString.number;
        amplitudeLabel.nextElementSibling.textContent = amplitudeString.unit;

        getId(`${ch}-freq`).value = freqToVal(axState[ch].frequency);
        getId(`${ch}-amplitude`).value = amplitudeToVal(axState[ch].amplitude);

        document.querySelector(`input[name=${ch}-waveType][value=${axState[ch].waveType}]`).checked = true;
        document.querySelector(`input[name=${ch}-polarity][value=${axState[ch].polarity}]`).checked = true;
    }
}


export function update(axState) {

    if (isEmpty(axState)) {
        console.log("Empty: handle this");
        return;
    }

    for (let ch of ["A1", "A2"]) {
        if (axState[ch].isOn) {
            getId(`${ch}-onoff`).classList.add("active");
        } else {
            getId(`${ch}-onoff`).classList.remove("active")
        }

        let freqString = freqToString(axState[ch].frequency);
        let amplitudeString = amplitudeToString(axState[ch].amplitude);

        getId(`${ch}-status`).innerHTML = freqString.number + ' ' + freqString.unit + ' ' + amplitudeString.number + ' ' + amplitudeString.unit;
    }

}

for (let ch of ["A1", "A2"]) {

    getId(`${ch}-onoff`).onclick = function () {
        let checked = this.classList.contains("active");
        nscope.setAxOn(nScope, ch, checked);
    }

    getId(`${ch}-freq`).onchange = function () {
        let frequency = valToFreq(this.value)
        nscope.setAxFrequency(nScope, ch, frequency)
    }

    getId(`${ch}-freq`).oninput = function () {
        let label = this.labels[0];
        let frequency = valToFreq(this.value);
        let freqString = freqToString(frequency);
        label.textContent = freqString.number;
        label.nextElementSibling.textContent = freqString.unit;
    }

    getId(`${ch}-amplitude`).onchange = function () {
        let amplitude = valToAmplitude(this.value)
        nscope.setAxAmplitude(nScope, ch, amplitude)
    }

    getId(`${ch}-amplitude`).oninput = function () {
        let label = this.labels[0];
        let amplitude = valToAmplitude(this.value);
        let amplitudeString = amplitudeToString(amplitude);
        label.textContent = amplitudeString.number;
        label.nextElementSibling.textContent = amplitudeString.unit;
    }

    for (let button of document.querySelectorAll(`input[name=${ch}-waveType]`)) {
        button.onchange = function () {
            let wave = this.value;
            nscope.setAxWaveType(nScope, ch, wave);
        }
    }

    for (let button of document.querySelectorAll(`input[name=${ch}-polarity]`)) {
        button.onchange = function () {
            let wave = this.value;
            nscope.setAxPolarity(nScope, ch, wave);
        }
    }
}