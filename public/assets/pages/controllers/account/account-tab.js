/**
 * 个人
 *
 */
angular.module('App').controller('AccountTabCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '基本信息', url: 'account.info'},
        {title: '认证资料', url: 'account.auth'},
        // {title: '安全设置', url: 'account.safe'},
        {title: '修改密码', url: 'account.pwd'}
    ];

    $scope.currentTab = 'account.info';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }

});
