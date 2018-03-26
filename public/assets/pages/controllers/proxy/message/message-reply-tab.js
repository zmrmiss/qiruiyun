/**
 * 接口短信
 *
 */
angular.module('App').controller('MessageReplyTabCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs3 = [
        {title: '今日回复', url: 'message.hear.reply.today'},
        {title: '昨日回复', url: 'message.hear.reply.yesterday'},
        {title: '更早回复', url: 'message.hear.reply.earlier'}
    ];

    $scope.currentTab3 = 'message.hear.reply.today';

    $scope.onClickDayRep = function(day) {
        // console.log(day)
        $scope.currentTab3 = day.url;
    };

    $scope.isActiveDayRep = function(day) {
        return day == $scope.currentTab3;
    }

});
