const xss = require('xss');
const { exec } = require('../db/mysql');

const getList = (author,keyword) => {
    let sql = `select * from blogs where 1=1 `;
    if (author){
        sql += `and author='${author}' `;
    }
    if (keyword){
        sql += `and title like '%${keyword}%' `
    }
    sql += 'order by createtime desc;';
    return exec(sql)
}
// 博客详情
const getDetail = (id) =>{
    const sql = `select * from blogs where id='${id}'`;
    return exec(sql).then(rows =>{
        return rows[0]
    })
}

// 新建博客
const newBlog = (blogData = {}) => {
    // blogData 是一个博客对象，包含title content author 属性
    const title = xss(blogData.title);
    const content = blogData.content;
    const author = blogData.author;
    const createtime = Date.now();

    const sql = `insert into blogs (title,content,createtime,author) values ('${title}','${content}',${createtime},'${author}')`;
    return exec(sql).then(insertData=>{
        // console.log('insertData id', insertData);
        return {
            id: insertData.insertId
        }
    })
};

// 修改博客
const updateBlog = (id, blogData = {}) => {
    // id就是要更新的博客的id
    // blogData 是一个博客对象，包含title content  属性
    const title = blogData.title;
    const content = blogData.content;
    const sql = `update blogs set title='${title}',content='${content}' where id='${id}'`;
    return exec(sql).then(updateData=>{
        // console.log('updateData is',updateData);
        if (updateData.affectedRows > 0){
            return true
        }
        return false
    })
};

//删除博客
const deleteBlog = (id,author) => {
    // id就是要删除博客的id
    const sql = `delete from blogs where id='${id}' and author='${author}'`;
    return exec(sql).then(deleteData => {
        if (deleteData.affectedRows > 0){
            return true
        }
        return false
    })
}
module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    deleteBlog
}
