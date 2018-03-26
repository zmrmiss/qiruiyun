 /**
 * 修改密码
 *
 */
angular.module('App').controller('AccountPwdCtrl', function($rootScope, $scope, $ajax) {

    $scope.currentTab = 'account.pwd';

    $ajax.get('/api/user/Center/basic', $.param({}), function(result) {
        $scope.data = result;
        $rootScope.id= $scope.data.id;
        sessionStorage.setItem("qrId", $scope.data.id);
    })

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    //判断输入密码的类型
    function CharMode(iN){
        if (iN>=48 && iN <=57) //数字
            return 1;
        if (iN>=65 && iN <=90) //大写
            return 2;
        if (iN>=97 && iN <=122) //小写
            return 4;
        else
            return 8;
    }
    //bitTotal函数
    //计算密码模式
    function bitTotal(num){
        var modes=0;
        for (i=0;i<4;i++){
            if (num & 1) modes++;
            num>>>=1;
        }
        return modes;
    }
    //返回强度级别
    function checkStrong(sPW){
        if (sPW.length<6)
            return 0; //密码太短，不检测级别
        var Modes=0;
        for (i=0;i<sPW.length;i++){
            //密码模式
            Modes|=CharMode(sPW.charCodeAt(i));
        }
        return bitTotal(Modes);
    }

    //显示颜色
    $scope._strongLevel = 0;
    $scope.pwStrength = function() {
        var pwd = $scope.data.newPassword;
        var level =checkStrong(pwd);
        console.log("strongLevel:"+level);
        $scope._strongLevel = level;
    }

    $scope.modify = function() {

        $('.form-horizontal').validate({
            rules: {
                password: {
                    required: true
                },
                newPassword: {
                    required: true,
                    isPassword: [6, 20]
                },
                rePassword: {
                    equalTo: '#newPassword'
                }
            },
            messages: {
                password: {
                    required: '请输入原密码'
                },
                newPassword: {
                    required: '请输入新密码'
                },
                rePassword: {
                    required: '请输入确认密码',
                    equalTo: "两次输入密码不一致"
                }
            },
            errorPlacement: function(error, element) {
                error.appendTo(element.parent());
            },
            // wrapper: 'div.error',
            // errorElement: 'span',
            // errorClass:"font-red bordered-red",
            // focusCleanup: true, //被验证的元素获得焦点时移除错误信息
            submitHandler: function() {

                layer.msg('你确定修改密码吗？', {
                    time: 0, //不自动关闭
                    icon: 0,
                    btn: ['确定', '取消'],
                    yes: function(index){
                        layer.close(index);
                        var id= $rootScope.id;
                        if (id==undefined){
                            id = sessionStorage.getItem("qrId");
                        }

                        $ajax.post('/api/user/Center/changePasswd',$.param({old_password: $scope.data.password,password: $scope.data.newPassword,id: id}),function () {
                            layer.msg('密码修改成功', {time: 1500, icon: 1});
                        })

                        // $.ajax({
                        //     type: "POST",
                        //     url: '/api/user/Center/changePasswd',
                        //     data: {old_password: $scope.data.password,password: $scope.data.newPassword,id: id},
                        //     dataType: "json",
                        //     async: true,
                        //     contentType: "application/x-www-form-urlencoded;charset=utf-8",
                        //     success: function(re){
                        //         if (re.code == '10000000') {
                        //             layer.msg('密码修改成功', {time: 1500, icon: 1});
                        //             // setDisabled(59, $('#sendCode'));
                        //         } else {
                        //             layer.msg(re.msg, {time: 2000, icon: 2});
                        //         }
                        //     }
                        // });
                    }
                });
            }
        });
    }
});
