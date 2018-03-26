/**
 * 订单
 *
 */
angular.module('App').controller('OrderTabCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '订单', url: 'orders.all'},
        // {title: '已支付', url: 'orders.paid'},
        // {title: '未支付', url: 'orders.nopaid'}
    ];

    $scope.tabs2 = [
        {title: '退款', url: 'orders.refund'},
        // {title: '已支付', url: 'orders.paid'},
        // {title: '未支付', url: 'orders.nopaid'}
    ];

    // $scope.currentTab = 'orders.all';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }

});
