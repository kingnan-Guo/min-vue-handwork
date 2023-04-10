// 老的是 array
// 新的是 text

import { ref, h } from "../../lib/mini-vue-handwork.esm.js";
const nextChildren = "newChildren";
const prevChildren = [h("div", {}, "A"), h("div", {}, "B")];

export default {
  name: "ArrayToText",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;

    return {
      isChange,
    };
  },
  render() {
    const self = this;
    // setTimeout(() => {
    //   self.isChange = true
    //   console.log("self", self);
    // }, 2000)
    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
