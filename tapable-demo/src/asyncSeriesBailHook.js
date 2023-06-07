const { AsyncSeriesBailHook } = require('tapable')

const hook = new AsyncSeriesBailHook(['arg1', 'arg2', 'arg3'])

console.time('timer')

// 注册事件
hook.tapPromise('flag1', (arg1, arg2, arg3, callback) => {
    console.log('flag2:', arg1, arg2, arg3)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // resolve函数存在任何值表示存在返回值
            // 存在返回值 bail保险打开 中断后续执行
            resolve(true)
        }, 1000)
    })
})

// flag2 不会被执行了
hook.tapAsync('flag2', (arg1, arg2, arg3, callback) => {
    console.log('flag1:', arg1, arg2, arg3)
    setTimeout(() => {
        callback()
    }, 1000)
})

// 调用事件并传递执行参数
hook.callAsync('1', '2', '3', () => {
    console.log('全部执行完毕 done')
    console.timeEnd('timer')
})

// flag2: 1 2 3
// 全部执行完毕 done
// timer: 1.007s
