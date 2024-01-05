/**
 * 实现客户端和服务端通信
 * 向入口文件中注入两个文件
 */

const path = require('path')

function updateCompiler(compiler) {
    const config = compiler.options
    config.entry = {
        main: [
            path.resolve(__dirname, '../../client/index.js'),
            path.resolve(__dirname, '../../../webpack/hot/dev-server.js'),
            config.entry
        ]
    }
}

module.exports = updateCompiler