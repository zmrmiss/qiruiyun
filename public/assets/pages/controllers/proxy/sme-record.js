/**
 * 系统消息
 *
 */
angular.module('App').controller('SmeRecordCtrl', function($rootScope, $stateParams, $uibModal, $scope, $ajax) {

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
                            $scope.load();
                        }
                    }
                }
            }
        });
    };

});
angular.module('App').controller('SmesendViewCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

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

        if ($scope.data.flag == 1) {
            $uibModalInstance.dismiss(0);
        } else {
            // 修改消息为已读
            $ajax.post('system/customer/message/update', {
                id: $scope.data.id,
                flag: 1
            }, function () {
                $uibModalInstance.dismiss(0);
                data.callback();
            })
        }


    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});
