package main
 
import (
    "net/http"
    "io/ioutil"
    "fmt"
)
 
func main() {
	//APIKey(用户名)
	apiKey := "xxxxxxxxxx"
	//APISecret(密码)
	apiSecret := "xxxxxxxxxxxxxxxxxxxx"
	//接受短信的手机号
	mobile := "15100000000"
	//短信内容(【签名】+短信内容)(编码utf8)，系统提供的测试签名和内容，如需要发送自己的短信内容请在启瑞云平台申请签名和模板。
	message := "【启瑞云】您的验证码是:5281"
	
	smsUrl := fmt.Sprintf("http://api.qirui.com:7891/mt?dc=15&un=%s&pw=%s&da=%s&sm=%s&tf=3&rf=2&rd=1", apiKey, apiSecret, mobile, message)
    //fmt.Println(smsUrl)
	sendMessage(smsUrl)
}

func sendMessage(smsUrl string) {
    client := &http.Client{}
    reqest, _ := http.NewRequest("GET", smsUrl, nil)
    reqest.Header.Set("Accept","application/json, text/plain, */*")
    response,_ := client.Do(reqest)
    if response.StatusCode == 200 {
        body, _ := ioutil.ReadAll(response.Body)
        bodystr := string(body);
		//打印返回结果
        fmt.Println(bodystr)
    }
}