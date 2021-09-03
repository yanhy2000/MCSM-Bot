"use strict"


var fs = require('fs');
let qqdata = fs.readFileSync('config.json');
let config = JSON.parse(qqdata);
const loginway = config.login_qrcode;//登陆方式，默认为为true；（true：扫码登陆，false：密码登陆）
const qgruop = config.gruop;//群号绑定
const admin = config.admin_qq;//机器人管理员
const ip = config.mcsm_ip;//面板ip
const port = config.port;//面板端口
const key = config.key;//面板用户key
const slist = config.server_list;//服务器列表（mcsm服务端名字）
const isadmin = config.mcsm_admin;//是否为面板管理员（true是，false否）
const account = config.qq;//机器人qq号
const password = config.password;

const conf = {//机器人内部配置
		platform: 2,//2：使用安卓pad协议
		kickoff: false,
		ignore_self: true,
		resend: true,
		brief: true		
}
const bot = require("oicq").createClient(account,conf)

if(loginway)//默认扫码登陆
{
	bot.on("system.login.qrcode", function (e) {
		this.logger.mark("扫码后按Enter完成登录") 
		process.stdin.once("data", () => {
			this.login()
		})
	})
	.on("system.login.error", function (e) {
		if (e.code < 0)
			this.login()
	})
	.login()
}
else{//密码登陆
	bot.on("system.login.slider", function (event) {
		this.logger.mark("需要验证滑块登陆！") 
		process.stdin.once("data", (input) => {
		  this.sliderLogin(input);
		});
	  }).on("system.login.device", function (event) {
		this.logger.mark("验证完成后按回车登录") 
		process.stdin.once("data", () => {
		  this.login();
		});
	  }).login(password);
}

function loadPlugins()
{
	exports.bot = bot;//主程序
	exports.qgroup = qgruop;//绑定的群号
	exports.admin = admin;//机器人管理员
	exports.ip = ip;//mcsm的ip
	exports.port = port;//端口
	exports.key = key;//用户key
	exports.slist = slist;//服务端列表
	if(isadmin)
	{
		console.log("配置文件检测用户为MCSM管理员,已解锁高级权限");
		delete require.cache[require.resolve("./plug-admin")];
		setTimeout(function(){require("./plug-admin")},300);
	}
	else{
		console.log("配置文件检测用户为MCSM普通用户,使用普通权限");
		delete require.cache[require.resolve("./plug-user")];
		setTimeout(function(){require("./plug-user")},300);
	}
}
loadPlugins();
bot.on("message.group",function(e){
	if(admin.indexOf(e.user_id)!=-1)
	{
		if(e.raw_message == '/reload'){//WARN!!!本功能未完善，缓存无法清除，会存在重复发言的情况，只能重启机器人解决！
			e.reply( "reloaded!")
			setTimeout(function(){loadPlugins();},300);
		}
		
	}
})






