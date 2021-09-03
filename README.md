### MCSM-BOT 
目前仍在开发中...
使用[QICQ](https://github.com/takayama-lily/oicq)机器人框架与其插件开发模板

----
### 开发进度

#### 配置文件
添加了`config.json`
自定义Bot的登陆QQ、Bot管理员、指定群、服务器地址端口等

#### 指令帮助
解释前注*的指令需要机器人管理员权限

查服  ——查询`配置文件内服务器列表`第一个服务器的状态信息

查服 xxx  ——查询`名字为xxx`并且同时在`配置文件内服务器列表`中服务器的状态信息

开服  ——*启动`配置文件内服务器列表`第一个服务器

开服 xxx  ——*启动`名字为xxx`并且同时在`配置文件内服务器列表`中的服务器

关服  ——*关闭`配置文件内服务器列表`第一个服务器

关服 xxx  ——*关闭`名字为xxx`并且同时在`配置文件内服务器列表`中的服务器

... ...[todo]

----

**Usage:**

1. 安装 [Node.js](https://nodejs.org/) 14以上版本  
2. clone到本地并执行 `npm i` 安装依赖
3. 根据需求修改`config.json`
    - "qq": 123456,//修改为机器人登陆时的账号
    - "login_qrcode":true,//是否使用扫码登陆，默认true，false的话则密码登陆
    - "password":123456,//密码登陆时填写机器人账号的密码，扫码可以无视
    - "admin_qq":[114514,1919810],//机器人管理员账号列表
    - "gruop": [11444444],//绑定群号，可多群
    - "mcsm_ip":"127.0.0.1",//MCSM面板所在的ip
    - "port":23333,//MCSM面板访问端口
    - "key":"123456780",//面板内用户的`api_key`(重要信息，不要泄露)
    - "mcsm_admin":false,//是否为面板的管理员（解锁高级管理功能，普通用户无法使用）
    - "server_list":["bds","test"]//面板内服务器名称列表，该名称来自面板详情页的`服务端信息`中`名称`
4. 执行 `npm run bot` 启动程序

