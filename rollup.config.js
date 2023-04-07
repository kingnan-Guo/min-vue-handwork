import pkg from "./package.json"  assert { type: 'json' };//引入 json 要增加  assert 断言

// 因为并不支持 typescript 所以 引入@rollup/plugin-typescript
import typescript from "@rollup/plugin-typescript";
// import resolve from "@rollup/plugin-node-resolve";

// 因为 rollup 支持esm 所以，直接写 esm 语法
export default {
    input: "./src/index.ts",
    plugins:[
        typescript(),
        // resolve()
    ],
    output: [
        // 打包分为几种类型
        // 1、cjs -> commonjs
        // 2、esm -> 标准化模块规范
        {
            format: "cjs",
            file: pkg.main, //"lib/mini-vue-handwork.cjs.js"
        },
        {
            format: "es",
            file: pkg.module, //"lib/mini-vue-handwork.esm.js"
        }
    ],


}