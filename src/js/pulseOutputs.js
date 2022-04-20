import {getId} from './Utils.js';

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

// exports.updateStatus = () => {

//     if(monitorScope.isOpen)
//     {
//         let isOn = nScopeAPI.get_PX_on(1);
//         if(isOn) {
//             $("#P1-onoff").addClass('active');
//         } else {
//             $("#P1-onoff").removeClass('active');
//         }

//         let frequency = nScopeAPI.get_PX_frequency_in_hz(1);
//         let duty = nScopeAPI.get_PX_duty_percentage(1);
//         let freqString = freqToString(frequency);
//         let dutyString = dutyToString(duty);

//         $("#P1-status").html(freqString.number+' '+freqString.unit+' '+dutyString.number+' '+dutyString.unit);

//         isOn = nScopeAPI.get_PX_on(2);
//         if(isOn) {
//             $("#P2-onoff").addClass('active');
//         } else {
//             $("#P2-onoff").removeClass('active');
//         }

//         frequency = nScopeAPI.get_PX_frequency_in_hz(2);
//         duty = nScopeAPI.get_PX_duty_percentage(2);
//         freqString = freqToString(frequency);
//         dutyString = dutyToString(duty);
//         $("#P2-status").html(freqString.number+' '+freqString.unit+' '+dutyString.number+' '+dutyString.unit);

//     } else {
//         $("#P1-status").html("&nbsp;");
//         $("#P2-status").html("&nbsp;");
//     }
//     window.requestAnimationFrame(this.updateStatus);
// }

getId("P1-onoff").onclick = function(){
    let checked = this.classList.contains("active");
    // TODO: API call to turn on/off
}

getId("P2-onoff").onclick = function(){
    let checked = this.classList.contains("active");
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