import {getId, isEmpty} from './Utils.js';
import {colors, text_colors} from './Axes.js';
import * as precisionInput from './PrecisionInput'

let slider_free = false;

export function update(triggerState) {

    if (triggerState.uiDisabled) {
        getId('trigger-controls').classList.add("disabled");
    } else {
        getId('trigger-controls').classList.remove("disabled");
    }

    if (triggerState.isOn) {
        getId('trigger-onoff').classList.add("active");
    } else {
        getId('trigger-onoff').classList.remove("active")
    }

    let source_display = getId('trigger-source-display');

    switch (triggerState.type) {
        case "RisingEdge":
            source_display.innerHTML = `${triggerState.source} ↑`;
            break;
        case "FallingEdge":
            source_display.innerHTML = `${triggerState.source} ↓`;
            break;
    }

    if (triggerState.isOn) {
        source_display.style.backgroundColor = colors[triggerState.source];
        source_display.style.color = text_colors[triggerState.source];
    } else {
        source_display.style.backgroundColor = null;
        source_display.style.color = null;
    }

    document.querySelector(`input[value=${triggerState.type}]`).checked = true;

    let label = getId('trigger-level').labels[0];
    let levelString = levelToString(triggerState.level);

    if (precisionInput.isNotEditable(label)) {
        label.textContent = levelString.number;
        label.nextElementSibling.textContent = levelString.unit;
    }

    if(slider_free) {
        getId('trigger-level').value = levelToVal(triggerState.level);
    }

}

export function adjustTriggerLevel(level) {
    let label = getId('trigger-level').labels[0];
    nlab.setTriggerLevel(nLab, level);
    let levelString = levelToString(level);
    label.textContent = levelString.number;
    label.nextElementSibling.textContent = levelString.unit;
}

getId('trigger-onoff').onclick = function () {
    let checked = this.classList.contains("active");
    nlab.setTriggerOn(nLab, checked);
    nlab.restartTraces(nLab);
}

for (let button of document.querySelectorAll('input[name=trigger-source]')) {
    button.onchange = function () {
        let source = this.value;
        nlab.setTriggerSource(nLab, source);
        nlab.restartTraces(nLab);
    }
}

function levelToString(level) {
    let levelString = {};
    if (Math.abs(level) < 0.99) {
        levelString.number = level.toPrecision(1);
    } else {
        levelString.number = level.toPrecision(2);
    }
    levelString.unit = 'V';
    return levelString
}

function valToLevel(val) {
    val = parseFloat(val);
    return val / 100.0 * 10.0 - 5.0;
}

function levelToVal(level) {
    return (level + 5.0) / 10.0 * 100.0;
}

getId('trigger-level').oninput = getId('trigger-level').onchange = function () {
    slider_free = false;
    let level = valToLevel(this.value);
    adjustTriggerLevel(level);
    nlab.reTriggerIfNotTriggered(nLab);
}


getId('trigger-level').addEventListener('mouseup', function () {
    slider_free = true;
});

for (let button of document.querySelectorAll('input[name=trigger-type]')) {
    button.onchange = function () {
        nlab.setTriggerType(nLab, this.value);
        nlab.reTriggerIfNotTriggered(nLab);
    }
}

let triggerLabel = getId('trigger-level').labels[0];
precisionInput.setup(triggerLabel, (label)=> {
    let value = parseFloat(label.innerHTML);
    // TODO: handle this in the driver layer
    value = Math.max(-5, Math.min(5, value));
    nlab.setTriggerLevel(nLab, value);
});