import { h } from "../../lib/mini-vue-handwork.esm.js";
export const App = {
    // vue
    // <template></template> //有编译能力才能使用; template 会被编译成 render 函数 
    // render 函数
    render (createElement, context) {
        
        // 创建虚拟节点 DOM
        // ui
        // this.msg 使用这种方式 获取到 setUp的值
        return h(
            "div",
            {id: 'root', class:['new', 'data']},
            //  "kingnan", + this.msg
            [h("p", {class: 'red'}, 'p-two'), h("p", {class: 'blue'}, [h("span", {class: ''}, 'p-three'),h("p", {class: 'yellow'}, 'p-four')])]
        );
    },
    setUp(){
        // vue3 使用 composition api
        return {
            //  返回对象
            msg: "mini-vue"
        }

    }


}