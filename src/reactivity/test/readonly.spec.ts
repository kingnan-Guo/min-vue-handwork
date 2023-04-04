import { readonly, isReactive, isReadonly } from "../reactive";

// readonly 不能被set 所以不会触发依赖；；
describe("readonly", () => {
    it("should make nested values readonly", () => {
      const original = { foo: 1, bar: { baz: 2 } };
      const wrapped = readonly(original);
      expect(wrapped).not.toBe(original);
    //   expect(isProxy(wrapped)).toBe(true);
      expect(isReactive(wrapped)).toBe(false);
      expect(isReadonly(wrapped)).toBe(true);
    //   expect(isReactive(original)).toBe(false);
    //   expect(isReadonly(original)).toBe(false);
    //   expect(isReactive(wrapped.bar)).toBe(false);
    //   expect(isReadonly(wrapped.bar)).toBe(true);
    //   expect(isReactive(original.bar)).toBe(false);
    //   expect(isReadonly(original.bar)).toBe(false);
      // get
    //   expect(wrapped.foo).toBe(1);
    });

    it('warn then call set', () => {
        console.warn = jest.fn()
        const user = readonly({
            foo: 30
        });
        user.foo = 40;
        // expect(user.foo).not.toBe(40)
        // 验证 console.warn 是否被调用过
        expect(console.warn).toBeCalled()
    })
  });
  