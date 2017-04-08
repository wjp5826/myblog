var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite');
var routes = require('./routers');
var pkg = require('./package');
//日志
var winston = require('winston');
var expressWinston = require('express-winston');
var app = express();

//设置模板目录
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//设置静态文件目录
app.use(express.static(path.join(__dirname,'public')));
//session中间件
app.use(session({
	name:config.session.key,//设置cookie中保存sessionid的字段名称
	secret:config.session.secret,//通过设置secret来计算 hash 值并放在 cookie中。使产生的 signedcookie放篡改
	resave:true,
	saveUninitialized:false,//false 强制创建一个session，即使用户未登录
	cookie:{
		maxAge:config.session.maxAge //过期时间，过期后cookie中的session id自动删除
	},
	store:new MongoStore({//将session存储到mongodb
		url:config.mongodb
	})
}));

//处理表单以及文件上传的中间件
app.use(require('express-formidable')({
	uploadDir:path.join(__dirname,'public/img'),//上传文件目录
	keepExtensions:true//保留后缀
}))

//flash中间件
app.use(flash());

//设置模板全局变量
app.locals.blog = {
	title:pkg.name,
	description:pkg.description
}

//设置模板必需的三个变量
app.use(function(req,res,next){
	res.locals.user = req.session.user;
	res.locals.success = req.flash('success').toString();
	res.locals.error = req.flash('error').toString();
	next();
})

//正常请求的日志
app.use(expressWinston.logger({
	transports:[
		new (winston.transports.Console)({
			json:true,
			colorize:true
		}),
		new winston.transports.File({
			filename:'logs/success.log'
		})
	]
}));
//路由
routes(app);
//错误请求的日志
app.use(expressWinston.errorLogger({
	transports:[
		new winston.transports.Console({
			json:true,
			colorize:true
		}),
		new winston.transports.File({
			filename:'logs/error.log'
		})
	]
}))
  
// 监听端口，启动程序
app.listen(config.port, function () {
  console.log(`${pkg.name} listening on port ${config.port}`);
});