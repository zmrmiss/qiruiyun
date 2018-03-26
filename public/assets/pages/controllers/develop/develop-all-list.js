/**
 * 开发者
 *
 */
angular.module('App').controller('DevelopAllCtrl', function($rootScope, $stateParams, $scope, $ajax) {

    $scope.currentTab = 'develop.API';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
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
    // $scope.params = {
    //     status: $scope.payStatuses[0].value
    // };
    $scope.tableData = [
        {name: 'JAVA版本', url: '#',time:'2017-08-19'},
        {name: 'PHP版本', url: '#',time:'2017-08-19'},
        {name: 'IOS版本', url: '#',time:'2017-08-19'},
        {name: 'WEB版本', url: '#',time:'2017-08-19'},
        {name: 'Python版本', url: '#',time:'2017-08-19'},
        {name: 'Android', url: '#',time:'2017-08-19'}
        // {title: '已支付', url: 'orders.paid'},
        // {title: '未支付', url: 'orders.nopaid'}
    ];
    // $scope.tableData = [];
    // $scope.load = function() {
    //     $ajax.post('balance/account/orders', {
    //         pageSize: $scope.paginationConf.itemsPerPage,
    //         currentPage: $scope.paginationConf.currentPage,
    //         startDate: $scope.date.startDate.unix() * 1000,
    //         endDate: $scope.date.endDate.unix() * 1000,
    //         payStatus: $scope.params.status
    //     }, function(result) {
    //         $scope.tableData = result.result;
    //         $scope.paginationConf.totalItems = result.total;
    //     });
    // };
    // $scope.load();
});
