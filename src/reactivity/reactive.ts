// import { track, trigger } from "./effect";
import {  mutableHanders, readonlyHanders, shallowReadonlyHanders } from "./baseHandlers";

// export function reactive(raw) {
//     return new Proxy(raw, {
//         // get(target, key, receiver){
//         //     console.log('reactive ==',target, key);
//         //     // 获取对象身上某个属性的值，类似于 target[key]。如果没有该属性，则返回undefined。
//         //     const res = Reflect.get(target, key, receiver)
//         //     //toDo 在get阶段进行依赖收集 track
//         //     track(target, key);
//         //     return res;
//         //     // return target[key];
//         // },
//         // set(target, key, value, receiver) {
//         //     console.log(target, key, value);
//         //     const res = Reflect.set(target, key, value, receiver)
//         //     //toDo 派发 依赖 trigger
//         //     trigger(target, key)
//         //     return res
//         // }


//     })
// }



// ---------------------------------------


export const enum ReactiveFlag  {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly"
}


export function reactive(raw) {
    // return new Proxy(raw, mutableHanders)
    return createActiveObject(raw, mutableHanders);
}


export function readonly(raw:any) {
    // return new Proxy(raw, readonlyHanders)
    return createActiveObject(raw, readonlyHanders);
}

function createActiveObject(raw:any, baseHandlers) {
    return new Proxy(raw, baseHandlers)
}

export function isReactive(value) {
    // 无论如何获取 value 内部的值 都会触发get
    // 通过判断 readOnly 来判断 isReactive

    //    return value['is_reactive']
    //  !! 将 undefined 转换为 booble值
   return !!value[ReactiveFlag.IS_REACTIVE]
}


export function isReadonly(value) {
    return !!value[ReactiveFlag.IS_READONLY]
}

export function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHanders);
}


