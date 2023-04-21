import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers";

/**
 * transform 的主要目的就是对 ast 做增删 改查，最终 交给 generateCode
 * @param root 
 *  1、遍历 深度优先搜索 traverseNode
 *  2、修改 text的 content
 * 
 * 
 */
export function transform(root, options:any = {}) {
    const context = creatTransformContext(root, options);
    traverseNode(root, context);
    createRootCodegen(root)

    // 将 helps 存入跟节点 root
    root.helpers = [...context.helpers.keys()]

}



function creatTransformContext(root: any, options: any) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key){
            context.helpers.set(key, 1)
        }
    }
    return context;
}


function createRootCodegen(root: any) {
    const child = root.children[0]
    if(child.type === NodeTypes.ELEMENT){
        root.codegenNode = child.codegenNode;
    } else{
        root.codegenNode = child;
    }

    
    
}

function traverseNode(node: any, context: any) {

    const nodeTransforms = context.nodeTransforms;
    const exitFuns:any = []
    for (let j = 0; j < nodeTransforms.length; j++) {
        const transform = nodeTransforms[j];
        const onExit = transform(node, context);
        if(onExit){
            exitFuns.push(onExit)
        }
        
    }
    // if (node.type === NodeTypes.TEXT) {
    //     node.content = node.content + "hellow"
    // }


    // 此处判断 是否为 插值
    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            // 希望 context  上有一个type
            context.helper(TO_DISPLAY_STRING)
            break;
        case NodeTypes.ELEMENT:
            traverseChildren(node,  context)
            break;
        case NodeTypes.ROOT:
            traverseChildren(node,  context)
            break;

        default:
            break;
    }


    // 在退出的时候再次重新执行 exitFun
    let i = exitFuns.length
    while(i--){
        exitFuns[i]()
    }

    
}

function traverseChildren(node: any, context: any) {
    const children = node.children
    if (children.length) {
        for (let i = 0; i < children.length; i++) {
            const node = children[i];

            traverseNode(node, context)
            
        }
    }
}


