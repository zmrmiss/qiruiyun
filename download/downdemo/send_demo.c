#include <stdio.h>
#include <stdlib.h>
#include <curl/curl.h>
#include <string.h>

#define MAX_BUF  65536
#define BASE_URL "http://api.qirui.com:7891/mt"

char * get_sms_url();

char wr_buffer[MAX_BUF+1]; 
int  wr_index = 0; 

int main(void)
{
	//APIKey(用户名)
	char *username = "xxxxxxxxxx";
	//APISecret(密码)
	char *password = "xxxxxxxxxxxxxxxxxxxx";
	//接受短信的手机号
	char *mobile   = "15100000000";
	//短信内容(【签名】+短信内容)，系统提供的测试签名和内容，如需要发送自己的短信内容请在启瑞云平台申请签名和模板
	char *message  = "【启瑞云】您的验证码是:5289";
	
	char *sms_url  = get_sms_url(username, password, mobile, message);
	//printf("%s\n", sms_url);
    send_sms_request(sms_url);
	//打印返回结果
	printf("%s\n", wr_buffer);
	free(sms_url);  
    sms_url = NULL;
	return 0;
}

size_t write_data(void *buffer, size_t size, size_t nmemb, void *userp)
{ 
	int segsize = size * nmemb;
	if (wr_index + segsize > MAX_BUF) { 
		*(int *)userp = 1; 
		return 0; 
	} 
	memcpy((void *)&wr_buffer[wr_index], buffer, (size_t)segsize); 
	wr_index += segsize; 
	wr_buffer[wr_index] = 0;
	return segsize; 
}

int send_sms_request(char *sms_url)
{
	CURL *curl;
    CURLcode res;
    struct curl_slist *headers = NULL;
    headers = curl_slist_append(headers, "Accept: application/json, text/plain, */*"); 
    curl = curl_easy_init();
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_URL, sms_url);
    	curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_data);
    	curl_easy_setopt(curl, CURLOPT_WRITEDATA, NULL);
        res = curl_easy_perform(curl);
        if (res != CURLE_OK) {
            printf("%d\n", res);
        }
		curl_slist_free_all(headers);
		curl_easy_cleanup(curl);
		curl_global_cleanup();
    }
	return res;
}

char* get_sms_url(char *username, char *password, char *mobile, char *message)
{
	char *str  = (char *)malloc(strlen(BASE_URL)+strlen(username)+strlen(password)+strlen(mobile)+strlen(message)+1+37);
	strcpy(str, BASE_URL);
    strcat(str, "?dc=15");
    strcat(str, "&un=");
    strcat(str, username);
    strcat(str, "&pw=");
	strcat(str, password);
	strcat(str, "&da=");
	strcat(str, mobile);
	strcat(str, "&sm=");
	strcat(str, message);
	strcat(str, "&tf=3&rf=2&rd=1");
    return str;
}



//gcc -l curl -o send_demo send_demo.c