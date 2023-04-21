export * from "./toDisplayString"

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

// 判断 value 中是否包含  key
export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)


// TPP开发模式 ： 先写一个 特定的行为 -> 重置成 -> 通用行为
// 1、将event 的  转换成 第一个字母大写的 单词

export const capitalize  = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
export const toHanderKey = (str: string) => {
    return str ? "on" + capitalize(str) : ""
}
// 2、add-foo  -> addFoo
// .replace(/-(\w)/g, (_, c:string) =>{}) 字符串匹配
export const camelize = (str: string) =>{
    return str.replace(/-(\w)/g, (_, c:string) =>{
        // console.log("c ====",c, _);
        // c 为匹配到的 字母 ： f，  _为匹配搭配的字符 ： -f
        return c ? c.toUpperCase(): ""
    })
}

// 创建空对象
export const EMPTY_OBJ = {}

export const isString = (value) => {
    return typeof value === "string"
}