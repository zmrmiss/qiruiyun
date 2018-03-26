/**
 * 接口短信
 *
 */
angular.module('App').controller('MessageApiCtrl', function($rootScope, $scope, $ajax , $uibModal) {
    $scope.tableDataList=[];
    $scope.tableDataShow=false;
    $scope.currentTab = 'message.hear.report';

    $scope.isActiveTab = function(url) {
        return url === $scope.currentTab;
    };
    $scope.username=0;
    $scope.smsCount = 0;
    $scope.templateCount = 0;
    $scope.signCount = 0;
    $scope.tableData = [];
    $scope.loadList = function() {
        $ajax.post('/api/ordinary/Account/items',{}, function(result) {
            if (result.length!=0){
                $scope.setTab = result;
                if(sessionStorage.getItem("qrname")==null){
                    $scope.username=result[0].username;
                    $rootScope.loadCounts(result[0].username);
                    $rootScope.loadReport(result[0].username);
                }else {
                    $scope.username=sessionStorage.getItem("qrname");
                    $rootScope.loadCounts(sessionStorage.getItem("qrname"));
                    $rootScope.loadReport(sessionStorage.getItem("qrname"));
                }

                $ajax.post('/api/ordinary/Signature/items',$.param({page:1,limit: 10, status:1, username:result[0].username}),function (result) {
                    $scope.tableDataList = result.list;
                    if(result.list!=''){
                        $scope.tableDataShow=true;
                    }else {
                        $scope.tableDataShow=false;
                    }
                });
            }

        });
    };

    $scope.loadList();

    $rootScope.loadCounts = function(username) {
        $scope.username=username;
        $ajax.post('/api/bridge1/Balance/detail',$.param({username:username}), function(result) {
            $scope.smsCount = result;
        });
        $ajax.post('/api/ordinary/Signature/items',$.param({page:1,limit: 10, status:1, username:username}),function (result) {
            // alert(result);
            $scope.tableDataList = result.list;
            if(result.list!=''){
                $scope.tableDataShow=true;
            }else {
                $scope.tableDataShow=false;
            }

        });
    };



    $rootScope.loadReport = function(username) {
        $ajax.post('/api/bridge2/Profile/detail', $.param({username:username}), function(result) {
            if (result.pAxisData) {
                init1(result.xAxisData, result.yAxisData, result.pAxisData);
            } else {
                init2(result.xAxisData, result.yAxisData);
            }
            $scope.tableData = result.data;
        })
    };

    var init1 = function(xData, yData, pData) {
        require.config({
            paths: {
                echarts: '../../public/assets/plugins/echarts/dist'
            }
        });
        require(
            [
                'echarts',
                'echarts/chart/line',
                'echarts/chart/pie'
            ],
            function(e) {
                var myChart = e.init(document.getElementById('sendR'));
                option = {
                    title: {
                        text: '发送统计',
                        subtext: '近30天内的统计数据，不包括今日',
                        textStyle: {
                            fontSize: 14,
                            fontWeight: 'bolder',
                            color: '#333'
                        }
                    },
                    // grid: {
                    //   x:0,
                    //   y:100,
                    //   x2:0,
                    //   y2:100
                    // },
                    tooltip : {
                        trigger: 'axis'
                    },
                    calculable : true,
                    legend: {
                        color: ['red', 'green', 'red', 'yellow'],
                        data:['发送总量','发送成功','发送失败','等待返回', '无效发送']
                    },
                    toolbox: {
                        show : true,
                        feature : {
                            // mark : {show: true},
                            // dataView : {show: true, readOnly: false},
                            // magicType : {show: true, type: ['line', 'bar']},
                            // restore : {show: true},
                            saveAsImage : {show: true}
                        }
                    },
                    xAxis : [
                        {
                            type : 'category',
                            splitLine : {show : false},
                            data : xData
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value',
                            position: 'left'
                        }
                    ],
                    series : [

                        {
                            name:'发送总量',
                            type:'line',
                            data: yData
                        },

                        {
                            name:'状态分析',
                            type:'pie',
                            tooltip : {
                                trigger: 'item',
                                formatter: '{a} <br/>{b} : {c} ({d}%)'
                            },
                            center: [160,130],
                            radius : [0, 50],
                            itemStyle :　{
                                normal : {
                                    labelLine : {
                                        length : 10
                                    }
                                }
                            },
                            data: pData
                        }
                    ]
                };
                myChart.setOption(option);
                window.onresize = myChart.resize;
            }
        );
    };

    var init2 = function(xData, yData) {
        require.config({
            paths: {
                echarts: '../../public/assets/plugins/echarts/dist'
            }
        });
        require(
            [
                'echarts',
                'echarts/chart/line'
            ],
            function(e) {
                var myChart = e.init(document.getElementById('sendR'));
                option = {
                    title: {
                        text: '发送统计',
                        subtext: '近30天内的统计数据，不包括今日',
                        textStyle: {
                            fontSize: 14,
                            fontWeight: 'bolder',
                            color: '#333'
                        }
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    calculable : true,
                    legend: {
                        data:['发送总量']
                    },
                    toolbox: {
                        show : true,
                        feature : {
                            saveAsImage : {show: true}
                        }
                    },
                    xAxis : [
                        {
                            type : 'category',
                            splitLine : {show : false},
                            data : xData
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value',
                            position: 'left'
                        }
                    ],
                    series : [

                        {
                            name:'发送总量',
                            type:'line',
                            data: yData
                        }
                    ]
                };
                myChart.setOption(option);
                window.onresize = myChart.resize;
            }
        );
    };


    // $scope.signs = [];
    // $scope.data = {
    //     sign: {}
    // };
    $scope.code = '';
    $scope.orderNo = '';
    $scope.random = function() {

        $scope.code = '';
        $scope.code2 = '';
        var letters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        var letters2 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        for (var i = 0 ; i < 4; i++) {
            $scope.code += letters[Math.ceil(Math.random() * 9)];
        }
        for (var i = 0 ; i < 4; i++) {
            $scope.code2 += letters[Math.ceil(Math.random() * 9)];
        }
        $scope.orderNo = '';
        for (var i = 0 ; i < 9; i++) {
            $scope.orderNo += letters[Math.ceil(Math.random() * 9)];
        }

        $scope.moneyNo1 = '';
        for (var i = 0 ; i < 2; i++) {
            $scope.moneyNo1 += letters[Math.ceil(Math.random() * 9)];
        }

        $scope.moneyNo2 = '';
        for (var i = 0 ; i < 2; i++) {
            $scope.moneyNo2 += letters[Math.ceil(Math.random() * 9)];
        }
        $scope.getMinutesMin = '';
        for (var i = 0 ; i < 2; i++) {
            $scope.getMinutesMin += letters2[Math.ceil(Math.random() * 9)];
        }
    };
    $scope.random();

    // var contents = [
    //     '',
    //     '您的验证码是：{1}，5分钟有效，为了保证您的隐私，请勿外泄。',
    // '通知订单：您的订单号{1}已通过审核！',
    // '尊敬的用户：你好，欢迎使用本平台，免费试用！我们将竭诚为您服务！回T退订。'
    // ];
    $scope.content = '您的验证码是：{1}，5分钟有效，请勿外泄。'.replace('{1}', $scope.code);
    $rootScope.changeSign='启瑞云';

    $scope.dataList={}
    $rootScope.signLoad = function () {
        var Temp=[
            '【'+$rootScope.changeSign+'】您的验证码是:'+$scope.code+'',
            // '【'+$rootScope.changeSign+'】您尾号'+$scope.code2+'的储蓄卡消费'+$scope.moneyNo1+'.'+$scope.moneyNo2+'元',
            // '【'+$rootScope.changeSign+'】您的快递（单号'+$scope.orderNo+'）已在派件，请保持电话畅通'
            // '【'+$rootScope.changeSign+'】亲爱的小主，您本次骑行已超过'+$scope.getMinutesMin+'分钟，感谢支持，祝您用车愉快！'
        ];
        $scope.dataList.Temps=Temp;
        $scope.dataList.Temp = Temp[0];
        // $select.selected=Temp[0]
    }
    $rootScope.signLoad();

    // $scope.selectSign = function (item) {
    //     $rootScope.Temp =item;
    // }
    // $scope.selectSign(Temp[0]);

    $scope.mobile='';

    $scope.send = function() {
        $('.form-body').validate({
            rules: {
                mobile: {
                    required: true,
                    mobile: true
                }
            },
            messages: {
                mobile: {
                    required: '请填写正确的手机号'
                }
            },
            errorPlacement: function(error, element) {
                if (element.is(':radio') || element.is(':checkbox')) {
                    var eid = element.attr('name');
                    error.appendTo(element.parent());
                } else error.insertAfter(element);
            },
            // wrapper: 'div.error',
            // errorElement: 'span',
            // errorClass:"font-red bordered-red",
            // focusCleanup: true, //被验证的元素获得焦点时移除错误信息
            submitHandler: function() {
                console.log($scope.mobile)

                if($scope.mobile==''){
                    layer.msg('手机号不能为空！', {time: 1000, icon: 2})
                }
                var p = $.param({
                    username:$scope.username,
                    telephone:$scope.mobile,
                    content: $scope.dataList.Temp,
                    origin:1
                });

                $ajax.post('/api/ordinary/Dispatch/run/',p, function() {
                    setDisabled(59, $('#send'));
                    layer.msg('测试短信发送成功，请注意查收！', {time: 1000, icon: 1})
                });
            }
        });
    };
    // 发送倒计时
    var _timeEvent = null;
    function setDisabled(seconds, o) {
        if (seconds <= 0) {
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

    $rootScope.clearTimetwo=function () {
        $scope
        cancelDisabled($('#send'))
    }
    function cancelDisabled(o) {
        clearTimeout(_timeEvent);
        _timeEvent = null;
        o.removeAttr("disabled");
        o.html('发送短信');
    }


    //api开关
    $scope.onChangeStep = function(data) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'setoff.html',
            controller: 'SettingSafeCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        data: angular.copy(data),
                        callback: function() {
                            // $scope.load();
                        }
                    }
                }
            }
        });
    };
    //重置api密码
    $scope.onResetname = function (username) {
        layer.msg("你确认重新生成AccessSecret吗？", {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                $ajax.post('/api/ordinary/Account/reset',$.param({username: username}) , function () {
                    layer.msg('API密码重置成功!', {time: 1000, icon: 1});
                    // $scope.load();
                })
            }
        });

    };



    //显示api密码
    $scope.openShow = function(username) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'showword.html',
            controller: 'ShowSafeCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        username: angular.copy(username),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    };

    //打开重置
    $scope.openRester = function(username) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'rester.html',
            controller: 'ResterSafeCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        username: angular.copy(username),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    };


//    更改签名开关、
    $scope.openSignList = function() {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'signlists.html',
            controller: 'SinglistSafeCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        data: angular.copy($scope.tableDataList),
                        callback: function() {
                            $rootScope.signLoad();
                        }
                    }
                }
            }
        });
    };

    //设置登录信息
    $scope.openSetLoginSize = function(username) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'setLoginSize.html',
            controller: 'setLoginSizeCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        username: angular.copy(username),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    };


});




//修改API账号状态（开启/关闭）
angular.module('App').controller('SettingSafeCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance , data) {
    $scope.data = {
        name:'',
        type:'',
        title:''
    };

    $scope.data.title=data.data.title;
    $scope.data.is_stop=data.data.is_stop;
    $scope.data.name=data.data.username;
    if($scope.data.type==''){
        $scope.data.type=data.data.is_stop;
    }
    $scope.ok = function () {
        if($scope.data.type){

            if ($scope.data.title!=undefined){

                $ajax.post('/api/ordinary/Account/action',$.param({is_stop: $scope.data.type,username:$scope.data.name,title:$scope.data.title}) , function () {
                    layer.msg('账号状态修改成功!', {time: 1000, icon: 1});
                    $rootScope.loadCountsHeader(1);
                    $uibModalInstance.dismiss(0);
                })
            }else {
                layer.msg('请输入API账号名称！', {time: 2000, icon: 2});
            }

        }else {
            layer.msg('请选择修改的状态', {time: 2000, icon: 2});
        }
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };

});

//显示api密码
angular.module('App').controller('ShowSafeCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {
    console.log(data)
    $scope.step = 1;

    $scope.data = {
        username: data.username,
        telephone: '',
        imgcode:''
    };

    $ajax.get('/api/user/Center/basic', {}, function(result) {
        $scope.data.telephone = result.mobile;
    })



    $scope.getCode = function () {
            if($scope.data.imgcode!=''){
                $ajax.post('/api/user/Sms/send', $.param({telephone: $scope.data.telephone,code:$scope.data.imgcode,type:4}), function (result) {
                    layer.msg('验证码短信已发送，请注意查收！', {time: 1500, icon: 1});
                    setDisabled(59, $('#sendCode'));
                });

                // $.ajax({
                //     type: "POST",
                //     url: '//'+domain.user+'/Sms/send',
                //     data:{telephone: $scope.data.telephone,code:$scope.data.imgcode,type:4},
                //     dataType: "json",
                //     async: true,
                //     contentType: "application/x-www-form-urlencoded;charset=utf-8",
                //     success: function(re){
                //         if (re.code == '10000000') {
                //             layer.msg('短信验证码发送成功', {time: 1500, icon: 1});
                //             setDisabled(59, $('#sendCode'));
                //         } else {
                //             layer.msg(re.msg, {time: 2000, icon: 2});
                //         }
                //     }
                // });

            }else {
                layer.msg('请填写图形验证码', {time: 2000, icon: 2});
            }

    };

    $scope.ok = function () {
        if($scope.data.sms_code){

            $ajax.post('/api/ordinary/Account/show', $.param($scope.data), function (result) {
                layer.msg('请查看！', {time: 1500, icon: 1});
                $('#accessSecretCopy').html(result);
                $uibModalInstance.dismiss(0);
            },function (result) {
                setDisabled(0,$('#sendCode'));
                layer.msg(result.msg, {time: 2000, icon: 2});
            })
            // $.ajax({
            //     type: "POST",
            //     url: 'http://api.dev.qirui.com/ordinary/Account/show',
            //     data:$scope.data,
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

        }else {
            layer.msg('请输入验证码', {time: 2000, icon: 2});
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

//重置api密码
angular.module('App').controller('ResterSafeCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {
    $scope.step = 1;

    $scope.data = {
        username: data.username,
        telephone: '',
        imgcode:''
    };

    $ajax.get('/api/user/Center/basic', {}, function(result) {
        $scope.data.telephone = result.mobile;
    })

    $scope.getCode = function () {
        if($scope.data.imgcode!=''){
            $ajax.post('/api/user/Sms/send', $.param({telephone: $scope.data.telephone,code:$scope.data.imgcode,type:5}), function (result) {
                layer.msg('验证码短信已发送，请注意查收！', {time: 1500, icon: 1});

                setDisabled(59, $('#sendCode'));

            });

        }else {
            layer.msg('请填写图形验证码', {time: 2000, icon: 2});
        }


    };

    $scope.ok = function () {
        $ajax.post('/api/ordinary/Account/reset', $.param($scope.data), function (result) {
            layer.msg('重置API密码！', {time: 1500, icon: 1});
            // $scope.data.mobile = $scope.data.newMobile;
            $('#accessSecretCopy').html(result);
            $uibModalInstance.dismiss(0);
        },function (result) {
            setDisabled(0,$('#sendCode'));
            layer.msg(result.msg, {time: 2000, icon: 2});
        })



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


//更改测试签名
angular.module('App').controller('SinglistSafeCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.tableDataSing=data.data;
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
    $scope.params=[];
    $scope.ok =function () {
        if($scope.params.content!=undefined){
            $rootScope.changeSign=$scope.params.content;
            data.callback();
            $uibModalInstance.dismiss(0);
        }else {
            layer.msg('请选择签名', {time: 2000, icon: 2});
        }

        // $rootScope.data.sign=$scope.param.content
    }
});

//设置登录信息
angular.module('App').controller('setLoginSizeCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {
    $scope.data = {
        username: data.username,
        child_mobile: '',
        login_password:''
    };

    $scope.ok = function () {
        console.log($scope.data);
        var regex = /^1([3578]\d|4[57])\d{8}$/;
        if (!regex.test($scope.data.child_mobile)) {
            layer.msg('请输入正确的手机号', {time: 2000, icon: 2});
            return false;
        }
        if($scope.data.login_password.length<8){
            layer.msg('请输入8-16位登录密码', {time: 2500, icon: 2});
            return false;
        }
        $ajax.post('/api/ordinary/Account/setChild', $.param($scope.data), function (result) {
            layer.msg('操作成功！', {time: 1500, icon: 1});
            $uibModalInstance.dismiss(0);
        })
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };

});