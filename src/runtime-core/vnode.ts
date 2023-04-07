import { ShapeFlags } from "../shared/ShapeFlags";
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
    return vnode
}

function getShapeFlag(type) {
    return typeof type ==="string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}