import { isObject } from "../shared/index";
import { createComponetInstance, setupComponent } from "./components";
import { ShapeFlags } from "../shared/ShapeFlags";
import { Fragment, Text } from "./vnode";

import { createAppAPI } from "./createApp";
import { effect } from "../reactivity/effect";

export function createRenderer(options) {
    const { createElement:hostCreateElement, patchProp: hostPatchProps, insert: hostInsert } = options

    /**
     * 
     * @param vnode 虚拟节点
     * @param container 容器
     * render 是为了调用patch 方法，方便执行 递归处理
     */
    function render(vnode,container) {
        // 正常应该 将 patch 的第三个参数 传 parentComponent，但是当最开始 调用path 的时候 的虚拟Dom 是没有父级的
        patch(null, vnode, container, null)
    }

    /**
     * 
     * @param vnode 虚拟节点 
     * @param container 容器
     * 步骤
     * 1、去处理组件 processComponet
     * 2、判断是不是 element 类型
     * 
      * -- 20230409_2228---
     * 给patch 添加 更新逻辑
     * 首先传入两个值 n1 -> 老的 vnode ， n2 -> 新的  
     * 当n1 不存在的时候  就是初始化，如果  n1存在
     * 使用 n2 替换vnode 
     *  添加 n1 传值 
     * 
     * function patch( n1, n2, container, parentComponent: any)
     */
    function patch( n1, vnode, container, parentComponent: any) {
        // ShapeFlags 可以标识vnode -> flag 
        // ShapeFlags/ element -> string
        // ShapeFlags/ object -> STATEFUL_COMPONENT
        const { type, shapeFlags } = vnode


        // 定义一个特殊类型 Fragment -> 只渲染  children （作用于  插槽 中  ）
        switch (type) {
            case Fragment:
                processFragment(n1, vnode, container, parentComponent)
                break;
            case Text:
                processText(n1, vnode, container)
                break;
                
            default:
                // ------其他正常形式---------
                // 判断 vnode 是不是 element 类型
                // 如果是 element  processElement
                //
                // typeof(vnode.type) =string
                // console.log("typeof(vnode.type) ==", typeof(vnode.type));
                
                console.log("shapeFlags ==", shapeFlags, 'ShapeFlags ==', (shapeFlags & ShapeFlags.ELEMENT));
                
                if (shapeFlags & ShapeFlags.ELEMENT) { //if (typeof(vnode.type) ===string)
                    processElement(n1, vnode, container, parentComponent)
                } else if(shapeFlags & ShapeFlags.STATEFUL_COMPONENT) { // else if(isObject(vnode.type))
                    // 如果是 component processComponet
                    // typeof(vnode.type) = object
                    processComponet(n1, vnode, container, parentComponent)
                }
                break;
        }




    
    }

    /**
     * processFragment 特殊处理 Fragment 类型的 vnode ； 在 插槽中使用
     * @param vnode 
     * @param container 
     * 
     * 1、先渲染出所有的children mountChildren (这样处理之后  插槽就不会再有 外层div 包裹了)
     */
    function processFragment(n1, vnode, container, parentComponent) {
        // 
        mountChildren(vnode, container, parentComponent)
        
    }


    /**
     * processText 处理 没有 type 的独立的 text Dom
     * @param vnode 
     * @param containe 
     */
    function processText(n1, vnode, containe) {
        const {children} = vnode
        // 渲染出来的元素 一定要给到 虚拟节点 vnode.el 
        const textNode = (vnode.el = document.createTextNode(children))
        containe.append(textNode)
    }


    /**
     * 去处理 element
     * @param vnode 
     * @param container 
     */
    function processElement(n1, vnode, container, parentComponent) {
        // 如果n1 不存在 那么是初始化
        if (!n1) {
            // 初始化 虚拟DOM  默认：将数据 append 到 容器中， 可以自定义
            mountElement(vnode, container, parentComponent)
        } else{
            patchElement(n1, vnode, container)
        }
        
    }

    /**
     * 
     * @param n1 preSubTree 老的dom
     * @param vnode  n2:vnode  当前最新的 虚拟dom
     * @param containe 
     */
    function patchElement(n1, vnode, containe) {
        console.log("patchElement n1", n1, "n2:vnode", vnode);
        
    }



    /**
     * 去处理组件 processComponet
     * @param vnode 
     * @param container 
     */
    function processComponet(n1, vnode: any, container: any, parentComponent: any) {
        mountComponet(vnode, container, parentComponent)
    }

    /**
     * 
     * @param vnode 
     * @param container 
     */
    function mountElement(vnode, container, parentComponent) {
        const {type, props, children, shapeFlags} = vnode;
        console.log("mountElement =vnode=", vnode, type);
        /**
         * 实现自定义渲染器 custom render ;想实现 各种平台均可以 展示，canvas 或 dom
         * 1、此处原本的代码：
         *       // 为了使用 $el 使用 vnode 储存 el， 之后调用  subTree.el 取出存储的 根DOM 
         *      // const el = (vnode.el = document.createElement(vnode.type))
         * 
         * 现在实现 自定义渲染器
         * 
         * 
         */
        // 
        // 为了使用 $el 使用 vnode 储存 el， 之后调用  subTree.el 取出存储的 根DOM 
        // const el = (vnode.el = document.createElement(vnode.type))
        const el = (vnode.el = hostCreateElement(vnode.type))
        
        // 首先区分
        console.log("typeof(children) ==", typeof(children), 'children ==', children);
        // children
        if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {// ShapeFlags/ text_children // if (typeof children == "string") 
            
            el.textContent = children

        } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {// ShapeFlags/ Array_children // else if (Array.isArray(children))
            

            //  每一个children 内部都是 一个虚拟节点vnode ，每一次都要判断是 element 还是 components
            // children.forEach((vn) => {
            //     patch(vn, el)
            // })
            mountChildren(vnode, el, parentComponent)
        }
        console.log("props ==", props);
        for (const key in props) {
            const val = props[key]
            /**
             * 实现自定义渲染器 代码整合 为 patchProp
             * 
             * 
             */

            // console.log("mountElement == props ==", key , 'val ==', val);
            // // 通用方法 
            // // on Event name
            // // onMousedown
            // const isOn = (key:string) => /^on[A-Z]/.test(key) 
            // console.log("isOn(key) ==",isOn(key) );
            // if (isOn(key)) {
            //     const event = key.slice(2).toLowerCase()
            //     el.addEventListener(event, val)
            // } else{
            //     el.setAttribute(key, val)
            // }
            hostPatchProps(el, key, val)
            
            
            
        }

        /**
         * 实现自定义渲染器 代码整合 为 insert
         * 此处原本的代码：
         *      // container.append(el)
         */
        hostInsert(el, container)

    }

    /**
     * 处理 children 
     * @param vnode 虚拟节点vnode 内部存在 children<array> 循环遍历数组 
     * @param container 容器
     * 
     * 每一个children 内部都是 一个虚拟节点vnode ，每一次都要判断是 element 还是 components
     */
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((vn) => {
            patch(null, vn, container, parentComponent)
        })
    }
    /**
     * 
     * @param vnode 
     * @param container 
     */
    function mountComponet(vnode: any, container: any, parentComponent: any) {
        // 创建组件实例 
        // 将父级传给 当前 组件实例
        const instance = createComponetInstance(vnode, parentComponent)
        setupComponent(instance) //这里 处理 instance 并将 render 赋值给 instance 
        
        setupRenderEffect( instance, vnode, container, parentComponent)
    }
    // 
    function setupRenderEffect(instance, vnode, container, parentComponent) {
        // 使用effect 进行依赖收集 ，当响应式 数据进行改变的时候 ，重新出发render 重新渲染,
        // 当 触发 render 函数后 会出发 this.count  的 get 操作，进行依赖收集
        effect(() => {

            // 添加新的 变量 来 判定 instance 的状态
            // instance.isMounted = false是 是个 初始化状态
            if (!instance.isMounted) {
                console.log("init");

                console.log("setupRenderEffect  instance =", instance);
                // 通过 instance 返回 proxy 代理对象
                const { proxy } = instance 
        
        
                // 调用 render 函数
                // subTree 是虚拟节点树
                // const subTree = instance.render()
                // const subTree = instance.render.call(proxy)
                // 初始化阶段先储存一个 subTree
                const subTree = (instance.subTree = instance.render.call(proxy))
                // 基于  render() return 出来的 vnode 去调用  patch
                // vnode 是 element ，将 element 处理 挂载出来 ，进行 mounElement 处理
        
                // 当重新调用render后 会重新生成 subTree 
                console.log("subTree =", subTree);
                
    
                // patch 属于 初始化 第一创建节点的时候 添加
                // patch 这里是 递归循环调用 ，但现在不知到如何跳出循环
                patch(null, subTree, container, instance)
        
        
                //储存 elemet 要在 所有的 mount 完成 之后
                // subTree.el 就是虚拟节点的 跟节点 ，
                // subTree.el 是在 mountElement 中的 vnode.el 存储的
                // 因为此处的  vnode  并非 是 mountElement 中的vnode ，而是被proxy 挂载的 vnode
                console.log("setupRenderEffect subTree ==", subTree);
                
                vnode.el = subTree.el

                instance.isMounted = true

            } else {
                console.log("upDate");
                // 在更新阶段再一次调用subTree

                // 通过 instance 返回 proxy 代理对象
                const { proxy } = instance 
        
        
                // 调用 render 函数
                // subTree 是虚拟节点树
                // const subTree = instance.render()
                const subTree = instance.render.call(proxy)
                // 基于  render() return 出来的 vnode 去调用  patch
                // vnode 是 element ，将 element 处理 挂载出来 ，进行 mounElement 处理
        
                // 当重新调用render后 会重新生成 subTree 
                console.log("subTree =", subTree);

                // 对比现在和之前的subTree 
                // 先把之前的subTree 获取处理啊
                const prevSubTree = instance.subTree


                console.log(" current subTree =", subTree, "prevSubTree =", prevSubTree);
                
                // 重新更新 subTree
                instance.subTree = subTree

                // 因为 patch 之前全部都是初始化 ，所以要给patch 添加 更新逻辑
                patch(prevSubTree, subTree, container, instance)

            }


          


        })


    }


    return {
        createApp: createAppAPI(render),
    };



}



