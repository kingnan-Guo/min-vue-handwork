import { h, getCurrentInstance } from "../../lib/mini-vue-handwork.esm.js";
import { Foo } from "./foo.js";

export const App = {
    name: "App",
    // vue
    // <template></template> //有编译能力才能使用; template 会被编译成 render 函数 
    // render 函数
    render (createElement, context) {
        // 创建虚拟节点 DOM

        
        // return h( "div", {id: 'getCurrentInstance'}, [h("div", {}, "getCurrentInstance"), h(Foo)]);
        return h( "div", {id: 'getCurrentInstance'}, [h("div", {}, "--getCurrentInstance"), h(Foo)]);

    },
    setup(){
        // currentInstance
        // 返回当前组件的 实例对象 
        // 这个方法 必须要在 setup 中使用
        // 可以访问到当前组件实例上的 一些数据
        const instance = getCurrentInstance()
        console.log("App:  getCurrentInstance  instance=", instance);

    }


}