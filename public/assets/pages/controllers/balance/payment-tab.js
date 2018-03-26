/**
 * 充值
 *
 */
angular.module('App').controller('PaymentCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '钱包充值', url: 'payment.account'},
        {title: '产品充值', url: 'payment.product'},
        {title: '线下充值', url: 'payment.offline'}
    ];

    $scope.currentTab = 'payment.account';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }

});
