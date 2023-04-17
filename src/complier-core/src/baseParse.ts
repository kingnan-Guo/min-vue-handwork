import { NodeTypes } from "./ast";

const enum TagType {
    Start,
    End,
}

export function baseParse(content:string) {
    const context = createParserContext(content);
    return createRoot(parseChildren(context, []));
    
    
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


function parseChildren(context, ancestors) {
    const nodes:any = [];
    // const isE = isEnd(context, ancestors)
    // console.log(isE);
    
    while (!isEnd(context, ancestors)) {
   
        let node;
        const s = context.source;
        if (s.startsWith("{{")) {
            node = parseInterpolation(context);
            
        } else if (s[0] === "<") {
            if (/[a-z]/i.test(s[1])) {
                // console.log("parse element");
                node = parseElement(context, ancestors);
            }
        }
        
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);


    }

    return nodes;

}

/**
 * 1、 source  有值的时候
 * 2、当遇到结束标签的是时候
 */
function isEnd(context, ancestors) {
    const s = context.source;
    // 变成模板字符护士劝
    // if (parentTag && s.startsWith(`</${parentTag}>`)) {
    //     return true
    // }
    // return !s

    // </div>
    if (s.startsWith("</")) {
        
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            // if (s.slice(2, 2 + tag.length) == tag) 
            if (startsWithEndTagOpen(s, tag)) {
            
            
                return true;
            }
            
        }

    }
    return !s;
    
}

/**
 * 处理text
 * @param context 
 * 1、获取content
 * 2、推进
 */
function parseText(context: any) {
    let endIndex = context.source.length;
    let endTokens = ["<", "{{"];

    for (let i = 0; i < endTokens.length; i++) {
        // const element = array[index];
        const index = context.source.indexOf(endTokens[i]);
        // endIndex > index 时 说明 找到了最近的 结束符
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        } 
    }





    // // 1、获取content
    // const content = context.source.slice(0, context.source.length)
    // // 2、推进
    // advanceBy(context, content.length)

    const content = parseTextData(context, endIndex);
    //console.log(" text  context.source =", context.source);
    //console.log("parseText  content =", content);
    
    return {
        type: NodeTypes.TEXT,
        content: content,
    }
}


function parseTextData(context: any, length) {
    const content = context.source.slice(0, length);
    advanceBy(context, length);
    return content;
}


/**
 * 解析 elelment
 * @param context 
 * @returns 
 */
function parseElement(context: any, ancestors) {

    // implement
    const element: any = parseTag(context, TagType.Start);
    // 收集 tag
    ancestors.push(element);

    element.children = parseChildren(context, ancestors);

    // 弹出
    ancestors.pop();

    // 如果此处标签相等 那么此处时 end标签 去消费
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End);
    } else {
        //console.log("Element =", `缺少结束标签${element.tag}`);
        throw new Error(`缺少结束标签:${element.tag}`);
    }
    // parseTag(context, TagType.End)


    //console.log('context.source', context.source);
    return element;
    // return {
    //     type: NodeTypes.ELEMENT,
    //     tag: tag,
    //     children: []
    // }
}

function startsWithEndTagOpen(source, tag) {
    // return (source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase())
    return (
        source.startsWith("</") &&
        source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
      );
}


function parseTag(context: any, type: TagType) {
    const match: any = /^<\/?([a-z]*)/i.exec(context.source);
    console.log("match =", match);
    const tag = match[1];
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    if (type == TagType.End) {
        return
    }
    return {
        type: NodeTypes.ELEMENT,
        tag: tag,
    };

}





/**
 * 解析插值
 */
function parseInterpolation(context) {
    // {{message}}

    const openDelimiter = "{{";
    const closeDelimiter = "}}";
    // 从第二个值开始查找 
    const closeIndex = context.source.indexOf(
        closeDelimiter, 
        openDelimiter.length
    );
    // 推进
    // context.source = context.source.slice(openDelimiter.length)
    advanceBy(context, openDelimiter.length);

    const rawContentLength = closeIndex - openDelimiter.length;
    // content 是去除双括号的值
    // const rawContent = context.source.slice(0, rawContentLenth)
    const rawContent = parseTextData(context, rawContentLength);
    // 去除空格
    const content = rawContent.trim();

    // context.source = context.source.slice(rawContentLenth + closeDelimiter.length)
    // advanceBy(context, rawContentLenth + closeDelimiter.length )
    advanceBy(context, closeDelimiter.length);
    // console.log("context =", context);

    return {
        type: NodeTypes.INTERPOLATION,// "interpolation",
        content: {
            type: NodeTypes.INTERPOLATION,
            content:content
        }
    }
}

/**
 * 推进
 * @param context 
 * @param length 
 */
function advanceBy(context, length) {
    // context.source.indexOf(context, length)
    context.source = context.source.slice(length);

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

