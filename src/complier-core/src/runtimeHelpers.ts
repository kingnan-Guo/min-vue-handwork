export const TO_DISPLAY_STRING = Symbol("toDisplayString")
export const CREATE_ELEMENT_VNODE = Symbol("createElementVNode")

// TO_DISPLAY_STRING 转换成string
export const helperMapName = {
    [TO_DISPLAY_STRING]:"toDisplayString",
    [CREATE_ELEMENT_VNODE]:"createElementVNode",
}
