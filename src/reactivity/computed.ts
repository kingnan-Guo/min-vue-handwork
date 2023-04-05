import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
    private _getter:any;
    private _dirty = true; //标记 get value 是否被调用过，第二次调用会直接返回缓存 this._value
    private _value: any; //缓存getter的值
    private _effect:any;
    constructor(getter) {
        this._getter = getter;
        // 因为有 scheduler 所以 当 value改变时 不会直接执行 getter
        this._effect = new ReactiveEffect(getter, () => {
            // 当依赖的响应式对象的值 发生改变时 _dirty = true
            if (!this._dirty) {
                this._dirty = true
            }
        })
    }
    get value(){
        
        // 当依赖的响应式对象的值 发生改变时 
        // get  value ->  _dirty = true
        // 这时要使用到依赖收集  effect，当改变的时候 我们是可以知道的
        if (this._dirty) {
            this._dirty = false
            this._value = this._effect.run()
        }
        return this._value;
    }

}

// getter 就是传入的 fn
export function computed(getter) {
    return new ComputedRefImpl(getter);
}