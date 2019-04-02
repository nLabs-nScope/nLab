
window.$ = window.jQuery = require('jquery')
window.Bootstrap = require('bootstrap')

const path = require("path");
const nScopeAPI = require(path.resolve('app/js/nScopeAPI'));

function updatePowerUsage(usage)
{
    if(usage < 0)
    {
        $("#usb-status-bar, #usb-status").css("visibility","hidden");
        $(".nscope-usb-disconnected").css("visibility","visible");
        updatePowerUsage.percentage = null;
    }
    else
    {
        $(".nscope-usb-disconnected").css("visibility","hidden");
        $("#usb-status-bar, #usb-status").css("visibility","visible");
        var percentage = usage*100/2.5;
        updatePowerUsage.percentage = updatePowerUsage.percentage*0.8+percentage*0.2 || percentage;
        $(".nscope-power-usage-bar .nscope-power-usage").css("width",updatePowerUsage.percentage+'%');
        $('#usb-status-bar, #usb-status').html((updatePowerUsage.percentage/100*2.5).toFixed(2)+' W');
    }
    return usage;
}

function monitorScope(){
    
    monitorScope.isOpen = monitorScope.isOpen || false;
    if(!monitorScope.isOpen)
    {
        if(nScopeAPI.open() == 0)
        {
            monitorScope.isOpen = true;
        }
    }
    else
    {
        if(updatePowerUsage(nScopeAPI.get_power_usage()) < 0)
        {
            monitorScope.isOpen = false;
        }
    }

}

// Monitor the state of the nScope:
setInterval(monitorScope,10);
