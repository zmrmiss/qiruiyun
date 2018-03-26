/**
 * Created by wangys on 2016/11/13.
 */
$(function () {
    // 手机号
    $.validator.addMethod('mobile', function (value, element) {
        var length = value.length;
        var mobile = /^1([3578]\d|4[57])\d{8}$/;
        return this.optional(element) || (length == 11 && mobile.test(value));
    }, '请填写正确的手机号');

    // 签名验证
    $.validator.addMethod('sign', function (value, element, params) {
        var minLength = params[0];
        var maxLength = params[1];
        var length = value.length;
        if (length > maxLength || length < minLength) {
            return false;
        } else {
            return true;
        }
    }, '签名长度为{0}至{1}个字符');

    // 备注验证
    $.validator.addMethod('remark', function (value, element, params) {
        var minLength = params[0];
        var maxLength = params[1];
        var length = value.length;
        if (length > maxLength || length < minLength) {
            return false;
        } else {
            return true;
        }
    }, '备注长度为{0}至{1}个字符');

    // 密码验证
    $.validator.addMethod('isPassword', function (value, element, params) {
        var minLength = params[0];
        var maxLength = params[1];
        var length = value.length;
        var reg = /^([A-Z]|[a-z]|[0-9]|[@_])*$/;
        if (length > maxLength || length < minLength) {
            return false;
        } else {
            if (reg.test(value)) {
                return true;
            } else {
                return false;
            }
        }
    }, '密码长度为{0}至{1}个字符,且只能包含数字、英文、下划线或\'@\'');

    // IP地址验证
    $.validator.addMethod('ip', function (value, element) {
        var reg = /^((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?),?)*$/;
        if (value == '' || reg.test(value)) {
            return true;
        } else {
            return false;
        }
    }, '请输入有效的IP地址,且多个IP地址使用(,)隔开');


});
