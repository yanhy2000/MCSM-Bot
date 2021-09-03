"use strict"
const { bot } = require("../index");
const { Server } = require("../lib/Server");
var conf = require("../index");
var http = require('http');

var groupid = conf.qgroup;//传入绑定群号
var admin = conf.admin;//传入机器人管理员
var ip = conf.ip;//传入MCSM面板ip
var port = conf.port;//传入端口
var key = conf.key;
var slist = conf.slist;//服务端列表



//关键函数，用于http访问与回传参数
function httpget(url,callback)
{
	http.get(url,(res)=>{
		var html = "";
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
	})
}

//查询服务器函数
function motd(ip,port)
{
	ser = new Server(ip, port=19132);
	ser.motdbe()
	setTimeout(() => {return ser.serverInfo}, 1000);
}
// {
// 	code: 200,
// 	status: 'online',
// 	ip: 'tr.luoyeling.top',
// 	port: 19132,
// 	motd: '★落叶岭★创造服',
// 	protocol: '448',
// 	version: '1.17.10',
// 	online: '0',
// 	upperLimit: '15',
// 	gamemode: 'Survival',
// 	difficulty: '1',
// 	port_ipv6: '19133',
// 	delay: '131ms'
//   }

//正则匹配函数
function res(pattern,str)
{
	switch(pattern){//带only的代表无需指令后面加参数即可触发默认服务器操作
		case "list":{
			var pat = /^查服\s(.+)$/;
			return pat.test(str);
		};
		case "list-only":{
			var pat = /^查服$/;
			return pat.test(str)
		};
		case "start":{
			var pat = /^开服\s(.+)$/;
			return pat.test(str);
		};
		case "start-only":{
			var pat = /^开服$/;
			return pat.test(str)
		};
		case "stop":{
			var pat = /^关服\s(.+)$/;
			return pat.test(str);
		};
		case "stop-only":{
			var pat = /^关服$/;
			return pat.test(str)
		};
		case "restart":{
			var pat = /^重启服务器\s(.+)$/;
			return pat.test(str);
		};
		case "restart-only":{
			var pat = /^重启服务器$/;
			return pat.test(str)
		};
	}
}

//群聊指令
bot.on("message.group", function (e) {
	var say = e.raw_message;
	var group_id = e.group_id
	var user = e.user_id;
	if(groupid.indexOf(group_id)!=-1)//判断信息来源是否在绑定的群号内
	{
		//查服,无限制请求,GET
		if(res("list",say) || res("list-only",say)){//无需管理员
				let server_name="";
				let out = say.split(' ');
				if(out.length==1)
				{//选取第一个服务端
					server_name = slist[0];
					let url = "http://"+ip+":"+port+"/api/status/"+server_name;
					httpget(url,status=>{
						if((JSON.parse(status)).status==true){
						e.reply("默认服务器"+server_name+"为启动状态！状态码："+(JSON.parse(status)).status)}else{
							e.reply("默认服务器"+server_name+"为关闭状态！状态码："+(JSON.parse(status)).status)}});
				}else if(out.length>=2)
				{//看指定的服务端
					server_name = out[1];
					if(slist.indexOf(server_name)!=-1){
						let url = "http://"+ip+":"+port+"/api/status/"+server_name;
						httpget(url,status=>{
							if((JSON.parse(status)).status==true){
							e.reply("指定服务器"+server_name+"为启动状态！状态码："+(JSON.parse(status)).status)}else{
								e.reply("指定服务器"+server_name+"为关闭状态！状态码："+(JSON.parse(status)).status)}})
					}else{
						e.reply("服务器列表找不到该服务器！")
					}
				}
		}
		
		//开服,10 秒内只能请求一次,GET
		if(res("start",say) || res("start-only",say)){
			if(admin.indexOf(user)!=-1){//管理员
				let server_name="";
				let out = say.split(' ');
				if(out.length==1)
				{//选取第一个服务端
					server_name = slist[0];
					let url = "http://"+ip+":"+port+"/api/start_server/"+server_name+"?apikey="+key;
					httpget(url,status=>{
						if((JSON.parse(status)).status==200){
						e.reply("默认服务器"+server_name+"启动执行成功！状态码："+(JSON.parse(status)).status)}else{
							e.reply("默认服务器"+server_name+"启动执行异常！状态码："+(JSON.parse(status)).status)}});
				}else if(out.length>=2)
				{//看指定的服务端
					server_name = out[1];
					if(slist.indexOf(server_name)!=-1){
						let url = "http://"+ip+":"+port+"/api/start_server/"+server_name+"?apikey="+key;
						httpget(url,status=>{
							if((JSON.parse(status)).status==200){
							e.reply("指定服务器"+server_name+"启动执行成功！状态码："+(JSON.parse(status)).status)}else{
								e.reply("指定服务器"+server_name+"启动执行异常！状态码："+(JSON.parse(status)).status)}})
					}else{
						e.reply("服务器列表找不到该服务器！")
					}
				}
			}else{
				e.reply("本指令仅机器人管理员使用！")
			}
		}


		//关服,1 秒内只能请求一次,GET
		if(res("stop",say) || res("stop-only",say)){
			if(admin.indexOf(user)!=-1){//管理员
				let server_name="";
				let out = say.split(' ');
				if(out.length==1)
				{//选取第一个服务端
					server_name = slist[0];
					let url = "http://"+ip+":"+port+"/api/stop_server/"+server_name+"?apikey="+key;
					httpget(url,status=>{
						if((JSON.parse(status)).status==200){
						e.reply("默认服务器"+server_name+"关闭执行成功！状态码："+(JSON.parse(status)).status)}else{
							e.reply("默认服务器"+server_name+"关闭执行异常！状态码："+(JSON.parse(status)).status)}});
				}else if(out.length>=2)
				{//看指定的服务端
					server_name = out[1];
					if(slist.indexOf(server_name)!=-1){
						let url = "http://"+ip+":"+port+"/api/stop_server/"+server_name+"?apikey="+key;
						httpget(url,status=>{
							console.log((JSON.parse(status)).status);
							if((JSON.parse(status)).status==200){
							e.reply("指定服务器"+server_name+"关闭执行成功！状态码："+(JSON.parse(status)).status)}else{
								e.reply("指定服务器"+server_name+"关闭执行异常！状态码："+(JSON.parse(status)).status)}})
					}else{
						e.reply("服务器列表找不到该服务器！")
					}
				}
			}else{
				e.reply("本指令仅机器人管理员使用！")
			}
		}
		
		//重启服务器,60 秒内只能请求一次,GET
		if(res("restart",say) || res("restart-only",say)){
			if(admin.indexOf(user)!=-1){//管理员
				let server_name="";
				let out = say.split(' ');
				if(out.length==1)
				{//选取第一个服务端
					server_name = slist[0];
					let url = "http://"+ip+":"+port+"/api/restart_server/"+server_name+"?apikey="+key;
					httpget(url,status=>{
						if((JSON.parse(status)).status==200){
						e.reply("默认服务器"+server_name+"重启执行成功！状态码："+(JSON.parse(status)).status)}else{
							e.reply("默认服务器"+server_name+"重启执行异常！状态码："+(JSON.parse(status)).status)}});
				}else if(out.length>=2)
				{//看指定的服务端
					server_name = out[1];
					if(slist.indexOf(server_name)!=-1){
						let url = "http://"+ip+":"+port+"/api/restart_server/"+server_name+"?apikey="+key;
						httpget(url,status=>{
							console.log((JSON.parse(status)).status);
							if((JSON.parse(status)).status==200){
							e.reply("指定服务器"+server_name+"重启执行成功！状态码："+(JSON.parse(status)).status)}else{
								e.reply("指定服务器"+server_name+"重启执行异常！状态码："+(JSON.parse(status)).status)}})
					}else{
						e.reply("服务器列表找不到该服务器！")
					}
				}
			}else{
				e.reply("本指令仅机器人管理员使用！")
			}
		}

}
})
console.log("————plug_user————插件已加载！by.yanhy2000")