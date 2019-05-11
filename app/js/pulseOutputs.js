const path = require("path");
const nScopeAPI = require(path.resolve('app/js/nScopeAPI'));


function valToDuty(val) {
    val = parseFloat(val);
    return val;
}

function valToFrequency(val) {
    val = parseFloat(val);
    freq = Math.pow(10,val/100.0*4.3);
    return freq;
}


function updatePxStatus()
{
    if(monitorScope.isOpen)
    {
        frequency = nScopeAPI.get_PX_frequency_in_hz(1);
        duty = nScopeAPI.get_PX_duty_percentage(1);
        if(frequency < 10)
        {
            $("#P1-status").html(frequency.toPrecision(2)+' Hz '+duty.toFixed(0)+'%');
        } else if(frequency < 1000)
        {
            $("#P1-status").html(frequency.toPrecision(3)+' Hz '+duty.toFixed(0)+'%');
        } else if (frequency < 1000000)
        {
            frequency /= 1000
            $("#P1-status").html(frequency.toPrecision(3)+' kHz '+duty.toFixed(0)+'%');
        } else 
        {
            frequency /= 1000000
            $("#P1-status").html(frequency.toPrecision(3)+' MHz '+duty.toFixed(0)+'%');
        }

        frequency = nScopeAPI.get_PX_frequency_in_hz(2);
        duty = nScopeAPI.get_PX_duty_percentage(2);
        if(frequency < 10)
        {
            $("#P2-status").html(frequency.toPrecision(2)+' Hz '+duty.toFixed(0)+'%');
        } else if(frequency < 1000)
        {
            $("#P2-status").html(frequency.toPrecision(3)+' Hz '+duty.toFixed(0)+'%');
        } else if (frequency < 1000000)
        {
            frequency /= 1000
            $("#P2-status").html(frequency.toPrecision(3)+' kHz '+duty.toFixed(0)+'%');
        } else 
        {
            frequency /= 1000000
            $("#P2-status").html(frequency.toPrecision(3)+' MHz '+duty.toFixed(0)+'%');
        }

    } else {
        $("#P1-status").html("&nbsp;");
        $("#P2-status").html("&nbsp;");
    }
}

$("#P1-onoff").on("click", function(){
    wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_PX_on(1,false)}
    if(!wasChecked) {nScopeAPI.set_PX_on(1,true)}
}); 

$("#P2-onoff").on("click", function(){
    wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_PX_on(2,false)}
    if(!wasChecked) {nScopeAPI.set_PX_on(2,true)}
}); 

$("#P1-freq,#P2-freq").on("input change", function(){
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

$("#P1-freq").on("change", function(){
    var frequency = valToFrequency($(this).val())
    nScopeAPI.set_PX_frequency_in_hz(1,frequency);
})

$("#P2-freq").on("change", function(){
    var frequency = valToFrequency($(this).val())
    nScopeAPI.set_PX_frequency_in_hz(2,frequency);
})


$("#P1-duty,#P2-duty").on("input change", function(){
    var label = $("label[for='" + $(this).attr('id') + "']");
    var duty = valToDuty($(this).val())
    label.html(duty.toFixed(0));
})

$("#P1-duty").on("change", function(){
    var duty = valToDuty($(this).val());
    nScopeAPI.set_PX_duty_percentage(1,duty);
})

$("#P2-duty").on("change", function(){
    var duty = valToDuty($(this).val());
    nScopeAPI.set_PX_duty_percentage(2,duty);
})


setInterval(updatePxStatus,10);