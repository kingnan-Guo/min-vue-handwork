import { baseParse } from "../src/baseParse";
import { NodeTypes } from "../src/ast";
import { transform } from "../src/transform";
import { generate } from "../src/codegen";
import { transformExpression } from "../src/transforms/transformExpression";
import { transformElement } from "../src/transforms/transformElement";
import { transformText } from "../src/transforms/transformText";



describe("code Generate ", () => {

    
    it("string ", () => {
        // const ast = baseParse("<div>king-{{message}}</div>")
        const ast = baseParse("hi1")
        
        transform(ast);
        console.log("ast ==",ast);
        const { code } = generate(ast)
        // 外部扩展处理 NodeTypes.TEXT

        // 快照测试 ：给code 拍照后续对比 出bug
        expect(code).toMatchSnapshot()

        


    })

    it("interpolation", () => {
        const ast = baseParse("{{message}}")
        
        transform(ast, {
            nodeTransforms: [transformExpression]
        });
        console.log("ast ==",ast);
        const { code } = generate(ast)
        // 快照测试 ：给code 拍照后续对比 出bug
        expect(code).toMatchSnapshot()
    })

    it("element", () => {
        const ast = baseParse("<div></div>")
        
        transform(ast, {
            nodeTransforms: [transformElement]
        });
        console.log("ast ==",ast);
        const { code } = generate(ast)
        // 快照测试 ：给code 拍照后续对比 出bug
        expect(code).toMatchSnapshot()
    })


    it("element-all", () => {
        const ast = baseParse("<div>king-{{message}}</div>")
        
        transform(ast, {
            // 有顺序  先将 更改节点 然后再 更改 text
            nodeTransforms: [transformExpression,transformElement, transformText]
        });
        console.log("ast ==",ast);
        const { code } = generate(ast)
        // 快照测试 ：给code 拍照后续对比 出bug
        expect(code).toMatchSnapshot()
    })

    it("element-all-test", () => {
        const ast = baseParse("<div><span>guo</span> king-{{message}}</div>")
        
        transform(ast, {
            // 有顺序  先将 更改节点 然后再 更改 text
            nodeTransforms: [transformExpression,transformElement, transformText]
        });
        console.log("ast ==",ast);
        const { code } = generate(ast)
        // 快照测试 ：给code 拍照后续对比 出bug
        expect(code).toMatchSnapshot()
    })
    
});