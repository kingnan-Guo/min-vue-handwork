import { getCurrentInstance } from "./components";

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
export function provide(key, value) {
    // 存储
    // 储存在 当前的 组件的实例对象 instance 里
    const currentInstance:any  = getCurrentInstance()
    console.log("provide currentInstance ==", currentInstance);
    
    if (currentInstance) {
        let { provides } = currentInstance
        console.log("1==function provide  =  provides ==", provides);
        const parentProvides = currentInstance.parent.provides
        // 当前 provides === 父级的 provides
        if(provides === parentProvides){
            // 将 provides 的原型指向 parentProvides 
            // Object.create() 方法用于创建一个新对象，使用现有的对象来作为新创建对象的原型（prototype）
            provides = currentInstance.provides = Object.create(parentProvides)
        }
      
        console.log("2==function provide  =  provides ==", provides);
        provides[key] = value
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

export function inject(key, defaultValue:any) {
    // 取
    // 取 的过程是 获取 父级组件 instance的 provides

    const currentInstance:any  = getCurrentInstance()
    
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides
        if (key in parentProvides) {
            return parentProvides[key]
        } else if(defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue()
            }
            return defaultValue
        }
        
    }


}