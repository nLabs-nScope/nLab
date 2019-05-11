const path = require("path");
const nScopeAPI = require(path.resolve('app/js/nScopeAPI'));



function valToAmplitude(val) {
    val = parseFloat(val);
    return val/100.0 * 4 + 0.5;
}

function valToFrequency(val) {
    val = parseFloat(val);
    freq = Math.pow(10,val/100.0*5.3-1);
    return freq;
}

function updateAxStatus() {
    if(monitorScope.isOpen) {
        frequency = nScopeAPI.get_AX_frequency_in_hz(1);
        amplitude = nScopeAPI.get_AX_amplitude(1);
        if(frequency < 10) {
            $("#A1-status").html(frequency.toPrecision(2)+' Hz '+amplitude.toPrecision(2)+' V');
        } else if(frequency < 1000) {
            $("#A1-status").html(frequency.toPrecision(3)+' Hz '+amplitude.toPrecision(2)+' V');
        } else if (frequency < 1000000) {
            frequency /= 1000
            $("#A1-status").html(frequency.toPrecision(3)+' kHz '+amplitude.toPrecision(2)+' V');
        } else {
            frequency /= 1000000
            $("#A1-status").html(frequency.toPrecision(3)+' MHz '+amplitude.toPrecision(2)+' V');
        }
     
        frequency = nScopeAPI.get_AX_frequency_in_hz(2);
        amplitude = nScopeAPI.get_AX_amplitude(2);
        if(frequency < 10) {
            $("#A2-status").html(frequency.toPrecision(2)+' Hz '+amplitude.toPrecision(2)+' V');
        } else if(frequency < 1000) {
            $("#A2-status").html(frequency.toPrecision(3)+' Hz '+amplitude.toPrecision(2)+' V');
        } else if (frequency < 1000000) {
            frequency /= 1000
            $("#A2-status").html(frequency.toPrecision(3)+' kHz '+amplitude.toPrecision(2)+' V');
        } else  {
            frequency /= 1000000
            $("#A2-status").html(frequency.toPrecision(3)+' MHz '+amplitude.toPrecision(2)+' V');
        }
    } else {
        $("#A1-status").html("&nbsp;");
        $("#A2-status").html("&nbsp;");
    }
}

$("#A1-onoff").on("click", function(){
    wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_AX_on(1,false)}
    if(!wasChecked) {nScopeAPI.set_AX_on(1,true)}
}); 

$("#A2-onoff").on("click", function(){
    wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_AX_on(2,false)}
    if(!wasChecked) {nScopeAPI.set_AX_on(2,true)}
}); 


$("#A1-freq,#A2-freq").on("input change", function(){
    var label = $("label[for='" + $(this).attr('id') + "']");
    var frequency = valToFrequency($(this).val())
    if(frequency < 10) {
        label.html(frequency.toPrecision(2));
        label.next().html("Hz");
    } else if(frequency < 1000) {
        label.html(frequency.toPrecision(3));
        label.next().html("Hz");
    } else if (frequency < 1000000) {
        label.html((frequency/1000).toPrecision(3));
        label.next().html("kHz");
    } else {
        label.html((frequency/1000000).toPrecision(3));
        label.next().html("MHz");
    }
})

$("#A1-freq").on("change", function(){
    var frequency = valToFrequency($(this).val())
    nScopeAPI.set_AX_frequency_in_hz(1,frequency);
})

$("#A2-freq").on("change", function(){
    var frequency = valToFrequency($(this).val())
    nScopeAPI.set_AX_frequency_in_hz(2,frequency);
})


$("#A1-amplitude,#A2-amplitude").on("input change", function(){
    var label = $("label[for='" + $(this).attr('id') + "']");
    var amplitude = valToAmplitude($(this).val())
    if(amplitude < 1) {
        label.html(amplitude.toPrecision(1));
    } else {
        label.html(amplitude.toPrecision(2));
    }    
})

$("#A1-amplitude").on("change", function(){
    var amplitude = valToAmplitude($(this).val());
    nScopeAPI.set_AX_amplitude(1,amplitude);
})

$("#A2-amplitude").on("change", function(){
    var amplitude = valToAmplitude($(this).val());
    nScopeAPI.set_AX_amplitude(2,amplitude);
})

$("#A1-unipolar").on("change", function(){
    var unipolar = !$(this).prop("checked");
    nScopeAPI.set_AX_unipolar(1,unipolar);
})

$("#A2-unipolar").on("change", function(){
    var unipolar = !$(this).prop("checked");
    nScopeAPI.set_AX_unipolar(2,unipolar);
})

$("input[type=radio][name=A1-waveType]").on("change", function(){
    var wave = $(this).val();
    nScopeAPI.set_AX_wave_type(1,wave);
})

$("input[type=radio][name=A2-waveType]").on("change", function(){
    var wave = $(this).val();
    nScopeAPI.set_AX_wave_type(2,wave);
})


setInterval(updateAxStatus,10);