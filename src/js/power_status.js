import '../css/power_status.css'

function hide(id) {
    let element = document.getElementById(id);
    element.classList.add("hidden");
}

function show(id) {
    let element = document.getElementById(id);
    element.classList.remove("hidden");
}

export function update(powerState)
{
    console.log(powerState.state);
    switch(powerState.state)
    {
        case "PowerOff":
        {
            hide('usb-status-bar');
            hide('usb-status');
            hide('nscope-usb-power-fault');
            hide('nscope-usb-disconnected');
            show('nscope-usb-power-off');

            update.percentage = null;
            break;
        }
        case "PowerOn":
        {
            hide('nscope-usb-power-off');
            hide('nscope-usb-power-fault');
            hide('nscope-usb-disconnected');

            show('usb-status-bar');
            show('usb-status');
            var percentage = powerState.usage*100/2.5;
            update.percentage = update.percentage*0.8+percentage*0.2 || percentage;

            // byId('nscope-power-usage-bar').style.width = `${update.percentage}%`;
            byId('nscope-power-usage').style.width = `${update.percentage}%`;

            byId('usb-status-bar').innerHTML = `${(update.percentage/100*2.5).toFixed(2)} W`;
            byId('usb-status').innerHTML = `${(update.percentage/100*2.5).toFixed(2)} W`;
            // $(".nscope-power-usage-bar .nscope-power-usage").css("width",update.percentage+'%');
            // $('#usb-status-bar, #usb-status').html((update.percentage/100*2.5).toFixed(2)+' W');
            break;
        }
        case "Shorted":
        case "Overcurrent":
        {
            hide('usb-status-bar');
            hide('usb-status');
            hide('nscope-usb-power-off');
            hide('nscope-usb-disconnected');

            show('nscope-usb-power-fault');
            update.percentage = null;
            break;
        }
        default:
        {
            hide('usb-status-bar');
            hide('usb-status');
            hide('nscope-usb-power-off');
            hide('nscope-usb-power-fault');

            show('nscope-usb-disconnected');
            update.percentage = null;
            break;
        }
    }
}