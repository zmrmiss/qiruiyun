/**
 * 接口短信
 *
 */
angular.module('App').controller('MessageBillsCtrl', function($rootScope, $stateParams, $scope, $ajax ,$filter) {

    $scope.currentTab = 'message.hear.bills';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.types = [{name: '全部', value: ''}, {name: '充值', value: 1}, {name: '注册赠送', value: 3},{name: '体验赠送', value: 4},{name: '短信转移', value: -1}];

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

    var username=$rootScope.username;
    if(username==undefined){
        username= sessionStorage.getItem("qrname");
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

    $scope.params = {
        type: $scope.types[0].value
    };

    $scope.tableData = [];
    $scope.load = function() {
        var data={
            username:username,
            start_date : $scope.date.startDate.format('YYYY-MM-DD'),
            end_date : $scope.date.endDate.format('YYYY-MM-DD'),
            page : $scope.paginationConf.currentPage,
            limit : 10,
            type : $scope.params.type
        };
        $ajax.post('/api/ordinary/Bill/items/',$.param(data),function (result) {
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
