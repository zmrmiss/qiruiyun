#! /usr/bin/env python2
# encoding:utf-8
# python 2.7

import httplib
import urllib

class SmsDemo:
    apiKey = ""
    apiSecret = ""
    host = "api.qirui.com:7891"

    def __init__(self, apiKey, apiSecret):
        self.apiKey = apiKey
        self.apiSecret = apiSecret
	
    def getRequestUrl(self, mobile, message):
        params = urllib.urlencode({"dc":"15", "un":self.apiKey, "pw":self.apiSecret, "da":mobile , "sm":message, "tf":"3", "rf":"2", "rd":"1"})
        return "/mt?%s" % (params)
	
    def sendMsg(self, mobile, message):
        sendUrl = self.getRequestUrl(mobile, message)
        #print sendUrl
        conn = None
        try:
        	conn = httplib.HTTPConnection(self.host, timeout=5)
        	conn.request("GET", sendUrl)
        	response = conn.getresponse()
        	#print response.status, response.reason
        	data = response.read()
			#打印返回结果
        	print data
        except Exception,e:
        	print e
        finally:
        	if(conn):
        		conn.close()
	

if __name__ == "__main__":
    #APIKey(用户名)
    apiKey = "xxxxxxxxxx"
    #APISecret(密码)
    apiSecret = "xxxxxxxxxxxxxxxxxx"
    #接受短信的手机号
    mobile = "15100000000"
    #短信内容(【签名】+短信内容)，系统提供的测试签名和内容，如需要发送自己的短信内容请在启瑞云平台申请签名和模板
    message = "【启瑞云】您的验证码是:5288"
    sender = SendDemo(apiKey, apiSecret)
    sender.sendMsg(mobile, message)