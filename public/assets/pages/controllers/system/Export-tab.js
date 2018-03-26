/**
 */
/**
 * 导出记录
 */
angular.module('App').controller('ExportTabCtrl', function($rootScope, $scope) {

    $scope.tabs = [
        {title: '导出记录', url: 'Export.export'},
    ];

    $scope.currentTab = 'Export.export';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }

});