const querystring = require('querystring');
const { get, set } = require('./src/db/redis');
const { access } = require('./src/utils/log');
const handleBlogRouter = require('./src/router/blog');
const handleUserRouter = require('./src/router/user');

// 获取cookie的过期时间
const getCookieExpires = () =>{
    const d = new Date();
    d.setTime(d.getTime() + (24*60*60*1000));
    return d.toGMTString();
}

// session数据
const SESSION_DATA = {};


// 用于处理post data
const getPostData = (req) =>{
    const promise = new Promise((resolve , reject) => {
        if (req.method !=='POST') {
            resolve({});
            return
        }
        if (req.headers['content-type'] !== 'application/json') {
            resolve({});
            return
        }
        let postData = '';
        req.on('data',chunk => {
            // 接收到部分数据
            // console.log('接收到部分数据',chunk.toString());
            postData += chunk.toString()
        });
        req.on('end',()=>{
            // 接收数据完成
            // console.log('接收数据完成',end);
            if (!postData){
                resolve({});
                return
            }
            resolve(JSON.parse(postData))
        })
    });
    return promise
};

const serverHandle = (req,res) =>{
    //写入日志
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`);

    //设置返回格式JSON
    res.setHeader('Content-type','application/json');

    // 获取path
    const url = req.url;
    req.path = url.split('?')[0];

    //解析query
    req.query = querystring.parse(url.split('?')[1]);

    //解析cookie
    req.cookie = {};
    const cookieStr = req.headers.cookie || ''; //k1=v1;k2=v2;k3=v3;
    cookieStr.split(';').forEach(item=>{
        if (!item) return;
        const arr = item.split('=');
        const key = arr[0].trim();
        const val = arr[1].trim();
        req.cookie[key] = val
    });
    console.log('cookie',req.cookie);

    // 解析session
    let needSetCookie = false;
    let userId = req.cookie.userid;
    if (userId) {
        if (!SESSION_DATA[userId]) {
            SESSION_DATA[userId] = {}
        }
    } else {
        needSetCookie = true;
        userId = `${Date.now()}_${Math.random()}`;
        SESSION_DATA[userId] = {}
    }
    req.session = SESSION_DATA[userId];

    // let userId = req.cookie.userid;
    // let needSetCookie = false;
    // if (!userId){
    //     needSetCookie = true;
    //     userId = `${Date.now()}_${Math.random()}`;
    //     set(userId,{});
    //     console.log('进来了');
    // }
    //
    // req.sessionId = userId;
    // get(req.sessionId).then(sessionData =>{
    //     if (sessionData == null) {
    //         // 设置redis的session
    //         set(req.sessionId,{});
    //         // 设置session
    //         req.session = {}
    //     } else {
    //         req.session = sessionData
    //     }
    //     // 处理post数据
    //     return getPostData(req)
    // })
    getPostData(req).then(postData => {
        req.body = postData;
        // 处理blog路由
        // const blogData = handleBlogRouter(req,res);
        // if(blogData){
        //     res.end(JSON.stringify(blogData));
        //     return
        // }
        const blogResult = handleBlogRouter(req,res);
        if (blogResult){
            blogResult.then(blogData =>{
                if (needSetCookie){
                    // httpOnly只允许通过后端修改，防止前端肆意修改cookie造成信息错乱
                    res.setHeader('Set-Cookie', `userid=${userId};path=/;httpOnly;expires=${getCookieExpires()}`);
                }
                res.end(JSON.stringify(blogData))
            });
            return;
        }

        // 处理user路由
        // const userData = handleUserRouter(req,res);
        // if(userData){
        //     res.end(JSON.stringify(userData));
        //     return
        // }
        const userResult = handleUserRouter(req,res);
        if(userResult){
            userResult.then(userData =>{
                if (needSetCookie){
                    // httpOnly只允许通过后端修改，防止前端肆意修改cookie造成信息错乱
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`);
                }
                res.end(JSON.stringify(userData));
            })
            return
        }

        // 未命中路由，返回404
        res.writeHead(404, {"Content-type": "text/plain"});//返回文本格式
        res.write("404 Not Found\n");
        res.end()
    });


}

module.exports = serverHandle;

//process.env.NODE_ENV
