import { createVNode } from "../vnode";

export function renderSlots(slots, name, props) {
    const slot = slots[name]
    console.log("renderSlots slot ==", slot);
    
    if (slot) {
        // slot is a function
        if(typeof slot === 'function'){
            return createVNode('div', {}, slot(props))
        }
        
    }
    
}