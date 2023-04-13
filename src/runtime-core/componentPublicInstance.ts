import { hasOwn } from "../shared/index";

export const publicPropertiesMap = {
    $el:(i) => i.vnode.el,
    // $slots:(i) => i.slots, == $slots:(i) => i.vnode.children,
    $slots:(i) => i.slots,
    $props:(i) => i.props,
}

export const PublicIntanceProxyHandlers = {
    get({_: instance}, key){
        console.log("setupComponent PublicIntanceProxyHandlers instance =", instance);
        
        // setupState
        const { setupState, props } = instance
        // if (key in setupState) {
        //     return setupState[key]
        // }
        // const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)
        // 检测当前这个 key  是否在 setupState 对象上
        if (hasOwn(setupState, key)) {
            return setupState[key]
        } else if(hasOwn(props, key)){
            // 此处的 获取 props 是通过 proxy代理  获取的 
            return props[key]
        }


        // 1、 ------
        // 使用 $el 方式 获取 setUp中的  数据
        // 因为 instance.vnode.el 组件实例中
        // if (key == "$el") {
        //     return instance.vnode.el
        // }

        // 2、--------
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }
    },
}