import { h, renderSlots } from "../../lib/mini-vue-handwork.esm.js";
export const Foo = {
    /**
     * 
     * @param {*} props 接收传过来的props
     * props 不可以被修改 < readonly > 
     * 
     * emit
     * 在foo中发送数据  在 App.js 接收数据
     */
    setup(props, {emit}){
        // eg: props = {count: 2}
        console.log("foo.js  setup = props, {emit} =", props, emit);
        return {}

    },
    render(){
        const foo = h("div", {class: "slot-class"}, "foo ")
        // 获取到 foo 组件当前节点vnode ->里的children,然后添加到children 里
        // this.$slots 这个key 返回虚拟节点vnode 的children
        console.log("this.$slots ==", this.$slots);
        // return h("div", {}, [foo, h('div', {}, this.$slots)])
        // renderSlot 


        /**
         * renderSlot 的 每个插槽制定位置
         * 具名 插槽
         * 、获取到指定要渲染的 元素
         * 2、获取到渲染的位置
         * 
         * 作用域插槽
         * 要获取到 foo 组件内部 的变量 比如说 const age = 30, 在 app.js 的插槽中可以获取到
         * 通过 function 传值 header: (age) => h("div", {}, "foo-slot-div-header"+ age)
         */
        const age = 30
        return h("div", {}, [renderSlots(this.$slots, 'header', {age}) ,foo, renderSlots(this.$slots, 'footer')])
    }
}