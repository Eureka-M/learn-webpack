const express = require('express')
const http = require('http')
// 用硬盘文件系统替换内存文件系统，方便查看真是文件
// const memoryFs = require('memory-fs')
const fs = require('fs-extra')

const path = require('path')
const mime = require('mime')
const socketIo = require('socket.io')

const updateCompiler = require('../utils/updateCompiler')
fs.join = path.join



class Server {
    constructor(compiler) {
        this.compiler = compiler
        updateCompiler(compiler)

        this.setupApp()
        // 当前 hash 值，每次编译都会产生
        this.currentHash
        // 存放着所有的通过的 websocket 连接到服务器的客户端
        this.clientSocketList = []
        this.setupHooks()

        this.setupDevMiddleware()
        // 先配置路由 再启动服务
        this.routes()
        this.createServer()

        // 创建 socket 服务器
        this.createSocketServer()
    }

    setupApp() {
        this.app = express()
        // this.app 是一个路由中间件
        // app.listen 不需要 http.createServer 这里是因为要拿到 server 实例 
    }

    createServer() {
        this.server = http.createServer(this.app)
    }

    listen(port, host, callback) {
        this.server.listen(port, host, callback)
    }

    setupHooks() {
        let { compiler } = this
        // 监听编译完成事件
        compiler.hooks.done.tap('webpack-dev-server', (stats) => {
            // stats 是一个描述对象，里面存放着 hash chunkHash contentHash 等
            this.currentHash = stats.hash
            
            // 向所有客户端进行广播，告知客户端已经编译成功，可以拉取新代码
            this.clientSocketList.forEach(socket => {
                socket.emit('hash', this.currentHash)
                socket.emit('ok')
            })
        })
    }

    setupDevMiddleware() {
        this.middleware = this.webpackDevMiddleware()
    }

    webpackDevMiddleware() {
        let { compiler } = this
        // 以监听模式启动，如果文件发生变更，会重新编译
        compiler.watch({}, () => {
            console.log('监听模式编译成功')
        })
        // new 一个 内存文件系统实例（更快）
        //let fs = new memoryFS()
        // 打包后的文件写入内存文件系统，读也从内存读
        this.fs = compiler.outputFileSystem = fs

        // 返回一个中间件，用来响应客户端对产出文件的请求 index.html main.js .json 
        // staticDir 静态文件根目录 其实就是输出目录
        return (staticDir) => {
            return (req, res, next) => {
                // 拿到请求路径
                let { url } = req

                if (url == '/favicon.ico') {
                    return res.sendStatus(404)
                }
                url === '/' ? url = '/index.html' : null
                // 得到要访问的静态路径 /index.html /main.js
                let filePath = path.join(staticDir, url)
                console.info('filePath', filePath) 
                try {
                    // 返回此文件路径上的文件描述对象，如果文件不存在，抛出异常
                    let statObj = this.fs.statSync(filePath)
                    //console.info('statObj', statObj)
                    console.log(statObj.isFile())
                    if (statObj.isFile()) {
                        // 读取文件内容
                        let content = this.fs.readFileSync(filePath)
                        console.log(filePath)
                        // 设置相应头告诉浏览器此文件内容
                        console.log(mime.getType)
                        res.setHeader('Content-Type', mime.getType(filePath))
                        // 发送内容给浏览器
                        res.send(content)
                        console.log('....')
                    } else {
                        return res.sendStatus(404)
                    }
                } catch (err) {
                    console.log(err)
                    return res.sendStatus(404)
                }
            }
        }
    }

    routes() {
        let { compiler } = this
        let config = compiler.options
        this.app.use(this.middleware(config.output.path))
    }

    createSocketServer() {
        // websocket 握手依赖于 http 服务器
        const io = socketIo(this.server)
        // 服务器监听客户端的连接，当客户端连接上来后，socket 代表跟这个客户端连接对象
        io.on('connection', (socket) => {
            console.log('客户端连接成功～')
            this.clientSocketList.push(socket)
            socket.emit('hash', this.currentHash)
            socket.emit('ok')

            socket.on('disconnect', () => {
                let index = this.clientSocketList.indexOf(socket)
                this.clientSocketList.splice(index, 1)
            })
        })
    }
}

module.exports = Server