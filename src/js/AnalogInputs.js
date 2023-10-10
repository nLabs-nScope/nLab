import { getId, isEmpty } from './Utils.js';
import * as timing from './Timing.js'

let sliders_free = {}
for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
    sliders_free[`${ch}-scale`] = true;
    // sliders_free[`${ch}-offset`] = true;
}

function gainToString(gain) {
    let gainString = {};
    let v_per_div = 1.0 / gain;

    if (v_per_div > 0.3) {
        gainString.number = v_per_div.toPrecision(1);
        gainString.unit = 'V / div';
    } else if (v_per_div > 0.1) {
        gainString.number = v_per_div.toPrecision(2);
        gainString.unit = 'V / div';
    } else {
        let mv_per_div = v_per_div * 1000;
        gainString.number = mv_per_div.toPrecision(2);
        gainString.unit = 'mV / div';
    }


    return gainString
}

function valToGain(val) {
    val = parseFloat(val);
    let gain = Math.pow(10, val  / 100.0 * Math.log10(20));

    // return gain;
    let gains = [1, 2, 4, 5, 10, 20];

    return gains.reduce(function(prev, curr) {
        return (Math.abs(curr - gain) < Math.abs(prev - gain) ? curr : prev);
    });
}

function gainToVal(gain) {
    return Math.log10(gain) * 100.0 / Math.log10(20);
}
//
//
// function valToOffset(val) {
//     val = parseFloat(val);
//     return val / 100.0 * 10.0 - 5.0;
// }
//
// function offsetToVal(level) {
//     return (level + 5.0) / 10.0 * 100.0;
// }
//
//
// function offsetToString(level) {
//     let offsetString = {};
//     if (Math.abs(level) < 0.99) {
//         offsetString.number = level.toPrecision(1);
//     } else {
//         offsetString.number = level.toPrecision(2);
//     }
//     offsetString.unit = 'V';
//     return offsetString
// }

export function update(chState) {

    if (isEmpty(chState)) {
        for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
            getId(`${ch}-onoff`).classList.remove("active");
            getId(`${ch}-controls`).classList.add("disabled");
        }
        return;
    }

    for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {

        getId(`${ch}-controls`).classList.remove("disabled");

        if (chState[ch].isOn) {
            getId(`${ch}-onoff`).classList.add("active");
        } else {
            getId(`${ch}-onoff`).classList.remove("active")
        }

        let label = getId(`${ch}-scale`).labels[0];
        let scaleString = gainToString(chState[ch].gain);
        label.textContent = scaleString.number;
        label.nextElementSibling.textContent = scaleString.unit;

        getId(`${ch}-status`).innerHTML = scaleString.number + ' ' + scaleString.unit;

        if(sliders_free[`${ch}-scale`]) {
            getId(`${ch}-scale`).value = gainToVal(chState[ch].gain);
        }
    }
}

for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
    getId(`${ch}-onoff`).onclick = function () {
        let checked = this.classList.contains("active");
        nscope.setChOn(nScope, ch, checked);
        timing.setTiming();
    }

    getId(`${ch}-scale`).oninput = getId(`${ch}-scale`).onchange = function () {
        sliders_free[`${ch}-scale`] = false;
        let label = this.labels[0];
        let gain = valToGain(this.value);
        nscope.setChGain(nScope, ch, gain);
        let scaleString = gainToString(gain);
        label.textContent = scaleString.number;
        label.nextElementSibling.textContent = scaleString.unit;
        nscope.reTriggerIfNotTriggered(nScope);
    }

    getId(`${ch}-scale`).onchange = function () {
        nscope.restartTraces(nScope);
    }

    getId(`${ch}-scale`).addEventListener('mouseup', function () {
        sliders_free[`${ch}-scale`] = true;
    });


//     getId(`${ch}-offset`).oninput = getId(`${ch}-offset`).onchange = function () {
//         sliders_free[`${ch}-offset`] = false;
//         let label = this.labels[0];
//         let offset = valToOffset(this.value);
//         // nscope.setTriggerLevel(nScope, level);
//         let offsetString = offsetToString(offset);
//         label.textContent = offsetString.number;
//         label.nextElementSibling.textContent = offsetString.unit;
//         // nscope.reTriggerIfNotTriggered(nScope);
//     }
//
//
//     getId(`${ch}-offset`).addEventListener('mouseup', function () {
//         sliders_free[`${ch}-offset`] = true;
//     });

}

