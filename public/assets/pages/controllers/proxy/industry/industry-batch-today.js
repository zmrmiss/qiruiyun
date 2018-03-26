/**
 * 群发短信
 *
 */
angular.module('App').controller('MouldIndustryBatchTodayCtrl', function($rootScope, $state, $stateParams, $scope, $ajax) {

    $scope.currentTab = 'mould.batch.today';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };
    $scope.isActiveDay = function(url) {
        return url == $scope.currentTab;
    };

    var apindustry=$rootScope.apindustry;
    if(apindustry==undefined){
        apindustry= sessionStorage.getItem("ApiIndustry");
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


    $scope.params = {};

    $scope.tableData = [];
    $scope.load = function() {
        $ajax.post('/api/marketing/Queue/realtime/', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage,
            username: apindustry
        }), function (result) {
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();


    $scope.cleanRealtime = function(id) {

        layer.msg('你确定终止即时发送吗？', {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                $ajax.post('/api/marketing/Queue/cleanRealtime/', $.param({
                    id:id,
                    username:apindustry
                }), function (result) {
                    layer.msg('操作成功', {time: 1500, icon: 1});
                    $scope.load();
                });
            }
        });
    }

    $scope.go = function(id) {
        $state.go('plat.record', {batchId: id, date: $scope.date});
    };

    $scope.export = function () {
        var url = 'plat/export/batch?startDate=' + $scope.date.startDate.unix() * 1000 + '&endDate=' + $scope.date.endDate.unix() * 1000;
        url = decodeURIComponent(url, true);
        url = encodeURI(encodeURI(url));
        window.location.href = url;
    }
});
