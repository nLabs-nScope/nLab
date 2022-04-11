const path = require("path");
const nScopeAPI = require(path.resolve('app/js/nScopeAPI'));


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

exports.initInput = () => {
    
    let frequency, duty, label, freqString, dutyString;

    frequency = nScopeAPI.get_PX_frequency_in_hz(1);
    duty = nScopeAPI.get_PX_duty_percentage(1);

    label = $("label[for='P1-freq']");
    
    freqString = freqToString(frequency);
    label.html(freqString.number);
    label.next().html(freqString.unit);
    $("#P1-freq").val(freqToVal(frequency));

    label = $("label[for='P1-duty']");

    dutyString = dutyToString(duty);;
    label.html(dutyString.number);
    label.next().html(dutyString.unit);
    $("#P1-duty").val(dutyToVal(duty));

    frequency = nScopeAPI.get_PX_frequency_in_hz(2);
    duty = nScopeAPI.get_PX_duty_percentage(2);

    label = $("label[for='P2-freq']");
    
    freqString = freqToString(frequency);
    label.html(freqString.number);
    label.next().html(freqString.unit);
    $("#P2-freq").val(freqToVal(frequency));

    label = $("label[for='P2-duty']");

    dutyString = dutyToString(duty);
    label.html(dutyString.number);
    label.next().html(dutyString.unit);
    $("#P2-duty").val(dutyToVal(duty));

}

exports.updateStatus = () => {

    if(monitorScope.isOpen)
    {
        let isOn = nScopeAPI.get_PX_on(1);
        if(isOn) {
            $("#P1-onoff").addClass('active');
        } else {
            $("#P1-onoff").removeClass('active');
        }

        let frequency = nScopeAPI.get_PX_frequency_in_hz(1);
        let duty = nScopeAPI.get_PX_duty_percentage(1);
        let freqString = freqToString(frequency);
        let dutyString = dutyToString(duty);

        $("#P1-status").html(freqString.number+' '+freqString.unit+' '+dutyString.number+' '+dutyString.unit);

        isOn = nScopeAPI.get_PX_on(2);
        if(isOn) {
            $("#P2-onoff").addClass('active');
        } else {
            $("#P2-onoff").removeClass('active');
        }

        frequency = nScopeAPI.get_PX_frequency_in_hz(2);
        duty = nScopeAPI.get_PX_duty_percentage(2);
        freqString = freqToString(frequency);
        dutyString = dutyToString(duty);
        $("#P2-status").html(freqString.number+' '+freqString.unit+' '+dutyString.number+' '+dutyString.unit);

    } else {
        $("#P1-status").html("&nbsp;");
        $("#P2-status").html("&nbsp;");
    }
    window.requestAnimationFrame(this.updateStatus);
}

$("#P1-onoff").on("click", function(){
    let wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_PX_on(1,false)}
    if(!wasChecked) {nScopeAPI.set_PX_on(1,true)}
}); 

$("#P2-onoff").on("click", function(){
    let wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_PX_on(2,false)}
    if(!wasChecked) {nScopeAPI.set_PX_on(2,true)}
}); 

$("#P1-freq,#P2-freq").on("input change", function(){
    let label = $("label[for='" + $(this).attr('id') + "']");
    let frequency = valToFreq($(this).val())
    let freqString = freqToString(frequency);
    label.html(freqString.number);
    label.next().html(freqString.unit);
})

$("#P1-freq").on("change", function(){
    let frequency = valToFreq($(this).val())
    nScopeAPI.set_PX_frequency_in_hz(1,frequency);
})

$("#P2-freq").on("change", function(){
    let frequency = valToFreq($(this).val())
    nScopeAPI.set_PX_frequency_in_hz(2,frequency);
})

$("#P1-duty,#P2-duty").on("input change", function(){
    let label = $("label[for='" + $(this).attr('id') + "']");
    let duty = valToDuty($(this).val())
    let dutyString = dutyToString(duty);;
    label.html(dutyString.number);
    label.next().html(dutyString.unit);
})

$("#P1-duty").on("change", function(){
    let duty = valToDuty($(this).val());
    nScopeAPI.set_PX_duty_percentage(1,duty);
})

$("#P2-duty").on("change", function(){
    let duty = valToDuty($(this).val());
    nScopeAPI.set_PX_duty_percentage(2,duty);
})

window.requestAnimationFrame(this.updateStatus);