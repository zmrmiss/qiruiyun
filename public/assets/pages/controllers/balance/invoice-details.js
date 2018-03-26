/**
 * 发票详情
 *
 */
angular.module('App').controller('InvoiceDetailsCtrl', function($rootScope, $stateParams, $scope, $ajax ,$uibModal ,$state) {
    $scope.data = {
        order_id:''
    }
    $scope.dataAdd = [];
    $scope.dataInv= [];
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
    $scope.load = function() {
        $ajax.post('/api/invoice/Invoice/invoiceView', $.param({
            id:$stateParams.id
        }), function (result) {
            $scope.data = result;
            $scope.dataAdd = result.address_arr;
            $scope.dataInv= result.invoice_arr;

            if($scope.data.order_id!=''){
                $scope.Relation($scope.data.order_id)
            }

        });

    };
    $scope.load();

    $scope.Relation = function (id) {
        $ajax.post('/api/invoice/Invoice/related_order', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage,
            orderid:id
        }), function (result) {
            $scope.tableData = result.list;
            if(result.length==0){
                $scope.tableData = [];
            }
            $scope.paginationConf.totalItems = result.count;

        });
    }


//    返回上一页
    $scope.goback = function () {
        $state.go('invoice.record')
    }

});
