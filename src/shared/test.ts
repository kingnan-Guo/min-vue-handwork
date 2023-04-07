// 如果 节点 vnode -> statefule_component; 那么 ShapeFlags.statefule_component = 1

/**
 * 可以 设置值  可以查找值
 * 不够高效
 */


const ShapeFlags = {
    element: 0,
    statefule_component:0,
    text_children: 0,
    array_children: 0
}


/**
 * 若要高效 使用位查找 设置
 * eg： 0000 
 * 0001    ShapeFlags.element = 1
 * 0010    ShapeFlags.statefule_component = 1
 * 0100    ShapeFlags.text_children = 1
 * 1000    ShapeFlags.array_children = 1
 * 
 */


/**
 * 位运算符
 * |  (两位为 0 才是 0)
 * &  (两位为 1 才是 1)
 * 
 */


/**
 * 修改 位标识符
 * 0000 -> 0001
 * 0000 | 0001 = 0001
 * 0001 | 0100 = 0101
 * 
 */


/**
 * 查找   使用&
 * 0001 & 0001  = 0001 查找是不是 element
 * 0010 & 0001 = 0000 查找是不是 element ，返回 0000 证明不是
 * 
 * 
 */