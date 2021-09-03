"use strict"


var fs = require('fs');
let qqdata = fs.readFileSync('config.json');
let config = JSON.parse(qqdata);
const qgruop = config.gruop;
const admin = config.admin_qq;
const ip = config.server_ip;
const port = config.port;
const token = config.token;



const account = config.qq;
const conf = {
		platform: 2,
		kickoff: false,
		ignore_self: true,
		resend: true,
		brief: true		
}


const bot = require("oicq").createClient(account,conf)

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

exports.bot = bot;
exports.qgroup = qgruop;
exports.admin = admin;
exports.ip = ip;
exports.port = port;
exports.token = token;

require("./plug-main") 
