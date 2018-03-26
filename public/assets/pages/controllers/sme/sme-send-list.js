/**
 * 系统消息
 *
 */
angular.module('App').controller('SmeSendCtrl', function($rootScope, $stateParams, $uibModal, $scope, $ajax) {




    //分页信息
    $scope.paginationConf = {
        currentPage : $stateParams.currentPage || 1,
        totalItems : 0,
        itemsPerPage : $stateParams.itemsPerPage || 10,
        pagesLength : 10,
        perPageOptions : [ 10, 20, 30, 40, 50 ],
        onChange : function() {
            $scope.loadlistSend();
        }
    };




    //获取类别
    $scope.loadSize = function() {
        $ajax.post('/api/foretaste/Category/items/', $.param({
        }), function (result) {
            $scope.tabs = result.list;
            $scope.currentTab = $scope.tabs[0].id;
            $scope.loadlistSend($scope.tabs[0].id);
        });
    };
    $scope.loadSize();



    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab;
        $scope.loadlistSend(tab)
    };
    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }
    $scope.params = {};

    $scope.tableData = [];
    //获取体验列表
    $scope.loadlistSend = function(id) {
        $ajax.post('/api/foretaste/Template/items/', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage,
            type:id
        }), function (result) {
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
    };
    //获取短信条数
    $scope.loadCount = function() {
        $ajax.post('/api/foretaste/UserTaste/amount', $.param({}), function (result) {
            $scope.smeCount = result||0;
        });
    };
    $scope.loadCount();

    $scope.submitView = function(data) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'sendView.html',
            controller: 'SmesendViewCtrl',
            windowClass:'width400',
            resolve:{
                data : function(){
                    return {
                        item: angular.copy(data),
                        callback: function() {
                            $scope.loadCount();
                        }
                    }
                }
            }
        });
    };

});
angular.module('App').controller('SmesendViewCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.data = data.item;
    // console.log($scope.data)
    $scope.btnT=true;
    $scope.btnTitle=false;
    $scope.parata= {
        moblie:''
    }
    function isPoneAvailable(str) {
        var myreg=/^[1][3,4,5,7,8,9][0-9]{9}$/;
        if (!myreg.test(str)) {
            $scope.btnT=true;
            $scope.btnTitle=true;
        } else {
            $scope.btnT=false;
            $scope.btnTitle=false;
        }
    }
    $scope.changeTel = function () {
        isPoneAvailable($scope.parata.moblie)
    }

    $scope.ok = function () {

        if ($scope.parata.moblie==''||$scope.parata.moblie==undefined) {
            layer.msg('请输入正确的手机号')
        } else {
            // 修改消息为已读
            // console.log($scope.data.id)
            // console.log($scope.parata.moblie)
            $ajax.post('/api/foretaste/Experience/start/', $.param({
                templet_id: $scope.data.id,
                telephone: $scope.parata.moblie
            }), function () {
                layer.msg('短信已发送，请注意查收！',{icon:1,time:2000})
                $uibModalInstance.dismiss(0);
                data.callback();
            })
        }


    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});
