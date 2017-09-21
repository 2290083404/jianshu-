# 简书爬虫测试
对网站简书的首页后文章详细页面进行爬虫测试
1：首先对本地要有一个node的开发环境
2：需要用到的包
var cheerio=require('cheerio');
var http=require("http");
var iconv=require("iconv-lite");//对html的dom节点进行处理
var async=require("async");//异步编程的流控制
var mysqlclient=require("./util/MySQLClient.js");//这是我自己封装的mysql

