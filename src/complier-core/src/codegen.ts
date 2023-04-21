import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers";
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
        case NodeTypes.ELEMENT:
            genElement(node, context)
            break;
        case NodeTypes.COMPOUND_EXPRESSION:
            genCompoundExpression(node, context)
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
    // const helpers =[TO_DISPLAY_STRING];
    const aliasHelp = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelp).join(", ")} } = ${VueBinging}`);
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

function genElement(node: any, context: any) {
    const { push, helper } = context;
    const { tag, children, props } = node

    // push(`${helper(CREATE_ELEMENT_VNODE)}("${tag}"), ${props},`);
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);

    // 因为 在 transformElement 对 node 进行累处理 ，所以 此处 废弃
    // for (let i = 0; i < children.length; i++) {
    //     genNode(children[i], context);
    // }
    // genNode(children, context);
    genNodeList(getNullAble([tag, props, children]), context)
    
    push(`)`)
}
// 检测数组里的值是否 有值 ，如果没有返回 null
function genNodeList(nodes: any[], context) {
    const { push, helper } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if(isString(node)){
            push(node)
        } else {
            genNode(node, context);
        }

        // 补充 逗号， 除了最后一个 其余都要加
        if(i< nodes.length -1){
            push(",")
        }
        
    }
}

// 检测数组里的值是否 有值 ，如果没有返回 null
function getNullAble(args: any[]) {
    return args.map((arg) => arg || " null" )
}

// 对 COMPOUND_EXPRESSION 类型进行 处理 生成 
function genCompoundExpression(node: any, context: any) {
    const { push, helper } = context;
    const { tag, children } = node

    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isString(child)) {
            push(child)
        } else {
            genNode(child, context);
        }
        
        
    }
    console.log("node ==", context.code);
    
    // push(`)`)
}


