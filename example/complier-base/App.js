import { h, ref } from "../../lib/mini-vue-handwork.esm.js";

export const App = {
    name: "App",
    template: "<div>king-{{message}}- {{count}}</div>",
    setup(){
        const count = (window.count = ref(1));
        return {
          message: "mini-vue",
          count: count,
        } 
    }
}