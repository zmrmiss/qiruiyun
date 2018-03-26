/**
/**
 * 模板短信
 *
 */
angular.module('App').controller('MassPlatBatchYesterdayCtrl', function($rootScope, $state, $stateParams, $scope, $ajax ,$uibModal) {

    $scope.currentTab = 'mass.batch.today';
    $scope.currentTab2 = 'mass.batch.yesterday';

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
        $ajax.post('/api/marketing/Queue/timing/', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage,
            username: apikey
        }), function (result) {
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();


    $scope.cleanTiming = function(id) {
        layer.msg('你确定终止定时发送吗？', {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                $ajax.post('/api/marketing/Queue/cleanTiming/', $.param({
                    id:id,
                    username:apikey
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



//    查看详情
    $scope.loadTimingList = function (id) {

        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'Timingdetails.html',
            controller: 'PlatTimingdetailsCtrl',
            size: 'lg',
            resolve:{
                data : function(){
                    return {
                        id: angular.copy(id),
                        username: angular.copy(apikey),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    }
});
angular.module('App').controller('PlatTimingdetailsCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {
    $scope.date2 = {
        startDate:moment().startOf('month'),
        endDate:moment().endOf('month')
    };
    console.log(data)
    $scope.data = {
        // username: username,
        // type:$scope.data.type,
        // content: $scope.data.content,
        // remark: $scope.data.remark
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

    $scope.tableData = [];

    $scope.loadr = function () {
        $ajax.post('/api/marketing/TimingDetail/items/',$.param({username:data.username,id:data.id,page:$scope.paginationConf.currentPage,limit: 10}),function (result) {
            console.log(result)
            $scope.tableDataLIST=result.list;
            $scope.paginationConf.totalItems = result.count;
        })
    }
    $scope.loadr();

    $scope.search = function () {
        $scope.paginationConf.currentPage = 1;
        $scope.loadr();
    };

    $scope.showTeam = function (data) {
        layer.open({
            title:"查看更多",
            content:data,
            // content:'短信发送成功!&nbsp;共计<span class=\'font-red\'>' + $scope.sendData.mobiles + '</span>个号码,<span class=\'font-red\'>' + $scope.sendData.counts + '</span>条短信',
            // content:'短信发送成功!',
            yes:function () {
                layer.closeAll();
            }
        });
    }
    
    
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});