const { AsyncParallelBailHook } = require('tapable')

const hook = new AsyncParallelBailHook(['arg1', 'arg2', 'arg3'])

console.time('timer')

// 注册事件
hook.tapPromise('flag1', (arg1, arg2, arg3) => {
    return new Promise((resolve, reject) => {
        console.log('flag1:', arg1, arg2, arg3)
        setTimeout(() => {
            // 返回了非 undefined 的值  发生保险效果，停止后续所有的事件函数调用
            resolve(true)
        }, 1000)
    })
})

hook.tapAsync('flag2', (arg1, arg2, arg3, callback) => {
    setTimeout(() => {
        console.log('flag2:', arg1, arg2, arg3)
        callback()
    }, 3000)
})

hook.callAsync('1', '2', '3', () => {
    console.log('全部执行完毕')
    console.timeEnd('timer')
})
