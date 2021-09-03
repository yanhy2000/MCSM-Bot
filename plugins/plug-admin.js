"use strict"
const { bot } = require("../index")

var conf = require("../index");
var http = require('http');
var groupid = conf.qgroup;
var token = conf.token;
var admin = conf.admin;

var link = "http://" + conf.ip + ":" + conf.port;
var pl = "players";
var ban = "ban";
var user = "users";
var group = "groups"
var world = "world"
var serv = "server"


function httpget(url,callback)
{
	http.get(url,(res)=>{
		var html = "";
		var status = res.statusCode;
		res.on("data",(data)=>{
			html+=data
		})
		res.on("end",()=>{
			if(callback){
				callback(html);
			}
		})
	}).on("error",(e)=>{
		callback(null)
		console.log(`获取数据失败: ${e.message}`)
	})
}


bot.on("message", function (e) {
	if(groupid.indexOf(e.group_id)!=-1)
	{
		// console.log(e)
	}
})
