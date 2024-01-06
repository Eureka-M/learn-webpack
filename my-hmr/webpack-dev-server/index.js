const webpack = require('webpack')
// 配置对象
const config = require('../webpack.config')
const Server = require('./lib/server/server')

// 编译器对象
const compiler = webpack(config)
const server = new Server(compiler) // Compiler实例

server.listen(9090, 'localhost', () => {
  console.info('启动服务器9090')
})