/**
 * 系统消息
 *
 */
angular.module('App').controller('ProxyManageCtrl', function($rootScope, $stateParams, $uibModal, $scope, $ajax , $state) {

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
        $ajax.post('/api/user/Message/items', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage
        }), function (result) {
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();

    //去群发
    $scope.massSee = function () {

        // $state.go('mass.report', {username: 1234,tip:456});
        $state.go('mass.report');
        sessionStorage.setItem('massApikey','1234')
    }
    //去模板
    $scope.mouldSee = function () {
        // $state.go('mass.report', {username: 1234,tip:456});
        $state.go('mould.report');
        sessionStorage.setItem('massApikey','5678')


    }

    $scope.addId = function(data) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'Newlyaddedid.html',
            controller: 'ProxyAddCtrl',
            size:'md',
            resolve:{
                data : function(){
                    return {
                        item: angular.copy(data),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    };

});
angular.module('App').controller('ProxyAddCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.data = data.item;
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

        // if ($scope.data.flag == 1) {
        //     $uibModalInstance.dismiss(0);
        // } else {
        //     // 修改消息为已读
        //     $ajax.post('system/customer/message/update', {
        //         id: $scope.data.id,
        //         flag: 1
        //     }, function () {
        //         $uibModalInstance.dismiss(0);
        //         data.callback();
        //     })
        // }


    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});
