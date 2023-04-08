import { h, getCurrentInstance } from "../../lib/mini-vue-handwork.esm.js";
export const Foo = {
    name:"Foo-getCurrentInstance",
    /**
     * 
     * @param {*} props 接收传过来的props
     * props 不可以被修改 < readonly > 
     * 
     * emit
     * 在foo中发送数据  在 App.js 接收数据
     */
    setup(){
        // eg: props = {count: 2}
        // console.log("foo.js  setup = props, {emit} =", props, emit);

        // currentInstance
        // 返回当前组件的 实例对象 
        // 这个方法 必须要在 setup 中使用
        const instance = getCurrentInstance()
        console.log("Foo: getCurrentInstance  instance=", instance);

        return {}

    },
    render(){
        return h("div", {class: "getCurrentInstance-class"}, "foo: ")
    }
}