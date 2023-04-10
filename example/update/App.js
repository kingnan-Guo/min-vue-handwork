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
        // return h("div", {id: 'root'}, [
        //     h("div", {}, "count:"+ this.count),
        //     h("button", {onClick: this.onClick}, "click")
        // ])
        return h("div",{id: "root",...this.props},
            [
              h("div", {}, "count:" + this.count),
              h("button", { onClick: this.onClick, }, "click"),
              h("button", { onClick: this.onChangePropsDemo1, }, "changeProps - 值改变了 - 修改"),
              h("button", { onClick: this.onChangePropsDemo2, }, "changeProps - 值变成了 undefined - 删除"),
              h("button", { onClick: this.onChangePropsDemo3, }, "changeProps - key 在新的里面没有了 - 删除"),
              
              // h("button", {  }, "changeProps - 层级比较深的 props"),
            ]
          );

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

        /**
         * 
         */
        const props = ref({
          foo: "foo",
          bar: "bar",
          data:{
            data2:{
              data3: 'cc'
            }
          }
        });
        const onChangePropsDemo1 = () => {
          props.value.foo = "new-foo";
        };
    
        const onChangePropsDemo2 = () => {
          props.value.foo = undefined;
        };
    
        const onChangePropsDemo3 = () => {
          props.value = {
            foo: "foo",
          };
        };


        return {
            count, 
            onClick,
            onChangePropsDemo1,
            onChangePropsDemo2,
            onChangePropsDemo3,
            props,
        } 
    }
}