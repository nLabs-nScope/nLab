const path = require("path");
const nScopeAPI = require(path.resolve('app/js/nScopeAPI'));



function valToAmplitude(val) {
    val = parseFloat(val);
    return val/100.0 * 4 + 0.5;
}

function amplitudeToVal(amplitude) {
    return (amplitude - 0.5)/4.0*100.0;
}

function amplitudeToString(amplitude) {
    let amplitudeString = {};
    if(amplitude < 1.01) {
        amplitudeString.number = amplitude.toPrecision(1);
    } else {
        amplitudeString.number = amplitude.toPrecision(2);
    }    
    amplitudeString.unit = 'V';
    return amplitudeString;
}

function valToFreq(val) {
    val = parseFloat(val);
    let freq = Math.pow(10,val/100.0*5.3-1);
    return freq;
}

function freqToVal(freq) {
    let val = (Math.log10(freq)+1)/4.3*100.0;
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

exports.initInput = () => {

    let frequency, amplitude, label, freqString, amplitudeString, wave, isUnipolar;


    frequency = nScopeAPI.get_AX_frequency_in_hz(1);
    amplitude = nScopeAPI.get_AX_amplitude(1);

    label = $("label[for='A1-freq']");
    
    freqString = freqToString(frequency);
    label.html(freqString.number);
    label.next().html(freqString.unit);
    $("#A1-freq").val(freqToVal(frequency));

    label = $("label[for='A1-amplitude']");

    amplitudeString = amplitudeToString(amplitude);;
    label.html(amplitudeString.number);
    label.next().html(amplitudeString.unit);
    $("#A1-amplitude").val(amplitudeToVal(amplitude));

    frequency = nScopeAPI.get_AX_frequency_in_hz(2);
    amplitude = nScopeAPI.get_AX_amplitude(2);

    label = $("label[for='A2-freq']");
    
    freqString = freqToString(frequency);
    label.html(freqString.number);
    label.next().html(freqString.unit);
    $("#A2-freq").val(freqToVal(frequency));

    label = $("label[for='A2-amplitude']");

    amplitudeString = amplitudeToString(amplitude);
    label.html(amplitudeString.number);
    label.next().html(amplitudeString.unit);
    $("#A2-amplitude").val(amplitudeToVal(amplitude));

    wave = nScopeAPI.get_AX_wave_type(1);
    $("input[type=radio][name=A1-waveType][value="+wave+"]").prop("checked",true);

    wave = nScopeAPI.get_AX_wave_type(2);
    $("input[type=radio][name=A2-waveType][value="+wave+"]").prop("checked",true);

    isUnipolar = nScopeAPI.get_AX_unipolar(1);
    $("#A1-unipolar").prop("checked",!isUnipolar);

    isUnipolar = nScopeAPI.get_AX_unipolar(2);
    $("#A2-unipolar").prop("checked",!isUnipolar);
}


exports.updateStatus = () => {

    if(monitorScope.isOpen) {

        let isOn = nScopeAPI.get_AX_on(1);
        if(isOn) {
            $("#A1-onoff").addClass('active');
        } else {
            $("#A1-onoff").removeClass('active');
        }

        let frequency = nScopeAPI.get_AX_frequency_in_hz(1);
        let amplitude = nScopeAPI.get_AX_amplitude(1);
        let freqString = freqToString(frequency);
        let amplitudeString = amplitudeToString(amplitude);

        $("#A1-status").html(freqString.number+' '+freqString.unit+' '+amplitudeString.number+' '+amplitudeString.unit);
     

        isOn = nScopeAPI.get_AX_on(2);
        if(isOn) {
            $("#A2-onoff").addClass('active');
        } else {
            $("#A2-onoff").removeClass('active');
        }

        frequency = nScopeAPI.get_AX_frequency_in_hz(2);
        amplitude = nScopeAPI.get_AX_amplitude(2);
        freqString = freqToString(frequency);
        amplitudeString = amplitudeToString(amplitude);

        $("#A2-status").html(freqString.number+' '+freqString.unit+' '+amplitudeString.number+' '+amplitudeString.unit);
    
    } else {
        $("#A1-status").html("&nbsp;");
        $("#A2-status").html("&nbsp;");
    }

    window.requestAnimationFrame(this.updateStatus);
}

$("#A1-onoff").on("click", function(){
    let wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_AX_on(1,false)}
    if(!wasChecked) {nScopeAPI.set_AX_on(1,true)}
}); 

$("#A2-onoff").on("click", function(){
    let wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_AX_on(2,false)}
    if(!wasChecked) {nScopeAPI.set_AX_on(2,true)}
}); 


$("#A1-freq,#A2-freq").on("input change", function(){
    let label = $("label[for='" + $(this).attr('id') + "']");
    let frequency = valToFreq($(this).val());
    let freqString = freqToString(frequency);
    label.html(freqString.number);
    label.next().html(freqString.unit);
})

$("#A1-freq").on("change", function(){
    let frequency = valToFreq($(this).val())
    nScopeAPI.set_AX_frequency_in_hz(1,frequency);
})

$("#A2-freq").on("change", function(){
    let frequency = valToFreq($(this).val())
    nScopeAPI.set_AX_frequency_in_hz(2,frequency);
})


$("#A1-amplitude,#A2-amplitude").on("input change", function(){
    let label = $("label[for='" + $(this).attr('id') + "']");
    let amplitude = valToAmplitude($(this).val());
    let amplitudeString = amplitudeToString(amplitude);
    label.html(amplitudeString.number);
    label.next().html(amplitudeString.unit);
})

$("#A1-amplitude").on("change", function(){
    let amplitude = valToAmplitude($(this).val());
    nScopeAPI.set_AX_amplitude(1,amplitude);
})

$("#A2-amplitude").on("change", function(){
    let amplitude = valToAmplitude($(this).val());
    nScopeAPI.set_AX_amplitude(2,amplitude);
})

$("#A1-unipolar").on("change", function(){
    let unipolar = !$(this).prop("checked");
    nScopeAPI.set_AX_unipolar(1,unipolar);
})

$("#A2-unipolar").on("change", function(){
    let unipolar = !$(this).prop("checked");
    nScopeAPI.set_AX_unipolar(2,unipolar);
})

$("input[name=A1-waveType]").on("change", function(){
    let wave = $("input[name=A1-waveType]:checked").val();
    nScopeAPI.set_AX_wave_type(1,wave);
})

$("input[name=A2-waveType]").on("change", function(){
    var wave = $("input[type='radio'][name='A2-waveType']:checked").val();
    nScopeAPI.set_AX_wave_type(2,wave);
})

window.requestAnimationFrame(this.updateStatus);