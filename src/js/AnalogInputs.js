import {getId, isEmpty} from './Utils.js';
import {ranges} from './Axes.js'
import * as timing from './Timing.js'


const gains = [0.2, 0.5, 1, 2, 4, 5, 10, 20];
let sliders_free = {}

for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
    sliders_free[`${ch}-scale`] = true;
    getId(`${ch}-scale`).min = "0";
    getId(`${ch}-scale`).max = `${gains.length-1}`
}

function chGain(ch) {
    return 10.0 / (ranges[ch][1] - ranges[ch][0]);
}

function gainString(ch) {
    let gainString = {};
    let v_per_div = 1 / chGain(ch);

    if (v_per_div >= 0.5) {
        gainString.number = v_per_div.toPrecision(1);
        gainString.unit = 'V / div';
    } else if (v_per_div >= 0.1) {
        let mv_per_div = v_per_div * 1000;
        gainString.number = mv_per_div.toPrecision(3);
        gainString.unit = 'mV / div';
    } else {
        let mv_per_div = v_per_div * 1000;
        gainString.number = mv_per_div.toPrecision(2);
        gainString.unit = 'mV / div';
    }

    return gainString
}

function valToGain(val) {
    return gains[val];
}

function gainToVal(gain) {
    gain = Math.round(gain);
    return gains.indexOf(gain);
}

export function setAnalogInputRange(ch) {


    let triggerState = nscope.getTriggerStatus(nScope);
    if(triggerState.level > ranges[ch][1]) {
        nscope.setTriggerLevel(nScope, ranges[ch][1]);
    }
    if(triggerState.level < ranges[ch][0]) {
        nscope.setTriggerLevel(nScope, ranges[ch][0]);
    }
    nscope.setChRange(nScope, ch, ranges[ch][0]-0.2, ranges[ch][1]+0.2);
}

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
        let scaleString = gainString(ch);
        label.textContent = scaleString.number;
        label.nextElementSibling.textContent = scaleString.unit;

        getId(`${ch}-status`).innerHTML = scaleString.number + ' ' + scaleString.unit;

        if (sliders_free[`${ch}-scale`]) {
            getId(`${ch}-scale`).value = gainToVal(chGain(ch));
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

        let old_range = ranges[ch];
        let percentage = (-old_range[0]) / (old_range[1] - old_range[0]);

        ranges[ch][0] = -10.0 / gain * percentage;
        ranges[ch][1] = ranges[ch][0] + 10.0 / gain;

        let scaleString = gainString(ch);
        label.textContent = scaleString.number;
        label.nextElementSibling.textContent = scaleString.unit;

        setAnalogInputRange(ch);
        nscope.reTriggerIfNotTriggered(nScope);
    }

    getId(`${ch}-scale`).onchange = function () {
        nscope.restartTraces(nScope);
    }

    getId(`${ch}-scale`).addEventListener('mouseup', function () {
        sliders_free[`${ch}-scale`] = true;
    });

}

