#!/bin/sh
cd /c/Users/admin/Desktop/数据/vue/nodestudy/blog-1/logs
cp access.log $(date +%Y-%m-%d).access.log
echo "" > access.log
