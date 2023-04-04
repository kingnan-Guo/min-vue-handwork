import { isReactive, isReadonly, readonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  test("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReactive(props)).toBe(false);
    expect(isReactive(props.n)).toBe(false);
  });


  it('warn then call set', () => {
    console.warn = jest.fn()
    const user = shallowReadonly({
        foo: 30
    });
    user.foo = 40;
    // expect(user.foo).not.toBe(40)
    // 验证 console.warn 是否被调用过
    expect(console.warn).toBeCalled()
})

  
//   test("should differentiate from normal readonly calls", async () => {
//     const original = { foo: {} };
//     const shallowProxy = shallowReadonly(original);
//     const reactiveProxy = readonly(original);
//     expect(shallowProxy).not.toBe(reactiveProxy);
//     expect(isReadonly(shallowProxy.foo)).toBe(false);
//     expect(isReadonly(reactiveProxy.foo)).toBe(true);
//   });
});
