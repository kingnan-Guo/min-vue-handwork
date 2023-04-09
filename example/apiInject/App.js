import { h, provide, inject } from "../../lib/mini-vue-handwork.esm.js";
// 组件 provide 和 inject 功能

// Provider 父组件里储存
// Consumer 子组件里获取
const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(ProviderTwo)]);
  },
};

const ProviderTwo = {
  name: "ProviderTwo",
  setup() {
    provide("foo", "fooTwo");
    const foo = inject("foo");

    return {
      foo,
    };
  },
  render() {
    return h("div", {}, [
      h("p", {}, `ProviderTwo foo:${this.foo}`),
      // h("p", {}, `ProviderTwo foo:`),
      h(Consumer),
    ]);
  },
};

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    // 给 baz 一个默认值
    // const baz = inject("baz", "bazDefault");
    const baz = inject("baz", () => "bazDefaultFunction");

    return {
      foo,
      bar,
      baz,
    };
  },

  render() {
    return h("div", {}, `Consumer: - ${this.foo} - ${this.bar}-${this.baz}`);
  },
};

export default {
  name: "App",
  setup() {},
  render() {
    return h("div", {}, [h("p", {}, "apiInject"), h(Provider)]);
  },
};