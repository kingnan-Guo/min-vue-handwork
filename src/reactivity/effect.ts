
class ReactiveEffect {
    private _fn: any;
    public scheduler: any;
    // public data:any;
    constructor(fn, scheduler?){
        this._fn = fn
        this.scheduler = scheduler
    }
    run(){
        activeEffect = this;
        return  this._fn()
    }
}
const targetMap = new Map()
export function track(target, key) {
    // target -> key -> dep
    // 每一个对象 ‘target’ 对应一个 depsMap，
    // depsMap中存储了每一个key对应的dep
    // dep 是通过 key 对应了每一个 new set
    // dep中存储 ReactiveEffect 中获取到的fn
    let depsMap = targetMap.get(target)
    if(!depsMap){
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    console.log("depsMap ==", depsMap);
    
    let dep = depsMap.get(key)
    if(!dep){
        dep = new Set();
        depsMap.set(key, dep)
    }
    dep.add(activeEffect)

    // 
    // const dep = new Set();
    // dep.add(key, )
}

// set 过程中会出发trigger ，因为scheduler 是在 obj内部值改变的时候执行的，所以做了判断
// 
export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    for (const effect of dep) {
        
        
        if (effect.scheduler) {
            // console.log('effect ==',typeof(effect.scheduler) );
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}

let activeEffect;  //存储 fn
export function effect(fn, options:any ={ }) {
    // fn
    const _effect = new ReactiveEffect(fn, options.scheduler)
    // 当调用 effect的时候 ，可以调用 fn
    _effect.run()
    // bind 修改 this 指针
    return  _effect.run.bind(_effect)
}

