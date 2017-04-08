var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/check').checkLogin;

// GET /signout 登出
router.get('/', checkLogin, function(req, res, next) {
	//清空 session 中用户信息
	req.session.user = null;
	req.flash('success','退出成功');
	//退出成功后跳转到首页
	res.redirect('/posts');
});

module.exports = router;