/**
 * 模板短信
 *
 */
angular.module('App').controller('MassPlatTabCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs2 = [
        {title: '今日发送', url: 'mass.record.today'},
        {title: '昨日发送', url: 'mass.record.yesterday'},
        {title: '前日发送', url: 'mass.record.eve'},
        {title: '更早发送', url: 'mass.record.earlier'}
    ];

    $scope.currentTab2 = 'mass.report.today';

    $scope.onClickDay = function(day) {
        // console.log(day)
        $scope.currentTab2 = day.url;
    };

    $scope.isActiveDay = function(day) {
        return day == $scope.currentTab2;
    }

});
