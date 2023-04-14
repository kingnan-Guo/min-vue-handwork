import { baseParse } from "../src/baseParse";
import { NodeTypes } from "../src/ast";
describe("Parse", () => {
    // 解析插值功能
    describe("interpolation", () => {
        test("interpolation one", () => {
            const ast = baseParse("{{message}}")
            console.log("ast ==",ast);
            
            // root
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.INTERPOLATION,
                content: {
                    type: NodeTypes.INTERPOLATION,
                    content:"message"
                }
            })


        })
    });
});
  