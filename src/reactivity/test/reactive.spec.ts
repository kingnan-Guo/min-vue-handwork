import { reactive } from "../reactive";
describe('reactive', () => {
    it('reactive one path', () => {
        const original = { foo: 1 };
        const observed = reactive(original);
        console.log("observed == 000", observed, "original ==", original, "reactive==", reactive);
        expect(observed).not.toBe(original);
        expect(observed.foo).toBe(1);
    })
})