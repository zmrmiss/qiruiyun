/**
 * 模板短信
 * Created by zhangm
 */
angular.module('App').controller('MessagePlatReplyCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs3 = [
        {title: '今日回复', url: 'plat.reply.today'},
        {title: '昨日回复', url: 'plat.reply.yesterday'},
        {title: '更早回复', url: 'plat.reply.earlier'}
    ];

    $scope.currentTab3 = 'plat.reply.today';

    $scope.onClickDayRep = function(day) {
        $scope.currentTab3 = day.url;
    };

    $scope.isActiveDayRep = function(day) {
        return day == $scope.currentTab3;
    }

});
