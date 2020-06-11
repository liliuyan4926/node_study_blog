const fs = require('fs');
const path = require('path');
const http = require('http');


// 标准输入输出
// process.stdin.pipe(process.stdout);


const server = http.createServer((req,res)=>{
   // if (req.method === 'POST'){
   //     req.pipe(res)
   // }
    if (req.method === 'GET') {
        const fileName = path.resolve(__dirname,'data.txt');
        const stream = fs.createReadStream(fileName);
        stream.pipe(res);
    }
});
server.listen(8000);

