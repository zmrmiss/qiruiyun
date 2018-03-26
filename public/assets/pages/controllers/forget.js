/**
 */

var flag = true;
$(function () {
    $('.forget-form').show();
    $('.forget-form').validate({
        errorElement: 'span', //default input error message container
        errorClass: 'help-block', // default input error message class
        focusInvalid: false, // do not focus the last invalid input
        ignore: "",
        rules: {

            /*mobile: {
                required: true,
                mobile: true
            },*/
            password: {
                required: true
            },
            imageCode: {
                required: true
            },
            smsCode: {
                required: true
            },
            // rePassword: {
            //     equalTo: "#password"
            // }
            // ,
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
            // rePassword: {
            //     required: '请确认密码',
            //     equalTo: '两次密码不一致'
            // },
            smsCode: {
                required: '请输入您的手机验证码'
            },
            // tnc: {
            //     required: "请勾选是否同意协议."
            // },
            imageCode: {
                required: '请输入您的验证码'
            }
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

            if (element.attr("name") == "tnc") { // insert checkbox errors after the container
                error.insertAfter($('#register_tnc_error'));
            } else if (element.closest('.input-icon').size() === 1) {
                error.insertAfter(element.closest('.input-icon'));
            } else {
                error.insertAfter(element);
            }
        },

        submitHandler: function(form) {
                // form[0].submit();
                // if (flag) {

            var regex = /^1([3578]\d|4[57])\d{8}$/;
            /*if (!regex.test($('#mobile').val())) {
                layer.msg('请输入正确的手机号', {time: 1000, icon: 2});
                return false;
            }*/
            if ($('#smsCode').val()=='') {
                layer.msg('请输入短信验证码', {time: 1000, icon: 2});
                return false;
            }
            if ($("#password").val()=='') {
                layer.msg('请输入密码（8-16位数字英文组合）', {time: 1000, icon: 2});
                return false;
            }

                    $('#forget-submit-btn').text('请稍候......');
                    $('#forget-submit-btn').attr('disabled', 'disabled');
                    $.ajax({
                        type: "POST",
                        url: '/api/user/Forget/reset',
                        data: {telephone:$("#mobile").val(),password:$("#password").val(),sms_code: $('#smsCode').val()},
                        dataType: "json",
                        contentType: "application/x-www-form-urlencoded;charset=utf-8",
                        async: true,
                        success: function(re){
                            if (re.code == '10001040') {

                                layer.msg('密码修改成功，点击【确定】按钮跳转到登录页面！', {
                                    time: 0, //不自动关闭
                                    icon: 1,
                                    btn: ['确定'],
                                    yes: function(index){
                                        layer.close(index);
                                        window.location.href = '/sign/login.html';
                                    }
                                });
                            } else {
                                layer.msg(re.msg + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;错误代码：" + re.code, {time: 1000, icon:2})
                            }
                            $('#forget-submit-btn').text('找回密码');
                            $('#forget-submit-btn').removeAttr('disabled');
                        }
                    });
                }
            // }
    });

    $('.forget-form input').keypress(function(e) {
        if (e.which == 13) {
            if ($('.forget-form').validate().form()) {
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
        //             flag = false;
        //             $('#mobileMsg').show();
        //             $('#mobileMsg').html('该手机号码不存在');
        //         } else if (data.code == 3004) {
        //             flag = true;
        //             $('#mobileMsg').hide();
        //         } else {
        //             flag = false;
        //             $('#mobileMsg').show();
        //             $('#mobileMsg').html(data.codeInfo + "错误代码：" + data.code, {time: 1000, icon: 2});
        //         }
        //     }
        // });
    }
    function sendCode() {
        var regex = /^1([3578]\d|4[57])\d{8}$/;
        /*if (!regex.test($('#mobile').val())) {
            layer.msg('请输入正确的手机号', {time: 1000, icon: 2});
            return false;
        }*/
        if ($('#imageCode').val()=='') {
            layer.msg('请输入验证码', {time: 1000, icon: 2});
            return false;
        }
        // if (!flag) {
        //     return false;
        // }
        $.ajax({
            type: "POST",
            url: '/api/user/Sms/send/',
            data:{telephone:$("#mobile").val(), code: $('#imageCode').val(),type:1},
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=utf-8",
            async: true,
            success: function(re){

                if (re.code == '10001023') {
                    setDisabled(60, $('#sendBtn'));
                    layer.msg('验证码短信已发送，请及时查看', {time: 1000, icon: 1})
                } else {
                    layer.msg(re.msg + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;错误代码：" + re.code, {time: 1000, icon:2})
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

