// 把处理element类型

import { NodeTypes, createVnodeCall } from "../ast";
// import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";


   
export function transformElement(node, context) {
    if (node.type === NodeTypes.ELEMENT) {
        return () => {

            // context.helper(CREATE_ELEMENT_VNODE) //将 helps 整理到 ast/createVnodeCall 中


            /**
             * 中间处理层
             * 1、处理tag
             * 2、处理props 
             */
            // tag
            const vnodeTag = `'${node.tag}'`
            let vnodeProps;
            const children = node.children
            let vnodeChildren = children[0]
            // const vnodeElement = {
            //     type: NodeTypes.ELEMENT,
            //     tag: vnodeTag,
            //     props: vnodeProps,
            //     children: vnodeChildren
            // }
    
            /**
             * 因为在最初 处理的时候 处理的额 是 node。codegenNode
             * 为了 可以处理 到 vnodeElement ，所以赋值到 node.codegenNode
             * 将codegenNode 体换的目的 是逐级处理
             */
            node.codegenNode = createVnodeCall(context, vnodeTag, vnodeProps, vnodeChildren) // return vnodeElement


        }
    }
}
