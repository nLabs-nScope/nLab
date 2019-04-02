const ffi = require('ffi')
const ref = require('ref')

var bool = ref.types.bool;
var double = ref.types.double;
var p_double = ref.refType(double);
var ns_error = ref.types.int;
var ns_power_state = ref.types.int;
var int = ref.types.int;

var scopeHandle = ref.types.void 
var p_scopeHandle = ref.refType(scopeHandle);

const libnscopeapi = ffi.Library('nScopeAPI/lib/mac/libnscopeapi',{
    "nScope_check_API_version": [ ns_error, [p_double]]
});

exports.check_API_version = () => {
    let apiVersion = ref.alloc(double)
    libnscopeapi.nScope_check_API_version(apiVersion);

    return apiVersion.deref()
}