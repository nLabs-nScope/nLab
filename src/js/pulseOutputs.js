import { getId, isEmpty } from './Utils.js';

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
    let freq = Math.pow(10, val / 100.0 * 4.3);
    return freq;
}

function freqToVal(freq) {
    let val = Math.log10(freq) / 4.3 * 100.0;
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

    let frequency, duty, label, freqString, dutyString;


    let pxState = nscope.getPxStatus(nScope);

    for (let ch of ["P1", "P2"]) {

        let freqString = freqToString(pxState[ch].frequency);
        let dutyString = dutyToString(pxState[ch].duty);

        let freqLabel = getId(`${ch}-freq`).labels[0];
        let dutyLabel = getId(`${ch}-duty`).labels[0];

        freqLabel.textContent = freqString.number;
        freqLabel.nextElementSibling.textContent = freqString.unit;

        dutyLabel.textContent = dutyString.number;
        dutyLabel.nextElementSibling.textContent = dutyString.unit;

        getId(`${ch}-freq`).value = freqToVal(pxState[ch].frequency);
        getId(`${ch}-duty`).value = freqToVal(pxState[ch].duty);
    }

}

export function update(pxState) {

    if (isEmpty(pxState)) {
        console.log("Empty: handle this");
        return;
    }


    for (let ch of ["P1", "P2"]) {
        if (pxState[ch].isOn) {
            getId(`${ch}-onoff`).classList.add("active");
        } else {
            getId(`${ch}-onoff`).classList.remove("active")
        }

        let freqString = freqToString(pxState[ch].frequency);
        let dutyString = dutyToString(pxState[ch].duty);

        getId(`${ch}-status`).innerHTML = freqString.number + ' ' + freqString.unit + ' ' + dutyString.number + ' ' + dutyString.unit;
    }

}

getId("P1-onoff").onclick = function () {
    let checked = this.classList.contains("active");
    nscope.setPxOn(nScope, "P1", checked);
}

getId("P2-onoff").onclick = function () {
    let checked = this.classList.contains("active");
    nscope.setPxOn(nScope, "P2", checked);
}

getId("P1-freq").onchange = getId("P1-freq").oninput =
    getId("P2-freq").onchange = getId("P2-freq").oninput = function () {
        let label = this.labels[0];
        let frequency = valToFreq(this.value);
        let freqString = freqToString(frequency);
        label.textContent = freqString.number;
        label.nextElementSibling.textContent = freqString.unit;
    }

getId("P1-freq").onchange = function () {
    let frequency = valToFreq(this.value)
    nscope.setPxFrequency(nScope, "P1", frequency)
}

getId("P2-freq").onchange = function () {
    let frequency = valToFreq(this.value)
    nscope.setPxFrequency(nScope, "P2", frequency)
}

getId("P1-duty").onchange = getId("P1-duty").oninput =
    getId("P2-duty").onchange = getId("P2-duty").oninput = function () {
        let label = this.labels[0];
        let duty = valToDuty(this.value);
        let dutyString = dutyToString(duty);
        label.textContent = dutyString.number;
        label.nextElementSibling.textContent = dutyString.unit;
    }


getId("P1-duty").onchange = function () {
    let duty = valToDuty(this.value)
    nscope.setPxDuty(nScope, "P1", duty)
}

getId("P2-duty").onchange = function () {
    let duty = valToDuty(this.value)
    nscope.setPxDuty(nScope, "P2", duty)
}