export function shoudUpdateComponent(preVNode, nextVnode) {
    const { props:preProps } = preVNode
    const { props:nextProps } = nextVnode

    for (const key in nextProps) {
        if (nextProps[key] !== preProps[key]) {
          
            return true
        }
        
    }

    return false
}