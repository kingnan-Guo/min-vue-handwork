import { createVNode, Fragment } from "../vnode";

export function renderSlots(slots, name, props) {
    const slot = slots[name]
    console.log("renderSlots slot ==", slot);
    
    if (slot) {
        // slot is a function
        if(typeof slot === 'function'){
            // 在项目中  每一个 插槽 外面都包裹着一个div
            // children 是不是可以有 array
            // 定义一个特殊的 type Fragment 在 path 中特殊处理
            return createVNode(Fragment, {}, slot(props))
        }
        
    }
    
}