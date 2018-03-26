/**
 * 系统消息
 *
 */
angular.module('App').controller('CustomerMessageCtrl', function($rootScope, $stateParams, $uibModal, $scope, $ajax) {

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

    $scope.open = function(data) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'newsView.html',
            controller: 'viewNewsCtrl',
            size: 'md',
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
angular.module('App').controller('viewNewsCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.data = data.item;

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
    // $scope.cancel = function () {
    //     $uibModalInstance.dismiss(0);
    // };
});
