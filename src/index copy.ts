/**
 * mini vue  的出口
 */

import { baseCompile } from "./complier-core/src";
import { registerRuntimeCopmpiler } from "./runtime-dom";


// export * from "./runtime-core";
export * from "./runtime-dom";
import * as runtimeDom from "./runtime-dom";
// import * from "@mini-vue-handwork";
// 根据vue的依赖 ，所以将 reactivity 转移到runtime-core
// export * from "./reactivity";

/**
 * 在vue 中 引入 complier-core
 * 在vue 中  complier-core  与其他的组件 不可以互相引入，不能强绑定，因为vue中的 complier-core 可以单独将 dom 编译成 render
 * 然后 runtime-core ...  运行时 函数对 render 进行处理
 */

export { baseCompile } from "./complier-core/src"
/**
 * 
 */
function compileFunction(template) {
    const { code } = baseCompile(template);
    console.log("code =", code);
    
    var code2 = `const { toDisplayString: _toDisplayString, createElementVNode: _createElementVNode } = Vue;
    return function render(_ctx, _cache){
        console.log("_ctx =", _ctx, "_cache ==", _cache);
        return _createElementVNode('div', null, 'king-' + _toDisplayString(_ctx.message) +  '- ' + _toDisplayString(_ctx.count))
    }`


    // 这段没看懂
    const render = new Function("Vue", code2)(runtimeDom);
    return render
    // const render = renderFunction()
    // function renderFunction(Vue) {
        

    //     const { toDisplayString: _toDisplayString, creatElementVNode: _creatElementVNode } = Vue
    //     return function render(_ctx, _cache){
    //         return _creatElementVNode('div', null, 'king-' + _toDisplayString(_ctx.message))
    //     }



    // }
}


registerRuntimeCopmpiler(compileFunction)