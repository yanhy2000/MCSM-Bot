"use strict"
const { bot } = require("./index")

var conf = require("./index");
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
		switch(e.raw_message)
		{
			case "test":e.reply("测试！");break;
			case "help":
				{
					//menu
					e.reply("*TerrariaBot*\n\
					/list 在线玩家 /stop *关服\n\
					")
				}

			//全员权限：查询服内玩家数量及在线玩家列表
			case "/list":
				{
					var playerlist = link + "/v2/" +pl+"/list?token="+token;
					httpget(playerlist,url=>{
						if(url!=null)
						{
							let len = JSON.parse(url).players.length;
							let str = "";
							for(let i=0;i<len;i++)
							{
								let players = (JSON.parse(url).players[i]).username;
								str += players;
							}
							e.reply("在线玩家："+len+"\n"+str);
						}
						else
						{
							e.reply("服务器未启动或连接异常！")
						}
					});
				};break;
			//管理员权限：关闭服务器
			case "/stop":
				{
					if(admin.indexOf(e.user_id)!=-1)
					{
						var url = link + "/v3/" + serv + "/rawcmd?token=" + token +"&cmd=/stop";
						httpget(url,html=>{
							if(html!=null)
							{
								let status = JSON.parse(html).status;
								console.log(status);
								if(status==200)
								{
									e.reply("服务器关闭成功！");
								}
								else{
									e.reply("服务器未启动或连接异常！");
								}
							}
						})
					}else
					{
						e.reply("你没有使用指令的权限！")
					}
				};break;
			//管理员权限：开启服务器（todo）
			case "/start":
				{
					if(admin.indexOf(e.user_id)!=-1)
					{
						//
					}
					else
					{
						e.reply("你没有使用指令的权限！")
					}
				}
		}





		// if (e.raw_message === "test")
		// {
		// 	e.reply("测试！")
		// }
		// if (e.raw_message === "查服"&&e.group_id == conf.qgroup)
		// {
		// 	var url = httpget(playerlist);
		// 	let len = JSON.parse(url).players.length;
		// 	let str = "";
		// 	for(let i=0;i<len;i++)
		//     {
		//         let players = (JSON.parse(url).players[i]).username;
		// 		str += players;
		//     }
		// 	e.reply("在线玩家："+str);
		// }
}
})
