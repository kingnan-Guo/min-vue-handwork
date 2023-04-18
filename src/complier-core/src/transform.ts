import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers";

/**
 * 
 * @param root 
 *  1、遍历 深度优先搜索 traverseNode
 *  2、修改 text的 content
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
        nodeTransforms:options.nodeTransforms || [],
        helpers: new Map(),
        helper(key){
            context.helpers.set(key, 1)
        }
    }
    return context;
}


function createRootCodegen(root: any) {
    root.codegenNode = root.children[0];
}

function traverseNode(node: any, context: any) {

    const nodeTransforms = context.nodeTransforms
    for (let j = 0; j < nodeTransforms.length; j++) {
        const transform = nodeTransforms[j];
        transform(node);
        
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

    
}

function traverseChildren(node: any, context: any) {
    const children = node.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const node = children[i];

            traverseNode(node, context)
            
        }
    }
}


