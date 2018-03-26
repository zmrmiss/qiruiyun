/**
 * 个人资料
 *
 */
angular.module('App').controller('AccountInfoCtrl', function($rootScope,$http, $scope, $ajax,$uibModal) {

    $scope.currentTab = 'account.info';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };
    //
    $scope.data = {
        contact1: '',
        contact1_mobile: '',
    };
    // $scope.data={};
    $scope.load = function() {
        $ajax.get('/api/user/Center/basic', $.param({}), function(result) {
            $scope.data = result;
            $rootScope.id= $scope.data.id;
            sessionStorage.setItem("qrId", $scope.data.id);

            if($scope.data.contact == null || $scope.data.contact == undefined){
                $scope.data.contact = '';
            }
            if($scope.data.qq == null || $scope.data.qq == undefined){
                $scope.data.qq = '';
            }
            if($scope.data.wechat == null || $scope.data.wechat == undefined){
                $scope.data.wechat = '';
            }
            if($scope.data.address == null || $scope.data.address == undefined){
                $scope.data.address = '';
            }
            //
            $scope.data.contact1_mobile = result.contact1_mobile == null ? '' : result.contact1_mobile.split(':')[0];
            $scope.data.contact1 = result.contact1 == null ? '' : result.contact1.split(':')[0];
        })
    };
    $scope.load();

    var checkIsPhone = function (val) {
        var reg = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
        return reg.test(val);
    };

    $scope.modify = function() {
        $scope.data.areaId = $scope.getAreaId();
        // console.log($scope.data.province);
        // if($scope.data.province=='' ){
        //     layer.msg('请选择市，县/区', {time: 1000, icon: 2});
        //     return;
        // }


        // debugger;
        //如果填了联系人就要填号码，或者填了号码就要填联系人
        if($scope.data.contact1 || $scope.data.contact1_mobile){
            if(!$scope.data.contact1){
                layer.msg('其他联系人不能为空!', {time: 1500, icon: 2});
                return;
            }
            if(!$scope.data.contact1_mobile){
                layer.msg('其他联系人手机号不能为空!', {time: 1500, icon: 2});
                return;
            }
            if(!checkIsPhone($scope.data.contact1_mobile)){
                layer.msg('其他联系人手机号不正确，请输入正确的手机号!', {time: 1500, icon: 2});
                return;
            }
        }

        if($scope.data.province == null){
            $scope.data.province = '';
        }
        if($scope.data.city == null){
            $scope.data.city = '';
        }
        if($scope.data.district == null){
            $scope.data.district = '';
        }
        var province,city,district;
        if($scope.data.province.value==undefined || $scope.data.province==null){
            province=$scope.data.province;
            city=$scope.data.city;
            district=$scope.data.district;
        }else {
            province=$scope.data.province.value;
            city=$scope.data.city.value;
            district=$scope.data.district.value;
            if (province=='--省--'){
                province='';
            }
            if (city=='--市--'){
                city='';
            }
            if (district=='--县/区--'){
                district='';
            }
        }


        $ajax.post('/api/user/Center/edit',$.param({
            id:$scope.data.id,
            contact:$scope.data.contact,
            qq:$scope.data.qq,
            wechat:$scope.data.wechat,
            province:province,
            city:city,
            district:district,
            address:$scope.data.address,
            contact1:$scope.data.contact1,
            contact1_mobile:$scope.data.contact1_mobile,
            username:$scope.data.username
        }),function () {
            layer.msg('保存成功', {time: 1500, icon: 1});
        })



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
    // $scope.data.province = '';
    // // $scope.data.city = '';
    // $scope.data.province = $scope.data.province;
    // $scope.data.city.value = $scope.data.city;
    // $scope.data.district.value = $scope.data.district;

    $scope.provinceData = [];
    $scope.cityData = [];
    $scope.countyData = [];

    if($scope.data.province==''){
        $scope.provinceData={00:'--省--'}
    }
    if($scope.data.city==''){
        $scope.cityData={00:'--市--'}
    }
    //获取地区数据
    $scope.getAreaCategory = function (param,callback) {
        $http.get("../public/assets/layout/login/js/AreaDatas.json",param).success(
            function (res) {
                var addressData = res;
                callback && callback(addressData[param.level]);
            }
        )
    };




    $scope.getAreaCategory({level:86},function (data) {
        $scope.provinceData = data;
    });
    // 选择省份
    $scope.changeProvince = function () {
        console.log($scope.data.province);
        $scope.getAreaCategory({level:$scope.data.province.key,province:$scope.data.province.value},function (data) {
            $scope.cityData = data;
            $scope.data.city='--市--';
            $scope.data.district='--县/区--';
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
    //选择城市
    $scope.changeCity = function () {

        $scope.getAreaCategory({level:$scope.data.city.key},function (data) {
            console.log(data);
            $scope.data.district='--县/区--';
            if(data!=undefined){
                $scope.countyData = data;
            }else {
                $scope.countyData = {00:'--县/区--'};
            }
        });
    };
    // setTimeout(function () {
    //     if($scope.data.province){
    //         $scope.getAreaCategory({level:86,province:$scope.data.province},function (data) {
    //             $scope.cityData = data;
    //             if($scope.data.city){
    //                 $scope.getAreaCategory({level:120100,province:$scope.data.province,city:$scope.data.city},function (data) {
    //                     $scope.countyData = data;
    //                 });
    //             }
    //         });
    //     }
    // },1000);

});
angular.module('App').controller('MobileSafeCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.step = 1;

    $scope.data = {
        oldMobile: data.mobile,
        newMobile: '',
        imgcode:'',
        id:$rootScope.id
    };

    var checkIsPhone = function (val) {
        var reg = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
        return reg.test(val);
    };
    $scope.getImgCode = function () {
       this.src='/api/user/Captcha/generate/?type=3&+new Date().getTime()'
    }

    $scope.getCode = function () {
        if(checkIsPhone($scope.data.newMobile)){

            if($scope.data.imgcode!=''){
                $ajax.post('/api/user/Sms/send', $.param({telephone: $scope.data.oldMobile,code:$scope.data.imgcode,type:3}), function (result) {
                        layer.msg('验证码短信已发送，请注意查收！', {time: 1500, icon: 1});
                        setDisabled(59, $('#sendCode'));

                });

            }else {
                layer.msg('请填写图形验证码', {time: 2000, icon: 2});
            }

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
                id:$rootScope.id,
                sms_code: $scope.data.code,
                telephone: $scope.data.newMobile
            };


            $ajax.post('/api/user/Center/changeMobile', $.param(param), function (result) {
                    layer.msg('新手机号码更新成功！', {time: 1500, icon: 1});
                    $scope.data.mobile = $scope.data.newMobile;
                    $uibModalInstance.dismiss(0);
            },function (result) {
                setDisabled(0,$('#sendCode'));
                layer.msg(result.msg, {time: 2000, icon: 2});
            })


            // $.ajax({
            //     type: "POST",
            //     url: '//'+domain.user+'/Center/changeMobile',
            //     data:param,
            //     dataType: "json",
            //     async: true,
            //     contentType: "application/x-www-form-urlencoded;charset=utf-8",
            //     success: function(re){
            //         if (re.code == '10000000') {
            //             layer.msg('新手机号码更新成功！', {time: 1500, icon: 1});
            //             $scope.data.mobile = $scope.data.newMobile;
            //             $uibModalInstance.dismiss(0);
            //         } else {
            //             layer.msg(re.msg, {time: 2000, icon: 2});
            //         }
            //     }
            // },function (result) {
            //     setDisabled(0,$('#sendCode'));
            //     layer.msg(result.msg, {time: 2000, icon: 2});
            // });



        //     $ajax.post('customer/safe/update/mobile', param, function (result) {
        //         if (result.code == 200) {
        //             layer.msg('新手机号码更新成功！', {time: 1500, icon: 1});
        //             $scope.data.mobile = $scope.data.newMobile;
        //             $uibModalInstance.dismiss(0);
        //         } else {
        //             layer.msg(result.msg, {time: 2000, icon: 2});
        //         }
        //     },function (result) {
        //         setDisabled(0,$('#sendCode'));
        //         layer.msg(result.msg, {time: 2000, icon: 2});
        //     })
        // }
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
                $ajax.post('/api/user/Center/changeEmail',$.param({email: $scope.data.newEmail,id:$rootScope.id}),function () {
                    layer.msg('邮箱更改成功', {time: 2000, icon: 1});
                    $uibModalInstance.dismiss(0);
                    data.callback();
                })
                // $.ajax({
                //     type: "POST",
                //     url: '/api/user/Center/changeEmail',
                //     data:{email: $scope.data.newEmail,id:$rootScope.id},
                //     dataType: "json",
                //     async: true,
                //     contentType: "application/x-www-form-urlencoded;charset=utf-8",
                //     success: function(re){
                //         if (re.code == '10000000') {
                //
                //         } else {
                //             layer.msg(re.msg, {time: 2000, icon: 2});
                //         }
                //     }
                // });




                // $ajax.post('customer/safe/send/email', {
                //     password: $scope.data.password,
                //     email: $scope.data.newEmail
                // }, function (result) {
                //     if (result.code == 200) {
                //         layer.msg('邮件已成功发送至您的邮件，请注意查收!', {time: 2000, icon: 1});
                //         $uibModalInstance.dismiss(0);
                //         data.callback();
                //     } else {
                //         layer.msg(result.codeInfo, {time: 2000, icon: 2});
                //     }
                // });
            }
        });

    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };

});