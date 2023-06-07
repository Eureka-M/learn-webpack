// 瀑布钩子会将上一个函数的返回值传递给下一个函数作为参数

const { SyncWaterfallHook } = require('tapable')

const hook = new SyncWaterfallHook(['arg1', 'arg2', 'arg3'])

// 注册事件
hook.tap('flag1', (arg1, arg2, arg3) => {
    console.log('flag1:', arg1, arg2, arg3)
    // 存在返回值 修改后续函数的实参
    // 当存在多个参数时，通过 SyncWaterfallHook 仅能修改第一个参数的返回值。
    return 'abc'
})

hook.tap('flag2', (arg1, arg2, arg3) => {
    console.log('flag2:', arg1, arg2, arg3);
})

hook.tap('flag3', (arg1, arg2, arg3) => {
    console.log('flag3:', arg1, arg2, arg3)
})

// 调用事件并传递执行参数
hook.call('1', '2', '3')

// flag1: 1 2 3
// flag2: abc 2 3
// flag3: abc 2 3



