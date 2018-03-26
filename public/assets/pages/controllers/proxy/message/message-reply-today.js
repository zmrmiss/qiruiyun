/**
 * 接口短信
 */
angular.module('App').controller('MessageReplyTodayCtrl', function($rootScope, $stateParams, $scope, $ajax,$uibModal,$filter ) {

    $scope.currentTab = 'message.hear.reply.today';
    $scope.currentTab2 = 'message.hear.reply.today';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.isActiveDayRep = function(day) {
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

    $scope.tableData = [];
    $scope.load = function() {
        var data={page:$scope.paginationConf.currentPage,limit: 10, day:0, username:username};
        $ajax.post('/api/bridge2/Reply/items',$.param(data),function (result) {
            // alert(result);
            // console.log(result)
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });

    };
    $scope.load();
});
