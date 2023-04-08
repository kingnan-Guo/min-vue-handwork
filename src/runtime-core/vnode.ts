import { ShapeFlags } from "../shared/ShapeFlags";

// 这样保证特殊字符 Fragment  整个项目里唯一
export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")
/**
 * 
 * @param type 
 * @param props 
 * @param children 
 * @returns 虚拟节点
 */
export function createVNode(type, props?, children?) {
    console.log("createVNode ==", type);
    
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlags:getShapeFlag(type),
    }
    if (typeof children === "string") {
        vnode.shapeFlags |=  ShapeFlags.TEXT_CHILDREN
    } else if(Array.isArray(children)) {
        vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN
    }

    // 判定是否为 slots children
    // 首先是 个 组件 && 它的 children 必须为 object 类型
    
    
    if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === "object") {
            vnode.shapeFlags |= ShapeFlags.SLOT_CHILDREN
        }
        
    }
    // console.log("vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT ==", vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT);
    console.log("vnode =======", vnode);
    return vnode
}

function getShapeFlag(type) {
    return typeof type ==="string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

export function creatTextVNode(text:string) {
    return createVNode(Text, {}, text)
}