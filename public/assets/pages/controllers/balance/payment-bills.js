/**
 * 钱包明细
 *
 */
angular.module('App').controller('PaymentAllCtrl', function($rootScope, $stateParams, $scope, $ajax ,$filter) {

    $scope.currentTab = 'money.bills';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.types = [{name: '全部', value: ''}, {name: '充值', value: 1}, {name: '消费', value: 2}];

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

    $scope.params = {
        type: $scope.types[0].value
    };

    $scope.tableData = [];
    $scope.load = function() {
        var start_date=$filter('date')($scope.date.startDate.unix() * 1000,'yyyy-MM-dd');
        var end_date=$filter('date')($scope.date.endDate.unix() * 1000,'yyyy-MM-dd');
        $ajax.post('/api/finance/wallet/index', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage,
            begin: start_date,
            end: end_date,
            type: $scope.params.type
        }), function (result) {
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();

    $scope.export = function () {
        var url = 'api/export/bills?startDate=' + $scope.date.startDate.unix() * 1000 + '&endDate=' + $scope.date.endDate.unix() * 1000 + '&type=' + $scope.params.type;
        url = decodeURIComponent(url, true);
        url = encodeURI(encodeURI(url));
        window.location.href = url;
    }
});
