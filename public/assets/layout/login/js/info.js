/**
 * 个人资料
 *
 */
angular.module('App').controller('AccountInfoCtrl', function($rootScope, $scope, $ajax,$uibModal) {

    $scope.currentTab = 'account.info';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.data = {
        contact1Name: '',
        contact1Mobile: '',
        contact2Name: '',
        contact2Mobile: ''
    };

    $scope.load = function() {
        $ajax.post('customer/basic/info', {}, function(result) {
            $scope.data = result;

            if($scope.data.name == 'null' || $scope.data.name == 'undefined'){
                $scope.data.name = '';
            }
            if($scope.data.contact == 'null' || $scope.data.contact == 'undefined'){
                $scope.data.contact = '';
            }
            if($scope.data.qq == 'null' || $scope.data.qq == 'undefined'){
                $scope.data.qq = '';
            }
            if($scope.data.wechat == 'null' || $scope.data.wechat == 'undefined'){
                $scope.data.wechat = '';
            }
            if($scope.data.address == 'null' || $scope.data.address == 'undefined'){
                $scope.data.address = '';
            }

            $scope.data.contact1Name = result.contact1 == null ? '' : result.contact1.split(':')[0];
            $scope.data.contact1Mobile = result.contact1 == null ? '' : result.contact1.split(':')[1];
            $scope.data.contact2Name = result.contact2 == null ? '' : result.contact2.split(':')[0];
            $scope.data.contact2Mobile = result.contact2 == null ? '' : result.contact2.split(':')[1];
        })
    };
    $scope.load();

    var checkIsPhone = function (val) {
        var reg = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
        return reg.test(val);
    };

    $scope.modify = function() {
        $scope.data.areaId = $scope.getAreaId();
        if($scope.data.province
            && $scope.data.province != '0'
            && !$scope.data.areaId){
            layer.msg('请选择市，县/区', {time: 1000, icon: 2});
            return;
        }

        // debugger;
        //如果填了联系人就要填号码，或者填了号码就要填联系人
        if($scope.data.contact1Name || $scope.data.contact1Mobile){
            if(!$scope.data.contact1Name){
                layer.msg('第一联系人不能为空!', {time: 1500, icon: 2});
                return;
            }
            if(!$scope.data.contact1Mobile){
                layer.msg('第一联系人手机号不能为空!', {time: 1500, icon: 2});
                return;
            }
            if(!checkIsPhone($scope.data.contact1Mobile)){
                layer.msg('第一联系人手机号不正确，请输入正确的手机号!', {time: 1500, icon: 2});
                return;
            }
        }
        if($scope.data.contact2Name || $scope.data.contact2Mobile){
            if(!$scope.data.contact2Name){
                layer.msg('第二联系人不能为空!', {time: 1500, icon: 2});
                return;
            }
            if(!$scope.data.contact2Mobile){
                layer.msg('第二联系人手机号不能为空!', {time: 1500, icon: 2});
                return;
            }
            if(!checkIsPhone($scope.data.contact2Mobile)){
                layer.msg('第二联系人手机号不正确，请输入正确的手机号!', {time: 1500, icon: 2});
                return;
            }
        }
        // var url = 'customer/basic/info/add';
        // if ($scope.data.id) {
        //     url = 'customer/basic/info/update';
        // };
        layer.msg('你确定修改基本信息吗？', {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                $ajax.post('customer/basic/info/update', {
                    id: $scope.data.id,
                    customerId: $scope.data.customerId,
                    areaId:$scope.data.areaId,
                    name: $scope.data.name,
                    qq: $scope.data.qq,
                    contact: $scope.data.contact,
                    wechat: $scope.data.wechat,
                    address: $scope.data.address,
                    contact1: $scope.data.contact1Name + ":" + $scope.data.contact1Mobile,
                    contact2: $scope.data.contact2Name + ":" + $scope.data.contact2Mobile
                }, function () {
                    layer.msg('修改成功!', {time: 1000, icon: 1});
                });
            }
        });
    }
    $scope.openMobile = function(mobile) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'mobile.html',
            controller: 'MobileSafeCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        mobile: angular.copy(mobile),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    };

    $scope.openEmail = function(email) {

        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'email.html',
            controller: 'EmailSafeCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        email: angular.copy(email),
                        callback: function() {
                            console.log("1111="+JSON.stringify($scope.data) + "  " + email);
                            $scope.load();
                        }
                    }
                }
            }
        });
    };


    //==============地区初始化==============
    $scope.data.province = $scope.data.areaProvince;
    $scope.data.city = $scope.data.areaCity;
    $scope.data.county = $scope.data.areaCounty;
    $scope.provinceData = [];
    $scope.cityData = [];
    $scope.countyData = [];

    //获取地区数据
    $scope.getAreaCategory = function (param,callback) {
        $ajax.get("getAreaCategory",param, function(result) {
            callback && callback(result);
        });
    };

    $scope.getAreaCategory({level:1},function (data) {
        $scope.provinceData = data;
    });
    //选择省份
    $scope.changeProvince = function () {
        $scope.getAreaCategory({level:2,province:$scope.data.province},function (data) {
            $scope.cityData = data;
            $scope.cityData.unshift({"name":"--市--","city":0,"code":"","level":2});
            $scope.data.city = $scope.cityData[0].city;
            $scope.countyData = [];
            $scope.countyData.unshift({"name":"--县/区--","county":0,"code":"","level":3});
            $scope.data.county = $scope.countyData[0].county;
        });
    };
    //选择城市
    $scope.changeCity = function () {
        $scope.getAreaCategory({level:3,province:$scope.data.province,city:$scope.data.city},function (data) {
            $scope.countyData = data;
            $scope.countyData.unshift({"name":"--县/区--","county":0,"code":"","level":3});
            $scope.data.county = $scope.countyData[0].county;
        });
    };

    $scope.getAreaId = function () {
        if($scope.data.county && $scope.data.county != '0'){
            for(var i=0;i<$scope.countyData.length;i++){
                if($scope.countyData[i].county == $scope.data.county){
                    return $scope.countyData[i].id;
                }
            }
        }
        return null;
    };

    setTimeout(function () {
        if($scope.data.province){
            $scope.getAreaCategory({level:2,province:$scope.data.province},function (data) {
                $scope.cityData = data;
                if($scope.data.city){
                    $scope.getAreaCategory({level:3,province:$scope.data.province,city:$scope.data.city},function (data) {
                        $scope.countyData = data;
                    });
                }
            });
        }
    },1000);
});
angular.module('App').controller('MobileSafeCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.step = 1;

    $scope.data = {
        oldMobile: data.mobile,
        newMobile: ''
    };

    var checkIsPhone = function (val) {
        var reg = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
        return reg.test(val);
    };

    $scope.getCode = function () {
        if(checkIsPhone($scope.data.newMobile)){
            $ajax.post('customer/safe/code', {
                newMobile: $scope.data.newMobile
            }, function (result) {
                if (result.code == 200) {
                    layer.msg('验证码短信已发送，请注意查收！', {time: 1500, icon: 1});
                    setDisabled(59, $('#sendCode'));
                } else {
                    layer.msg(result.codeInfo, {time: 2000, icon: 2});
                }
            });
        }else {
            layer.msg('请填写正确的手机号', {time: 2000, icon: 2});
        }
    };

    $scope.ok = function () {
        if(checkIsPhone($scope.data.newMobile)){
            if($scope.data.oldMobile == $scope.data.newMobile){
                layer.msg('与原号码重复！', {time: 1500, icon: 2});
                return;
            }
            var param = {
                code: $scope.data.code,
                newMobile: $scope.data.newMobile
            };
            $ajax.post('customer/safe/update/mobile', param, function (result) {
                if (result.code == 200) {
                    layer.msg('新手机号码更新成功！', {time: 1500, icon: 1});
                    $scope.data.mobile = $scope.data.newMobile;
                    $uibModalInstance.dismiss(0);
                } else {
                    layer.msg(result.codeInfo, {time: 2000, icon: 2});
                }
            },function (result) {
                setDisabled(0,$('#sendCode'));
                layer.msg(result.codeInfo, {time: 2000, icon: 2});
            })
        }else {
            layer.msg('请填写正确的手机号', {time: 2000, icon: 2});
        }
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };

    // 发送倒计时
    var _timeEvent = null;
    function setDisabled(seconds, o) {
        if (seconds <= 0) {
            clearTimeout(_timeEvent);
            o.removeAttr("disabled");
            o.html('发送短信');
        } else {
            o.attr('disabled', true);

            o.html('重新发送 ( ' + (seconds < 10 ? '0': '') + seconds + ' )');
            seconds --;
            _timeEvent = setTimeout(function () {
                setDisabled(seconds, o);
            }, 1000);
        }
    }
});
angular.module('App').controller('EmailSafeCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.data = {
        oldEmail: data.email,
        email: data.email,
        newEmail: ''
    };
    $scope.ok = function () {
        if($scope.data.newEmail == $scope.data.email){
            layer.msg('与原邮箱重复！', {time: 1500, icon: 2});
            return;
        }
        $('#emailForm').validate({
            rules: {
                newEmail: {
                    required: true,
                    email: true
                },
                password: {
                    required: true
                }
            },
            messages: {
                newEmail: {
                    required: '请填写正确的邮箱'
                },
                password: {
                    required: '请输入登录密码'
                }
            },
            errorPlacement: function(error, element) {
                // if (element.is(':radio') || element.is(':checkbox')) {
                //     var eid = element.attr('name');
                //     error.appendTo(element.parent());
                // } else {
                error.appendTo(element.parent());
                // }
            },
            // errorElement: 'span',
            // debug: true,
            submitHandler: function() {
                $ajax.post('customer/safe/send/email', {
                    password: $scope.data.password,
                    email: $scope.data.newEmail
                }, function (result) {
                    if (result.code == 200) {
                        layer.msg('邮件已成功发送至您的邮件，请注意查收!', {time: 2000, icon: 1});
                        $uibModalInstance.dismiss(0);
                        data.callback();
                    } else {
                        layer.msg(result.codeInfo, {time: 2000, icon: 2});
                    }
                });
            }
        });

    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };

});