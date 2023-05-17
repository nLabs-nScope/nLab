import { getId, isEmpty } from './Utils.js';

for (let button of document.querySelectorAll("input[name=run-control]")) {
    button.onchange = function () {
        const action = this.id;
        console.log(action);
        nscope.setRunState(nScope, action);

    }
}

export function update(runState) {
    for (let button of document.querySelectorAll("input[name=run-control]")) {
        if (button.id === runState) {
            button.checked = true;
        } else {
            button.checked = false;
        }
    }
}