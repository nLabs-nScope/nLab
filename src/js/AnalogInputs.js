import { getId, isEmpty } from './Utils.js';
import * as timing from './Timing.js'

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
    }
}

for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
    getId(`${ch}-onoff`).onclick = function () {
        let checked = this.classList.contains("active");
        nscope.setChOn(nScope, ch, checked);
        timing.setTiming();
    }
}