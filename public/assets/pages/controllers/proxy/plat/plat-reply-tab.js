/**
 * 模板短信
 * Created by zhangm
 */
angular.module('App').controller('MassPlatReplyCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs3 = [
        {title: '今日回复', url: 'mass.reply.today'},
        {title: '昨日回复', url: 'mass.reply.yesterday'},
        {title: '更早回复', url: 'mass.reply.earlier'}
    ];

    $scope.currentTab3 = 'mass.reply.today';

    $scope.onClickDayRep = function(day) {
        $scope.currentTab3 = day.url;
    };

    $scope.isActiveDayRep = function(day) {
        return day == $scope.currentTab3;
    }

});
