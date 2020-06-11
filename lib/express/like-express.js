const http = require('http');
const slice = Array.prototype.slice;

class LikeExpress {
    constructor() {
        // 存放中间件的列表
        this.routes = {
            all: [],
            get: [],
            post: []
        }
    }

    // 内部要实现的方法：分析第一个参数是不是路由，如果是，则存储路由，且从第二个参数开始转化为数组存入stac
    // 如果不是，则默认路由为'/',且从第一个参数开始转化为数组存入stack
    register(path) {
        const info = {};
        if (typeof path === 'string') {
            info.path = path;
            // 如果path存在，则第一个参数肯定为路由信息，所以从第二个参数开始，转换为数组，存入stack
            info.stack = slice.call(arguments,1); //数组
        } else {
            // 如果info.path不存在，则默认为根目录‘/’
            info.path ='/';
            // 从第一个参数开始，转换为数组，存入stack
            info.stack = slice.call(arguments,0); //数组
        }
        return info
    }
    use() {
        // 将当前函数的所有参数都存入register中
        const info = this.register.apply(this,arguments);
        this.routes.all.push(info)
    }

    get() {
        const info = this.register.apply(this,arguments);
        this.routes.get.push(info)
    }

    post() {
        const info = this.register.apply(this,arguments);
        this.routes.post.push(info)
    }

    match(method,url){
        let stack = []
        if (url === '/favicon.ico'){
            return stack
        }

        // 获取routes
        let curRoutes = [];
        curRoutes = curRoutes.concat(this.routes.all);
        curRoutes = curRoutes.concat(this.routes[method]);

        curRoutes.forEach(routeInfo =>{
            //判断routeInfo.path是不是符合当前url或者url的根路径或者父路径
            if (url.indexOf(routeInfo.path) === 0){
                //例 url === '/api/get-cookie' 且 routeInfo.path === '/'
                //例 url === '/api/get-cookie' 且 routeInfo.path === '/api'
                //例 url === '/api/get-cookie' 且 routeInfo.path === '/api/get-cookie'
                // 把routeInfo.stack放到当前的stack中
                stack = stack.concat(routeInfo.stack)
            }
        });
        return stack;
    }

    // 核心的next机制
    handle(req,res,stack){
        const next = () =>{
            // 拿到第一个匹配的中间件
            const middleware = stack.shift();
            if (middleware){
                // 执行中间件函数
                middleware(req,res,next)
            }
        };
        next();
    }
    callback(){
        return (req,res) => {
            res.json = (data) =>{
                res.setHeader('Content-type', 'application/json');
                res.end(JSON.stringify(data))
            };

            const url = req.url;
            const method = req.method.toLowerCase();

            //通过url和method来区分哪些中间件需要访问，哪些不需要访问
            const resultList = this.match(method,url);
            this.handle(req,res,resultList);
        }
    }
    listen(...args){
        const server = http.createServer(this.callback());
        server.listen(...args);
    }
}


// 工厂函数
module.exports = () =>{
    return new LikeExpress();
};
