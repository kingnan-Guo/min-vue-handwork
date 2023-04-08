// 这样保证特殊字符 Fragment  整个项目里唯一
const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
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
    // 判定是否为 slots children
    // 首先是 个 组件 && 它的 children 必须为 object 类型
    if (vnode.shapeFlags & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlags |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    // console.log("vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT ==", vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT);
    console.log("vnode =======", vnode);
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
function creatTextVNode(text) {
    return createVNode(Text, {}, text);
}

// 将两个或多个对象的属性合并到一起
const extend = Object.assign;
// 判断是否 为 object
const isObject = (val) => {
    return val !== null && typeof (val) == "object";
};
// 判断 vaule 中是否包含  key
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
// TPP开发模式 ： 先写一个 特定的行为 -> 重置成 -> 通用行为
// 1、将event 的  转换成 第一个字母大写的 单词
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHanderKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};
// 2、add-foo  -> addFoo
// .replace(/-(\w)/g, (_, c:string) =>{}) 字符串匹配
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        // console.log("c ====",c, _);
        // c 为匹配到的 字母 ： f，  _为匹配搭配的字符 ： -f
        return c ? c.toUpperCase() : "";
    });
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    // $slots:(i) => i.slots, == $slots:(i) => i.vnode.children,
    $slots: (i) => i.slots,
};
const PublicIntanceProxyHandlers = {
    get({ _: instance }, key) {
        console.log("setupComponent PublicIntanceProxyHandlers instance =", instance);
        // setupState
        const { setupState, props } = instance;
        // if (key in setupState) {
        //     return setupState[key]
        // }
        // const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)
        // 检测当前这个 key  是否在 setupState 对象上
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            // 此处的 获取 props 是通过 proxy代理  获取的 
            return props[key];
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

// 使用bind 传值 将component 作为 "第一个参数" 传给 emit
function emit(instance, event, ...args) {
    console.log("emit event", event);
    // 通过 instance.props 查找event
    const { props } = instance;
    // // TPP开发模式 ： 先写一个 特定的行为 -> 重置成 -> 通用行为
    // // 1、将event 的  转换成 第一个字母大写的 单词
    // const capitalize  = (str: string) => {
    //     return str.charAt(0).toUpperCase() + str.slice(1)
    // }
    // const toHanderKey = (str: string) => {
    //     return str ? "on" + capitalize(str) : ""
    // }
    // // 2、add-foo  -> addFoo
    // // .replace(/-(\w)/g, (_, c:string) =>{}) 字符串匹配
    // const camelize = (str: string) =>{
    //     return str.replace(/-(\w)/g, (_, c:string) =>{
    //         // console.log("c ====",c, _);
    //         // c 为匹配到的 字母 ： f，  _为匹配搭配的字符 ： -f
    //         return c ? c.toUpperCase(): ""
    //     })
    // }
    const handlerName = toHanderKey(camelize(event));
    const handler = props[handlerName];
    // console.log("handler ==", handler);
    handler && handler(...args);
}

/**
 * 初始话 props
 * @param instance
 * @param rawProps
 *
 * 将没有处理过的props 给到instance；
 *  之后还要处理 attrs 也是 initProps 内处理
 *
 */
function initProps(instance, rawProps) {
    // 初始话 props 的时候  如果没有默认的值 那么给一个 空对象 
    // 因为 要在 reactive - shallowReadonly 中使用但是如果是空的话 无法使用 proxy
    instance.props = rawProps || {};
}

function initSlots(instance, children) {
    // 1、将 children 转换成 数组
    // instance.slots = Array.isArray(children) ? children: [children]  || []
    // -----
    // 2、转换成obj
    // const slots = {}
    // for (const key in children) {
    //     const value = children[key]
    //     slots[key] = normalizeSlotValue(value); // Array.isArray(value) ? value: [value]  || []
    // }
    // instance.slots = slots
    // 先检测 是否为 SLOT_CHILDREN
    const { vnode } = instance;
    // console.log("(instance.slots = {})", );
    // console.log("vnode.ShapeFlags & ShapeFlags.SLOT_CHILDREN ==", vnode.shapeFlags , ShapeFlags.SLOT_CHILDREN);
    if (vnode.shapeFlags & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
    // normalizeObjectSlots(children, instance.slots)
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value] || [];
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        // 现在 value 变为 function 了 
        slots[key] = (props) => normalizeSlotValue(value(props)); // Array.isArray(value) ? value: [value]  || []
    }
}

const targetMap = new Map();
// set 过程中会出发trigger ，因为scheduler 是在 obj内部值改变的时候执行的，所以做了判断
// 
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            // console.log('effect ==',typeof(effect.scheduler) );
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

// 只在初始化的时候
const get = createGetter();
const set = creatSetter();
const readonlyGet = createGetter(true, false);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        console.log('reactive = get =', target, key);
        // 获取对象身上某个属性的值，类似于 target[key]。如果没有该属性，则返回undefined。
        const res = Reflect.get(target, key, receiver);
        console.log("createGetter res =", res);
        // shallowReadonlyHanders
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            const reactiveRes = isReadonly ? readonly(res) : reactive(res);
            console.log("reactiveRes ==", reactiveRes);
            return reactiveRes;
        }
        if (key === "__v_isReactive" /* ReactiveFlag.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlag.IS_READONLY */) {
            return isReadonly;
        }
        return res;
        // return target[key];
    };
}
function creatSetter() {
    return function set(target, key, value, receiver) {
        console.log(target, key, value);
        const res = Reflect.set(target, key, value, receiver);
        //toDo 派发 依赖 trigger
        trigger(target, key);
        return res;
    };
}
const mutableHanders = {
    get,
    set
};
const readonlyHanders = {
    get: readonlyGet,
    set(target, key, value) {
        // throw new Error("new set ");
        // 为啥 console.warn 不能与 return true 对齐 ，对齐会报错
        console.warn(`key: ${key} set fail ,because targer is readOnly ${target}`);
        return true;
    }
};
const shallowReadonlyHanders = extend({}, readonlyHanders, {
    get: shallowReadonlyGet,
});
// export const shallowReadonlyHanders = {
//     get: shallowReadonlyGet,
//     set(target, key, value){
//         // throw new Error("new set ");
//         // 为啥 console.warn 不能与 return true 对齐 ，对齐会报错
//             console.warn(`key: ${key} set fail ,because targer is readOnly ${target}`)
//         return true
//     }
// }

// import { track, trigger } from "./effect";
function reactive(raw) {
    // return new Proxy(raw, mutableHanders)
    return createReactiveObject(raw, mutableHanders);
}
function readonly(raw) {
    // return new Proxy(raw, readonlyHanders)
    return createReactiveObject(raw, readonlyHanders);
}
function createReactiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} mast be a  object`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHanders);
}

/**
 * @param vnode 虚拟节点
 * 创建组件实例
 */
function createComponetInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { } // 传给父组件的值
        // el: null
    };
    // 使用bind 传值 将component 作为 "第一个参数" 传给 emit
    component.emit = emit.bind(null, component);
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
    //         // setupState
    //         const { setupState } = instance
    //         if (key in setupState) {
    //             return setupState[key]
    //         }
    //         // 使用 $el 方式 获取 setUp中的  数据
    //         // 因为 instance.vnode.el 组件实例中
    //         if (key == "$el") {
    //             return instance.vnode.el
    //         }
    //     },
    // }
    );
    // 初始化 props
    // 在 setupStatefulComponet 中的  setup 中 使用 setup(instance.props) 传值
    initProps(instance, instance.vnode.props);
    // 初始化插槽 将虚拟节点的children 赋值 给 instance
    initSlots(instance, instance.vnode.children);
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
    const { setup } = Component;
    if (setup) {
        /**
         * 这里有两种返回值
         * 1、function 就任务是组件的 render 函数
         * 2、object ： 就会把object返回的对象 注入到 上下文中
         */
        /**
         * 使用 setup(instance.props) 传值props 给组件
         * const setupResult = setup(instance.props)
         *
         */
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
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
    // ShapeFlags 可以标识vnode -> flag 
    // ShapeFlags/ element -> string
    // ShapeFlags/ object -> STATEFUL_COMPONENT
    const { type, shapeFlags } = vnode;
    // 定义一个特殊类型 Fragment -> 只渲染  children （作用于  插槽 中  ）
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            // ------其他正常形式---------
            // 判断 vnode 是不是 element 类型
            // 如果是 element  processElement
            //
            // typeof(vnode.type) =string
            // console.log("typeof(vnode.type) ==", typeof(vnode.type));
            console.log("shapeFlags ==", shapeFlags, 'ShapeFlags ==', (shapeFlags & 1 /* ShapeFlags.ELEMENT */));
            if (shapeFlags & 1 /* ShapeFlags.ELEMENT */) { //if (typeof(vnode.type) ===string)
                processElement(vnode, container);
            }
            else if (shapeFlags & 2 /* ShapeFlags.STATEFUL_COMPONENT */) { // else if(isObject(vnode.type))
                // 如果是 component processComponet
                // typeof(vnode.type) = object
                processComponet(vnode, container);
            }
            break;
    }
}
/**
 * processFragment 特殊处理 Fragment 类型的 vnode ； 在 插槽中使用
 * @param vnode
 * @param container
 *
 * 1、先渲染出所有的children mountChildren (这样处理之后  插槽就不会再有 外层div 包裹了)
 */
function processFragment(vnode, container) {
    // 
    mountChildren(vnode, container);
}
/**
 * processText 处理 没有 type 的独立的 text Dom
 * @param vnode
 * @param containe
 */
function processText(vnode, containe) {
    const { children } = vnode;
    // 渲染出来的元素 一定要给到 虚拟节点 vnode.el 
    const textNode = (vnode.el = document.createTextNode(children));
    containe.append(textNode);
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
        console.log("mountElement == props ==", key, 'val ==', val);
        // 通用方法 
        // on Event name
        // onMousedown
        const isOn = (key) => /^on[A-Z]/.test(key);
        console.log("isOn(key) ==", isOn(key));
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
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

function renderSlots(slots, name, props) {
    const slot = slots[name];
    console.log("renderSlots slot ==", slot);
    if (slot) {
        // slot is a function
        if (typeof slot === 'function') {
            // 在项目中  每一个 插槽 外面都包裹着一个div
            // children 是不是可以有 array
            // 定义一个特殊的 type Fragment 在 path 中特殊处理
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

export { creatTextVNode, createApp, h, renderSlots };
