// 在任意一个被监听的函数存在非 undefined 返回值时返回重新开始执行

const { SyncLoopHook } = require('tapable')

let flag1 = 2
let flag2 = 1

// 初始化同步钩子
const hook = new SyncLoopHook()

// 注册事件
hook.tap('flag1', () => {
    console.log('flag1', flag1)
    if (flag1 !== 3) {
        return flag1++
    }
})

hook.tap('flag2', () => {
    console.log('flag2', flag2)
    if (flag2 !== 3) {
        return flag2++
    }
})

// 调用事件
hook.call()

//flag1 2
//flag1 3
//flag2 1
//flag1 3
//flag2 2
//flag1 3
//flag2 3


