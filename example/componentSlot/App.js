import { h, creatTextVNode } from "../../lib/mini-vue-handwork.esm.js";
import { Foo } from "./foo.js";

export const App = {
    name: "App",
    // vue
    // <template></template> //有编译能力才能使用; template 会被编译成 render 函数 
    // render 函数
    render (createElement, context) {
        // 创建虚拟节点 DOM
        const app = h("div", {}, "App")
        // const fooSingle = h(Foo,{}, h("div", {}, "foo-slot-div-Single"))
        // const foo = h(Foo,{}, [h("div", {}, "foo-slot-div-one"), h("div", {}, "foo-slot-div-two")])
        // return h( "div", {id: 'root'}, [app, foo, fooSingle]);

        // const fooSingle = h(Foo,{}, h("div", {}, "foo-slot-div-Single"))
        const foo = h(Foo,{}, {header: ({age}) => [h("div", {}, "foo-slot-div-header- age="+ age), creatTextVNode('不带标签的DOM,需要creatTextVNode特殊处理')], footer:() => h("div", {}, "foo-slot-div-footer")})
        return h( "div", {id: 'root'}, [app, foo]);


    },
    setup(){
        // vue3 使用 composition api
        return {
            //  返回对象
            msg: "componentSlot",
        }

    }


}