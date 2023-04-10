import { trackEffects, triggerEffects, isTracking } from "./effect";
import { hasChange, isObject } from "../shared";
import { reactive } from "./reactive";


class RefImpl{
    private _value:any;
    public dep;
    private _rawValue:any;// 未处理的 value
    public _v_isRef = true
    constructor(value){
        this._rawValue = value;
        // value -> 使用 reactive 包裹
        // 1、判断 value 是不是对象
        // 2、如果是对象那么执行  reactive(value)
        this._value = convert(value);
        this.dep = new Set();
    }
    
    get value() {
        // if (isTracking()) {
        //     console.log("isTracking");
        //     trackEffects(this.dep)
        // }
        trackRefValue(this)
        return this._value
    }
    // get data() {
    //     return 2
    // }
    set value(newValue) {
        // console.log("newValue ==", newValue);
        // this._value = newValue
        if(hasChange(this._rawValue, newValue)){
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerEffects(this.dep)   
        }
        // if(this._value !== newValue) {
        //     this._value = newValue
        //     triggerEffects(this.dep)
        // }

        // trackEffects(this.dep)
        // triggerEffects(this.dep)
    }
    
}

// 对比 
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
    if (isTracking()) {
        // console.log("isTracking");
        trackEffects(ref.dep)
    }
}

export function ref(value) {
    const ref = new RefImpl(value);
    return ref;
}

// 判断是否为 ref 对象
export function isRef(ref) {
    return !!ref._v_isRef
}

// 如果是ref  返回 value
export function unRef(ref) {
    return isRef(ref)? ref.value : ref
}


export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key){
            return unRef(Reflect.get(target, key)) 
        },
        set(target, key, value){
          if (isRef(target[key]) && !isRef(value)) {
            return (target[key].value = value)
          } else {
            return Reflect.set(target, key, value)
          }
         
        }
      }
    )
}
