'use strict';

/**
 *
 * @param type
 * @param props
 * @param children
 * @returns 虚拟节点
 */
function createVNode(type, props, children) {
    console.log("createVNode ==", type);
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlags: getShapeFlag(type),
    };
    if (typeof children === "string") {
        vnode.shapeFlags |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlags |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicIntanceProxyHandlers = {
    get({ _: instance }, key) {
        console.log("setupComponent PublicIntanceProxyHandlers instance =", instance);
        // setUpState
        const { setUpState } = instance;
        if (key in setUpState) {
            return setUpState[key];
        }
        // 1、 ------
        // 使用 $el 方式 获取 setUp中的  数据
        // 因为 instance.vnode.el 组件实例中
        // if (key == "$el") {
        //     return instance.vnode.el
        // }
        // 2、--------
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

/**
 * @param vnode 虚拟节点
 * 创建组件实例
 */
function createComponetInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setUpState: {},
        // el: null
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
    console.log('setupComponent ==instance =', instance);
    // 通过代理的方式 访问 setUp
    instance.proxy = new Proxy({ _: instance }, PublicIntanceProxyHandlers
    // {
    //     get(target, key){
    //         console.log("setupComponent instance =", instance);
    //         // setUpState
    //         const { setUpState } = instance
    //         if (key in setUpState) {
    //             return setUpState[key]
    //         }
    //         // 使用 $el 方式 获取 setUp中的  数据
    //         // 因为 instance.vnode.el 组件实例中
    //         if (key == "$el") {
    //             return instance.vnode.el
    //         }
    //     },
    // }
    );
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
        instance.setUpState = setupResult;
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
    // ShapeFlags 可以标识vnode -> flag 
    // ShapeFlags/ element -> string
    // ShapeFlags/ object -> STATEFUL_COMPONENT
    // 判断 vnode 是不是 element 类型
    // 如果是 element  processElement
    //
    // typeof(vnode.type) =string
    // console.log("typeof(vnode.type) ==", typeof(vnode.type));
    const { shapeFlags } = vnode;
    console.log("shapeFlags ==", shapeFlags, 'ShapeFlags ==', (shapeFlags & 1 /* ShapeFlags.ELEMENT */));
    if (shapeFlags & 1 /* ShapeFlags.ELEMENT */) { //if (typeof(vnode.type) ===string)
        processElement(vnode, container);
    }
    else if (shapeFlags & 2 /* ShapeFlags.STATEFUL_COMPONENT */) { // else if(isObject(vnode.type))
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
    const { type, props, children, shapeFlags } = vnode;
    console.log("mountElement =vnode=", vnode, type);
    // 为了使用 $el 使用 vnode 储存 el， 之后调用  subTree.el 取出存储的 根DOM 
    const el = (vnode.el = document.createElement(vnode.type));
    // 首先区分
    console.log("typeof(children) ==", typeof (children), 'children ==', children);
    // children
    if (shapeFlags & 4 /* ShapeFlags.TEXT_CHILDREN */) { // ShapeFlags/ text_children // if (typeof children == "string") 
        el.textContent = children;
    }
    else if (shapeFlags & 8 /* ShapeFlags.ARRAY_CHILDREN */) { // ShapeFlags/ Array_children // else if (Array.isArray(children))
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
 * @param vnode 虚拟节点vnode 内部存在 children<array> 循环遍历数组
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
    setupRenderEffect(instance, vnode, container);
}
// 
function setupRenderEffect(instance, vnode, container) {
    console.log("setupRenderEffect  instance =", instance);
    // 通过 instance 返回 proxy 代理对象
    const { proxy } = instance;
    // 调用 render 函数
    // subTree 是虚拟节点树
    // const subTree = instance.render()
    const subTree = instance.render.call(proxy);
    // 基于  render() return 出来的 vnode 去调用  patch
    // vnode 是 element ，将 element 处理 挂载出来 ，进行 mounElement 处理
    // patch 这里是 递归循环调用 ，但现在不知到如何跳出循环
    patch(subTree, container);
    //储存 elemet 要在 所有的 mount 完成 之后
    // subTree.el 就是虚拟节点的 跟节点 ，
    // subTree.el 是在 mountElement 中的 vnode.el 存储的
    // 因为此处的  vnode  并非 是 mountElement 中的vnode ，而是被proxy 挂载的 vnode
    console.log("setupRenderEffect subTree ==", subTree);
    vnode.el = subTree.el;
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
