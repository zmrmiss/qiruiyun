/**
 * 接口短信
 *
 */
angular.module('App').controller('MessageSetupCtrl', function($rootScope, $stateParams,$scope, $ajax,$uibModal) {
    $scope.currentTab = 'message.hear.setup';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };
    var username=$rootScope.username;

    if(username==undefined){
        username= sessionStorage.getItem("qrname");
    }

    var remind=$rootScope.remind;
    if(remind==undefined){
        remind= sessionStorage.getItem("remind");
    }



    //ip白名单
    $scope.params={
        name:'',
        form:''
    }
    $scope.datastatus=true;
    $scope.hasvip=true;
    $scope.data = {};
    $scope.data2= {}
    $scope.load = function() {
        //数据推送、
        $ajax.post('/api/ordinary/DataPush/detail', $.param({username:username}), function(result) {
            // console.log(result)
            if( result != null){
                if(result.type==1){
                    $rootScope.AuditingData = [
                        {name:"客户通过接口主动获取",status:1},
                        {name:"系统推送数据到客户URL",status:2}
                    ];
                    $scope.params.form=$scope.AuditingData[0];
                    $scope.data=result;
                    $scope.hasvip=true;
                    $scope.datastatus=true;
                }else if(result.type==2){
                    // $scope.params.form='系统推送数据到客户URL';
                    // $scope.params.name='系统推送数据到客户URL';
                    // $scope.name='系统推送数据到客户URL';
                    $rootScope.AuditingData = [
                        {name:"系统推送数据到客户URL",status:2},
                        {name:"客户通过接口主动获取",status:1}
                        ];
                    $scope.params.form=$scope.AuditingData[0];
                    // layer.msg('设置成功!', {time: 1000, icon: 1});
                    if (result.status==0){
                        $scope.datastatus=false;
                    }
                    $scope.data=result;
                    $scope.hasurl=true;
                    $scope.hasvip=false;
                }
            }else {
                $scope.datastatus=true;
                $rootScope.AuditingData = [
                    {name:"客户通过接口主动获取",status:1},
                    {name:"系统推送数据到客户URL",status:2}
                ];
            }

        })
        $ajax.post('/api/ordinary/Whitelist/status', $.param({username:username}), function(result) {
            // console.log(result);
            if(result.is_stop==0){
                $scope.hasSetoff=true;
                $scope.data2 = result;
            }

        })
    };
    $scope.load();
    $scope.modify = function() {
        if($scope.hasSetoff==true){
            $scope.data2.is_stop=0;
        }else {
            $scope.data2.is_stop=1
        }
        $('.form-horizontal').validate({
            rules: {
                ip: {
                    ip: true
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

                var url ='/api/ordinary/Whitelist/edit';
                var data={username:username,ip_content:$scope.data2.ip_content,is_stop:$scope.data2.is_stop};
                layer.msg('你确定修改IP白名单吗？', {
                    time: 0, //不自动关闭
                    icon: 0,
                    btn: ['确定', '取消'],
                    yes: function(index){
                        layer.close(index);
                        $ajax.post(url, $.param(data), function (result) {
                            layer.msg('修改成功!', {time: 1000, icon: 1});
                        });
                    }
                });
            }
        });

    }


    //短信不足预警
    if(remind==0){
        $scope.dxtype=false;
    }else if(remind==1){
        $scope.dxtype=true;
    }

    $scope.loadDuanxing=function () {
        var remind;
        if($scope.dxtype==true){
            remind=1;
        }else {
            remind=0;
        }
        // sessionStorage.setItem("remind", remind);
        $ajax.post('/api/ordinary/Account/remind', $.param({username:username,remind:remind}), function(result) {
            layer.msg('设置成功!', {time: 1000, icon: 1});
        })
    }






    $scope.sjpt=function () {
        // alert($scope.params.form)
        if($scope.params.form==1){
            //客户通过接口主动获取
            $scope.hasvip=true;
            $scope.hasurl=false;
        }else if($scope.params.form==2){
            //系统推送数据到客户URL
            $scope.hasurl=true;
            $scope.hasvip=false;
        }else if($scope.params.form==''){
            $scope.hasvip=false;
            $scope.hasurl=false;
        }
    }
    $scope.data={}
    ////客户通过接口主动获取
    $scope.Datapush2=function () {
        $ajax.post('/api/ordinary/DataPush/edit', $.param({username:username,type:1,status_report:'',
            sms_upload:''}), function(result) {
            layer.msg('设置成功!', {time: 1000, icon: 1});
            $scope.load();
            // if(result.type==1){
            //     $scope.hasvip=true;
            // }else if(result.type=2){
            //     $scope.hasurl=true;
            // }
        })
    }

    //系统推送数据到客户URL
    $scope.Datapush1=function () {
        $ajax.post('/api/ordinary/DataPush/edit', $.param({
            username:username,
            type:2,
            status_report:$scope.data.status_report,
            sms_upload:$scope.data.sms_upload
        }), function(result) {
            layer.msg('设置成功!', {time: 1000, icon: 1});
            $scope.load();
            // if(result.type==1){
            //     $scope.hasvip=true;
            // }else if(result.type=2){
            //     $scope.hasurl=true;
            // }
        })
    }

});



//黑名单
angular.module('App').controller('MessagePlatBlackEditCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.data = data.item;
    var s = '新增';
    var url = '/api/ordinary/Blacklist/add';
    if ($scope.data) {
        $scope.data = {
            id: $scope.data.id,
            mobile: $scope.data.mobile,
            comment: $scope.data.comment
        };
        s = '编辑';
        url = 'api/black/update';
    }

    $scope.ok = function () {
        $('#platBlackEditForm').validate({
            rules: {
                mobile: {
                    required: true,
                    mobile: true
                },
                comment: {
                    required: true,
                    mobile: false
                }
            },
            messages: {
                mobile: {
                    required: '请输入正确格式的手机号'
                },
                comment: {
                    required: '请输入加黑说明'
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
                console.log(url)
                $ajax.post(url, $.param($scope.data), function () {
                    layer.msg('黑名单' + s + '成功!', {time: 1000, icon: 1});
                    $uibModalInstance.dismiss(0);
                    data.callback();
                })
            }
        });
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});
