import { h } from "../../lib/mini-vue-handwork.esm.js";
export const foo = {
    /**
     * 
     * @param {*} props 接收传过来的props
     * props 不可以被修改 < readonly > 
     */
    setup(props){
        // eg: props = {count: 2}
        console.log("foo.js  setup =props=", props);
        props.count++; //一直都应该是 传进来的值 ；props 不可以修改 ， 是个 readOnly 类型， 但其实是 shallowReadonly， 使用 shallowReadonly， 包裹 props 


    },
    render(){
        return h("div", {class: "props-class"}, "foo: "+ this.count)
    }
}