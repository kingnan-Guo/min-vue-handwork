import { NodeTypes } from "./ast";
export function baseParse(content:string) {

    const context = createParserContext(content)
    return createRoot(parserChildren(context))
    
    
    // return {
    //     children:[{
    //         type: "interpolation",
    //         content: {
    //             type: "simple_expression",
    //             content:"message"
    //         }
    //     }]
    // }
}




/**
 * 创建 跟节点
 * @param children 
 * @returns 
 */
function createRoot(children) {
    return{
        children
    }
}


function parserChildren(context) {
    const nodes:any = []
    let node
    if (context.source.startsWith("{{")) {
        node = parserInterpolation(context)
        nodes.push(node)
    }
    return nodes

}



/**
 * 解析插值
 */
function parserInterpolation(context) {
    // {{message}}

    const openDelimiter = "{{"
    const closeDelimiter = "}}"
    // 从第二个值开始查找 
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
    // 推进
    // context.source = context.source.slice(openDelimiter.length)
    advanceBy(context, openDelimiter.length)

    const rawContentLenth = closeIndex - openDelimiter.length;
    // content 是去除双括号的值
    const rawContent = context.source.slice(0, rawContentLenth)
    // 去除空格
    const content = rawContent.trim()

    // context.source = context.source.slice(rawContentLenth + closeDelimiter.length)
    advanceBy(context, rawContentLenth + closeDelimiter.length )

    // console.log("context =", context);

    return {
        type: NodeTypes.INTERPOLATION,// "interpolation",
        content: {
            type: NodeTypes.INTERPOLATION,
            content:content
        }
    }
}


function advanceBy(context, length) {
    // context.source.indexOf(context, length)
    context.source = context.source.slice(length)

}

/**
 * 
 * @param content 
 * @returns 
 */
function createParserContext(content) {
    return {
        source:content
    }
}