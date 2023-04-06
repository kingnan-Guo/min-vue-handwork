import { createComponetInstance, setupComponent } from "./components";
/**
 * 
 * @param vnode 虚拟节点
 * @param container 容器
 * render 是为了调用patch 方法，方便执行 递归处理
 */
export function render(vnode,container) {
    patch(vnode, container)
}

/**
 * 
 * @param vnode 虚拟节点 
 * @param container 容器
 * 步骤
 * 1、去处理组件 processComponet
 * 
 */
function patch(vnode, container) {

    
    // 判断是不是 element 类型
    processComponet(vnode, container)
}
/**
 * 去处理组件 processComponet
 * @param vnode 
 * @param container 
 */
function processComponet(vnode: any, container: any) {
    mountComponet(vnode, container)
}

function mountComponet(vnode: any, container: any) {
    // 创建组件实例 
    const instance = createComponetInstance(vnode)
    setupComponent(instance) //这里 处理 instance 并将 render 赋值给 instance 
    
    setupRenderEffect(instance, container)
}
// 
function setupRenderEffect(instance, container) {
    // 调用 render 函数
    // subTree 是虚拟节点树
    const subTree = instance.render()
    // 基于  return 出来的 vnode 去调用  patch
    // vnode 是 element ，将 element 处理 挂载出来 ，进行 mounElement 处理

    // patch 这里是 递归循环调用 ，但现在不知到如何跳出循环
    patch(subTree, container)

}


