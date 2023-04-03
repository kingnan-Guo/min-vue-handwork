import { reactive } from "../reactive";
import { effect } from "../effect";
describe("effect", () => {
    it('first path', () => {
        
        const user = reactive({
            age: 10,
        })
        let nextAge:any;
        // 依赖收集 fn
        effect(() => {
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(11)
        // upDate
        user.age++
        expect(nextAge).toBe(12)
    })


    // 此处返回  传给 effect 的fn ,
    // 在effect 调用 过程中 ，将相关的 fn 存储到 targermap 中
    // 在task 过程中 收集 
    // 在trigger 中 运行
    // 猜测在 effect 运行过程中 ，只是监听 并记录 运行 的fn 与 obj的关系
    // effect(fn) 的返回值 是 函数，函数运行后 是  fn 的返回值； effect(fn)()  ==  fn()
    it('return runner  when we call effect ', () => {
        // 1、 调用effect(fn) - 返回-> function(runner)
        // 2、调用 function(runner) 会再次执行 传给 effect内部的fn
        // 3、当调用 fn时会将 内部fn的返回值 return

        let foo = 10;
        const runner = effect(() => {
            foo++;
            return 'foo'
        })
        expect(foo).toBe(11)
        // 再次调用runner 函数的时候 获取到 foo 返回值
        const r = runner()
        expect(r).toBe('foo')

    })




    // effect.sheduler 功能 调度器
    // 在scheduler中主要通过三个队列实现任务调度，这三个对列分别为：
    // pendingPreFlushCbs：组件更新前置任务队列
    // queue：组件更新任务队列
    // pendingPostFlushCbs：组件更新后置任务队列
    it( 'scheduler', () => {
        // 1. 通过effect的第二个参数给定一个 scheduler 的fn
        // 2. effect第一次执行的时候 还 会执行fn
        // 3. 当响应式对象 set update的时候不会执行fn 而是执行第二个参数 scheduler函数
        // 4. 然后执行runner的时候，会再次执行 fn
        let dummy
        let run: any
        // scheduler 是一个fn
        const scheduler = jest.fn( () => {
            run = runner
        })
        console.log('scheduler ==', scheduler);
        
        const obj = reactive( { foo: 1 } )
        const runner = effect( () => {
            dummy = obj.foo
        }, { scheduler })
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        // should be called on first trigger
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        // should not run yet
        expect(dummy).toBe(1)

        // manually run 手动执行run
        run()
        // should have run
        expect(dummy).toBe(2)
        
    })
})
