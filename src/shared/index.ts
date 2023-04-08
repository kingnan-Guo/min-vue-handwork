// 将两个或多个对象的属性合并到一起
export const extend = Object.assign;

// 判断是否 为 object
export const isObject = (val) => {
    return val !== null && typeof(val) == "object"
}

// 判断两个对象是否一样
export const hasChange = (val, newValue) => {
    return !Object.is(val, newValue)
}

// 判断 vaule 中是否包含  key
export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)

