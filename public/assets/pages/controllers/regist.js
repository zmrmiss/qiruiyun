/**
 * 注册
 */
var flag = true;
$(function () {
    $('.register-form').show();
    $('.register-form').validate({
        errorElement: 'span', //default input error message container
        errorClass: 'help-block', // default input error message class
        focusInvalid: false, // do not focus the last invalid input
        ignore: "",
        rules: {

            mobile: {
                required: true,
                mobile: true
            },
            password: {
                required: true
            },
            imageCode: {
                required: true
            },
            smsCodes2: {
                required: true
            },
            qq : {
                required: true
            }
            // rePassword: {
            //     equalTo: "#password"
            // },
            // tnc: {
            //     required: true
            // }
        },

        messages: { // custom messages for radio buttons and checkboxes
            mobile: {
                required: '请输入您的手机号.'
            },
            password: {
                required: '请输入您的密码'
            },
            imageCode: {
                required: '请输入您的图形验证码'
            },
            // rePassword: {
            //     required: '请确认密码',
            //     equalTo: '两次密码不一致'
            // },
            smsCodes2: {
                required: '请输入您的手机验证码'
            },
            qq : {
                required: '请输入QQ号'
            }
            // tnc: {
            //     required: "请勾选是否同意协议."
            // }
        },

        invalidHandler: function(event, validator) { //display error alert on form submit

        },

        highlight: function(element) { // hightlight error inputs
            $(element).closest('.form-group').addClass('has-error'); // set error class to the control group
        },

        success: function(label) {
            label.closest('.form-group').removeClass('has-error');
            label.remove();
        },

        errorPlacement: function(error, element) {
            if (element.attr("name") == 'smsCode') {
                error.insertAfter($('#register_smsCode_error'));
            } else if (element.closest('.input-icon').size() === 1) {
                error.insertAfter(element.closest('.input-icon'));
            } else {
                error.insertAfter(element);
            }

            // if (element.attr("name") == "tnc") { // insert checkbox errors after the container
            //     error.insertAfter($('#register_tnc_error'));
            // } else if (element.closest('.input-icon').size() === 1) {
            //     error.insertAfter(element.closest('.input-icon'));
            // } else {
            //     error.insertAfter(element);
            // }
        },

        submitHandler: function(form) {
                // form[0].submit();
            var regex = /^1([3578]\d|4[57])\d{8}$/;
            if (!regex.test($('#mobile').val())) {
                layer.msg('请输入正确的手机号', {time: 1000, icon: 2});
                return false;
            }
            if ($('#smsCode').val()=='') {
                layer.msg('请输入短信验证码', {time: 1000, icon: 2});
                return false;
            }
            if ($("#password").val()=='') {
                layer.msg('请输入密码（8-16位数字英文组合）', {time: 1000, icon: 2});
                return false;
            }

            $('#register-submit-btn').text('请稍候......');
            $('#register-submit-btn').attr('disabled', 'disabled');
            $.ajax({
                type: "POST",
                url: '/api/user/Register/register',
                data:{telephone:$("#mobile").val(), password:$("#password").val(), sms_code: $('#smsCode').val(), qq: $('#qq').val()},
                dataType: "json",
                async: true,
                contentType: "application/x-www-form-urlencoded;charset=utf-8",
                success: function(re){
                    if (re.code == '10001050') {
                        layer.msg('注册成功');
                        ToLogin()
                    } else {
                        layer.msg(re.msg + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;错误代码：" + re.code, {time: 1000, icon:2})
                    }
                    $('#register-submit-btn').text('确认注册');
                    $('#register-submit-btn').removeAttr('disabled');
                }
            });

                //    去登录
            function ToLogin() {
                $.ajax({
                    type: "POST",
                    url: '/api/user/Login/register/',
                    data:{telephone:$("#mobile").val()},
                    dataType: "json",
                    async: true,
                    contentType: "application/x-www-form-urlencoded;charset=utf-8",
                    success: function(re){
                        if (re.code == '10001000') {
                            window.location.href = 'http://sms.qirui.com/admin/index.html';
                        } else if(re.code == '10001011'){
                            window.location.href = 'http://sms.qirui.com';
                        } else {
                            layer.msg(re.msg + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;错误代码：" + re.code, {time: 1000, icon:2})
                        }
                        $('#register-submit-btn').text('确认注册');
                        $('#register-submit-btn').removeAttr('disabled');
                    }
                });
            }



                }

    });

    $('.register-form input').keypress(function(e) {
        if (e.which == 13) {
            if ($('.register-form').validate().form()) {
                // $('.register-form').submit();
            }
            return false;
        }
    });

});

    function checkMobile() {
        var regex = /^1([3578]\d|4[57])\d{8}$/;
        var mobile = $('#mobile').val();
        if (!regex.test(mobile)) {
            flag = false;
            return flag;
        }
        // $.ajax({
        //     type: "POST",
        //     url: "common/mobile/check",
        //     data: JSON.stringify({
        //         mobile: mobile
        //     }),
        //     dataType: "json",
        //     contentType: 'application/json;charset=UTF-8',
        //     success: function (data) {
        //         if (data.code == 200) {
        //             flag = true;
        //             $('#mobileMsg').hide();
        //         } else if (data.code == 3004) {
        //             flag = false;
        //             //                    layer.msg('该手机号已经被注册，请更换手机号', {time: 1000, icon: 2})
        //             $('#mobileMsg').show();
        //             $('#mobileMsg').html('该手机号已经被注册，请更换手机号');
        //         } else {
        //             flag = false;
        //             //                    layer.msg(data.codeInfo + "错误代码：" + data.code, {time: 1000, icon:2})
        //             $('#mobileMsg').show();
        //             $('#mobileMsg').html(data.codeInfo + "错误代码：" + data.code, {time: 1000, icon: 2});
        //         }
        //     }
        // });
    }
    function sendCode() {
        var regex = /^1([3578]\d|4[57])\d{8}$/;
        if (!regex.test($('#mobile').val())) {
            layer.msg('请输入正确的手机号', {time: 1000, icon: 2});
            return false;
        }
        if ($('#imageCode').val()=='') {
            layer.msg('请输入图形验证码', {time: 1000, icon: 2});
            return false;
        }
        // if (!flag) {
        //     return false;
        // }
        $.ajax({
            type: "POST",
            url: '/api/user/Sms/send/',
            data: {telephone:$("#mobile").val(),code: $('#imageCode').val(),type:2},
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=utf-8",
            async: true,
            success: function(re){
                if (re.code == '10001023') {
                    setDisabled(60, $('#sendBtn'));
                    layer.msg('验证码短信已发送，请及时查看', {time: 1000, icon: 1})
                }else if(re.code == '10001003'){
                    layer.msg('图形验证码错误'+  "  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  错误代码：" + re.code, {time: 1000, icon:2})
                } else {
                    layer.msg(re.msg +  "  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  错误代码：" + re.code, {time: 1000, icon:2})
                }
            }
        });
    }

    // 发送倒计时
    function setDisabled(seconds, o) {
        if (seconds <= 0) {
            o.removeAttr("disabled");
            o.html('发送验证码');
        } else {
            o.attr('disabled', true);

            o.html('重新发送 ( ' + (seconds < 10 ? '0': '') + seconds + ' )');
            seconds --;
            setTimeout(function () {
                setDisabled(seconds, o);
            }, 1000);
        }
    }


var browser=navigator.appName;
var b_version=navigator.appVersion;
var version=b_version.split(";");
var trim_Version=version[1].replace(/[ ]/g,"");
if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE6.0")
{
    $('.ps-title').show();
}
else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE7.0")
{
    $('.ps-title').show();
}
else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE8.0")
{
    $('.ps-title').show();
}
else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE9.0")
{
    // alert("IE 9.0");;console.log('4')
}
