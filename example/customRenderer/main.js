// vue3
import { App } from "./App.js";
import { createRenderer } from "../../lib/mini-vue-handwork.esm.js";


console.log("pixi ==",PIXI);

const game = new PIXI.Application({
    width: "500",
    height: "500"
})

document.body.append(game.view)
// 自定义 createRenderer createElement patchProp insert 方法 将 rect 渲染到 canvas 上
const renderer = createRenderer({
    createElement(type){
        if (type === "rect") {
            const rect = new PIXI.Graphics()
            rect.beginFill(0xff0000)
            rect.drawRect(0, 0, 100, 100)
            rect.endFill

            return rect
        }
    },
    patchProp(el, key, val){
        console.log("el, key, val ==", el, key, val);
        el[key] = val
    },
    insert(el, container){
        container.addChild(el)

    }
})
// const rootContainer = document.querySelector('#app')

// game.stage canvas 根容器
renderer.createApp(App).mount(game.stage)