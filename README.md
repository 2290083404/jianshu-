# 简书爬虫测试
对网站简书的首页后文章详细页面进行爬虫测试
1：首先对本地要有一个node的开发环境
2：需要用到的包
var cheerio=require('cheerio');
var http=require("http");
var iconv=require("iconv-lite");//对html的dom节点进行处理
var async=require("async");//异步编程的流控制
var mysqlclient=require("./util/MySQLClient.js");//这是我自己封装的mysql
3：开始码代码,创建一个spider.js
首先写一个入口主程序
var url="http://www.jianshu.com/";
main(url);//这里的url就是简书网的首页地址
然后写主程序体

function main(url){
	console.log("开始获取首页的文章列表"); 
	getDom(url,function(titles){
    //通过回调函数去获取文章的详细内容
		titles.forEach(function(n,i){
			var newurl="http://www.jianshu.com"+n.href;
			http.get(newurl, function(sres) {
			  var chunks = [];
			  sres.on('data', function(chunk) {
			    chunks.push(chunk);
			  });
			  // chunks里面存储着网页的 html 内容，将它zhuan ma传给 cheerio.load 之后
			  // 就可以得到一个实现了 jQuery 接口的变量，将它命名为 `$`
			  // 剩下就都是 jQuery 的内容了
			  sres.on('end', function() {
			    var titles = [];
			    //由于咱们发现此网页的编码格式为gb2312，所以需要对其进行转码，否则乱码
			    //依据：“<meta http-equiv="Content-Type" content="text/html; charset=gb2312">”
			    var html = iconv.decode(Buffer.concat(chunks), 'utf-8');
			    $=cheerio.load(html, {decodeEntities: false});   
			    var content=$("div.show-content").html();
			    n.content=content;
			 	//把爬到的数据保存到数据库中去
			 	saveData(n,function(data){
			 		console.log(data);
			 	});
			  });
			});
		});
	});   
}
这个方法就是去获取首页的中文章的列表
function getDom(url,callback){
	http.get(url, function(sres) {
	  var chunks = [];
	  sres.on('data', function(chunk) {
	    chunks.push(chunk);
	  });
	  // chunks里面存储着网页的 html 内容，将它zhuan ma传给 cheerio.load 之后
	  // 就可以得到一个实现了 jQuery 接口的变量，将它命名为 `$`
	  // 剩下就都是 jQuery 的内容了
	  sres.on('end', function() {
	    var titles = [];
	    //由于咱们发现此网页的编码格式为gb2312，所以需要对其进行转码，否则乱码
	    //依据：“<meta http-equiv="Content-Type" content="text/html; charset=gb2312">”
	    var html = iconv.decode(Buffer.concat(chunks), 'utf-8');
	    $=cheerio.load(html, {decodeEntities: false});   
	    $('#list-container').find("ul.note-list").children("li").each(function (i, n) {
	      var $element = $(n);
	      titles.push({
	      	author:{
	      		'avatar':$element.find("div.author").find("a.avatar").find("img").attr("src"),//个人头像
	      		'name':$element.find("div.author").find('div.name').find("a").text(),//作者名称
	      		'time':$element.find("div.author").find('div.name').find("span").attr("data-shared-at")//发表时间
	      	},
	      	href: $element.find("a.title").attr("href"),//文章路径
	        title: $element.find("a.title").text(),//标题
	        abstract: $element.find("p.abstract").text(),//简介
	        tag:$element.find("div.meta").find("a.collection-tag").text(),//标签
	        see:$element.find("div.meta").find("a").eq(1).text(),//浏览人数
	        reply:$element.find("div.meta").find("a").eq(2).text(),//回复人数
	        star:$element.find("div.meta").find("span").eq(0).text(),//喜欢人数
	        money:$element.find("div.meta").find("span").eq(1).text(),//赞赏
	        wrapimg:$element.find("a.wrap-img").html()//需要正则表达式进行提取
	      })
	    })  
	    callback(titles);
	    
	  });
	});
}
//获取的数据保存到数据库中
function saveData(data,callback){
	async.waterfall([
		function(callback){
			var str = data.wrapimg;
			
			if(str){
				var wrapimgarr = str.match(/\/\/upload-images.jianshu.io\S*?"/);
				callback(null, wrapimgarr[0]);
			}else{
				callback(null, str);
			}
			
		},
		function(arg1, callback){
		  // arg1 now equals 'one' and arg2 now equals 'two'
			mysqlObj.exec(
				'insert into info_user (username,avatar) values(?,?)',
				[
					data.author.name,
					data.author.avatar	
				],
				function(err,result){
					if(err){
						callback(null,err);
					}else{
						callback(null,"成功");
					}
				}
			);
		}
	], function (err, result) {
	   // result now equals 'done'
	   console.log(result);
	});
}
