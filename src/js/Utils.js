export function getId(id) {
    return document.getElementById(id);
}

export function isEmpty(obj) {
    return obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
}