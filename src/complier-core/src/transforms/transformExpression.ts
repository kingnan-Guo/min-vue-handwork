import { NodeTypes } from "../ast";

/**
 * 
 * @param node 
 */
export function transformExpression(node) {
    if (node.type === NodeTypes.INTERPOLATION) {
        
        const rawContent = processExperssion(node.content);
        node.content = rawContent
    }
}

function processExperssion(node: any) {
    node.content = `_ctx.${node.content}`
    return node
}
