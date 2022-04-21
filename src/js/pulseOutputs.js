import {getId, isEmpty} from './Utils.js';

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
    let freq = Math.pow(10,val/100.0*4.3);
    return freq;
}

function freqToVal(freq) {
    let val = Math.log10(freq)/4.3*100.0;
    return val;
}

function freqToString(freq) {

    let freqString = {};
    if(freq < 10) {
        freqString.number = freq.toPrecision(2);
        freqString.unit = "Hz";
    } else if(freq < 1000) {
        freqString.number = freq.toPrecision(3);
        freqString.unit = "Hz";
    } else if (freq < 1000000) {
        freqString.number = (freq/1000).toPrecision(3);
        freqString.unit = "kHz";
    } else {
        freqString.number = (freq/1000000).toPrecision(3);
        freqString.unit = "MHz";
    }
    return freqString;
}

export function initInput() {
    
    let frequency, duty, label, freqString, dutyString;

    // TODO: Get frequency and duty from API
    frequency = 10;
    duty = 50;

    label = getId("P1-freq").labels[0]
    freqString = freqToString(frequency);
    label.textContent = freqString.number;
    label.nextElementSibling.textContent = freqString.unit;
    getId("P1-freq").value = freqToVal(frequency);

    label = getId("P1-duty").labels[0]
    dutyString = dutyToString(duty);
    label.textContent = dutyString.number;
    label.nextElementSibling.textContent = dutyString.unit;
    getId("P1-duty").value = dutyToVal(duty);

    // TODO: Get frequency and duty from API
    frequency = 10;
    duty = 50;

    label = getId("P2-freq").labels[0]
    freqString = freqToString(frequency);
    label.textContent = freqString.number;
    label.nextElementSibling.textContent = freqString.unit;
    getId("P2-freq").value = freqToVal(frequency);

    label = getId("P2-duty").labels[0]
    dutyString = dutyToString(duty);
    label.textContent = dutyString.number;
    label.nextElementSibling.textContent = dutyString.unit;
    getId("P2-duty").value = dutyToVal(duty);
    
}

export function update(pxState) {

    if(isEmpty(pxState)) {
        console.log("Empty: handle this");
        return;
    }
    

    for (let ch of ["P1", "P2"]) {
        if(pxState[ch].isOn){
            getId(`${ch}-onoff`).classList.add("active");
        } else {
            getId(`${ch}-onoff`).classList.remove("active")
        }

        let freqString = freqToString(pxState[ch].frequency);
        let dutyString = dutyToString(pxState[ch].duty);

        getId(`${ch}-status`).innerHTML = freqString.number+' '+freqString.unit+' '+dutyString.number+' '+dutyString.unit;
    }

}

getId("P1-onoff").onclick = function(){
    let checked = this.classList.contains("active");
    nscope.setPxOn(nScope, "P1", checked);
    // TODO: API call to turn on/off
}

getId("P2-onoff").onclick = function(){
    let checked = this.classList.contains("active");
    nscope.setPxOn(nScope, "P2", checked);
    // TODO: API call to turn on/off
}

getId("P1-freq").onchange = getId("P1-freq").oninput =
getId("P2-freq").onchange = getId("P2-freq").oninput = function(){
    let label = this.labels[0];
    let frequency = valToFreq(this.value);
    let freqString = freqToString(frequency);
    label.textContent = freqString.number;
    label.nextElementSibling.textContent = freqString.unit;
}

// getId("P2-freq").onchange = function() {
//     let frequency = valToFreq($(this).val())
// }
// TODO: API call to set frequency

// $("#P1-freq").on("change", function(){
//     let frequency = valToFreq($(this).val())
//     nScopeAPI.set_PX_frequency_in_hz(1,frequency);
// })

// $("#P2-freq").on("change", function(){
//     let frequency = valToFreq($(this).val())
//     nScopeAPI.set_PX_frequency_in_hz(2,frequency);
// })

getId("P1-duty").onchange = getId("P1-duty").oninput = 
getId("P2-duty").onchange = getId("P2-duty").oninput = function(){
    let label = this.labels[0];
    let duty = valToDuty(this.value);
    let dutyString = dutyToString(duty);
    label.textContent = dutyString.number;
    label.nextElementSibling.textContent = dutyString.unit;
}
// TODO: API call to set duty

// $("#P1-duty").on("change", function(){
//     let duty = valToDuty($(this).val());
//     nScopeAPI.set_PX_duty_percentage(1,duty);
// })

// $("#P2-duty").on("change", function(){
//     let duty = valToDuty($(this).val());
//     nScopeAPI.set_PX_duty_percentage(2,duty);
// })

// window.requestAnimationFrame(this.updateStatus);