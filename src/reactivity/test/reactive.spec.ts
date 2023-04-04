import { isReactive, reactive } from "../reactive";
describe('reactive', () => {
    it('reactive one path', () => {
        const original = { foo: 1 };
        const observed = reactive(original);
        console.log("observed == 000", observed, "original ==", original, "reactive==", reactive);
        expect(observed).not.toBe(original);
        expect(observed.foo).toBe(1);
    })
    
    // 嵌套 判定 是否返回 reactive
    it('nested reactive', () => {
        const original = {
            nested: {
                foo: 1,
            },
            array: [{bar: 2}, {bar: 6}]
        }
        const observed = reactive(original)
        expect(isReactive(observed.nested)).toBe(true)
        expect(isReactive(observed.array)).toBe(true)
        expect(isReactive(observed.array[0])).toBe(true)
    })
})