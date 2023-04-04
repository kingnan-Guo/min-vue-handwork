import { track, trigger } from "./effect";
import { ReactiveFlag, reactive, readonly } from "./reactive";
import { extend, isObject } from "../shared";
// 只在初始化的时候
const get = createGetter()
const set = creatSetter()
const readonlyGet =  createGetter(true, false)
const shallowReadonlyGet = createGetter(true, true)
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver){
        console.log('reactive = get =',target, key);
        // 获取对象身上某个属性的值，类似于 target[key]。如果没有该属性，则返回undefined。
        const res = Reflect.get(target, key, receiver)
        console.log("createGetter res =", res);
        
        // shallowReadonlyHanders
        if(shallow) {
            return res
        }
        if (isObject(res)) {
            const reactiveRes = isReadonly ? readonly(res) : reactive(res)
            console.log("reactiveRes ==", reactiveRes);
            return reactiveRes
        }


        if(key === ReactiveFlag.IS_REACTIVE){
            return !isReadonly
        }
        else if (key === ReactiveFlag.IS_READONLY) {
            return isReadonly
        }
        if(!isReadonly){
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


export const shallowReadonlyHanders = extend({}, readonlyHanders, {
    get: shallowReadonlyGet,
})

// export const shallowReadonlyHanders = {
//     get: shallowReadonlyGet,
//     set(target, key, value){
//         // throw new Error("new set ");
//         // 为啥 console.warn 不能与 return true 对齐 ，对齐会报错
//             console.warn(`key: ${key} set fail ,because targer is readOnly ${target}`)
//         return true
//     }
// } 
