exports.initInput = () => {

    let isOn;

    isOn = nScopeAPI.get_ChX_on(1);
    if(isOn) {
        $("#Ch1-onoff").addClass('active');
    } else {
        $("#Ch1-onoff").removeClass('active');
    }

    isOn = nScopeAPI.get_ChX_on(2);
    if(isOn) {
        $("#Ch2-onoff").addClass('active');
    } else {
        $("#Ch2-onoff").removeClass('active');
    }

    isOn = nScopeAPI.get_ChX_on(3);
    if(isOn) {
        $("#Ch3-onoff").addClass('active');
    } else {
        $("#Ch3-onoff").removeClass('active');
    }

    isOn = nScopeAPI.get_ChX_on(4);
    if(isOn) {
        $("#Ch4-onoff").addClass('active');
    } else {
        $("#Ch4-onoff").removeClass('active');
    }
}


$("#Ch1-onoff").on("click", function(){
    let wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_ChX_on(1,false)}
    if(!wasChecked) {nScopeAPI.set_ChX_on(1,true)}
}); 

$("#Ch2-onoff").on("click", function(){
    let wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_ChX_on(2,false)}
    if(!wasChecked) {nScopeAPI.set_ChX_on(2,true)}
}); 

$("#Ch3-onoff").on("click", function(){
    let wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_ChX_on(3,false)}
    if(!wasChecked) {nScopeAPI.set_ChX_on(3,true)}
}); 

$("#Ch4-onoff").on("click", function(){
    let wasChecked = $(this).hasClass('active');
    if(wasChecked) {nScopeAPI.set_ChX_on(4,false)}
    if(!wasChecked) {nScopeAPI.set_ChX_on(4,true)}
}); 

