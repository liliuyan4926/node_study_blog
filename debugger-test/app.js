const http = require('http')
const querystring = require('querystring');

/*
const server = http.createServer((req,res) => {
    console.log(req.method);  //GET
    const url = req.url  //获取请求的完整url
    req.query = querystring.parse(url.split('?')[1]) //解析querystring
    res.end(JSON.stringify(req.query));  //将querystring返回
});
*/
/*
const server = http.createServer((req,res) => {
    if(req.method === 'POST') {
        //数据格式
        console.log('content-type', req.headers['content-type'])
        //接收数据
        let postData = ""
        //随时来了数据，随时触发
        req.on('data',chunk => {
            //chunk本身是二进制格式
            postData += chunk.toString()
        })
        req.on('end',()=>{
            console.log(postData)
            res.end('hello world') //在这里返回，因为是异步
        })
    }
})
*/
const server = http.createServer((req,res) => {
    const method = req.method
    const url = req.url
    const path = url.split('?')[0]
    const query = querystring.parse(url.split('?')[1])

    // 设置返回格式为JSON
    res.setHeader('content-type','application/json')

    //返回的数据
    const resData = {
        method,
        url,
        path,
        query
    }

    //返回
    if(method === 'GET'){
        res.end(JSON.stringify(resData))
    }
    if(method === 'POST'){
        let postData=""
        req.on('data',chunk=>{
            postData += chunk.toString()
        })
        req.on('end', () => {
            resData.postData = postData
            // 返回
            res.end(JSON.stringify(resData))
        })
    }
})

server.listen(8000);
console.log('listening on 8000 port')
