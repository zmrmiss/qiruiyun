/**
 * 索取记录
 *
 */
angular.module('App').controller('InvoiceRecordCtrl', function($rootScope, $stateParams, $scope, $ajax , $filter ,$state) {

    $scope.currentTab = 'invoice.record';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.payStatuses = [
        {name: '全部', value: ''},
        {name: '开票处理中', value: 1},
        {name: '邮寄中', value:2},
        {name: '已开发票', value:3},
        {name: '已驳回', value:4}
        ];

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
        status: '',
        type: ''
    };


    $scope.tableData = [];
    $scope.load = function() {
        $ajax.post('/api/invoice/Invoice/asklist', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage,
            begin:$scope.date.startDate.format('YYYY-MM-DD'),
            end: $scope.date.endDate.format('YYYY-MM-DD'),
            status: $scope.params.status
        }), function(result) {
            $scope.tableData = result.list;
            if(result.length==0){
                $scope.tableData = [];
            }
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();

    $scope.todetails = function (id) {
        $state.go('invoice.details',{id:id})
    }
    
    $scope.toSign = function (id) {
        layer.msg('确认签收?', {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                $ajax.post('/api/invoice/Invoice/renewals', $.param({
                    id:id
                }), function(result) {
                    layer.close(index);
                    $scope.load();
                });
            }
        })
    }

});
