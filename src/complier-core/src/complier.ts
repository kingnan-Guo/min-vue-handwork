/**
 * complier-core 统一出口
 */

import { baseParse } from "./baseParse";
import { generate } from "./codegen";
import { transform } from "./transform";
import { transformElement } from "./transforms/transformElement";
import { transformExpression } from "./transforms/transformExpression";
import { transformText } from "./transforms/transformText";

export function baseCompile(template) {
    const ast = baseParse(template)
        
    transform(ast, {
        // 有顺序  先将 更改节点 然后再 更改 text
        nodeTransforms: [transformExpression,transformElement, transformText]
    });
    console.log("ast ==",ast);
    return generate(ast)
}