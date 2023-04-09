import { createVNode } from "./vnode";
// import { render } from "./render";

export function createAppAPI(render) {
    
    /**
     * 
     * @param rootComponent 
     * @returns 
     */
    return function createApp(rootComponent) {
        return {
            /**
             * 
             * @param rootContainer : element 实例 容器
             */
            mount(rootContainer){
                //1、  先转换成 vnode 虚拟节点
                // 2、所有的逻辑操作都会 基于 vnode 虚拟节点 做处理
                // 将组件 component 转换成 虚拟节点 vnode
                const vnode = createVNode(rootComponent);

                render(vnode, rootContainer)
            }
        }
    }



}




