import { createRenderer } from "../runtime-core";

function createElement(type) {
    console.log("createElement -------------------");
    return document.createElement(type)
}

function patchProp(el, key, preVal, nextVal) {
    console.log("patchProp -------------------");
    
    console.log("mountElement == props ==", key , 'val ==', nextVal);
    // 通用方法 
    // on Event name
    // onMousedown
    const isOn = (key:string) => /^on[A-Z]/.test(key) 
    console.log("isOn(key) ==",isOn(key) );
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, nextVal)
    } else{
        if (nextVal === undefined || nextVal == null) {
            el.removeAttribute(key, nextVal) 
        } else {
            el.setAttribute(key, nextVal)
        }
        
    }

}

function insert(el, container) {
    console.log("insert -------------------");
    container.append(el)
}

// 删除 children
function remove(child) {
    // 先获取到父级元素
    const parent = child.parentNode
    if (parent) {
        parent.removeChild(child)
    }
}

// 给容器设置文本
function setElementText(el, text) {
    el.textContent = text
}

const renderer:any =  createRenderer({
    createElement, patchProp, insert, remove, setElementText
})

// 使用 createRenderer 的return 返回 createApp 
export function createApp(...args) {
    return renderer.createApp(...args)
}



// 把  "./runtime-core" 的导出  放在 runtime-dom 里，使用rentime-dom 一起导出所有
export * from "../runtime-core";