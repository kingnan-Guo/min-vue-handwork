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
})
