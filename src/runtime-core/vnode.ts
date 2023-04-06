/**
 * 
 * @param type 
 * @param props 
 * @param children 
 * @returns 虚拟节点
 */
export function createVNode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children
    }
    return vnode
}