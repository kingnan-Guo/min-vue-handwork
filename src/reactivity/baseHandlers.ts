import { track, trigger } from "./effect";
import { ReactiveFlag } from "./reactive";
// 只在初始化的时候
const get = createGetter()
const set = creatSetter()
const readonlyGet =  createGetter(true)
function createGetter(readonly = false) {
    return function get(target, key, receiver){
        console.log('reactive = get =',target, key);
        // 获取对象身上某个属性的值，类似于 target[key]。如果没有该属性，则返回undefined。
        const res = Reflect.get(target, key, receiver)
        if(key === ReactiveFlag.IS_REACTIVE){
            return !readonly
        }
        else if (key === ReactiveFlag.IS_READONLY) {
            return readonly
        }
        if(!readonly){
            //toDo 在get阶段进行依赖收集 track
            track(target, key);
        }
        return res;
        // return target[key];
    }
}

function creatSetter() {
    return function set(target, key, value, receiver) {
        console.log(target, key, value);
        const res = Reflect.set(target, key, value, receiver)
        //toDo 派发 依赖 trigger
        trigger(target, key)
        return res
    }
}


export const mutableHanders = {
    get,
    set
}

export const readonlyHanders = {
    get: readonlyGet,
    set(target, key, value){
        // throw new Error("new set ");
        // 为啥 console.warn 不能与 return true 对齐 ，对齐会报错
            console.warn(`key: ${key} set fail ,because targer is readOnly ${target}`)
        return true
    }
} 