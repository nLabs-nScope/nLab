

import './scss/custom_bootstrap.scss'
import './css/nscope.css'

import * as powerStatus from './js/power_status.js'

// const path = require("path");
// const nScopeAPI = require(path.resolve('app/js/nScopeAPI'));
// const nsAnalogInputs = require(path.resolve('app/js/analogInputs'))
// const nsAnalogOutputs = require(path.resolve('app/js/analogOutputs'));
// const nsPulseOutput = require(path.resolve('app/js/pulseOutputs'));
const Plotly = require('plotly.js-basic-dist');

global.byId = function( id ) { return document.getElementById( id ); };


function initPowerUsage()
{
    updatePowerUsage(-1, 0);
}

function requestData(){
    clearData();
    let err;
    
    err = nScopeAPI.request_data(1200);
}


// $('.dropdown-menu.clickable').click(function(e) {
//     e.stopPropagation();
// });

// $("label[contenteditable='true'").keypress(function(e) { 
//     return false;
//     // if(e.which == 13)
//     // {

//     // }   
//     return e.which != 13; 
// });

  
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
    showlegend: false,
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
        range: [-5, 5],
        linecolor: 'rgba(255,255,255,1)',
        linewidth: 1,
        mirror: true
    }
};


var chData = [];
function clearData() {
    
    chData[0] = [];
    chData[1] = [];
    chData[2] = [];
    chData[3] = [];
}
clearData();


var colors = [
    'rgb(233,102,86)',
    'rgb(52,210,146)',
    'rgb(58,176,226)',
    'rgb(246,216,97)'
];

function computeData() {

    // let rtrn = [];
    // for(let ch=0;ch<4;ch++)
    // {

    //     while(true){
    //         rtrn[ch] = nScopeAPI.read_data(ch+1);
    //         if(rtrn[ch] > -100)
    //         {
    //             chData[ch].push(rtrn[ch]);
    //         } else {
    //             break;
    //         }
    //     }
    // }
    // if(rtrn.every(function(x){
    //     return x==-104;
    // }))
    // {
    //     requestData();
    // }

    // let traces = [];

    // for(let ch=0;ch<4;ch++)
    // {
    //     traces.push({x:[], y:[],
    //         line: {
    //         color: colors[ch],
    //         width: 2
    //         }
    //     })
    // }

    // for(let ch=0;ch<4;ch++){
    //     let data = chData[ch];
    //     for(let i=0; i<data.length;i++)
    //     {
    //         let x,y;
    //         x = i/100;
    //         y = data[i];
    //         traces[ch].x.push(x);
    //         traces[ch].y.push(y);
    //     }
    // }




    // return traces;
}

function updatePlot() {
    
    // traces =  computeData();
    // update = {
    //     x:[traces[0].x,traces[1].x,traces[2].x,traces[3].x],
    //     y:[traces[0].y,traces[1].y,traces[2].y,traces[3].y]
    // };
    // Plotly.restyle('glcanvas-div',update);
    // window.requestAnimationFrame(updatePlot);
}

Plotly.newPlot('glcanvas-div', computeData(), layout,  {responsive: true, displayModeBar: false});


function monitorScope(){

    let powerState = nscope.monitor_nscope(nScope);

    powerStatus.update(powerState);

    window.requestAnimationFrame(monitorScope);
}


// Monitor the state of the nScope:
// initPowerUsage();
monitorScope();



version.innerHTML = nscope.version();