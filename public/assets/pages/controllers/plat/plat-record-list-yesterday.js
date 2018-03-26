/**
 * 模板短信
 *
 */
angular.module('App').controller('MessagePlatRecordYesterdayCtrl', function($rootScope, $stateParams, $scope, $ajax,$state) {

    $scope.currentTab = 'plat.record.today';
    $scope.currentTab2 = 'plat.record.yesterday';

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
        var data={page:$scope.paginationConf.currentPage,limit: 10,telephone:$scope.params.telephone,  username:apikey,day:'-1',scope:1};
        $ajax.post('/api/bridge1/Down/items',$.param(data),function (result) {
            // alert(result);
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
        // $ajax.post('plat/record/list', {
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
    //     var url = 'plat/export/record?startDate=' + $scope.date.startDate.unix() * 1000 + '&endDate=' + $scope.date.endDate.unix() * 1000 + '&mobile=' + $scope.params.mobile + '&batchId=' + $scope.batchId + "&type=" + $scope.params.type;
    //     url = decodeURIComponent(url, true);
    //     url = encodeURI(encodeURI(url));
    //     window.location.href = url + '&content=' + $scope.params.content;
    // }

    $scope.ExportList = function () {
        var downData={
            username:apikey,
            day:-1,
            telephone:$scope.params.telephone,
            scope:1
        };
        $ajax.post('/api/bridge1/DownExport/query/',$.param(downData),function (result) {
            $state.go('Export.export');
        })
    }
});
