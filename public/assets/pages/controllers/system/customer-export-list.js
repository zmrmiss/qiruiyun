/**
 * 操作日志
 *
 */
angular.module('App').controller('CustomerUserExportCtrl', function($rootScope, $stateParams, $uibModal, $scope, $ajax) {

    // $scope.currentTab = 'customer.export';
    //
    // $scope.isActiveTab = function(url) {
    //     return url == $scope.currentTab;
    // }

    $scope.types = [{name: '不限', value: ''}, {name: '回复记录导出', value: 3}, {name: '发送记录导出', value: 1}, {name: '通讯录导出', value: 2}];
    // 日期控制初始化参数
    $scope.opts = {
        locale: {
            applyClass: 'btn-green',
            applyLabel: "确定",
            fromLabel: "从",
            toLabel: "至",
            cancelLabel: '取消',
            customRangeLabel: '自定义范围',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            firstDay: 1,
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月',
                '十月', '十一月', '十二月'
            ]
        }
    };
    //初始化日期查询参数
    $scope.date = {
        startDate: moment().startOf('month'),
        endDate: moment().endOf('month')
    };

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
        $ajax.post('/api/setting/Exports/items', $.param({
            page:$scope.paginationConf.currentPage,
            limit:$scope.paginationConf.itemsPerPage,
            type:$scope.params.type,
            start_date:$scope.date.startDate.format('YYYY-MM-DD'),
            end_date:$scope.date.endDate.format('YYYY-MM-DD')
        }), function (result) {
            if(!result.list){
                result.list=[]
            }
            $scope.tableData = result.list;

            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();

});
