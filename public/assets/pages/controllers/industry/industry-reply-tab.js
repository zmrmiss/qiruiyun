/**
 * 群发短信
 *
 */
angular.module('App').controller('MessageIndustryReplyCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs3 = [
        {title: '今日回复', url: 'industry.reply.today'},
        {title: '昨日回复', url: 'industry.reply.yesterday'},
        {title: '更早回复', url: 'industry.reply.earlier'}
    ];

    $scope.currentTab3 = 'industry.reply.today';

    $scope.onClickDayRep = function(day) {
        // console.log(day)
        $scope.currentTab3 = day.url;
    };

    $scope.isActiveDayRep = function(day) {
        return day == $scope.currentTab3;
    }

});
