/**
 * 发票
 *
 */
angular.module('App').controller('InvoiceTabCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '发票索取', url: 'invoice.claim'},
        {title: '索取记录', url: 'invoice.record'},
        {title: '发票信息', url: 'invoice.news'},
        {title: '寄送地址', url: 'invoice.add'}

        // {title: '已支付', url: 'orders.paid'},
        // {title: '未支付', url: 'orders.nopaid'}
    ];

    $scope.currentTab = 'invoice.claim';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }

});
