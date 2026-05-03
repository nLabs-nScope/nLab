import {getId} from "./Utils";

const Plotly = require('plotly.js-basic-dist');
var update_function = null;

function isPlot(el) {
    return el && el._fullLayout;
}

export function hide_extra_graph() {
    let main_wrapper = getId('scope-graph-wrapper');
    let extra_wrapper = getId('scope-graph-extra-wrapper');

    main_wrapper.className = 'w-100 h-100 position-absolute start-0 top-0 d-flex flex-column overflow-hidden';
    extra_wrapper.className = 'w-100 h-100 position-absolute start-0 top-0 d-none d-flex flex-column overflow-hidden';

    void main_wrapper.offsetWidth;
    window.dispatchEvent(new Event('resize'));
}

export function view_full_extra_graph() {
    let main_wrapper = getId('scope-graph-wrapper');
    let extra_wrapper = getId('scope-graph-extra-wrapper');

    main_wrapper.className = 'w-100 h-100 position-absolute start-0 top-0 d-none d-flex flex-column overflow-hidden';
    extra_wrapper.className = 'w-100 h-100 position-absolute start-0 top-0 d-flex flex-column overflow-hidden';

    void extra_wrapper.offsetWidth;
    window.dispatchEvent(new Event('resize'));
}

export function view_horizontal_split_extra_graph() {
    let main_wrapper = getId('scope-graph-wrapper');
    let extra_wrapper = getId('scope-graph-extra-wrapper');

    main_wrapper.className = 'w-100 h-50 position-absolute start-0 top-0 d-flex flex-column overflow-hidden';
    extra_wrapper.className = 'w-100 h-50 position-absolute start-0 bottom-0 d-flex flex-column overflow-hidden';

    void main_wrapper.offsetWidth;
    void extra_wrapper.offsetWidth;
    window.dispatchEvent(new Event('resize'));
}

export function view_vertical_split_extra_graph() {
    let main_wrapper = getId('scope-graph-wrapper');
    let extra_wrapper = getId('scope-graph-extra-wrapper');

    main_wrapper.className = 'w-50 h-100 position-absolute start-0 top-0 d-flex flex-column overflow-hidden';
    extra_wrapper.className = 'w-50 h-100 position-absolute end-0 top-0 d-flex flex-column overflow-hidden';

    void main_wrapper.offsetWidth;
    void extra_wrapper.offsetWidth;
    window.dispatchEvent(new Event('resize'));
}

export function set_update_function(fn) {
    update_function = fn
}

export function clear_update_function() {
    update_function = null
}

export function update(trace_data) {
    if (update_function) {
        update_function(trace_data)
    }
}