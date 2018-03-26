/**
 * 接口短信
 *
 */
angular.module('App').controller('MessageEarlierCtrl', function($rootScope, $stateParams, $scope, $ajax ,$filter ,$uibModal ,$state) {

    $scope.currentTab = 'message.hear.record.today';
    $scope.currentTab2 = 'message.hear.record.earlier';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };
    $scope.isActiveDay = function(day) {
        return day == $scope.currentTab2;
    };

    $scope.types = [{name: '全部', value: ''}, {name: '等待返回', value: -1}, {name: '接收成功', value: 0}, {name: '接收失败', value: 1}];
    $scope.result = [{name: '全部', value: ''}, {name: '待发送', value: -1}, {name: '发送成功 ', value: 0}, {name: '发送失败', value: 1}];

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
            // '今天': [moment(), moment()],
            // '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '最近7天': [moment().subtract(6, 'days'), moment()],
            '最近30天': [moment().subtract(30, 'days'), moment()],
            '本月': [moment().startOf('month'), moment().endOf('month')]
        }
    };
    //初始化日期查询参数
    $scope.date = {
        startDate: '',
        endDate:''
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
        var start_date,end_date;
        if ($scope.date.startDate==''){
            start_date='';
            end_date='';
        }else {
            start_date=$scope.date.startDate.format('YYYY-MM-DD');
            end_date=$scope.date.endDate.format('YYYY-MM-DD');
        }

        var data={
            username:username,
            telephone:$scope.params.mobile,
            'page':$scope.paginationConf.currentPage,
            'limit': 10,
            'keyword': $scope.params.content,
            'start_date':start_date,
            'end_date':end_date,
            'result':$scope.params.result,
            'receipt':$scope.params.value
        };

        $ajax.post('/api/bridge2/DownAll/items/',$.param(data),function (result) {
            // alert(result);
            // console.log(result)
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });

    };
    // $scope.load();



    $scope.loadHistoryList = function () {
        var Ptime;
        Ptime=$scope.date.endDate-$scope.date.startDate;

        if(moment.duration(Ptime).asDays()==0){
            layer.msg( '请选择查询日期!', {time: 3000, icon:2});
            return false;
        }else if(moment.duration(Ptime).asDays()>31){
            layer.msg( '导出跨度不能超过1个月!', {time: 3000, icon:2});
            return false;
        }
        var start_date,end_date;
        if ($scope.date.startDate==''){
            start_date='';
            end_date='';
        }else {
            start_date=$scope.date.startDate.format('YYYY-MM-DD');
            end_date=$scope.date.endDate.format('YYYY-MM-DD');
        }
        var downData={
            username:username,
            start_date:start_date,
            end_date:end_date,
            telephone:$scope.params.mobile,
            keyword: $scope.params.content,
            result:$scope.params.result,
            receipt:$scope.params.value
        };
        $ajax.post('/api/bridge2/DownExport/query/',$.param(downData),function (result) {
            $state.go('Export.export');
        })
        // $uibModal.open({
        //     backdrop: 'static',
        //     templateUrl: 'HistoryExport.html',
        //     controller: 'MessageHistoryExportCtrl',
        //     size: 'lg',
        //     resolve:{
        //         data : function(){
        //             return {
        //                 item: angular.copy(1),
        //                 callback: function() {
        //                     $scope.load();
        //                 }
        //             }
        //         }
        //     }
        // });
    }
});


//导出历史记录
angular.module('App').controller('MessageHistoryExportCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {
    $scope.date2 = {
        startDate:moment().startOf('month'),
        endDate:moment().endOf('month')
    };
    $scope.data = {
        // username: username,
        // type:$scope.data.type,
        // content: $scope.data.content,
        // remark: $scope.data.remark
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});