module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.8.227:8899/api', // 设置你调用的接口域名和端口号 别忘了加http
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/temp': {
        target: 'http://192.168.8.227:8899/temp', // 设置你调用的接口域名和端口号 别忘了加http
        changeOrigin: true,
        pathRewrite: {
          '^/temp': ''
        }
      }
    }
  }
}
