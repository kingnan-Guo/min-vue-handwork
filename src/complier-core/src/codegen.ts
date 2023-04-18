import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers";
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

    /**
     * genFunctionPreamble
     * 
     * const VueBinging = "Vue";
     * // helpers 基于类型的处理 添加 不同的额 函数，当处理插值的时候 使用 helper
     * // 期望在ast 上直接就带有  helpers 属性
     * const helpers =["toDisplayString"];
     * const aliasHelp = (s) => `${s}: _${s}`
     * // push(`const { ${helpers.map(e => aliasHelp(e)).join(", ")} } = ${VueBinging} `);
     * push(`const { ${helpers.map(aliasHelp).join(", ")} } = ${VueBinging}`);
     * push("\n");
     */

    genFunctionPreamble(ast, context);

    
    // const node = ast.codegenNode
    // code += `function ${functionName}(${singnature}){`
    // code += `renturn `
    // code += genNode(ast, code)
    // code += `}`

    
    push(`function ${functionName}(${singnature}){`)
    push(`return `)
    genNode(ast.codegenNode, context)
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
        },
        helper(key){
            return `_${helperMapName[key]}`
        }
    }
    return context;
}




function genNode(node: any, context: any) {
    // 分类处理
    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            geninterpolation(node, context)
            break;
        case NodeTypes.TEXT:
            // const { push } = context;
            // push(` '${node.content}'`);
            genText(node, context)
            break;
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node, context)
            break;


        default:
            break;
    }

}




/**
 * genFunctionPreamble
 * @param ast 
 * @param context 
 * 
 * 
 * const VueBinging = "Vue";
 * // helpers 基于类型的处理 添加 不同的额 函数，当处理插值的时候 使用 helper
 * // 期望在ast 上直接就带有  helpers 属性
 * const helpers =["toDisplayString"];
 * const aliasHelp = (s) => `${s}: _${s}`
 * // push(`const { ${helpers.map(e => aliasHelp(e)).join(", ")} } = ${VueBinging} `);
 * push(`const { ${helpers.map(aliasHelp).join(", ")} } = ${VueBinging}`);
 * push("\n");
 * 
 */
function genFunctionPreamble(ast: any, context: { code: string; push(source: any): void; }) {
    // throw new Error("Function not implemented.");
    const { push } = context;
    const VueBinging = "Vue";
    // helpers 基于类型的处理 添加 不同的额 函数，当处理插值的时候 使用 helper
    // 期望在ast 上直接就带有  helpers 属性
    const helpers =[TO_DISPLAY_STRING];
    const aliasHelp = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        push(`const { ${helpers.map(aliasHelp).join(", ")} } = ${VueBinging}`);
    }
    push("\n");
    push(`return `);


}

function geninterpolation(node: any, context: any) {
    const { push, helper } = context;
    // push(`_toDisplayString(_ctx.message)`);
    // push(`${helperMapName[TO_DISPLAY_STRING]}(`);
    push(`${helper(TO_DISPLAY_STRING)}(`);
    console.log("node ===", node);
    
    genNode(node.content, context)
    push(`)`)

}

function genText(node: any, context: any) {
    const { push } = context;
    push(` '${node.content}'`);
}

function genExpression(node: any, context: any) {
    const { push } = context;
    push(`${node.content}`);
}

