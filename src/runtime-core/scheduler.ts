
const queue:any[] = []
let isFlushPending = false

const p = Promise.resolve()
export function nextTick(fn) {
    return fn ? p.then(fn) : p
}



/**
 * 收集数据队列
 * @param job 
 * 
 */
export function queueJobs(job) {
    if (!queue.includes(job)) {
        // 通过队列 添加jobs
        queue.push(job)
    }


    queueFlush()
}

// 
function queueFlush() {
    if (isFlushPending) {
        return 
    }
    isFlushPending = true
    // 同步任务会执行到这里 不断执行for循环，等所有的同步任务完成之后，会执行promise
    // 在微任务的时候 执行jobs
    nextTick(flushJobs)
    // Promise.resolve().then(() => {
    //     isFlushPending = false
    //     let job
    //     while(job =queue.shift()){
    //         job && job()
    //     }
    // })
}

function flushJobs() {
    isFlushPending = false
    let job
    while(job =queue.shift()){
        job && job()
    }
}

