/**
 * 启瑞云短信发送测试demo
 * @author qiruiyun
 */
 
var request = require('request');
var querystring = require('querystring');

class SendDemo{
	
    constructor(apiKey, apiSecret){
		this.baseUrl = 'http://api.qirui.com:7891/mt';
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
	
	getRequestUrl(mobile, message) {
		let data = {dc:'15', un:this.apiKey, pw:this.apiSecret, da:mobile, sm:message, tf:'3', rf:'2', rd:'1'};
		return this.baseUrl + '?' + querystring.stringify(data);
	}
	
	sendMessage(mobile, message) {
		let smsUrl = this.getRequestUrl(mobile, message);
		//console.log(smsUrl);
		request(smsUrl, function (error, response, body) {
			//打印返回结果
			console.log(body);
		});
	}
	
}

//APIKey(用户名)
var apiKey    = 'xxxxxxxxxx';
//APISecret(密码)
var apiSecret = 'xxxxxxxxxxxxxxxxxxx';
//接受短信的手机号
var mobile    = '15100000000';
//短信内容(【签名】+短信内容)，系统提供的测试签名和内容，如需要发送自己的短信内容请在启瑞云平台申请签名和模板
var message   = '【启瑞云】您的验证码是:3288';


var send = new SendDemo(apiKey, apiSecret);
send.sendMessage(mobile, message);
