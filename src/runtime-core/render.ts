import { isObject } from "../shared/index";
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
 * 2、判断是不是 element 类型
 */
function patch(vnode, container) {
    // 判断 vnode 是不是 element 类型
    // 如果是 element  processElement
    //
    // typeof(vnode.type) =string
    console.log("typeof(vnode.type) ==", typeof(vnode.type));
    if (typeof vnode.type == 'string') {
        processElement(vnode, container)
    } else if(isObject(vnode.type)) {
        // 如果是 component processComponet
        // typeof(vnode.type) = object
        processComponet(vnode, container)
    }
}



/**
 * 去处理 element
 * @param vnode 
 * @param container 
 */
function processElement(vnode, container) {
    mountElement(vnode, container)
}

/**
 * 去处理组件 processComponet
 * @param vnode 
 * @param container 
 */
function processComponet(vnode: any, container: any) {
    mountComponet(vnode, container)
}

/**
 * 
 * @param vnode 
 * @param container 
 */
function mountElement(vnode, container) {
    const {type, props, children} = vnode;
    const el = document.createElement(vnode.type)
    // 首先区分
    console.log("typeof(children) ==", typeof(children), 'children ==', children);
    if (typeof children == "string") {
        el.textContent = children

    } else if (Array.isArray(children)) {
        //  每一个children 内部都是 一个虚拟节点vnode ，每一次都要判断是 element 还是 components
        // children.forEach((vn) => {
        //     patch(vn, el)
        // })
        mountChildren(vnode, el)
    }
    console.log("props ==", props);
    for (const key in props) {
        const val = props[key]
        el.setAttribute(key, val)
    }
    container.append(el)

}

/**
 * 处理 children 
 * @param vnode 虚拟节点vnode 内部存在 children<array> 循环🏪数组 
 * @param container 容器
 * 
 * 每一个children 内部都是 一个虚拟节点vnode ，每一次都要判断是 element 还是 components
 */
function mountChildren(vnode, container) {
    vnode.children.forEach((vn) => {
        patch(vn, container)
    })
}
/**
 * 
 * @param vnode 
 * @param container 
 */
function mountComponet(vnode: any, container: any) {
    // 创建组件实例 
    const instance = createComponetInstance(vnode)
    setupComponent(instance) //这里 处理 instance 并将 render 赋值给 instance 
    
    setupRenderEffect(instance, container)
}
// 
function setupRenderEffect(instance, container) {
    console.log("setupRenderEffect  instance =", instance);
    
    // 调用 render 函数
    // subTree 是虚拟节点树
    const subTree = instance.render()
    // 基于  render() return 出来的 vnode 去调用  patch
    // vnode 是 element ，将 element 处理 挂载出来 ，进行 mounElement 处理

    // patch 这里是 递归循环调用 ，但现在不知到如何跳出循环
    patch(subTree, container)

}


