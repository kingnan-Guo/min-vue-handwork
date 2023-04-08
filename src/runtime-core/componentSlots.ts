import { ShapeFlags } from "../shared/ShapeFlags";
export function initSlots(instance, children) {
    // 1、将 children 转换成 数组
    // instance.slots = Array.isArray(children) ? children: [children]  || []


    // -----
    // 2、转换成obj
    // const slots = {}
    // for (const key in children) {
    //     const value = children[key]
    //     slots[key] = normalizeSlotValue(value); // Array.isArray(value) ? value: [value]  || []
    // }
    // instance.slots = slots


    // 先检测 是否为 SLOT_CHILDREN
    const { vnode } = instance;
    // console.log("(instance.slots = {})", );
    // console.log("vnode.ShapeFlags & ShapeFlags.SLOT_CHILDREN ==", vnode.shapeFlags , ShapeFlags.SLOT_CHILDREN);
    
    if (vnode.shapeFlags & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots)
    }
    // normalizeObjectSlots(children, instance.slots)
}

function normalizeSlotValue(value) {
    return Array.isArray(value) ? value: [value]  || []
}

function normalizeObjectSlots(children:any, slots:any) {
    for (const key in children) {
        const value = children[key]
        // 现在 value 变为 function 了 
        slots[key] = (props) => normalizeSlotValue(value(props)); // Array.isArray(value) ? value: [value]  || []
    }
}