// 异步串联执行
// tapAsync 注册时实参结尾额外接受一个 callback ，调用 callback 表示本次事件执行完毕

const { AsyncSeriesHook } = require('tapable')

const hook = new AsyncSeriesHook(['arg1', 'arg2', 'arg3'])

console.time('timer')

// 注册事件
hook.tapAsync('flag1', (arg1, arg2, arg3, callback) => {
    console.log('flag1:', arg1, arg2, arg3)
    setTimeout(() => {
        // 1s 后调用 callback表示 flag1 执行完成
        callback()
    }, 1000)
})

hook.tapPromise('flag2', (arg1, arg2, arg3) => {
    console.log('flag2:', arg1, arg2, arg3)
    // tapPromise 返回 Promise
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, 1000)
    })
})

// 调用事件并传递执行参数
hook.callAsync('1', '2', '3', () => {
    console.log('全部执行完毕 done')
    console.timeEnd('timer')
})

// flag1: 1 2 3
// flag2: 1 2 3
// 全部执行完毕 done
// timer: 2.012s
