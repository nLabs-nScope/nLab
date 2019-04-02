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

switch(require('process').platform)
{
    case 'linux':
        switch(require('process').arch) {
            case 'arm':     var lib = 'nScopeAPI/lib/linux_armhf/libnscopeapi'; break;
            case 'arm64':   var lib = 'nScopeAPI/lib/linux_arm64/libnscopeapi'; break;
            case 'x32':     var lib = 'nScopeAPI/lib/linux_i386/libnscopeapi'; break;
            case 'x64':     var lib = 'nScopeAPI/lib/linux_amd64/libnscopeapi'; break;
        }
        break;
    case 'win32':
        switch(require('process').arch) {
            case 'x32':     var lib = 'nScopeAPI/lib/win32/libnscopeapi'; break;
            case 'x64':     var lib = 'nScopeAPI/lib/win64/libnscopeapi'; break;
        }
        break;
    case 'darwin': var lib = 'nScopeAPI/lib/mac/libnscopeapi'; break;       
}


const libnscopeapi = ffi.Library(lib,{
    "nScope_check_API_version": [ ns_error, [p_double]]
});

exports.check_API_version = () => {
    let apiVersion = ref.alloc(double)
    libnscopeapi.nScope_check_API_version(apiVersion);

    return apiVersion.deref()
}