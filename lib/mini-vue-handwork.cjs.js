'use strict';

/**
 *
 * @param type
 * @param props
 * @param children
 * @returns 虚拟节点
 */
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

// 将两个或多个对象的属性合并到一起
// 判断是否 为 object
const isObject = (val) => {
    return val !== null && typeof (val) == "object";
};

/**
 * @param vnode 虚拟节点
 * 创建组件实例
 */
function createComponetInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
/**
 * 处理组件
 * @param instance 组件实例
 *
 * 1、初始化 initProps
 * 2、初始话 initSlots() 插槽
 * 3、处理调用setUp 后的 返回值
 */
function setupComponent(instance) {
    // initProps()
    // initSlots()
    // 初始化有状态的 component 组件 ； 函数组件没有任何状态
    setupStatefulComponet(instance);
}
/**
 * 初始化有状态的 component 组件
 * @param instance
 * 1、调用 setUp  拿到setUp 的返回值
 *
 *
 * -----------
 * 在最开始使用的时候
 * 1、createApp / createVNode 的传值是  rootComponent 为 example/hellowWorld/main.js 中的App<用户配置>
 * 2、经过 createVNode 处理后  生成 vnode  对象
 *
 */
function setupStatefulComponet(instance) {
    console.log("setupStatefulComponet =instance =", instance);
    // Component: 当前组件的 对象
    const Component = instance.type;
    const { setUp } = Component;
    if (setUp) {
        /**
         * 这里有两种返回值
         * 1、function 就任务是组件的 render 函数
         * 2、object ： 就会把object返回的对象 注入到 上下文中
         */
        const setupResult = setUp();
        handleSetupResult(instance, setupResult);
    }
}
/**
 * handleSetupResult 处理传来 不同类型的值
 * @param instance 组件实例
 * @param setupResult 两种类型的值 function object
 *
 *
 * -----------
 * 如果 setupResult = "object" 那么 就赋值到 组件实例instance上
 */
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult == "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
/**
 *
 * @param instance
 *
 *
 * ---
 * 保证组件的 render  一定是有值的
 *
 * 先获取组件的 render
 * 因为 render 函数才会返回要渲染的 组件的节点
 */
function finishComponentSetup(instance) {
    console.log("finishComponentSetup == instance ==", instance);
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

/**
 *
 * @param vnode 虚拟节点
 * @param container 容器
 * render 是为了调用patch 方法，方便执行 递归处理
 */
function render(vnode, container) {
    patch(vnode, container);
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
    console.log("typeof(vnode.type) ==", typeof (vnode.type));
    if (typeof vnode.type == 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 如果是 component processComponet
        // typeof(vnode.type) = object
        processComponet(vnode, container);
    }
}
/**
 * 去处理 element
 * @param vnode
 * @param container
 */
function processElement(vnode, container) {
    mountElement(vnode, container);
}
/**
 * 去处理组件 processComponet
 * @param vnode
 * @param container
 */
function processComponet(vnode, container) {
    mountComponet(vnode, container);
}
/**
 *
 * @param vnode
 * @param container
 */
function mountElement(vnode, container) {
    const { type, props, children } = vnode;
    const el = document.createElement(vnode.type);
    // 首先区分
    console.log("typeof(children) ==", typeof (children), 'children ==', children);
    if (typeof children == "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        //  每一个children 内部都是 一个虚拟节点vnode ，每一次都要判断是 element 还是 components
        // children.forEach((vn) => {
        //     patch(vn, el)
        // })
        mountChildren(vnode, el);
    }
    console.log("props ==", props);
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
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
        patch(vn, container);
    });
}
/**
 *
 * @param vnode
 * @param container
 */
function mountComponet(vnode, container) {
    // 创建组件实例 
    const instance = createComponetInstance(vnode);
    setupComponent(instance); //这里 处理 instance 并将 render 赋值给 instance 
    setupRenderEffect(instance, container);
}
// 
function setupRenderEffect(instance, container) {
    console.log("setupRenderEffect  instance =", instance);
    // 调用 render 函数
    // subTree 是虚拟节点树
    const subTree = instance.render();
    // 基于  render() return 出来的 vnode 去调用  patch
    // vnode 是 element ，将 element 处理 挂载出来 ，进行 mounElement 处理
    // patch 这里是 递归循环调用 ，但现在不知到如何跳出循环
    patch(subTree, container);
}

/**
 *
 * @param rootComponent
 * @returns
 */
function createApp(rootComponent) {
    return {
        /**
         *
         * @param rootContainer : element 实例 容器
         */
        mount(rootContainer) {
            //1、  先转换成 vnode 虚拟节点
            // 2、所有的逻辑操作都会 基于 vnode 虚拟节点 做处理
            // 将组件 component 转换成 虚拟节点 vnode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
