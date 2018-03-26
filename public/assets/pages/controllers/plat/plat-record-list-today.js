/**
 * 模板短信
 *
 */
angular.module('App').controller('MessagePlatRecordTodayCtrl', function($rootScope, $stateParams, $scope, $ajax,$state) {

    $scope.currentTab = 'plat.record.today';
    $scope.currentTab2 = 'plat.record.today';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.isActiveDay = function(url) {
        return url == $scope.currentTab2;
    };

    var apikey=$rootScope.apikey;
    if(apikey==undefined){
        apikey= sessionStorage.getItem("ApiKey");
    }

    $scope.types = [{name: '全部', value: ''}, {name: '接收成功', value: 1}, {name: '接收失败', value: 2}, {name: '等待返回', value: 3}, {name: '无效发送', value: 4}];


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


    $scope.params = {
        telephone: ''
    };

    $scope.search = function () {
        $scope.paginationConf.currentPage = 1;
        $scope.load();
    };
    $scope.tableData = [];
    $scope.stateSwitched = 1;
    $scope.load = function() {
        var data={page:$scope.paginationConf.currentPage,limit: 10,day:0,telephone:$scope.params.telephone,  username:apikey,scope:1};
        $ajax.post('/api/bridge1/Down/items',$.param(data),function (result) {
            // alert(result);
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();


    $scope.ExportList = function () {
        var downData={
            username:apikey,
            day:0,
            telephone:$scope.params.telephone,
            scope:1
        };
        $ajax.post('/api/bridge1/DownExport/query/',$.param(downData),function (result) {
            $state.go('Export.export');
        })
    }
});
