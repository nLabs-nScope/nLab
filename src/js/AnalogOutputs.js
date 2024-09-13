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
        if(!freqLabel.classList.contains("editing")) {
            freqLabel.textContent = freqString.number;
            freqLabel.nextElementSibling.textContent = freqString.unit;
        }

        let amplitudeLabel = getId(`${ch}-amplitude`).labels[0];
        amplitudeLabel.textContent = amplitudeString.number;
        amplitudeLabel.nextElementSibling.textContent = amplitudeString.unit;

        if(sliders_free[`${ch}-freq`]) {
            getId(`${ch}-freq`).value = freqToVal(axState[ch].frequency);
        }

        if(sliders_free[`${ch}-amplitude`]) {
            getId(`${ch}-amplitude`).value = amplitudeToVal(axState[ch].amplitude);
        }

        document.querySelector(`input[name=${ch}-waveType][value=${axState[ch].waveType}]`).checked = true;
        document.querySelector(`input[name=${ch}-polarity][value=${axState[ch].polarity}]`).checked = true;
    }

}

export function initInput() {
    let axState = nscope.getAxStatus(nScope);
    update(axState);
}

function findNextITag(element) {
    let nextElement = element.nextElementSibling; // Start with the next sibling

    // Loop until you find an <i> tag or run out of siblings
    while (nextElement) {
        if (nextElement.tagName.toLowerCase() === 'i') {
            return nextElement; // Found the first <i> tag
        }
        nextElement = nextElement.nextElementSibling; // Move to the next sibling
    }

    return null; // No <i> tag found
}

for (let ch of ["A1", "A2"]) {

    getId(`${ch}-onoff`).onclick = function () {
        let checked = this.classList.contains("active");
        nscope.setAxOn(nScope, ch, checked);
    }

    getId(`${ch}-freq`).oninput = getId(`${ch}-freq`).onchange = function () {
        sliders_free[`${ch}-freq`] = false;
        let label = this.labels[0];
        let frequency = valToFreq(this.value);
        nscope.setAxFrequency(nScope, ch, frequency)
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
        nscope.setAxAmplitude(nScope, ch, amplitude)
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
            nscope.setAxWaveType(nScope, ch, wave);
        }
    }

    for (let button of document.querySelectorAll(`input[name=${ch}-polarity]`)) {
        button.onchange = function () {
            let wave = this.value;
            nscope.setAxPolarity(nScope, ch, wave);
        }
    }



    let label = document.querySelector(`label[for=${ch}-freq]`)
    let edit_button = findNextITag(label);

    edit_button.onclick = function () {
        if(this.classList.contains("editing")){
            label.classList.remove("editing");
            edit_button.classList.remove("editing");
            label.setAttribute("contenteditable", false);
            edit_button.classList.remove("fa-solid", "fa-check");
            edit_button.classList.add("fa-regular", "fa-pen-to-square");
        } else {
            label.setAttribute("contenteditable", true);

            const range = document.createRange();
            const selection = window.getSelection();

            range.selectNodeContents(label);
            selection.removeAllRanges();
            selection.addRange(range);
            label.classList.add("editing");
            edit_button.classList.add("editing");
            edit_button.classList.remove("fa-regular", "fa-pen-to-square");
            edit_button.classList.add("fa-solid", "fa-check");
        }
    }

    label.onclick = function () {
        label.setAttribute("contenteditable", true);

        const range = document.createRange();
        const selection = window.getSelection();

        range.selectNodeContents(label);
        selection.removeAllRanges();
        selection.addRange(range);
        label.classList.add("editing");
        edit_button.classList.add("editing");
        edit_button.classList.remove("fa-regular", "fa-pen-to-square");
        edit_button.classList.add("fa-solid", "fa-check");
    }
    label.onkeydown = function (event) {
        const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-'];

        // Allow backspace, delete, etc.
        if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            return;
        }

        // Prevent input if the key is not allowed
        if (!allowedKeys.includes(event.key)) {
            event.preventDefault();
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            label.classList.remove("editing");
            edit_button.classList.remove("editing");
            label.setAttribute("contenteditable", false);
            edit_button.classList.remove("fa-solid", "fa-check");
            edit_button.classList.add("fa-regular", "fa-pen-to-square");
        }
    }
}