import { baseParse } from "../src/baseParse";
import { NodeTypes } from "../src/ast";
import { transform } from "../src/transform";
import { generate } from "../src/codegen";



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


});