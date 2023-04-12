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
        key: props && props.key, //新增key 字段
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

// 将两个或多个对象的属性合并到一起
const extend = Object.assign;
// 判断是否 为 object
const isObject = (val) => {
    return val !== null && typeof (val) == "object";
};
// 判断两个对象是否一样
const hasChange = (val, newValue) => {
    return !Object.is(val, newValue);
};
// 判断 value 中是否包含  key
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
// 创建空对象
const EMPTY_OBJ = {};

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

let activeEffect; //存储 fn
let shouldTrack;
class ReactiveEffect {
    // onStop = true;
    // public data:any;
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        // 收集依赖
        // 使用 shouldTrack 来做区分
        // 在没有使用 stop 之前 active = true
        // 在使用 stop 之后，active  =false ，直接返回function，
        // 不收集依赖，所以 activeEffect = this;写在了下面
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        // 执行fn 会执行 track 逻辑，因为 有时fn = () => { dummy = obj.prop }
        // 当fn执行完成之后  程序 才会继续往下走
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    // if(!activeEffect) return;
    // if(!shouldTrack) return;
    if (!isTracking())
        return;
    // target -> key -> dep
    // 每一个对象 ‘target’ 对应一个 depsMap，
    // depsMap中存储了每一个key对应的dep
    // dep 是通过 key 对应了每一个 new set
    // dep中存储 ReactiveEffect 中获取到的fn
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    console.log("depsMap ==", depsMap);
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    // 反向收集 所有的 dep
    activeEffect.deps.push(dep);
}
// 判断是否 可以收集到 track 中
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
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
    // // 因为  ES5 中 dep 无法 for of 所以改成 foreach
    // dep.forEach(effect => {
    //     console.log("triggerEffects = effect =", effect);
    //     if (effect.scheduler) {
    //         // console.log('effect ==',typeof(effect.scheduler) );
    //         effect.scheduler()
    //     } else {
    //         effect.run()
    //     }
    // });
}
function effect(fn, options = {}) {
    // fn
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // 是不是也可以使用  Reflect
    // Object.assign(_effect, options)
    // _effect.onStop = options.onStop;
    extend(_effect, options);
    // 当调用 effect的时候 ，可以调用 fn
    _effect.run();
    // bind 修改 this 指针
    var runner = _effect.run.bind(_effect);
    // 补充注释 ： 收集 ReactiveEffect 到runner 中返回
    runner.effect = _effect;
    return runner;
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
        if (!isReadonly) {
            //toDo 在get阶段进行依赖收集 track
            track(target, key);
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

class RefImpl {
    constructor(value) {
        this._v_isRef = true;
        this._rawValue = value;
        // value -> 使用 reactive 包裹
        // 1、判断 value 是不是对象
        // 2、如果是对象那么执行  reactive(value)
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        // if (isTracking()) {
        //     console.log("isTracking");
        //     trackEffects(this.dep)
        // }
        trackRefValue(this);
        return this._value;
    }
    // get data() {
    //     return 2
    // }
    set value(newValue) {
        // console.log("newValue ==", newValue);
        // this._value = newValue
        if (hasChange(this._rawValue, newValue)) {
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerEffects(this.dep);
        }
        // if(this._value !== newValue) {
        //     this._value = newValue
        //     triggerEffects(this.dep)
        // }
        // trackEffects(this.dep)
        // triggerEffects(this.dep)
    }
}
// 对比 
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        // console.log("isTracking");
        trackEffects(ref.dep);
    }
}
function ref(value) {
    const ref = new RefImpl(value);
    return ref;
}
// 判断是否为 ref 对象
function isRef(ref) {
    return !!ref._v_isRef;
}
// 如果是ref  返回 value
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

/**
 * @param vnode 虚拟节点
 * 创建组件实例
 */
function createComponetInstance(vnode, parent) {
    console.log("createComponetInstance = parent =", parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
        provides: parent ? parent.provides : {},
        parent: parent,
        isMounted: false,
        subTree: {}
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
         * currentInstance = instance = component  || setCurrentInstance(instance)
         * 这里是获取 Component 的值存入到全局变量中，
         * 用来在  getCurrentInstance 中获取 Component
         *
         * currentInstance = instance
         */
        setCurrentInstance(instance);
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
        /**
         * 插一句
         * 清除掉 currentInstance 的值
         * 因为在此时 setup 内的 getCurrentInstance 已经获取完成
         * currentInstance = null
         */
        // 
        setCurrentInstance(null);
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
    if (typeof setupResult === "object") {
        // 将 proxyRefs 包裹 setupResult， 
        instance.setupState = proxyRefs(setupResult);
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
 * currentInstance 后续在setup 中赋值
 *
 * getCurrentInstance 目的是 获取 component  也就是 instance
 *
 * 因为在 app 组件中获取 是 app.js 的实例对象
 * 在 foo.js 获取 是 foo.js 的实例对象 所以 要在各自 的setup 中去获取
 *
 */
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
/**
 * 给 currentInstance 赋值
 * @param instance
 * 好处是
 * 当后续 想跟踪 currentInstance 被谁赋值的时候，只需在这里打上断点就可以知道
 * 也起到了 中间层的作用
 *
 */
function setCurrentInstance(instance) {
    currentInstance = instance;
}

/**
 * 存储 (父级)
 * @param key
 * @param value
 * 储存在 当前的 组件的实例对象 instance 里
 *
 * ----
 *  需求 ：
 * 1、子级 向上 父级 查找 provides ，如果有 则返回值，如果有将向父级的父级查找
 * 2、 本级修改 后只会影响  子级 不会影响父级
 *
 * 实现：
 * 1、将 provides 的原型 指向 父级的 provides
 *
 */
function provide(key, value) {
    // 存储
    // 储存在 当前的 组件的实例对象 instance 里
    const currentInstance = getCurrentInstance();
    console.log("provide currentInstance ==", currentInstance);
    if (currentInstance) {
        let { provides } = currentInstance;
        console.log("1==function provide  =  provides ==", provides);
        const parentProvides = currentInstance.parent.provides;
        // 当前 provides === 父级的 provides
        if (provides === parentProvides) {
            // 将 provides 的原型指向 parentProvides 
            // Object.create() 方法用于创建一个新对象，使用现有的对象来作为新创建对象的原型（prototype）
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        console.log("2==function provide  =  provides ==", provides);
        provides[key] = value;
    }
}
/**
 * 取数据
 * @param key
 * 取 的过程是 获取 父级组件 instance 的 provides
 *
 * 1、还是获取当前组件 instance
 * 2、找到父级
 * 3、在父级 的 provides 找到数据
 *  这 parent 要存在 当前instance.parent 中 (我感觉 不是太好，如果是我 我想将parent 作为一个function 去获取父级 instance)
 *
 *
 */
function inject(key, defaultValue) {
    // 取
    // 取 的过程是 获取 父级组件 instance的 provides
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

// import { render } from "./render";
function createAppAPI(render) {
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
            mount(rootContainer) {
                //1、  先转换成 vnode 虚拟节点
                // 2、所有的逻辑操作都会 基于 vnode 虚拟节点 做处理
                // 将组件 component 转换成 虚拟节点 vnode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProps, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    /**
     *
     * @param vnode 虚拟节点
     * @param container 容器
     * render 是为了调用patch 方法，方便执行 递归处理
     */
    function render(vnode, container) {
        // 正常应该 将 patch 的第三个参数 传 parentComponent，但是当最开始 调用path 的时候 的虚拟Dom 是没有父级的
        patch(null, vnode, container, null, null);
    }
    /**
     *
     * @param vnode 虚拟节点
     * @param container 容器
     * 步骤
     * 1、去处理组件 processComponet
     * 2、判断是不是 element 类型
     *
      * -- 20230409_2228---
     * 给patch 添加 更新逻辑
     * 首先传入两个值 n1 -> 老的 vnode ， n2 -> 新的
     * 当n1 不存在的时候  就是初始化，如果  n1存在
     * 使用 n2 替换vnode
     *  添加 n1 传值
     *
     * function patch( n1, n2, container, parentComponent: any)
     */
    function patch(n1, vnode, container, parentComponent, anchor) {
        // ShapeFlags 可以标识vnode -> flag 
        // ShapeFlags/ element -> string
        // ShapeFlags/ object -> STATEFUL_COMPONENT
        const { type, shapeFlags } = vnode;
        // 定义一个特殊类型 Fragment -> 只渲染  children （作用于  插槽 中  ）
        switch (type) {
            case Fragment:
                processFragment(n1, vnode, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, vnode, container);
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
                    processElement(n1, vnode, container, parentComponent, anchor);
                }
                else if (shapeFlags & 2 /* ShapeFlags.STATEFUL_COMPONENT */) { // else if(isObject(vnode.type))
                    // 如果是 component processComponet
                    // typeof(vnode.type) = object
                    processComponet(n1, vnode, container, parentComponent, anchor);
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
    function processFragment(n1, vnode, container, parentComponent, anchor) {
        // 
        mountChildren(vnode.children, container, parentComponent, anchor);
    }
    /**
     * processText 处理 没有 type 的独立的 text Dom
     * @param vnode
     * @param containe
     */
    function processText(n1, vnode, containe) {
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
    function processElement(n1, vnode, container, parentComponent, anchor) {
        // 如果n1 不存在 那么是初始化
        if (!n1) {
            // 初始化 虚拟DOM  默认：将数据 append 到 容器中， 可以自定义
            mountElement(vnode, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, vnode, container, parentComponent, anchor);
        }
    }
    /**
     *
     * @param n1 preSubTree 老的dom
     * @param vnode  n2:vnode  当前最新的 虚拟dom
     * @param containe
     *
     *
     * 此处开始 更新对比  n1 与 n2 也就是 n1 与 vnode
     * 1、对比  props
     * 2、对比 children
     */
    function patchElement(n1, vnode, containe, parentComponent, anchor) {
        console.log("patchElement n1", n1, "n2:vnode", vnode);
        // 此处开始 更新对比 props  children
        // 
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = vnode.props || EMPTY_OBJ;
        const el = (vnode.el = n1.el);
        patchChildren(n1, vnode, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    /**
     * 对比更新 children
     * @param n1 老
     * @param vnode 新
     *
     * 1、对比 text 与数组
     */
    function patchChildren(n1, vnode, container, parentComponent, anchor) {
        const { shapeFlags } = vnode;
        const preShapeFlags = n1.shapeFlags;
        const c1 = n1.children;
        const c2 = vnode.children;
        if (shapeFlags & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            // 新的节点vnode是一个 text
            if (preShapeFlags & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                // 老节点preShapeFlag 是一个 数组
                // 1、把老的children清空
                unmountChildren(n1.children);
                // 2、设置text
                // hostSetElementText(container, c2)
            }
            if (c1 !== c2) {
                // 2、设置text
                hostSetElementText(container, c2);
            }
        }
        else {
            // vnode<array>
            if (shapeFlags & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                console.log("------ array diff array -------");
                // array diff array
                // 设置三个指针 i：可以移动的 i i<= e1 & i<=e2；  e1:当前这个数组的最后位置； e2:新数据 最后的索引值
                patchKeyChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    /**
     * array diff array
     * 双端指针对比
     * @param c1
     * @param c2
     *
     * 先对比前后两侧找到不同的 索引
     */
    function patchKeyChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        // 检测节点是否一样
        function isSomeVNodeType(n1, n2) {
            // 检测type  key
            return n1.type === n2.type && n1.key === n2.key;
        }
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            //如果两个节点一样 那么 再次进行递归patch 进行属性对比 props children
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            // 如果不一样的时候 跳出循环
            else {
                break;
            }
            // 移动 i 这个指针
            i++;
        }
        console.log("指针 i 的位置", i);
        // 右侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            //如果两个节点一样 那么 再次进行递归patch 进行属性对比 props children
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            // 如果不一样的时候 跳出循环
            else {
                break;
            }
            // 移动 i 这个指针
            e1--;
            e2--;
        }
        console.log("指针 i 的位置", i, "末端指针索引的位置  e1 ", e1, ' = e2 = ', e2);
        // 新的比老的 多 ,左侧对比 右侧对比
        if (i > e1) {
            if (i <= e2) {
                // 在 当前的 DOM 节点前 添加数据 ，
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    // 新增 数据 所以 n1 是没有的
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
            console.log("指针 i 的位置", i, "末端指针索引的位置  e1 ", e1, ' = e2 = ', e2);
        }
        else if (i > e2) {
            while (i <= e1) {
                // 删除所有获取到的 节点
                hostRemove(c1[i].el);
                i++;
            }
        }
        // 乱序部分
        else {
            // 中间对比
            let s1 = i; //老节点的开始位置
            let s2 = i; //老节点的开始位置
            // 建立映射表 从左向右开始对比 储存 不同新数据  的 key和 i 映射
            const keyToNewIndexMap = new Map();
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            let newIndex;
            for (let i = s1; i <= e1; i++) {
                // 拿到老节点
                const prevChild = c1[i];
                // 如果节点中 key 存在 那么
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    //如果不存在 key那么进行 for循环
                    for (let j = s2; j < e2; j++) {
                        if (isSomeVNodeType(prevChild, c2[j])) {
                            // 更新index的值
                            newIndex = j;
                            break;
                        }
                    }
                }
                // 如果循环对比中任无法查找到 对应 的index 说明 最新的数据中不存在此节点，所以要删除此节点
                if (newIndex === undefined) {
                    // 那么执行删除
                    hostRemove(prevChild.el);
                }
                else {
                    // 如果存在的话那么将 继续调用patch 进行 其他属性的对比
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                }
            }
        }
    }
    /**
     * 把老的 children 清空
     * @param children
     */
    function unmountChildren(children) {
        for (let index = 0; index < children.length; index++) {
            const element = children[index].el;
            // remove
            hostRemove(element);
        }
    }
    /**
     *  对比 新老两个props
     * @param oldProps
     * @param newProps
     *
     * for (const key in newProps)  遍历新的 props 用于 添加
     *
     *
     */
    function patchProps(el, oldProps, newProps) {
        //  当新老虚拟节点中的 props 不一样后才去对比
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const preProps = oldProps[key];
                const nextProps = newProps[key];
                // 对比两个个 props 如果不相等
                // 但是如果props 层级比较深 怎么办？？
                if (preProps !== nextProps) {
                    //触发更新
                    hostPatchProps(el, key, preProps, nextProps);
                }
            }
            /**
             * 如果使用 oldProps ！== {} 在这里会创建一个新的 空对象 ，如果 oldProps 没有值
             * 那么 const oldProps = n1.props || {} 中 也会创建一个 空对象，两个空对象 不相等
             */
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    const preProps = oldProps[key];
                    if (!(key in newProps)) {
                        hostPatchProps(el, key, preProps, null);
                    }
                }
            }
        }
    }
    /**
     * 去处理组件 processComponet
     * @param vnode
     * @param container
     */
    function processComponet(n1, vnode, container, parentComponent, anchor) {
        mountComponet(vnode, container, parentComponent, anchor);
    }
    /**
     *
     * @param vnode
     * @param container
     */
    function mountElement(vnode, container, parentComponent, anchor) {
        const { type, props, children, shapeFlags } = vnode;
        console.log("mountElement =vnode=", vnode, type);
        /**
         * 实现自定义渲染器 custom render ;想实现 各种平台均可以 展示，canvas 或 dom
         * 1、此处原本的代码：
         *       // 为了使用 $el 使用 vnode 储存 el， 之后调用  subTree.el 取出存储的 根DOM
         *      // const el = (vnode.el = document.createElement(vnode.type))
         *
         * 现在实现 自定义渲染器
         *
         *
         */
        // 
        // 为了使用 $el 使用 vnode 储存 el， 之后调用  subTree.el 取出存储的 根DOM 
        // const el = (vnode.el = document.createElement(vnode.type))
        const el = (vnode.el = hostCreateElement(vnode.type));
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
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        console.log("props ==", props);
        for (const key in props) {
            const val = props[key];
            /**
             * 实现自定义渲染器 代码整合 为 patchProp
             *
             *
             */
            // console.log("mountElement == props ==", key , 'val ==', val);
            // // 通用方法 
            // // on Event name
            // // onMousedown
            // const isOn = (key:string) => /^on[A-Z]/.test(key) 
            // console.log("isOn(key) ==",isOn(key) );
            // if (isOn(key)) {
            //     const event = key.slice(2).toLowerCase()
            //     el.addEventListener(event, val)
            // } else{
            //     el.setAttribute(key, val)
            // }
            hostPatchProps(el, key, null, val);
        }
        /**
         * 实现自定义渲染器 代码整合 为 insert
         * 此处原本的代码：
         *      // container.append(el)
         */
        hostInsert(el, container, anchor);
    }
    /**
     * 处理 children
     * @param vnode 虚拟节点vnode 内部存在 children<array> 循环遍历数组
     * @param container 容器
     *
     * 每一个children 内部都是 一个虚拟节点vnode ，每一次都要判断是 element 还是 components
     */
    // function mountChildren(vnode, container, parentComponent) {
    //     vnode.children.forEach((vn) => {
    //         patch(null, vn, container, parentComponent)
    //     })
    // }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((vn) => {
            patch(null, vn, container, parentComponent, anchor);
        });
    }
    /**
     *
     * @param vnode
     * @param container
     */
    function mountComponet(vnode, container, parentComponent, anchor) {
        // 创建组件实例 
        // 将父级传给 当前 组件实例
        const instance = createComponetInstance(vnode, parentComponent);
        setupComponent(instance); //这里 处理 instance 并将 render 赋值给 instance 
        setupRenderEffect(instance, vnode, container, parentComponent, anchor);
    }
    // 
    function setupRenderEffect(instance, vnode, container, parentComponent, anchor) {
        // 使用effect 进行依赖收集 ，当响应式 数据进行改变的时候 ，重新出发render 重新渲染,
        // 当 触发 render 函数后 会出发 this.count  的 get 操作，进行依赖收集
        effect(() => {
            // 添加新的 变量 来 判定 instance 的状态
            // instance.isMounted = false是 是个 初始化状态
            if (!instance.isMounted) {
                console.log("init");
                console.log("setupRenderEffect  instance =", instance);
                // 通过 instance 返回 proxy 代理对象
                const { proxy } = instance;
                // 调用 render 函数
                // subTree 是虚拟节点树
                // const subTree = instance.render()
                // const subTree = instance.render.call(proxy)
                // 初始化阶段先储存一个 subTree
                const subTree = (instance.subTree = instance.render.call(proxy));
                // 基于  render() return 出来的 vnode 去调用  patch
                // vnode 是 element ，将 element 处理 挂载出来 ，进行 mounElement 处理
                // 当重新调用render后 会重新生成 subTree 
                console.log("subTree =", subTree);
                // patch 属于 初始化 第一创建节点的时候 添加
                // patch 这里是 递归循环调用 ，但现在不知到如何跳出循环
                patch(null, subTree, container, instance, anchor);
                //储存 elemet 要在 所有的 mount 完成 之后
                // subTree.el 就是虚拟节点的 跟节点 ，
                // subTree.el 是在 mountElement 中的 vnode.el 存储的
                // 因为此处的  vnode  并非 是 mountElement 中的vnode ，而是被proxy 挂载的 vnode
                console.log("setupRenderEffect subTree ==", subTree);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("upDate");
                // 在更新阶段再一次调用subTree
                // 通过 instance 返回 proxy 代理对象
                const { proxy } = instance;
                // 调用 render 函数
                // subTree 是虚拟节点树
                // const subTree = instance.render()
                const subTree = instance.render.call(proxy);
                // 基于  render() return 出来的 vnode 去调用  patch
                // vnode 是 element ，将 element 处理 挂载出来 ，进行 mounElement 处理
                // 当重新调用render后 会重新生成 subTree 
                console.log("subTree =", subTree);
                // 对比现在和之前的subTree 
                // 先把之前的subTree 获取处理啊
                const prevSubTree = instance.subTree;
                console.log(" current subTree =", subTree, "prevSubTree =", prevSubTree);
                // 重新更新 subTree
                instance.subTree = subTree;
                // 因为 patch 之前全部都是初始化 ，所以要给patch 添加 更新逻辑
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    console.log("createElement -------------------");
    return document.createElement(type);
}
function patchProp(el, key, preVal, nextVal) {
    console.log("patchProp -------------------");
    console.log("mountElement == props ==", key, 'val ==', nextVal);
    // 通用方法 
    // on Event name
    // onMousedown
    const isOn = (key) => /^on[A-Z]/.test(key);
    console.log("isOn(key) ==", isOn(key));
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal == null) {
            el.removeAttribute(key, nextVal);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
/**
 *
 * @param el
 * @param container
 * @param anchor 锚点 新的 el添加到 container 中的位置
 *
 */
function insert(el, container, anchor) {
    console.log("insert -------------------");
    // container.append(el)
    // 把元素指定添加到某个 元素之前，如果 anchor = null 那么添加到最后  与append 一样
    container.insertBefore(el, anchor || null);
}
// 删除 children
function remove(child) {
    // 先获取到父级元素
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
// 给容器设置文本
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement, patchProp, insert, remove, setElementText
});
// 使用 createRenderer 的return 返回 createApp 
function createApp(...args) {
    return renderer.createApp(...args);
}

export { creatTextVNode, createApp, createRenderer, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
