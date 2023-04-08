import { h } from "../../lib/mini-vue-handwork.esm.js";
import { foo } from "./foo.js";

//  测试数据  window.self = null;   window.self =this;
window.self = null;

export const App = {


    name: "App",
    // vue
    // <template></template> //有编译能力才能使用; template 会被编译成 render 函数 
    // render 函数
    render (createElement, context) {
        
        // 测试数据 window.self = this
        window.self = this

        // 创建虚拟节点 DOM
        // ui
        // this.msg 使用这种方式 获取到 setUp的值
        return h(
            "div",
            {id: 'root', class:['new', 'data']},

            //  "kingnan", + this.msg
            [
                // h("p", {class: 'red'}, 'p-two'),
                // h("p", {class: 'blue'}, [
                //     h("span", {class: ''}, 'p-three'),
                //     h("p", {class: 'yellow', onClick(){console.log("onClick")}}, 
                //     // setupState 方式 获取 msg
                //     // 1、猜测 因为将 setupState 通过代理 挂载到 instance 中，所以使用 this可以访问到 msg 
                //     'p-four-'+this.msg ),

                //     h("p", {class: 'green', onMouseenter(){console.log("onMouseenter")}}, 
                //     // $el 方式 获取 msg
                //     // this.$el -> get root element  (通过 el获取到 根element 的DOM 实例)
                //     'p-five-'+this.msg2 )
                // ]),
                h(foo, {
                    count: 7,
                    // on + Event
                    // 
                    // onAdd(a, b){
                    //     console.log("reserve msg from foo", a, b);
                    // }
                    onAdd(...args){
                        console.log("reserve msg from foo onAdd : args=",args);
                    },
                    // add-foo -> addFoo
                    onAddFoo(...args){
                        console.log("reserve msg from foo onAddFoo : args=",args);
                    }

                }),
            ]
        );
    },
    setup(){
        // vue3 使用 composition api
        return {
            //  返回对象
            msg: "mini-vue",
            msg2: 'msg2'
        }

    }


}