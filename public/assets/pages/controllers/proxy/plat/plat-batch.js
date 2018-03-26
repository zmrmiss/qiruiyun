/**
 * 模板短信
 */
angular.module('App').controller('MassPlatBatchTabCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs2 = [
        {title: '即时类', url: 'mass.batch.today'},
        {title: '定时类', url: 'mass.batch.yesterday'}
    ];

    $scope.currentTab2 = 'plat.batch.today';

    $scope.onClickDay = function(day) {
        // console.log(day)
        $scope.currentTab2 = day.url;
    };

    $scope.isActiveDay = function(day) {
        return day == $scope.currentTab2;
    }

});
