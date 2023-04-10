import { extend } from "../shared";


let activeEffect;  //存储 fn
let shouldTrack;

export class ReactiveEffect {
    private _fn: any;
    public scheduler: any;
    deps = [];
    active = true;
    onStop?:() => void;
    // onStop = true;
    // public data:any;
    constructor(fn, scheduler?: Function){
        this._fn = fn
        this.scheduler = scheduler
    }
    run(){
        // 收集依赖
        // 使用 shouldTrack 来做区分
        // 在没有使用 stop 之前 active = true
        // 在使用 stop 之后，active  =false ，直接返回function，
        // 不收集依赖，所以 activeEffect = this;写在了下面

        if(!this.active){
            return this._fn()
        }
        shouldTrack = true
        activeEffect = this;
        // 执行fn 会执行 track 逻辑，因为 有时fn = () => { dummy = obj.prop }
        // 当fn执行完成之后  程序 才会继续往下走
        const result = this._fn();

        shouldTrack = false
        
        return  result
    }
    stop(){
        if (this.active) {
            cleanupEffect(this)
            if(this.onStop){
                this.onStop()
            }
            this.active = false
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep:any) => {
        dep.delete(effect)
    });
    effect.deps.length = 0
}

const targetMap = new Map()
export function track(target, key) {

    
    // if(!activeEffect) return;
    // if(!shouldTrack) return;
    if (!isTracking()) return;




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
    
    trackEffects(dep)


}

export function trackEffects(dep) {
    if (dep.has(activeEffect)) return;

    dep.add(activeEffect)
    // 反向收集 所有的 dep
    activeEffect.deps.push(dep)


}

// 判断是否 可以收集到 track 中
export function isTracking () {
    return shouldTrack && activeEffect !== undefined
}


// set 过程中会出发trigger ，因为scheduler 是在 obj内部值改变的时候执行的，所以做了判断
// 
export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    triggerEffects(dep)
}


export function triggerEffects(dep) {
    for (const effect of dep) {
        
        if (effect.scheduler) {
            // console.log('effect ==',typeof(effect.scheduler) );
            effect.scheduler()
        } else {
            effect.run()
        }
    }
    // // 因为  ES5 中 dep 无法 for of 所以改成 foreach
    // dep.forEach(effect => {
    //     console.log("triggerEffects = effect =", effect);
        
    //     if (effect.scheduler) {
    //         // console.log('effect ==',typeof(effect.scheduler) );
    //         effect.scheduler()
    //     } else {
    //         effect.run()
    //     }
    // });




}


export function effect(fn, options:any ={ }) {
    // fn
    const _effect:any = new ReactiveEffect(fn, options.scheduler)
    

    // 是不是也可以使用  Reflect
    // Object.assign(_effect, options)
    // _effect.onStop = options.onStop;
    extend(_effect, options)

    // 当调用 effect的时候 ，可以调用 fn
    _effect.run()
    // bind 修改 this 指针
    var runner = _effect.run.bind(_effect)

    // 补充注释 ： 收集 ReactiveEffect 到runner 中返回
    runner.effect = _effect
    return runner;
}



export function stop(runner) {
    // runner -> trager- > key  在 depMap中华清除
    runner.effect.stop()
}


