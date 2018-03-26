/**
 * 群发短信
 *
 */
angular.module('App').controller('MouldIndustryRecordTodayCtrl', function($rootScope, $stateParams, $scope, $ajax) {

    $scope.currentTab = 'mould.record.today';
    $scope.currentTab2 = 'mould.record.today';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.isActiveDay = function(url) {
        return url == $scope.currentTab2;
    };

    var apindustry=$rootScope.apindustry;
    if(apindustry==undefined){
        apindustry= sessionStorage.getItem("ApiIndustry");
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
        var data={page:$scope.paginationConf.currentPage,limit: 10, day : 0, telephone:$scope.params.telephone, username:apindustry,scope:1};
        $ajax.post('/api/bridge1/Down/items',$.param(data),function (result) {
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();

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
