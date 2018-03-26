/**
 * 模板短信
 *
 */
angular.module('App').controller('MessagePlatBatchCtrl', function($rootScope, $state, $stateParams, $scope, $ajax) {

    $scope.currentTab = 'plat.batch';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    // $scope.categories = [];
    // $ajax.post('plat/template/categories', {}, function (result) {
    //     $scope.categories = result;
    // });

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
        },
        ranges: {
            '今天': [moment(), moment()],
            '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '最近7天': [moment().subtract(6, 'days'), moment()],
            '最近30天': [moment().subtract(30, 'days'), moment()],
            '本月': [moment().startOf('month'), moment().endOf('month')]
        }
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

    //初始化日期查询参数
    $scope.date = {
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day')
    };

    $scope.params = {};

    $scope.tableData = [];
    $scope.load = function() {
        $ajax.post('plat/batch/list', {
            pageSize: $scope.paginationConf.itemsPerPage,
            currentPage: $scope.paginationConf.currentPage,
            startDate: $scope.date.startDate.unix() * 1000,
            endDate: $scope.date.endDate.unix() * 1000,
            mobile: $scope.params.mobile,
            validateFlag: $scope.params.validateFlag,
            categoryId: $scope.params.categoryId
        }, function (result) {
            $scope.tableData = result.result;
            $scope.paginationConf.totalItems = result.total;
        });
    };
    $scope.load();

    $scope.go = function(id) {
        $state.go('plat.record', {batchId: id, date: $scope.date});
    };

    $scope.export = function () {
        var url = 'plat/export/batch?startDate=' + $scope.date.startDate.unix() * 1000 + '&endDate=' + $scope.date.endDate.unix() * 1000;
        url = decodeURIComponent(url, true);
        url = encodeURI(encodeURI(url));
        window.location.href = url;
    }
});
