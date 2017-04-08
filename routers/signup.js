var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var checkNotLogin = require('./../middlewares/check').checkNotLogin;
var UserModel = require('../models/users');

// get /signup 注册页
router.get('/', checkNotLogin, function(req, res, next) {
    res.render('signup');
});

// post /signup 用户注册
router.post('/', checkNotLogin, function(req, res, next) {
    var name = req.fields.name;
    var gender = req.fields.gender;
    var bio = req.fields.bio;
    var avatar = req.files.avatar.path.split(path.sep).pop();
    var password = req.fields.password;
    var repassword = req.fields.repassword;
    //校验参数
    try {
        if (!(name.length >= 1 && name.length <= 10)) {
            throw new Error('名字请限制在1-10个字符之间')
        }
        if (['m', 'f', 'x'].indexOf(gender) === -1) {
            throw new Error('性别只能是 m . f或x')
        }
        if(!(bio.length >= 1 && bio.length <= 30)){
        	throw new Error('个人简历请限制在1-30个字符')
        }
        if(!req.files.avatar.name){
        	throw new Error('缺少头像');
        }
        if(password.length < 6){
        	throw new Error('密码至少6个字符');
        }
        if(password !== repassword){
        	throw new Error('两次密码输入不一致')
        }
    } catch(e) {
    	//注册失败，异步删除上传的头像
    	fs.unlink(req.files.avatar.path);
    	req.flash('error',e.message);
    	return res.redirect('/signup');
    }
    //明文密码加密
    password = sha1(password);

    //待写入数据库的用户信息
    var user = {
    	name:name,
    	password:password,
    	gender:gender,
    	bio:bio,
    	avatar:avatar
    }

    UserModel.create(user)
    .then(function(result){
    	//此user是插入mongodb后的值
    	user = result.ops[0];
    	//将用户信息存入session
    	delete user.password;
    	req.session.user = user;
    	//写入flash
    	req.flash('success','注册成功');
    	//跳转到首页
    	res.redirect('/posts');
    })
    .catch(function(e){
    	//注册失败
    	fs.unlink(req.files.avatar.path);
    	if(e.message.macth('E11000 duplicate key')){
    		req.flash('error','用户名已被占用');
    		return res.redirect('/signup');
    	}
    	next(e);
    })
});

module.exports = router;
