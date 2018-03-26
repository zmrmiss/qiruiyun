/**
 * 模板短信
 *
 */
angular.module('App').controller('PlatSetupCtrl', function($rootScope, $stateParams,$scope, $ajax,$uibModal) {
    $scope.currentTab = 'plat.setting';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    var apikey=$rootScope.apikey;
    if(apikey==undefined){
        apikey= sessionStorage.getItem("ApiKey");
    }


    //分页信息
    $scope.paginationConf = {
        currentPage : $stateParams.currentPage || 1,
        totalItems : 0,
        itemsPerPage : $stateParams.itemsPerPage || 10,
        pagesLength : 10,
        perPageOptions : [ 10, 20, 30, 40, 50 ],
        onChange : function() {
            $scope.load();
        }
    };

    $scope.params = {};

    $scope.tableData = [];
    $scope.load = function() {

        var data={username:apikey,page:$scope.paginationConf.currentPage,limit: 10, telephone:$scope.params.telephone};
        $ajax.post('/api/marketing/Blacklist/items',$.param(data),function (result) {
            // alert(result);
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();

    $scope.search = function () {
        $scope.paginationConf.currentPage = 1;
        $scope.load();
    };



    // $scope.currentTab = 'message.messageer.report';//暂时不用

    // $scope.isActiveKey = function(username) {
    //     // alert('1111')
    //     return username == $rootScope.username;
    // }
    // $rootScope.username=$scope.key.username;
    // console.log( $rootScope.username)

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


    //添加黑名单
    $scope.open = function(data) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'CreatBlack.html',
            controller: 'MessagePlatBlackAppendCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        item: angular.copy(apikey),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    };


    //删除黑名单
    $scope.delete = function (data) {
        layer.msg('你确定删除该黑名单吗？', {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                $ajax.post('/api/marketing/Blacklist/remove', $.param({
                    id: data.id,username:apikey
                }), function () {
                    layer.msg('删除成功!', {time: 1000, icon: 1});
                    $scope.load();
                })
            }
        });

    };

});

//黑名单
angular.module('App').controller('MessagePlatBlackAppendCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {
    console.log(data.item);
    $scope.data={
        username:'',
        telephone:'',
        remark:''
    }
    $scope.data.username=data.item;
    // $scope.data = data.item;

    var s = '新增';
    var url = '/api/marketing/Blacklist/add';
    // if ($scope.data) {
    //     $scope.data = {
    //         id: $scope.data.id,
    //         mobile: $scope.data.mobile,
    //         comment: $scope.data.comment
    //     };
    //     s = '编辑';
    //     url = 'api/black/update';
    // }

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
