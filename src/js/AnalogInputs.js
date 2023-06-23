import { getId, isEmpty } from './Utils.js';

export function update(chState) {

    if (isEmpty(chState)) {
        // console.log("Empty: handle this");
        return;
    }


    for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
        if (chState[ch].isOn) {
            getId(`${ch}-onoff`).classList.add("active");
        } else {
            getId(`${ch}-onoff`).classList.remove("active")
        }

        // let freqString = freqToString(chState[ch].frequency);
        // let dutyString = dutyToString(chState[ch].duty);

        // getId(`${ch}-status`).innerHTML = freqString.number + ' ' + freqString.unit + ' ' + dutyString.number + ' ' + dutyString.unit;
    }

}

for (let ch of ["Ch1", "Ch2", "Ch3", "Ch4"]) {
    getId(`${ch}-onoff`).onclick = function () {
        let checked = this.classList.contains("active");
        nscope.setChOn(nScope, ch, checked);
    }
}