var config = require('config-lite');
var Mongolass = require('mongolass');
var mongolass = new Mongolass();
var moment = require('moment');
var objectIdToTimestamp = require('objectid-to-timestamp');
mongolass.connect(config.mongodb);
//用户模型
exports.User = mongolass.model('User',{
	name:{type:'string'},
	password:{type:'string'},
	avatar:{type:'string'},
	gender:{type:'string',enum:['m','f','x']},
	bio:{type:'string'}
});

//文章模型
exports.Post = mongolass.model('Post',{
	author:{type:'string'},
	title:{type:'string'},
	content:{type:'string'},
	pv:{type:'number'}
})
exports.Post.index({author:1,_id:-1}).exec();//按创建时间降序查看用户的文章列表
//根据id生成创建时间
mongolass.plugin('addCreateAt',{
	afterFind:function(results){
		results.forEach(function(item){
			item.create_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
		});
		return results;
	},
	afterFindOne:function(result){
		if(result){
			result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
		}
		return result;
	}
});

exports.User.index({name:1},{unique:true}).exec();//根据用户名找到用户，全局唯一