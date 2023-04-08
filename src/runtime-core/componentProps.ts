/**
 * 初始话 props
 * @param instance 
 * @param rawProps
 * 
 * 将没有处理过的props 给到instance；
 *  之后还要处理 attrs 也是 initProps 内处理
 *  
 */

export function initProps(instance, rawProps) {
    // 初始话 props 的时候  如果没有默认的值 那么给一个 空对象 
    // 因为 要在 reactive - shallowReadonly 中使用但是如果是空的话 无法使用 proxy
    instance.props = rawProps || {}
}