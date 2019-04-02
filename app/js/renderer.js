
window.$ = window.jQuery = require('jquery')
window.Bootstrap = require('bootstrap')

const path = require("path");
const nScopeAPI = require(path.resolve('app/js/nScopeAPI'));

console.log('open returns ', nScopeAPI.open());