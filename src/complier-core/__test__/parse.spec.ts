import { baseParse } from "../src/baseParse";
import { NodeTypes } from "../src/ast";
describe("Parse", () => {
    // 解析插值功能
    describe("interpolation", () => {
        test("interpolation {{message}}", () => {
            const ast = baseParse("{{message}}")
            console.log("ast ==",ast);
            
            // root
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.INTERPOLATION,
                content: {
                    type: NodeTypes.SIMPLE_EXPRESSION,
                    content:"message"
                }
            })


        })

        test("element div", () => {
            const ast = baseParse("<div></div>")
            console.log("ast ==",ast);
            // root
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.ELEMENT,
                tag: "div",
                children: []
            })
        })




    });



    describe("text", () => {
        it("text", () => {
            const ast = baseParse("some text")
            console.log("ast ==",ast);
            // root
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.TEXT,
                content: "some text",
            })
        })

      });


});
  

test("linkall", () => {
    const ast = baseParse("<div>king-{{message}}</div>")
    console.log("ast ==",ast);
    


    expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        children: [{
            type: NodeTypes.TEXT,
            content: "king-",
        }, {
            type: NodeTypes.INTERPOLATION,
            content: {
                type: NodeTypes.INTERPOLATION,
                content:"message"
            }
        }]
    })
    
    



})


test("linke - p", () => {
    const ast = baseParse("<div><p>king-</p>{{message}}</div>")
    console.log("ast ==",ast);
    


    expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        children: [{
            type: NodeTypes.ELEMENT,
            tag: "p",
            children: [{
                type: NodeTypes.TEXT,
                content: "king-",
            }]
        }, {
            type: NodeTypes.INTERPOLATION,
            content: {
                type: NodeTypes.INTERPOLATION,
                content:"message"
            }
        }]
    })
    
    



})


// test("should throw error when lack end tag", () => {
//     const ast = baseParse("<div><span></div>")
//     expect(() =>{
//         ast.children[0]
//     }).toThrow('缺少结束标签span')
// })

test("should throw error when lack end tag", () => {
    expect(() => {
      baseParse("<div><span></div>");
    }).toThrow(`缺少结束标签:span`);
  });

