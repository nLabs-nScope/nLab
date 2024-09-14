function button_from_label(element) {
    return element.nextElementSibling.nextElementSibling;
}

function start_edit(label, button) {
    label.setAttribute("contenteditable", true);
    label.classList.add("editing");
    button.classList.add("editing");
    button.classList.remove("fa-regular", "fa-pen-to-square");
    button.classList.add("fa-solid", "fa-check");
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(label);
    selection.removeAllRanges();
    selection.addRange(range);
}

function end_edit(label, button) {
    label.setAttribute("contenteditable", false);
    label.classList.remove("editing");
    button.classList.remove("editing");
    button.classList.remove("fa-solid", "fa-check");
    button.classList.add("fa-regular", "fa-pen-to-square");
}

export function setup(label) {

    let button = button_from_label(label);

    label.onclick = function () {
        start_edit(label, button);
    }

    label.onkeydown = function (event) {
        const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-'];
        // Allow backspace, delete, etc.
        if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            return;
        }
        // Prevent input if the key is not allowed
        if (!allowedKeys.includes(event.key)) {
            event.preventDefault();
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            end_edit(label, button)
        }
    }

    button.onclick = function () {
        if(this.classList.contains("editing")){
            end_edit(label, button);
        } else {
            start_edit(label, button);
        }
    }
}

export function isNotEditable(label) {
    return !label.classList.contains("editing");
}
