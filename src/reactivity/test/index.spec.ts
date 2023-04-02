import {add} from "../index";
it("init", () => {
    var ss = add(1, 2)
    expect(ss).toBe(3);
})