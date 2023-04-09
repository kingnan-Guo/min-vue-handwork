import { createRenderer } from "../runtime-core";

function createElement(type) {
    console.log("createElement -------------------");
    return document.createElement(type)
}

function patchProp(el, key, val) {
    console.log("patchProp -------------------");
    
    console.log("mountElement == props ==", key , 'val ==', val);
    // 通用方法 
    // on Event name
    // onMousedown
    const isOn = (key:string) => /^on[A-Z]/.test(key) 
    console.log("isOn(key) ==",isOn(key) );
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, val)
    } else{
        el.setAttribute(key, val)
    }

}

function insert(el, container) {
    console.log("insert -------------------");
    container.append(el)
}

const renderer:any =  createRenderer({
    createElement, patchProp, insert
})

// 使用 createRenderer 的return 返回 createApp 
export function createApp(...args) {
    return renderer.createApp(...args)
}



// 把  "./runtime-core" 的导出  放在 runtime-dom 里，使用rentime-dom 一起导出所有
export * from "../runtime-core";