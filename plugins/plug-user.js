"use strict"
const { bot } = require("../index");
const { Server } = require("../lib/Server");
var conf = require("../index");
var http = require('http');
var querystring = require('querystring');
var util = require('util');

var groupid = conf.qgroup;//传入绑定群号
var admin = conf.admin;//传入机器人管理员
var ip = conf.ip;//传入MCSM面板ip
var port = conf.port;//传入端口
var key = conf.key;
var slist = conf.slist;//服务端列表

function logger(e){
	console.log("[MCSM-INFO]",e);
}

//GET请求
function httpget(url,callback)
{
	http.get(url,(res)=>{
		let html = "";
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

//POST请求
function httppost(str,path,callback)
{
	const data = JSON.stringify(str);
	const options = {
		hostname: ip,
		port: port,
		path: path,
		method: 'POST',
		headers: {
		'Content-Type': 'application/json',
		'Content-Length': data.length
		}
	}
	const req = http.request(options, res => {
		let html = "";
		res.on('data', d => {
			html+=d;
		});
		res.on("end",()=>{
			if(callback){
				callback(html);
			}
		})
	})
	req.on('error', error => {
		callback(error)
	});
	req.write(data);
	req.end();
}

//motd
function motd(ip,port)
{
	ser = new Server(ip, port=19132);
	ser.motdbe()
	setTimeout(() => {return ser.serverInfo}, 1000);
}


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
		case "cmd":{
			var pat = /\/cmd:(.+)/;
			return pat.test(str);
		};
		case "cmd-only":{
			var pat = /\/cmd\s(.+)/;
			return pat.test(str)
		};
		case "motd":{
			var pat = /\!motd (.+)/;
			return pat.test(str);
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
							e.reply("默认服务器"+server_name+"为关闭状态！状态码："+(JSON.parse(status)).status);logger(status)}});
				}else if(out.length>=2)
				{//看指定的服务端
					server_name = out[1];
					if(slist.indexOf(server_name)!=-1){
						let url = "http://"+ip+":"+port+"/api/status/"+server_name;
						httpget(url,status=>{
							if((JSON.parse(status)).status==true){
							e.reply("指定服务器"+server_name+"为启动状态！状态码："+(JSON.parse(status)).status)}else{
								e.reply("指定服务器"+server_name+"为关闭状态！状态码："+(JSON.parse(status)).status);logger(status)}})
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
							e.reply("默认服务器"+server_name+"启动执行异常！信息："+(JSON.parse(status)).error);logger(status)}});
				}else if(out.length>=2)
				{//看指定的服务端
					server_name = out[1];
					if(slist.indexOf(server_name)!=-1){
						let url = "http://"+ip+":"+port+"/api/start_server/"+server_name+"?apikey="+key;
						httpget(url,status=>{
							if((JSON.parse(status)).status==200){
							e.reply("指定服务器"+server_name+"启动执行成功！状态码："+(JSON.parse(status)).status)}else{
								e.reply("指定服务器"+server_name+"启动执行异常！信息："+(JSON.parse(status)).error);logger(status)}})
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
							e.reply("默认服务器"+server_name+"关闭执行异常！信息："+(JSON.parse(status)).error);logger(status)}});
				}else if(out.length>=2)
				{//看指定的服务端
					server_name = out[1];
					if(slist.indexOf(server_name)!=-1){
						let url = "http://"+ip+":"+port+"/api/stop_server/"+server_name+"?apikey="+key;
						httpget(url,status=>{
							if((JSON.parse(status)).status==200){
							e.reply("指定服务器"+server_name+"关闭执行成功！状态码："+(JSON.parse(status)).status)}else{
								e.reply("指定服务器"+server_name+"关闭执行异常！信息："+(JSON.parse(status)).error);logger(status)}})
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
							e.reply("默认服务器"+server_name+"重启执行异常！信息："+(JSON.parse(status)).error);logger(status)}});
				}else if(out.length>=2)
				{//看指定的服务端
					server_name = out[1];
					if(slist.indexOf(server_name)!=-1){
						let url = "http://"+ip+":"+port+"/api/restart_server/"+server_name+"?apikey="+key;
						httpget(url,status=>{
							if((JSON.parse(status)).status==200){
							e.reply("指定服务器"+server_name+"重启执行成功！状态码："+(JSON.parse(status)).status)}else{
								e.reply("指定服务器"+server_name+"重启执行异常！信息："+(JSON.parse(status)).error);logger(status)}})
					}else{
						e.reply("服务器列表找不到该服务器！")
					}
				}
			}else{
				e.reply("本指令仅机器人管理员使用！")
			}
		}

		//	向服务器发送指令,1 秒内只能请求一次,POST
		if(res("cmd",say) || res("cmd-only",say)){
			if(admin.indexOf(user)!=-1){//管理员
				let server_name="";
				let url = "/api/execute/?apikey="+key;
				let str = "";
				if(res("cmd-only",say))//格式不同，分开处理，先处理单服务端
				{
					let out = say.split(' ');
					let len = out.length;
					
					server_name = slist[0];
					for(let i=1;i<len;i++)
					{
						str = str + out[i] + " ";
					}
					let cmd = {"name":server_name,"command":str}
					httppost(cmd,url,status=>{
						if((JSON.parse(status)).status==200){
							e.reply("指令已成功发送至"+server_name+"! 状态码："+(JSON.parse(status)).status)}else{
							e.reply("指令未发送至"+server_name+"! 信息："+(JSON.parse(status)).error);logger(status)}});
				}else if(res("cmd",say))//处理指定服务端
				{//bdstet whitelist add "ss dfd fgh"
					let rule = /\/cmd:(.+)/;
					let out1 = rule.exec(say)[1];
					let out = out1.split(' ');
					let len = out.length;
					server_name = out[0];
					for(let i=1;i<len;i++)
					{
						str = str + out[i] + " ";
					}
					let cmd = {"name":server_name,"command":str}
					if(slist.indexOf(server_name)!=-1){
						httppost(cmd,url,status=>{
							if((JSON.parse(status)).status==200){
								e.reply("指令已成功发送至"+server_name+"! 状态码："+(JSON.parse(status)).status)}else{
								e.reply("指令未发送至"+server_name+"! 信息："+(JSON.parse(status)).error);logger(status)}});
					}else{
						e.reply("服务器列表找不到该服务器！")
					}
				}
			}else{
				e.reply("本指令仅机器人管理员使用！")
			}
		}

		//motd请求,需要延迟,Function
		// if(res("motd",say)){
		// 	console.log("111")
		// 	if(admin.indexOf(user)!=-1)
		// 	{
		// 		console.log("2");
		// 		let out = say.split(' ');
		// 		let ip = out[1];
		// 		let port = "";
		// 		let len = out.length;
		// 		if(len==3)
		// 		{
		// 			port = out[2];
		// 			let end = motd(ip,port);
		// 			console.log(end)
		// 			e.reply(end)
		// 		}
		// 		else if(len == 2)
		// 		{
		// 			let end = motd(ip,"");
		// 			e.reply(end)
		// 		}

				// port = out[2];
				
				
				
		// 	}
		// 	else{
		// 		e.reply("本指令仅机器人管理员使用！")
		// 	}
		// }

}
})
console.log("————plug_user————插件已加载！by.yanhy2000")