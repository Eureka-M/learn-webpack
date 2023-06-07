// 异步串行瀑布钩子 
// 瀑布类型的钩子会在注册的事件执行时将事件函数执行非 undefined 的返回值传递给接下来的事件函数作为参数
const { AsyncSeriesWaterfallHook } = require('tapable')

const hook = new AsyncSeriesWaterfallHook(['arg1', 'arg2', 'arg3'])

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
// flag2: true 2 3
// 全部执行完毕 done
// timer: 2.011s