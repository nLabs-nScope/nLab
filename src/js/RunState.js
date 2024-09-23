import {getId, isEmpty} from './Utils.js';

for (let button of document.querySelectorAll("input[name=run-control]")) {
    button.onchange = function () {
        const action = this.id;
        nlab.setRunState(nLab, action);
    }
}

export function update(runState) {
    if (nlab.isConnected(nLab)) {
        getId('run-control').classList.remove("disabled");

        for (let button of document.querySelectorAll("input[name=run-control]")) {
            if (button.id === runState) {
                button.checked = true;
            } else {
                button.checked = false;
            }
        }
    } else {
        getId('run-control').classList.add("disabled");
    }
}