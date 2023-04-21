import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers"

// 枚举 一般使用大写的昂是
export const enum NodeTypes {
    INTERPOLATION,
    SIMPLE_EXPRESSION,
    ELEMENT,
    TEXT,
    ROOT,
    COMPOUND_EXPRESSION, //复合类型  TEXT + INTERPOLATION
}
export function createVnodeCall(context, tag, props, children) {
    context.helper(CREATE_ELEMENT_VNODE)
    const vnodeElement = {
        type: NodeTypes.ELEMENT,
        tag: tag,
        props: props,
        children: children
    }
    return vnodeElement
}