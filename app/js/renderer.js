
window.$ = window.jQuery = require('jquery')
window.Bootstrap = require('bootstrap')

const path = require("path");
const nScopeAPI = require(path.resolve('app/js/nScopeAPI'));
const nsAnalogOutputs = require(path.resolve('app/js/analogOutputs'));
const nsPulseOutput = require(path.resolve('app/js/pulseOutputs'));
const Plotly = require('plotly.js-dist');

function updatePowerUsage(state, usage)
{
    switch(state)
    {
        case 0:
        {
            $("#usb-status-bar, #usb-status").css("visibility","hidden");
            $(".nscope-usb-disconnected").css("visibility","hidden");
            $(".nscope-usb-power-fault").css("visibility","hidden");
            $(".nscope-usb-power-off").css("visibility","visible");
            updatePowerUsage.percentage = null;
            break;
        }
        case 1:
        {
            $(".nscope-usb-disconnected").css("visibility","hidden");
            $(".nscope-usb-power-off").css("visibility","hidden");
            $(".nscope-usb-power-fault").css("visibility","hidden");
            $("#usb-status-bar, #usb-status").css("visibility","visible");
            var percentage = usage*100/2.5;
            updatePowerUsage.percentage = updatePowerUsage.percentage*0.8+percentage*0.2 || percentage;
            $(".nscope-power-usage-bar .nscope-power-usage").css("width",updatePowerUsage.percentage+'%');
            $('#usb-status-bar, #usb-status').html((updatePowerUsage.percentage/100*2.5).toFixed(2)+' W');
            break;
        }
        case 2:
        case 3:
        {
            $("#usb-status-bar, #usb-status").css("visibility","hidden");
            $(".nscope-usb-disconnected").css("visibility","hidden");
            $(".nscope-usb-power-off").css("visibility","hidden");
            $(".nscope-usb-power-fault").css("visibility","visible");
            updatePowerUsage.percentage = null;
            break;
        }
        default:
        {
            $("#usb-status-bar, #usb-status").css("visibility","hidden");
            $(".nscope-usb-power-off").css("visibility","hidden");
            $(".nscope-usb-power-fault").css("visibility","hidden");
            $(".nscope-usb-disconnected").css("visibility","visible");
            updatePowerUsage.percentage = null;
            break;
        }
    }
    return usage;
}

function initPowerUsage()
{
    updatePowerUsage(-1, 0);
}

function monitorScope(){

    monitorScope.isOpen = monitorScope.isOpen || false;
    if(!monitorScope.isOpen)
    {
        if(nScopeAPI.open() == 0)
        {
            monitorScope.isOpen = true;
            nsPulseOutput.initInput();
            nsAnalogOutputs.initInput();
        }
    }
    else
    {
        let state = nScopeAPI.get_power_state();
        let usage = nScopeAPI.get_power_usage();
        if(state < 0 || usage < 0)
        {
            monitorScope.isOpen = false;
        }
        updatePowerUsage(state, usage);
    }
    window.requestAnimationFrame(monitorScope);
}

$('.dropdown-menu.clickable').click(function(e) {
    e.stopPropagation();
});

$("label[contenteditable='true'").keypress(function(e) { 
    return false;
    // if(e.which == 13)
    // {

    // }   
    return e.which != 13; 
});

  
var layout = {
    margin: {
        l:20,
        t:1,
        r:20,
        b:0
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    hovermode: false,
    xaxis: {
        showticklabels: false,
        zeroline: false,
        dtick: 1,
        fixedrange: true,
        range: [0, 12],
        linecolor: 'rgba(255,255,255,1)',
        linewidth: 1,
        mirror: true
    },
    yaxis: {
        showticklabels: false,
        zeroline: false,
        dtick: 1,
        fixedrange: true,
        range: [-4, 4],
        linecolor: 'rgba(255,255,255,1)',
        linewidth: 1,
        mirror: true
    }
};

var data = [{
    x: [1.2, 2.1, 2.7, 4.1, 6.2],
    y: [1, -2, -4, 3.5, 2.5] 
}];

function computeData() {

    let numPts = 1200;
    let trace = {x:[], y:[],
        line: {
        color: 'rgb(246,216,97)',
        width: 1
      }};

    // console.log(Date.now() % 1000);

    for(let i = 0;i<numPts;i++)
    {
        let x,y;
        x = i/numPts*12;
        y = Math.sin((x + (Date.now())/1000)*Math.PI)
        trace.x.push(x);
        trace.y.push(y);
    }
    return trace;
}

function updatePlot() {
    
    trace =  computeData();
    update = {x:[trace.x],y:[trace.y]};
    Plotly.restyle('glcanvas-div',update);
    Plotly.redraw('glcanvas-div');
    window.requestAnimationFrame(updatePlot);
}

Plotly.plot('glcanvas-div', [computeData()], layout,  {responsive: true});

// Monitor the state of the nScope:
initPowerUsage();
monitorScope();

window.requestAnimationFrame(monitorScope);
window.requestAnimationFrame(updatePlot);