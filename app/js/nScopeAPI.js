const ffi = require('ffi')
const ref = require('ref')

var bool = ref.types.bool;
var p_bool = ref.refType(bool);
var double = ref.types.double;
var p_double = ref.refType(double);
var ns_error = ref.types.int;
var ns_power_state = ref.types.int;
var p_ns_power_state = ref.refType(ns_power_state);
var int = ref.types.int;
var p_int = ref.refType(int);

var scopeHandle = ref.refType(ref.types.void);
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
    "nScope_open": [ns_error, [bool, p_scopeHandle]],
    "nScope_close": [ns_error, [p_scopeHandle]],
    "nScope_clean": [ns_error, [p_scopeHandle]],
    "nScope_initialize": [ns_error, [scopeHandle]],
    "nScope_get_power_usage": [ns_error, [scopeHandle, p_double]],
    "nScope_get_power_state": [ns_error, [scopeHandle, p_ns_power_state]],
    "nScope_find_firmware_loader": [ns_error, []],
    "nScope_write_to_loader": [ns_error, []],
    "nScope_load_firmware": [ns_error, []],
    "nScope_check_API_version": [ns_error, [p_double]],
    "nScope_check_FW_version": [ns_error, [p_double]],
    "nScope_check_API_build": [ns_error, [p_int]],

    "nScope_set_AX_on": [ns_error, [scopeHandle, int, bool]],
    "nScope_get_AX_on": [ns_error, [scopeHandle, int, p_bool]],
    "nScope_set_AX_frequency_in_hz": [ns_error, [scopeHandle, int, double]],
    "nScope_get_AX_frequency_in_hz": [ns_error, [scopeHandle, int, p_double]],
    "nScope_set_AX_wave_type": [ns_error, [scopeHandle, int, int]],
    "nScope_get_AX_wave_type": [ns_error, [scopeHandle, int, p_int]],
    "nScope_set_AX_unipolar": [ns_error, [scopeHandle, int, bool]],
    "nScope_get_AX_unipolar": [ns_error, [scopeHandle, int, p_bool]],
    "nScope_set_AX_amplitude": [ns_error, [scopeHandle, int, double]],
    "nScope_get_AX_amplitude": [ns_error, [scopeHandle, int, p_double]],

    "nScope_set_PX_on": [ns_error, [scopeHandle, int, bool]],
    "nScope_get_PX_on": [ns_error, [scopeHandle, int, p_bool]],
    "nScope_set_PX_frequency_in_hz": [ns_error, [scopeHandle, int, double]],
    "nScope_get_PX_frequency_in_hz": [ns_error, [scopeHandle, int, p_double]],
    "nScope_set_PX_duty_percentage": [ns_error, [scopeHandle, int, double]],
    "nScope_get_PX_duty_percentage": [ns_error, [scopeHandle, int, p_double]],



});

var p_nScopeHandle = ref.alloc(p_scopeHandle);
var nScopeHandle;
var p_nScopeRequest;
var nScopeRequest;

exports.open = () => {
    var err = libnscopeapi.nScope_open(true,p_nScopeHandle);
    if(err == 0) nScopeHandle = p_nScopeHandle.deref();
    return err;
}

exports.close = () => {
    var err = libnscopeapi.nScope_close(p_nScopeHandle);
    return err;
}

exports.clean = () => {
    var err = libnscopeapi.nScope_close(p_nScopeHandle);
    return err;
}

exports.initialize = () => {
    var err = libnscopeapi.nScope_initialize(nScopeHandle);
    return err;
}

exports.get_power_usage = () => {
    let powerUsage = ref.alloc(double);
    var err = libnscopeapi.nScope_get_power_usage(nScopeHandle,powerUsage);
    if(err == 0) return powerUsage.deref();
    return err;
}

exports.get_power_state = () => {
    let powerState = ref.alloc(ns_power_state);
    var err = libnscopeapi.nScope_get_power_state(nScopeHandle,powerState);
    if(err == 0) return powerState.deref();
    return err;
}

exports.find_firmware_loader = () => {
    var err = libnscopeapi.nScope_find_firmware_loader();
    return err;
}

exports.write_to_loader = () => {
    var err = libnscopeapi.nScope_write_to_loader();
    return err;
}

exports.load_firmware = () => {
    var err = libnscopeapi.nScope_load_firmware();
    return err;
}

exports.check_API_version = () => {
    let apiVersion = ref.alloc(double)
    var err = libnscopeapi.nScope_check_API_version(apiVersion);
    if(err == 0) return apiVersion.deref();
    return err;
}

exports.check_FW_version = () => {
    let fwVersion = ref.alloc(double)
    var err = libnscopeapi.nScope_check_FW_version(fwVersion);
    if(err == 0) return fwVersion.deref();
    return err;
}

exports.check_API_build = () => {
    let apiBuild = ref.alloc(int)
    var err = libnscopeapi.nScope_check_API_build(apiBuild);
    if(err == 0) return apiBuild.deref();
    return err;
}

exports.get_AX_on = (ch) => {
    let isOn = ref.alloc(bool)
    var err = libnscopeapi.nScope_get_AX_on(nScopeHandle,ch,isOn);
    if(err == 0) return isOn.deref();
    return err;
}

exports.set_AX_on = (ch, on) => {
    var err = libnscopeapi.nScope_set_AX_on(nScopeHandle,ch,on);
    return err;
}

exports.get_AX_frequency_in_hz = (ch) => {
    let freq = ref.alloc(double)
    var err = libnscopeapi.nScope_get_AX_frequency_in_hz(nScopeHandle,ch,freq);
    if(err == 0) return freq.deref();
    return err;
}

exports.set_AX_frequency_in_hz = (ch, freq) => {
    var err = libnscopeapi.nScope_set_AX_frequency_in_hz(nScopeHandle,ch,freq);
    return err;
}

exports.get_AX_wave_type = (ch) => {
    let wavetype = ref.alloc(int)
    var err = libnscopeapi.nScope_get_AX_wave_type(nScopeHandle,ch,wavetype);
    if(err == 0) return wavetype.deref();
    return err;
}

exports.set_AX_wave_type = (ch, wavetype) => {
    var err = libnscopeapi.nScope_set_AX_wave_type(nScopeHandle,ch,wavetype);
    return err;
}

exports.get_AX_unipolar = (ch) => {
    let isUnipolar = ref.alloc(bool)
    var err = libnscopeapi.nScope_get_AX_unipolar(nScopeHandle,ch,isUnipolar);
    if(err == 0) return isUnipolar.deref();
    return err;
}

exports.set_AX_unipolar = (ch, unipolar) => {
    var err = libnscopeapi.nScope_set_AX_unipolar(nScopeHandle,ch,unipolar);
    return err;
}

exports.get_AX_amplitude = (ch) => {
    let amplitude = ref.alloc(double)
    var err = libnscopeapi.nScope_get_AX_amplitude(nScopeHandle,ch,amplitude);
    if(err == 0) return amplitude.deref();
    return err;
}

exports.set_AX_amplitude = (ch, amplitude) => {
    var err = libnscopeapi.nScope_set_AX_amplitude(nScopeHandle,ch,amplitude);
    return err;
}

exports.get_PX_on = (ch) => {
    let isOn = ref.alloc(bool)
    var err = libnscopeapi.nScope_get_PX_on(nScopeHandle,ch,isOn);
    if(err == 0) return isOn.deref();
    return err;
}

exports.set_PX_on = (ch, on) => {
    var err = libnscopeapi.nScope_set_PX_on(nScopeHandle,ch,on);
    return err;
}

exports.get_PX_frequency_in_hz = (ch) => {
    let freq = ref.alloc(double)
    var err = libnscopeapi.nScope_get_PX_frequency_in_hz(nScopeHandle,ch,freq);
    if(err == 0) return freq.deref();
    return err;
}

exports.set_PX_frequency_in_hz = (ch, freq) => {
    var err = libnscopeapi.nScope_set_PX_frequency_in_hz(nScopeHandle,ch,freq);
    return err;
}

exports.get_PX_duty_percentage = (ch) => {
    let duty = ref.alloc(double)
    var err = libnscopeapi.nScope_get_PX_duty_percentage(nScopeHandle,ch,duty);
    if(err == 0) return duty.deref();
    return err;
}

exports.set_PX_duty_percentage = (ch, duty) => {
    var err = libnscopeapi.nScope_set_PX_duty_percentage(nScopeHandle,ch,duty);
    return err;
}