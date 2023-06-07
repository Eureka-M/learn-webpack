// 并发执行所有异步钩子

const { AsyncParallelHook } = require('tapable')
const hook = new AsyncParallelHook(['arg1', 'arg2', 'arg3'])

console.time('timer')

// 注册事件
hook.tapPromise('flag1', (arg1, arg2, arg3) => {
    console.log('flag1:', arg1, arg2, arg3)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, 1000)
    })
})

hook.tapAsync('flag2', (arg1, arg2, arg3, callback) => {
    console.log('flag2:', arg1, arg2, arg3)
    setTimeout(() => {
        callback()
    }, 1000)
})

// 调用事件并传递执行参数
hook.callAsync('1', '2', '3', () => {
    console.log('全部执行完毕 done')
    console.timeEnd('timer')
})

// flag1: 1 2 3
// flag2: 1 2 3
// 全部执行完毕 done
// timer: 1.008s
