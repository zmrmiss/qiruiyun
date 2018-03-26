/**
 * 群发短信
 *
 */
angular.module('App').controller('MessageIndustryBatchTabCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs2 = [
        {title: '即时类', url: 'industry.batch.today'},
        {title: '定时类', url: 'industry.batch.yesterday'}
    ];

    $scope.currentTab2 = 'industry.batch.today';

    $scope.onClickDay = function(day) {
        // console.log(day)
        $scope.currentTab2 = day.url;
    };

    $scope.isActiveDay = function(day) {
        return day == $scope.currentTab2;
    }

});
