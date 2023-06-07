const { SyncHook } = require('tapable')

// 初始化同步钩子
const hook = new SyncHook(['4', '5', '6'])

// 注册事件
hook.tap('flag1', (arg1, arg2, arg3) => {
    console.log('flag1:', arg1, arg2, arg3)
})

hook.tap('flag2', (arg1, arg2, arg3) => {
    console.log('flag2:', arg1, arg2, arg3)
})

hook.call('1', '2', '3')

// flag1: 1 2 3
// flag2: 1 2 3