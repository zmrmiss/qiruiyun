/**
 * 接口短信
 *
 */
angular.module('App').controller('MessageRecordCtrl', function($rootScope, $stateParams, $scope, $ajax) {

    $scope.currentTab = 'message.hear.record';
    $scope.currentTab2 = 'message.hear.record.today';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };
    $scope.isActiveTab2 = function(url) {
        return url == $scope.currentTab2;
    };


    function GetDateStr(AddDayCount) {
        var dd = new Date();
        dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
        var y = dd.getFullYear();
        var m = dd.getMonth()+1;//获取当前月份的日期
        var d = dd.getDate();
        return y+"-"+m+"-"+d;
    }

    $scope.types = [{name: '今天', value: GetDateStr(0)}, {name: '昨天', value: GetDateStr(-1)}, {name: '前天', value: GetDateStr(-2)}];

    // // 日期控制初始化参数
    // $scope.opts = {
    //     ranges: {
    //         '今天': [moment()],
    //         '昨天': [moment().subtract(1, 'days')],
    //         '前天': [moment().subtract(2, 'days')]
    //         // '最近7天': [moment().subtract(6, 'days'), moment()],
    //         // '最近30天': [moment().subtract(30, 'days'), moment()],
    //         // '本月': [moment().startOf('month'), moment().endOf('month')]
    //     }
    // };
    // //初始化日期查询参数
    // $scope.date = {
    //     startDate: moment().startOf('day')
    //
    // };

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

    var username=$rootScope.username;
    if(username==undefined){
        username= sessionStorage.getItem("qrname");
    }
    // $scope.batchId = $stateParams.batchId == null ? -1 : $stateParams.batchId;
    // if ($scope.batchId != -1) {
    //     $scope.date = $stateParams.date;
    // }
    $scope.params = {
        mobile: '',
        content: '',
        type: ''
    };

    //初始化日期
    $scope.params.type=GetDateStr(0);
    $scope.search = function () {
        $scope.paginationConf.currentPage = 1;
        $scope.load();
    };
    $scope.tableData = [];
    $scope.stateSwitched = 1;
    $scope.load = function() {
        // console.log($scope.params.type)
        var data={page:$scope.paginationConf.currentPage,limit: 1,  username:username,date:$scope.params.type};
        $ajax.post('/api/bridge1/Down/items',$.param(data),function (result) {
            // alert(result);
            $scope.tableData = result;
            $scope.paginationConf.totalItems = result.length;
        });

        // $ajax.post('api/record/list', {
        //     pageSize: $scope.paginationConf.itemsPerPage,
        //     currentPage: $scope.paginationConf.currentPage,
        //     startDate: $scope.date.startDate.unix() * 1000,
        //     endDate: $scope.date.endDate.unix() * 1000,
        //     mobile: $scope.params.mobile,
        //     content: $scope.params.content,
        //     type: $scope.params.type,
        //     batchId: $scope.batchId
        // }, function (result) {
        //     $scope.tableData = result.page.result;
        //     $scope.paginationConf.totalItems = result.page.total;
        //     $scope.stateSwitched = result.stateSwitched;
        // });
    };
    $scope.load();

    // $scope.export = function () {
    //     var url = 'api/export/record?startDate=' + $scope.date.startDate.unix() * 1000 + '&endDate=' + $scope.date.endDate.unix() * 1000 + '&mobile=' + $scope.params.mobile + '&batchId=' + $scope.batchId + "&type=" + $scope.params.type;
    //     url = decodeURIComponent(url, true);
    //     url = encodeURI(encodeURI(url));
    //     window.location.href = url + '&content=' + $scope.params.content;
    // }
    $scope.export = function () {
        $ajax.post('api/record/listExport', {
            // startDate: $scope.date.startDate.unix() * 1000,
            // endDate: $scope.date.endDate.unix() * 1000,
            date:$scope.params.type,
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
