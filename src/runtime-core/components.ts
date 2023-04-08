import { PublicIntanceProxyHandlers } from "./componentPublicInstance";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";

import { shallowReadonly } from "../reactivity/reactive";
/**
 * @param vnode 虚拟节点
 * 创建组件实例 
 */
export function createComponetInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => {}
        // el: null
    }
    // 使用bind 传值 将component 作为 "第一个参数" 传给 emit
    component.emit = emit.bind(null, component) as any;
    return component
}

/**
 * 处理组件
 * @param instance 组件实例
 * 
 * 1、初始化 initProps
 * 2、初始话 initSlots() 插槽
 * 3、处理调用setUp 后的 返回值
 */

export function setupComponent(instance) {
    // initProps()
    // initSlots()
    console.log('setupComponent ==instance =', instance);
    
    // 通过代理的方式 访问 setUp
    instance.proxy = new Proxy({_:instance},
        PublicIntanceProxyHandlers
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
    initProps(instance, instance.vnode.props)

    // 初始化有状态的 component 组件 ； 函数组件没有任何状态
    setupStatefulComponet(instance)
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
function setupStatefulComponet(instance: any) {
    console.log("setupStatefulComponet =instance =", instance);
    
    // Component: 当前组件的 对象
    const Component = instance.type
    const {setup} = Component;
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
        const setupResult = setup(shallowReadonly(instance.props), {emit: instance.emit})
        handleSetupResult(instance, setupResult)
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
function handleSetupResult(instance, setupResult:any) {
    if (typeof setupResult == "object") {
        instance.setupState = setupResult
    }
    finishComponentSetup(instance)
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
function finishComponentSetup(instance:any) {
    console.log("finishComponentSetup == instance ==", instance);
    
    const Component = instance.type
    if (Component.render) {
        instance.render = Component.render
    }
}

