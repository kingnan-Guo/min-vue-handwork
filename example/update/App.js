import { h, ref } from "../../lib/mini-vue-handwork.esm.js";

export const App = {
    name: "App",
    // vue
    render () {
        /**
         * 
         * this.count is  ref
         * 期望 this.count 直接获取到 count.value 的值
         * unRef 可以 直接返回 ref.value
         * 
         */
        console.log("this.count =", this.count);
        return h("div", {id: 'root'}, [
            h("div", {}, "count:"+ this.count),
            h("button", {onClick: this.onClick}, "click")
        ])
    },
    setup(){
        const count = ref(0);
        /**
         * 目标： 点击 onClick 更新 count
         * 
         * 因为页面中的 dom在渲染之前都是虚拟节点， 
         * 更新逻辑 是就是重新生成 虚拟 DOM 节点， 
         * 然后进行对比 哪些节点需要更新，然后更新；
         * 所以 可以把更新逻辑变为两个对象 的对比
         * ----------------
         * 写组件的时候 count 是一个响应式对象，当响应式对象改变的时候，重新调用一下render，可以利用之前学过的effect 收集
         */
        const onClick = () => {
            count.value++;
        }
        return {
            count, 
            onClick
        } 
    }
}