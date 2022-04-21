import { getId } from './Utils.js';

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

    let frequency, amplitude, label, freqString, amplitudeString, wave, isUnipolar;

    // TODO: Get frequency and amplitude from API
    frequency = 10;
    amplitude = 5.0;

    label = getId("A1-freq").labels[0]
    freqString = freqToString(frequency);
    label.textContent = freqString.number;
    label.nextElementSibling.textContent = freqString.unit;
    getId("A1-freq").value = freqToVal(frequency);

    label = getId("A1-amplitude").labels[0]
    amplitudeString = amplitudeToString(amplitude);
    label.textContent = amplitudeString.number;
    label.nextElementSibling.textContent = amplitudeString.unit;
    getId("A1-amplitude").value = amplitudeToVal(amplitude);

    // TODO: Get frequency and amplitude from API
    frequency = 10;
    amplitude = 5.0;

    label = getId("A2-freq").labels[0]
    freqString = freqToString(frequency);
    label.textContent = freqString.number;
    label.nextElementSibling.textContent = freqString.unit;
    getId("A2-freq").value = freqToVal(frequency);

    label = getId("A2-amplitude").labels[0]
    amplitudeString = amplitudeToString(amplitude);
    label.textContent = amplitudeString.number;
    label.nextElementSibling.textContent = amplitudeString.unit;
    getId("A2-amplitude").value = amplitudeToVal(amplitude);


    // wave = nScopeAPI.get_AX_wave_type(1);
    // $("input[type=radio][name=A1-waveType][value="+wave+"]").prop("checked",true);

    // wave = nScopeAPI.get_AX_wave_type(2);
    // $("input[type=radio][name=A2-waveType][value="+wave+"]").prop("checked",true);

    // isUnipolar = nScopeAPI.get_AX_unipolar(1);
    // $("#A1-unipolar").prop("checked",!isUnipolar);

    // isUnipolar = nScopeAPI.get_AX_unipolar(2);
    // $("#A2-unipolar").prop("checked",!isUnipolar);
}


// exports.updateStatus = () => {

//     if(monitorScope.isOpen) {

//         let isOn = nScopeAPI.get_AX_on(1);
//         if(isOn) {
//             $("#A1-onoff").addClass('active');
//         } else {
//             $("#A1-onoff").removeClass('active');
//         }

//         let frequency = nScopeAPI.get_AX_frequency_in_hz(1);
//         let amplitude = nScopeAPI.get_AX_amplitude(1);
//         let freqString = freqToString(frequency);
//         let amplitudeString = amplitudeToString(amplitude);

//         $("#A1-status").html(freqString.number+' '+freqString.unit+' '+amplitudeString.number+' '+amplitudeString.unit);


//         isOn = nScopeAPI.get_AX_on(2);
//         if(isOn) {
//             $("#A2-onoff").addClass('active');
//         } else {
//             $("#A2-onoff").removeClass('active');
//         }

//         frequency = nScopeAPI.get_AX_frequency_in_hz(2);
//         amplitude = nScopeAPI.get_AX_amplitude(2);
//         freqString = freqToString(frequency);
//         amplitudeString = amplitudeToString(amplitude);

//         $("#A2-status").html(freqString.number+' '+freqString.unit+' '+amplitudeString.number+' '+amplitudeString.unit);

//     } else {
//         $("#A1-status").html("&nbsp;");
//         $("#A2-status").html("&nbsp;");
//     }

//     window.requestAnimationFrame(this.updateStatus);
// }

getId("A1-onoff").onclick = function () {
    let checked = this.classList.contains("active");
    // TODO: API call to turn on/off
}

getId("A2-onoff").onclick = function () {
    let checked = this.classList.contains("active");
    // TODO: API call to turn on/off
}

getId("A1-freq").onchange = getId("A1-freq").oninput =
    getId("A2-freq").onchange = getId("A2-freq").oninput = function () {
        let label = this.labels[0];
        let frequency = valToFreq(this.value);
        let freqString = freqToString(frequency);
        label.textContent = freqString.number;
        label.nextElementSibling.textContent = freqString.unit;
    }

// TODO: API call to set frequency

// $("#A1-freq").on("change", function(){
//     let frequency = valToFreq($(this).val())
//     nScopeAPI.set_AX_frequency_in_hz(1,frequency);
// })

// $("#A2-freq").on("change", function(){
//     let frequency = valToFreq($(this).val())
//     nScopeAPI.set_AX_frequency_in_hz(2,frequency);
// })


getId("A1-amplitude").onchange = getId("A1-amplitude").oninput = 
getId("A2-amplitude").onchange = getId("A2-amplitude").oninput = function(){
    let label = this.labels[0];
    let amplitude = valToAmplitude(this.value);
    let amplitudeString = amplitudeToString(amplitude);
    label.textContent = amplitudeString.number;
    label.nextElementSibling.textContent = amplitudeString.unit;
}

// TODO: API call to set amplitude

// $("#A1-amplitude").on("change", function(){
//     let amplitude = valToAmplitude($(this).val());
//     nScopeAPI.set_AX_amplitude(1,amplitude);
// })

// $("#A2-amplitude").on("change", function(){
//     let amplitude = valToAmplitude($(this).val());
//     nScopeAPI.set_AX_amplitude(2,amplitude);
// })




// $("#A1-unipolar").on("change", function(){
//     let unipolar = !$(this).prop("checked");
//     nScopeAPI.set_AX_unipolar(1,unipolar);
// })

// $("#A2-unipolar").on("change", function(){
//     let unipolar = !$(this).prop("checked");
//     nScopeAPI.set_AX_unipolar(2,unipolar);
// })

// $("input[name=A1-waveType]").on("change", function(){
//     let wave = $("input[name=A1-waveType]:checked").val();
//     nScopeAPI.set_AX_wave_type(1,wave);
// })

// $("input[name=A2-waveType]").on("change", function(){
//     var wave = $("input[type='radio'][name='A2-waveType']:checked").val();
//     nScopeAPI.set_AX_wave_type(2,wave);
// })

// window.requestAnimationFrame(this.updateStatus);