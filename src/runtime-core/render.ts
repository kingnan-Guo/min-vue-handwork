import { isObject, EMPTY_OBJ } from "../shared/index";
import { createComponetInstance, setupComponent } from "./components";
import { ShapeFlags } from "../shared/ShapeFlags";
import { Fragment, Text } from "./vnode";

import { createAppAPI } from "./createApp";
import { effect } from "../reactivity/effect";

import { shoudUpdateComponent } from "./componentUpdateUtils";

export function createRenderer(options) {
    const { createElement:hostCreateElement, patchProp: hostPatchProps, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options

    /**
     * 
     * @param vnode 虚拟节点
     * @param container 容器
     * render 是为了调用patch 方法，方便执行 递归处理
     */
    function render(vnode,container) {
        // 正常应该 将 patch 的第三个参数 传 parentComponent，但是当最开始 调用path 的时候 的虚拟Dom 是没有父级的
        patch(null, vnode, container, null, null)
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
    function patch( n1, vnode, container, parentComponent: any, anchor) {
        // ShapeFlags 可以标识vnode -> flag 
        // ShapeFlags/ element -> string
        // ShapeFlags/ object -> STATEFUL_COMPONENT
        const { type, shapeFlags } = vnode


        // 定义一个特殊类型 Fragment -> 只渲染  children （作用于  插槽 中  ）
        switch (type) {
            case Fragment:
                processFragment(n1, vnode, container, parentComponent, anchor)
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
                    processElement(n1, vnode, container, parentComponent, anchor)
                } else if(shapeFlags & ShapeFlags.STATEFUL_COMPONENT) { // else if(isObject(vnode.type))
                    // 如果是 component processComponet
                    // typeof(vnode.type) = object
                    processComponet(n1, vnode, container, parentComponent, anchor)
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
    function processFragment(n1, vnode, container, parentComponent, anchor) {
        // 
        mountChildren(vnode.children, container, parentComponent, anchor)
        
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
    function processElement(n1, vnode, container, parentComponent, anchor) {
        // 如果n1 不存在 那么是初始化
        if (!n1) {
            // 初始化 虚拟DOM  默认：将数据 append 到 容器中， 可以自定义
            mountElement(vnode, container, parentComponent, anchor)
        } else{
            patchElement(n1, vnode, container, parentComponent, anchor)
        }
        
    }

    /**
     * 
     * @param n1 preSubTree 老的dom
     * @param vnode  n2:vnode  当前最新的 虚拟dom
     * @param containe 
     * 
     * 
     * 此处开始 更新对比  n1 与 n2 也就是 n1 与 vnode
     * 1、对比  props
     * 2、对比 children
     */
    function patchElement(n1, vnode, containe, parentComponent, anchor) {
        console.log("patchElement n1", n1, "n2:vnode", vnode);



        // 此处开始 更新对比 props  children
        // 
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = vnode.props || EMPTY_OBJ
        const el = (vnode.el = n1.el)

        patchChildren(n1, vnode, el, parentComponent, anchor)
        patchProps(el, oldProps, newProps)
    }

    /**
     * 对比更新 children
     * @param n1 老
     * @param vnode 新 
     * 
     * 1、对比 text 与数组
     */
    function patchChildren(n1, vnode, container, parentComponent, anchor) {
        const {shapeFlags} = vnode
        const preShapeFlags = n1.shapeFlags
        const c1 = n1.children
        const c2 = vnode.children
        if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
            // 新的节点vnode是一个 text
            if (preShapeFlags & ShapeFlags.ARRAY_CHILDREN) {
                // 老节点preShapeFlag 是一个 数组
                // 1、把老的children清空
                unmountChildren(n1.children)
                // 2、设置text
                // hostSetElementText(container, c2)

            }

            if(c1 !== c2){
                // 2、设置text
                hostSetElementText(container, c2)
            }

        } else{
            // vnode<array>
            if(shapeFlags & ShapeFlags.TEXT_CHILDREN){
                hostSetElementText(container, "")
                mountChildren(c2, container, parentComponent, anchor)
            } else{
                console.log("------ array diff array -------");
                
                // array diff array
                // 设置三个指针 i：可以移动的 i i<= e1 & i<=e2；  e1:当前这个数组的最后位置； e2:新数据 最后的索引值
                patchKeyChildren(c1, c2, container, parentComponent, anchor);
            
            
            }
        }
 

    }

    /**
     * array diff array
     * 双端指针对比
     * @param c1 
     * @param c2 
     * 
     * 先对比前后两侧找到不同的 索引
     */

    function patchKeyChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0;
        const l2 = c2.length
        let e1 = c1.length - 1;
        let e2 = l2- 1;
        // 检测节点是否一样
        function isSomeVNodeType(n1, n2) {
            // 检测type  key
            return n1.type === n2.type && n1.key === n2.key
        }

        while(i<=e1 && i <=e2){
            const n1 = c1[i]
            const n2 = c2[i]
            //如果两个节点一样 那么 再次进行递归patch 进行属性对比 props children
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } 
            // 如果不一样的时候 跳出循环
            else {
              break
            }
            // 移动 i 这个指针
            i++
        }
        console.log("指针 i 的位置", i);

        // 右侧对比
        while(i<=e1 && i <=e2){
            const n1 = c1[e1]
            const n2 = c2[e2]
            //如果两个节点一样 那么 再次进行递归patch 进行属性对比 props children
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } 
            // 如果不一样的时候 跳出循环
            else {
              break
            }
            // 移动 i 这个指针
            e1--
            e2--
        }

        console.log("指针 i 的位置", i , "末端指针索引的位置  e1 ", e1, ' = e2 = ',e2);
        
        // 新的比老的 多 ,左侧对比 右侧对比
        if(i > e1){
            if(i<= e2){

                // 在 当前的 DOM 节点前 添加数据 ，
                const nextPos = e2 + 1
                const anchor = nextPos < l2 ? c2[nextPos].el : null
                while (i <= e2 ) {
                    // 新增 数据 所以 n1 是没有的
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
            console.log("指针 i 的位置", i , "末端指针索引的位置  e1 ", e1, ' = e2 = ',e2);
        } else if(i > e2){
            while (i <= e1) {
                // 删除所有获取到的 节点
                hostRemove(c1[i].el)
                i++
            }
        } 
        // 乱序部分
        else{
            // 中间对比
            let s1 = i;//老节点的开始位置
            let s2 = i;//老节点的开始位置

            // 记录当前节点的总数两
            const toBePatched = e2 - s2 + 1;//因为是索引所以 +1
            let patched = 0;

            // 建立映射表 从左向右开始对比 储存 不同新数据  的 key和 i 映射
            const keyToNewIndexMap = new Map()



            // 最长递增子序列 --- start
            // 创建定长的数组 性能最高 
            const newIndexToOldIndexMap = new Array(toBePatched)
            // newIndexToOldIndexMap[i] = 0;//0 代表未建立映射关系
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0;
            }
            // 记录是否需要移动
            let needMove = false;
            // 记录最大的值
            let maxNewIndexSoFar = 0
            // 最长递增子序列 --- end


            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i]                
                keyToNewIndexMap.set(nextChild.key, i)
            }





            
            for (let i = s1; i <= e1; i++) {
                // 拿到老节点
                const prevChild = c1[i]

                if (patched >= toBePatched) {
                    hostRemove(prevChild.el)
                    continue;
                }


                let newIndex;
                // 如果节点中 key 存在 那么
                if (prevChild.key  != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key) 
                }else {
                    

                    //如果不存在 key那么进行 for循环
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(prevChild, c2[j])) {
                            // 更新index的值
                            newIndex = j;
                            break;
                        }                        
                    }
                }
                // 如果循环对比中任无法查找到 对应 的index 说明 最新的数据中不存在此节点，所以要删除此节点
                if(newIndex === undefined){
                    // 那么执行删除
                    hostRemove(prevChild.el)
                } else {

                    // ---最长递增子序列
     
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex
                    } else {
                        needMove = true
                    }

                    // 为了保证 newIndexToOldIndexMap 储存的值 不为0，所以使用 i+1
                    // 因为 newIndexToOldIndexMap[i] = 0; 有特殊意义 代表未建立映射关系
                    newIndexToOldIndexMap[newIndex - s2] = i + 1



                    // ---最长递增子序列 ---



                    // 如果存在的话那么将 继续调用patch 进行 其他属性的对比
                    patch(prevChild, c2[newIndex], container, parentComponent, null)
                    // 每次添加完一个数据 那么 + 1
                    patched++


                }
                
            }


            // 最长递增子序列---
            // 获取最长递增子序列的  index 值
            const increasingNewIndexSequence = needMove ? getSequence(newIndexToOldIndexMap) : []


            // 使用 倒叙 进行循环
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2
                const nextChild = c2[nextIndex]
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;//当前节点的 下一个
                
                // 如果increasingNewIndexSequence 中的元素为0，那么说明老元素中不存在，所以需要 创建新增
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor)
                } else {

                    if (needMove) {
                   
                        // j<0 时 直接移动位置
                        if (j< 0 || i !== increasingNewIndexSequence[j]) {
                            console.log("移动位置");
                            hostInsert(nextChild.el, container, anchor)
                        }else{
                            j--
                        }
    
                        
                    }


                }


                

                
            }
            // 最长递增子序列-----



        }



        
    }




    /**
     * 把老的 children 清空
     * @param children 
     */
    function unmountChildren(children) {
        for (let index = 0; index < children.length; index++) {
            const element = children[index].el;
            // remove
            hostRemove(element)
            
        }
    }


    /**
     *  对比 新老两个props
     * @param oldProps 
     * @param newProps 
     * 
     * for (const key in newProps)  遍历新的 props 用于 添加 
     * 
     * 
     */

    function patchProps(el, oldProps, newProps) {
        //  当新老虚拟节点中的 props 不一样后才去对比
        if(oldProps !== newProps){

            for (const key in newProps) {
                const preProps = oldProps[key]
                const nextProps = newProps[key]
                // 对比两个个 props 如果不相等
                // 但是如果props 层级比较深 怎么办？？
                if (preProps !== nextProps) {
                    //触发更新
                    hostPatchProps(el, key, preProps, nextProps)
                    
    
                }
            }
            /**
             * 如果使用 oldProps ！== {} 在这里会创建一个新的 空对象 ，如果 oldProps 没有值
             * 那么 const oldProps = n1.props || {} 中 也会创建一个 空对象，两个空对象 不相等
             */
            if(oldProps !== EMPTY_OBJ) {

                for (const key in oldProps) {
                    const preProps = oldProps[key]
                    if(!(key in newProps)){
        
                        hostPatchProps(el, key, preProps, null)
                    }
                }


            }
    



        }

    }

    /**
     * 去处理组件 processComponet
     * @param vnode 
     * @param container 
     */
    function processComponet(n1, vnode: any, container: any, parentComponent: any, anchor) {
        // n1 没有值的时候说明 是初始化
        if (!n1) {
            mountComponet(vnode, container, parentComponent, anchor)
        } else{
            // update
            updateComponent(n1, vnode)
        }
        
    }

    /**
     * 更新组件
     * 更新组件就是调用这个组件的render 函数 ，重新生成一个虚拟节点，在进行patch 在进行对比
     * @param vnode 
     * @param container 
     * 
     * 调用effect的时候 返回runner，当调用runner 时 ，会调用里传给里面的函数
    
     * 将 instance.upDate 收集到的 runner 进行调用
     * 本身在 n1 中无法找到 组件component 所以在 创建vnode 时候，将组件挂在到vnode,在 mountomponent给他赋值
     */
    function updateComponent(n1, vnode) {

        // 从 n1 中取出 组件component，赋值给n2，就像之前处理 el 一样
        const  instance = (vnode.component =n1.component)

        // 需要更新
        if (shoudUpdateComponent(n1, vnode)) {
            
            instance.next = vnode;//要被更新的虚拟节点

            instance.upDate()

        } else{
            // 不需要更新时 也要重置虚拟节点
            vnode.el = n1.el;
            instance.vnode = vnode;
        }

    }






    /**
     * 
     * @param vnode 
     * @param container 
     */
    function mountElement(vnode, container, parentComponent, anchor) {
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
            mountChildren(vnode.children, el, parentComponent, anchor)
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
            hostPatchProps(el, key, null, val)
            
            
            
        }

        /**
         * 实现自定义渲染器 代码整合 为 insert
         * 此处原本的代码：
         *      // container.append(el)
         */
        hostInsert(el, container, anchor)

    }

    /**
     * 处理 children 
     * @param vnode 虚拟节点vnode 内部存在 children<array> 循环遍历数组 
     * @param container 容器
     * 
     * 每一个children 内部都是 一个虚拟节点vnode ，每一次都要判断是 element 还是 components
     */
    // function mountChildren(vnode, container, parentComponent) {
    //     vnode.children.forEach((vn) => {
    //         patch(null, vn, container, parentComponent)
    //     })
    // }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((vn) => {
            patch(null, vn, container, parentComponent, anchor)
        })
    }




    /**
     * 
     * @param vnode : initalVNode
     * @param container 
     */
    function mountComponet(vnode: any, container: any, parentComponent: any, anchor) {
        // 创建组件实例 
        // 将父级传给 当前 组件实例

        // 在初始化 component的时候 收集组件
        const instance =(vnode.component =  createComponetInstance(vnode, parentComponent))
        setupComponent(instance) //这里 处理 instance 并将 render 赋值给 instance 
        
        setupRenderEffect( instance, vnode, container, parentComponent, anchor)
    }
    // 
    function setupRenderEffect(instance, vnode, container, parentComponent, anchor) {
        // 使用effect 进行依赖收集 ，当响应式 数据进行改变的时候 ，重新出发render 重新渲染,
        // 当 触发 render 函数后 会出发 this.count  的 get 操作，进行依赖收集

        // 使用 instance.upDate 收集 effect 返回的runner
        instance.upDate = effect(() => {

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
                patch(null, subTree, container, instance, anchor)
        
        
                //储存 elemet 要在 所有的 mount 完成 之后
                // subTree.el 就是虚拟节点的 跟节点 ，
                // subTree.el 是在 mountElement 中的 vnode.el 存储的
                // 因为此处的  vnode  并非 是 mountElement 中的vnode ，而是被proxy 挂载的 vnode
                console.log("setupRenderEffect subTree ==", subTree);
                
                vnode.el = subTree.el

                instance.isMounted = true

            } else {
                console.log("upDate");
                
                
                                // 整个过程 要在 更新之前
                // 还要更新组件的props
                // 更新时 将 要被更新的虚拟节点从 instance 中取出来
                //vnode 指向的是更新之前的虚拟节点
                // next 是下次要更新的虚拟节点
                const {next, vnode} = instance
                if (next) {
                    next.el = vnode.el
                    updateComponentPreRender(instance, next)    
                }

                
                
                
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
                patch(prevSubTree, subTree, container, instance, anchor)


            }


          


        })


    }


    return {
        createApp: createAppAPI(render),
    };



}


/**
 * 
 * @param instance 
 * @param nextVNode 
 * 更新实例对象上的 props，从 nextVNode.props给到他
 */
function updateComponentPreRender(instance, nextVNode) {
    //  把虚拟节点更新一下
    instance.vnode = nextVNode
    instance.next = null

    instance.props = nextVNode.props

}


function patchProps(oldProps: any, newProps: any) {
    throw new Error("Function not implemented.");
}

// 最长递增子序列算法
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
          p[i] = j;
          result.push(i);
          continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
          c = (u + v) >> 1;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
            v = c;
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1];
          }
          result[u] = i;
        }
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = p[v];
    }
    return result;
}
