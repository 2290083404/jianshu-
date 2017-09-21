/**
 * mysql的帮助工具
 *
 * @author 792793182@qq.com 2016-01-03.
 */

var mysql=require('mysql');
var dbconfig=require("../config/db.js");
var userSql=require("../config/userSqlMapping.js");


function MySQLClient() {
    var connection;

    function connect(callback){
        connection = mysql.createConnection(dbconfig.mysql);

        connection.on('error',function(err){
            console.log(err);
            // 如果是连接断开，自动重新连接
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                connect(callback);
            } else {
                throw err;
            }
        });
    }

    MySQLClient.prototype.exec = function(sql,value,callback) {
        if(connection){
            connection.query(sql,value,callback);
        }else{
            connect(function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log(sql+"执行成功");
                    connection.query(sql,value,callback);
                }
            });
        }
    };
    
    MySQLClient.prototype.end=function(callback){
        if(connection){
            connection.end(callback);
        }else{
            console.log("连接断开");
        }
    }
}

module.exports = MySQLClient;