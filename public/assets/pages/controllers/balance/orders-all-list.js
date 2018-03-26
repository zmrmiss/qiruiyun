/**
 * 订单列表
 *
 */
angular.module('App').controller('OrderAllCtrl', function($rootScope, $stateParams, $scope, $ajax , $filter) {

    $scope.currentTab = 'orders.all';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.payStatuses = [
        {name: '全部', value: 'all'},
        {name: '未支付', value: '0'},
        {name: '已支付', value:1},
        {name: '支付失败', value:-1},
        {name: '已关闭', value:2},
        {name: '支付中', value:3}
        ];

    $scope.payTypes = [
        {name: '全部', value: ''},
        {name: '短信充值', value: 1},
        {name: '钱包充值', value:2},
        {name: '注册赠送', value:3},
        {name: '体验赠送', value:4},
        {name: '钱包代充', value:5},
        {name: '补给赠送', value:6}
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

    // $scope.params = {
    //     status: $scope.payStatuses[0].value,
    //     type: $scope.payTypes[0].value
    // };
    $scope.params = {
        status: '',
        type: ''
    };


    $scope.tableData = [];
    $scope.load = function() {
        if($scope.params.status==''){
            $scope.params.status='all'
        }
        $ajax.post('/api/recharge/order/index', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage,
            begin:$scope.date.startDate.unix(),
            end: $scope.date.endDate.unix(),
            order_num: $scope.params.number,
            pay_status: $scope.params.status,
            order_type : $scope.params.type
        }), function(result) {
            $scope.tableData = result.list;
            if(result.length==0){
                $scope.tableData = [];
            }
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();
    
    
//    去支付
    $scope.payMoney = function (data) {
        if(data.pay_method_name == '支付宝'){

            var l = (screen.width - 650) / 2;
            var t = (screen.height - 400) / 2;
            // var newWin = window.open("_blank",'newwindow', "toolbar=no, directories=no, status=no, menubar=no, width=650, height=550, top=" + t + ", left=" + l);
            var newWin = window.open();
            $ajax.post('/api/finance/Pending/run/',$.param({order_no:data.order_num}),function (result) {
                newWin.location.href =encodeURI(result.alipay);
                layer.confirm('是否支付完成？', {
                    title:'支付状态',
                    btn: ['支付成功','支付失败'] //按钮
                }, function(index){
                    layer.close(index);
                    $scope.load();
                }, function(){
                    $scope.load();
                });
            })
        }else {
            layer.msg('你确定支付么？', {
                time: 0, //不自动关闭
                icon: 0,
                btn: ['确定', '取消'],
                yes: function(index){
                    layer.close(index);
                    $ajax.post('/api/finance/Pending/run/', $.param({order_no:data.order_num}), function (result) {
                        layer.msg('支付成功！', {time: 2000, icon: 1});
                        $scope.load();
                    });
                }
            });
        }

    }
});
