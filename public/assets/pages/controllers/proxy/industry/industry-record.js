/**
 * 群发短信
 *
 */
angular.module('App').controller('MouldIndustryTabCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs2 = [
        {title: '今日发送', url: 'mould.record.today'},
        {title: '昨日发送', url: 'mould.record.yesterday'},
        {title: '前日发送', url: 'mould.record.eve'},
        {title: '更早发送', url: 'mould.record.earlier'}
    ];

    $scope.currentTab2 = 'mould.report.today';

    $scope.onClickDay = function(day) {
        // console.log(day)
        $scope.currentTab2 = day.url;
    };

    $scope.isActiveDay = function(day) {
        return day == $scope.currentTab2;
    }

});
