import { track, trigger } from "./effect";
export function reactive(raw) {
    return new Proxy(raw, {
        get(target, key, receiver){
            console.log('reactive ==',target, key);
            // 获取对象身上某个属性的值，类似于 target[key]。如果没有该属性，则返回undefined。
            const res = Reflect.get(target, key, receiver)
            //toDo 在get阶段进行依赖收集 track
            track(target, key);
            return res;
            // return target[key];
        },
        set(target, key, value, receiver) {
            console.log(target, key, value);
            const res = Reflect.set(target, key, value, receiver)
            //toDo 派发 依赖 trigger
            trigger(target, key)
            return res
        }
    })
}