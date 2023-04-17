import { baseParse } from "../src/baseParse";
import { NodeTypes } from "../src/ast";
import { transform } from "../src/transform";


describe("transform", () => {

    
    it("transform ", () => {
        const ast = baseParse("<div>king-{{message}}</div>")
        console.log("ast ==",ast);
        // 外部扩展处理 NodeTypes.TEXT
        const plugin = (node) => {
            if (node.type === NodeTypes.TEXT) {
                node.content = node.content + "hellow"
            }
        }
        transform(ast, { nodeTransforms: [plugin] })
        const nodeText = ast.children[0].children[0]
        expect(nodeText.content).toBe("king-hellow")
        // expect(ast.children[0]).toStrictEqual({
        //     type: NodeTypes.ELEMENT,
        //     tag: "div",
        //     children: [{
        //         type: NodeTypes.TEXT,
        //         content: "hellow-",
        //     }, {
        //         type: NodeTypes.INTERPOLATION,
        //         content: {
        //             type: NodeTypes.INTERPOLATION,
        //             content:"message"
        //         }
        //     }]
        // })
        


    })


});