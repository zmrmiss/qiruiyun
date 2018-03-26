/**
 * 系统设置
 */
angular.module('App').controller('CustomerTabCtrl', function($rootScope, $scope) {

    $scope.tabs = [
        {title: '系统消息', url: 'customer.news'},
        {title: '操作日志', url: 'customer.logs'}
    ];

    $scope.currentTab = 'customer.news';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }

});