
window.$ = window.jQuery = require('jquery')
window.Bootstrap = require('bootstrap')

const path = require("path");
const nScopeAPI = require(path.resolve('app/js/nScopeAPI'));
console.log('function output ', nScopeAPI.check_API_version());