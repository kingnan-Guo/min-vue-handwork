// 使用bind 传值 将component 作为 "第一个参数" 传给 emit
// 用户再传值，就只需传入 event  不需要再传 instance
import { toHanderKey, camelize } from "../shared/index";
export function emit(instance, event, ...args) {
    console.log("emit event", event);
    // 通过 instance.props 查找event

    const {props} = instance
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


    const handlerName = toHanderKey(camelize(event))
    const handler = props[handlerName]
    // console.log("handler ==", handler);
    
    handler && handler(...args)

}