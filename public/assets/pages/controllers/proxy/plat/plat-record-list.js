/**
 * 模板短信
 *
 */
angular.module('App').controller('MessagePlatRecordCtrl', function($rootScope, $stateParams, $scope, $ajax) {

    $scope.currentTab = 'plat.record';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.types = [{name: '全部', value: ''}, {name: '接收成功', value: 1}, {name: '接收失败', value: 2}, {name: '等待返回', value: 3}, {name: '无效发送', value: 4}];

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
        totalItems : 10,
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

    $scope.batchId = $stateParams.batchId == null ? -1 : $stateParams.batchId;
    if ($scope.batchId != -1) {
        $scope.date = $stateParams.date;
    }

    $scope.params = {
        mobile: '',
        content: '',
        type: $scope.types[0].value
    };

    $scope.search = function () {
        $scope.paginationConf.currentPage = 1;
        $scope.load();
    };
    $scope.tableData = [];
    $scope.stateSwitched = 1;
    $scope.load = function() {
        $ajax.post('plat/record/list', {
            pageSize: $scope.paginationConf.itemsPerPage,
            currentPage: $scope.paginationConf.currentPage,
            startDate: $scope.date.startDate.unix() * 1000,
            endDate: $scope.date.endDate.unix() * 1000,
            mobile: $scope.params.mobile,
            content: $scope.params.content,
            type: $scope.params.type,
            batchId: $scope.batchId
        }, function (result) {
            $scope.tableData = result.page.result;
            $scope.paginationConf.totalItems = result.page.total;
            $scope.stateSwitched = result.stateSwitched;
        });
    };
    $scope.load();

    // $scope.export = function () {
    //     var url = 'plat/export/record?startDate=' + $scope.date.startDate.unix() * 1000 + '&endDate=' + $scope.date.endDate.unix() * 1000 + '&mobile=' + $scope.params.mobile + '&batchId=' + $scope.batchId + "&type=" + $scope.params.type;
    //     url = decodeURIComponent(url, true);
    //     url = encodeURI(encodeURI(url));
    //     window.location.href = url + '&content=' + $scope.params.content;
    // }

    $scope.export = function() {
        $ajax.post('plat/record/listExport', {
            startDate: $scope.date.startDate.unix() * 1000,
            endDate: $scope.date.endDate.unix() * 1000,
            mobile: $scope.params.mobile,
            content: $scope.params.content,
            type: $scope.params.type,
            batchId: $scope.batchId
        }, function (fileUrl) {
            if(fileUrl){
                window.open(fileUrl);
            }else{
                layer.msg("没有记录！", {time: 2000, icon: 2});
            }
        });
    };
});
