const fs = require('fs');
const path = require('path');


const fileName = path.resolve(__dirname,'data.txt');

// 读取文件内容
fs.readFile(fileName, (err,data) =>{
    if (err) {
        console.error(err);
        return
    }
    // data是二进制类型，需要转换成字符串
    console.log(data.toString())
});


// 写入文件
const content = '这是新写入的内容\n';
const opt = {
    flag: 'a'    // 追加写入，覆盖用'w'
};

fs.writeFile(fileName,content,opt,(err)=>{
    if (err) console.error(err)
});


// 判断文件是否存在
fs.exists(fileName,(exists)=>{
    console.log('exists',exists)
});



//  按照流的方式copy文件

// 两个文件名
const fileName1 = path.resolve(__dirname,'data.txt');
const fileName2 = path.resolve(__dirname,'data-bak.txt');

// 读取文件的stream对象
const readStream = fs.createReadStream(fileName1);
// 写入文件的stream对象
const writeStream = fs.createWriteStream(fileName2);
// 执行拷贝，通过pipe
readStream.pipe(writeStream);

//每次读取的数据
readStream.on('data',chunk=>{
   console.log(chunk.toString())
});
// 数据读取完成，即拷贝完成
readStream.on('end', function () {
    console.log('拷贝完成')
});
