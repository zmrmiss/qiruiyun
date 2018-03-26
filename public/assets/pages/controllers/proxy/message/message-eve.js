/**
 * 接口短信
 *
 */
angular.module('App').controller('MessageEveCtrl', function($rootScope, $stateParams, $scope, $ajax) {

    $scope.currentTab = 'message.hear.record.today';
    $scope.currentTab2 = 'message.hear.record.eve';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };
    $scope.isActiveDay = function(day) {
        return day == $scope.currentTab2;
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

    var username=$rootScope.username;
    if(username==undefined){
        username= sessionStorage.getItem("qrname");
    }
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
        var data={page:$scope.paginationConf.currentPage,limit: 10,telephone:$scope.params.telephone,username:username,day:'-2'};
        $ajax.post('/api/bridge1/Down/items',$.param(data),function (result) {
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });

    };
    $scope.load();

});
