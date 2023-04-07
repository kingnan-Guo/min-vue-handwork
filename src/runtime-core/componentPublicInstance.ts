export const publicPropertiesMap = {
    $el:(i) => i.vnode.el
}

export const PublicIntanceProxyHandlers = {
    get({_: instance}, key){
        console.log("setupComponent PublicIntanceProxyHandlers instance =", instance);
        
        // setUpState
        const { setUpState } = instance
        if (key in setUpState) {
            return setUpState[key]
        }
        // 使用 $el 方式 获取 setUp中的  数据
        // 因为 instance.vnode.el 组件实例中
        // if (key == "$el") {
        //     return instance.vnode.el
        // }


        // --------
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }
    },
}