let currentHash
let lastHash

class EventEmitter {
    constructor() {
        this.events = {}
    }

    on(eventName, fn) {
        this.events[eventName] = fn
    }
    
    emit(eventName, ...args) {
        this.events[eventName](...args)
    }
}
let hotEmitter = new EventEmitter();

(function (modules) {
    // 存放缓存的模块
    var installedModules = {}

    // parentModuleId = ./src/index.js
    function hotCreateRequire (parentModuleId) { 
        // 因为要加载子模块的时候，父模块肯定加载过了，可以从缓存中通过父模块的 ID 拿到父模块对象
         // ./src/index.js 模块对象
        let parentModule = installedModules[parentModuleId]
        // 如果缓存里没有此父模块对象，说明这是一个顶级模块没有父级
        if (!parentModule) return __webpack_require__

        // childModuleId ./src/title.js
        let hotRequire = function (childModuleId) {
            // 如果 require 过了，会把子模块对象放在缓存
            __webpack_require__(childModuleId)

            // 取出子模块对象
            let childModule = installedModules[childModuleId] 
            childModule.parents.push(parentModule) 
            parentModule.children.push(childModule)
            
            console.log('childModule', childModule)
            return childModule.exports // 返回子模块的导出对象
        }
        return hotRequire
    }

    function hotDownloadManifest () {
        return new Promise(function(resolve, reject) {
            let xhr = new XMLHttpRequest()
            let url = `main.${lastHash}.hot-update.json`
            xhr.open('get', url)
            xhr.responseType = 'json'
            xhr.onload = function() {
                resolve(xhr.response)
            }
            xhr.send()
        })
    }

    function hotDownloadUpdateChunk (chunkId) {
        let script = document.createElement('script')
        script.src = `${chunkId}.${lastHash}.hot-update.js`
        document.head.appendChild(script)
    }

    window.webpackHotUpdatemy_hmr = function (chunkId, moreModules) {
        hotAddUpdateChunk(chunkId, moreModules)
    }

    let hotUpdate = {}
    function hotAddUpdateChunk(chunkId, moreModules) {
        for (let moduleId in moreModules) {
            modules[moduleId] = hotUpdate[moduleId] = moreModules[moduleId]
        }
        hotApply()
    }

    function hotApply() {
        // ./src/title.js
        for (let moduleId in hotUpdate) {
            // 老 title.js 模块
            let oldModule = installedModules[moduleId] 
            // 从缓存中删除旧模块
            delete installedModules[moduleId]
            // 循环它所依赖的父模块
            oldModule.parents.forEach(parentModule => {
                // 取出父模块上的回调，如果有就执行
                let cb = parentModule.hot._acceptedDependencies[moduleId]
                // 执行回调
                cb && cb()
            })
        }
    }

    function hotCheck () {
        console.log('hot chcek')

        // {"c": [ "main"], "r": [], "m": []}
        hotDownloadManifest().then(update => {
            let chunkIds = update.c
            chunkIds.forEach(chunkId => {
                hotDownloadUpdateChunk(chunkId)
            })
            lastHash = currentHash
        }).catch((err) => {
            console.log(err)
            window.location.reload()
        })
    }

    function hotCreateModule () {
        let hot = {
            _acceptedDependencies: {},
            accept(deps, callback) {
                // hot._acceptedDependencies['./title.js'] = render
                deps.forEach(dep => hot._acceptedDependencies[dep] = callback)
            },
            check: hotCheck
        }
        return hot
    }

    function __webpack_require__(moduleId) {
        // 如果缓存中有模块id，直接返回
        if (installedModules[moduleId]) {
            return installedModules[moduleId]
        }
        let module = installedModules[moduleId] =  {
            i: moduleId,
            // loaded 是否已经加载
            l: false,
            // 导出对象
            exports: {},
            // 当前模块的父亲们
            parents: [],
            children: [],
            hot: hotCreateModule()
        }
        // 执行模块代码，给 module.exports 赋值
        modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId))
        module.l = true // 表示已经加载过了
        return module.exports
    }
    __webpack_require__.c = installedModules
    return hotCreateRequire('./src/index.js')('./src/index.js')
})(
{
    "./src/index.js": function (module, exports, __webpack_require__) {
        // 监听 webpackHotUpdate 消息
        __webpack_require__('webpack/hot/dev-server.js')
        // 连接 websocket 服务器，如果服务器发 hash 就保存在 currentHash 里
        // 如果服务器发送 ok，就 emit webpackHotUpdate 事件
        __webpack_require__('webpack-dev-server/client/index.js')
        let input = document.createElement('input')
        document.body.append(input)

        let div = document.createElement('div')
        document.body.append(div)

        let render = () => {
            let title = __webpack_require__('./src/title.js')
            div.innerHTML = title
        }
        render()

        if (module.hot) {
            module.hot.accept(['./src/title.js'], render)
        }
    },
    "./src/title.js": function (module, exports) {
        module.exports = "title"
    },
    "webpack-dev-server/client/index.js": function (module, exports) {
        const socket = window.io('/')
        socket.on('hash', (hash) => {
            console.log(hash)
            currentHash = hash
        })

        socket.on('ok', () => {
            console.info('ok')
            reloadApp()
        })

        function reloadApp () {
            hotEmitter.emit('webpackHotUpdate')
        }
    },
    "webpack/hot/dev-server.js": function (module, exports) {
        hotEmitter.on('webpackHotUpdate', () => {
            // 没有 lastHash 说明就是第一次渲染
            if (!lastHash) { 
                lastHash = currentHash
                console.log('lashHash',lastHash, 'currentHash', currentHash)
                return
            }
            console.log('lashHash2', lastHash, 'currentHash', currentHash)
            // 调用 hot.check 向服务器检查更新并拉取最新的代码
            module.hot.check()
        })
    }
})