const http = require('http')
const config = require('./config')
// 创建http服务
const app = http.createServer(function (req, res) {
  let sreq = http.request({
    host: config.remoteAddress, // 目标主机
    port: config.remotePort, // 目标主机端口号
    path: req.url, // 目标路径
    method: req.method, // 请求方式
    headers: req.headers // 拷贝用户请求的headers
  }, (sres) => {
    // 托管服务器回复转交给用户
    sres.pipe(res)
    sres.on('end', () => {
      console.log(`${req.url} --成功`)
    })
  })
  // 用户请求转交给托管服务器
  req.pipe(sreq)
  sreq.on('error', (e) => {
    console.error(`请求遇到问题: ${e.message}`)
    handleError(res, e)
  })
})

app.listen(5757)

app.on('error', err => {
  console.log(`服务器错误:`, err)
})

function handleError(res, err) {
  res.statusCode = 404
  res.end(err.message)
}