import { NodeTypes } from "./ast";

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

}



function creatTransformContext(root: any, options: any) {
    const context = {
        root,
        nodeTransforms:options.nodeTransforms || []
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

    traverseChildren(node,  context)
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


