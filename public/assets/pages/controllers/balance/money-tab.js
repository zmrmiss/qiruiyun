/**
 * 充值
 *
 */
angular.module('App').controller('MoneyTabCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '钱包明细', url: 'money.bills'},

        // {title: '已支付', url: 'orders.paid'},
        // {title: '未支付', url: 'orders.nopaid'}
    ];

    $scope.currentTab = 'orders.all';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }

});
