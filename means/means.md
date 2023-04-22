关于 
render(_ctx, _cache)中的 _ctx,
通过修改 const render = new Function("Vue", code2) 传入 为 code2，在console.log 中打印 _ctx 发现与 位 proxy

因为在 src/runtime-core/render.ts 的 setupRenderEffect 中
 const subTree = (instance.subTree = instance.render.call(proxy, proxy))

 通过call将 this 替换 proxy， 而 _ctx 的打印结果是 Proxy 
 想要用 proxy 的方法  调用  instance.render, proxy中赋值了instance.render的属性,在call调用后删除掉 instance.render 的相关属性，
 所以 render(_ctx, _cache) 被 nstance.render 替换, render的第一个传值 是 proxy



function compileFunction(template) {
    const { code } = baseCompile(template);
    console.log("code =", code);
    
    var code2 = `const { toDisplayString: _toDisplayString, createElementVNode: _createElementVNode } = Vue;
    return function render(_ctx, _cache){
        console.log("_ctx =", _ctx, "_cache ==", _cache);
        return _createElementVNode('div', null, 'king-' + _toDisplayString(_ctx.message) +  '- ' + _toDisplayString(_ctx.count))
    }`



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



![return render中的 _ctx](./flowPath/init/_ctx%20.png)