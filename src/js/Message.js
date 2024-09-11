import {getId} from './Utils.js';

export function showTransientMessage(msg, timeout = 3) {

    let msgDiv = getId('transient-message-display');

    msgDiv.innerHTML = msg
    msgDiv.classList.remove("hidden");

    setTimeout(() => {
        clearTransientMessage();
    }, timeout * 1000);

}

export function clearTransientMessage() {
    let msgDiv = getId('transient-message-display');
    msgDiv.innerHTML = "";
    msgDiv.classList.add("hidden");
}