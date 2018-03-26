/**
 * 群发短信
 *
 */
angular.module('App').controller('MessageIndustryTabCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs2 = [
        {title: '今日发送', url: 'industry.record.today'},
        {title: '昨日发送', url: 'industry.record.yesterday'},
        {title: '前日发送', url: 'industry.record.eve'},
        {title: '更早发送', url: 'industry.record.earlier'}
    ];

    $scope.currentTab2 = 'industry.report.today';

    $scope.onClickDay = function(day) {
        // console.log(day)
        $scope.currentTab2 = day.url;
    };

    $scope.isActiveDay = function(day) {
        return day == $scope.currentTab2;
    }

});
