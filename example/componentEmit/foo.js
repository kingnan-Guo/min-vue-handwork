import { h } from "../../lib/mini-vue-handwork.esm.js";
export const foo = {
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
        console.log("foo.js  setup =props=", props);

        const emitAdd = () => {
            console.log("emit add")
            emit("add", 1, 2)
            emit("add-foo", 2,3,4)
        }

        return {
            emitAdd
        }

    },
    render(){
        // 电机2button 发出emit
        const btn = h("button", {
            onClick: this.emitAdd
        }, "emitAdd")
        const foo = h("div", {class: "emit-class"}, "foo: "+ this.count)
        return h("div", {}, [btn, foo])
    }
}