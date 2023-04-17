import { NodeTypes } from "./ast";

/**
 * 
 * @param root 
 *  1、遍历 深度优先搜索 traverseNode
 *  2、修改 text的 content
 */
export function generate(ast: any) {
    const context = createCodegenContext();
    const { push } = context;

    // let code = "";
    // code += "return "
    const functionName = "render"
    const args = ["_ctx", "_cache"]
    const singnature = args.join(", ");
    // const node = ast.codegenNode
    // code += `function ${functionName}(${singnature}){`
    // code += `renturn `
    // code += genNode(ast, code)
    // code += `}`

    push("return");
    push(`function ${functionName}(${singnature}){`)
    push("return")
    genNode(ast, context)
    push("}")


    

    return {
        code: context.code,
    }
}

function createCodegenContext() {
    const context = {
        code: "",
        push(source){
            context.code +=source
        }
    }
    return context;
}




function genNode(ast: any, context: any) {
    const { push } = context;
    const node = ast.codegenNode;
    push(` '${node.content}'`);
}

