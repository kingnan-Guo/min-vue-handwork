import { NodeTypes } from "../ast";
import { isTextOrInterpolation } from "../utills";

/**
 * 因为在生成节点的过程中， 只生成了节点 没有对相邻的text 和 message  进行连接，缺少+ 所以要创建一种复合类型的 节点
 * @param node 
 * @param context 
 */
export function transformText(node, context) {
    if (node.type === NodeTypes.ELEMENT) {

        return () => {
            const { children } = node
            let currentContainer;
            if (children && children.length) {
                for (let index = 0; index < children.length; index++) {
                    const child = children[index];
                    if (isTextOrInterpolation(child)) {
                        
                        for (let j = index + 1; j < children.length; j++) {
                            const nextChild = children[j];
                            if(isTextOrInterpolation(nextChild)){
                                /**
                                 * 初始化为 currentContainer 复合类型 
                                 * 并且替换掉 children[index] 因为不能重复添加 node 节点x
                                 */
                                if(!currentContainer){
                                    // 此处 将  合并好的 currentContainer<COMPOUND_EXPRESSION> 替换 children，此处未来会在 genCode 中被处理
                                    currentContainer = children[index] ={
                                        type: NodeTypes.COMPOUND_EXPRESSION,
                                        children: [child]
        
                                    }
                                }
                                // 为了解决 + 的问题
    
                                currentContainer.children.push(" + ")
                                currentContainer.children.push(nextChild)
                                // 最后要将已经添加进入currentContainer 的 节点删除掉
                                children.splice(j, 1)
                                j--;//是因为 数组被删除了一个 那么 length 就减少 一，
    
    
                            } else {
                                // 如果 第一位是 isTextOrInterpolation 第二位不是 TextOrInterpolation，那么要清除currentContainer
                                currentContainer = undefined
                                break;
                            }
                        }
    
    
    
                    }
    
                }    
            }
        }

    }
}


// function isTextOrInterpolation(node) {
//     return node.type == NodeTypes.TEXT || node.type == NodeTypes.INTERPOLATION
// }