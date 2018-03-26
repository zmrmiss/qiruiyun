/**
 * 开发者
 *
 */
angular.module('App').controller('DevelopTabCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '开发者', url: 'develop.API'}
    ];

    $scope.currentTab = 'develop.API';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }

});
