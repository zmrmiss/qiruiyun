/**
 * 群发短信
 *
 */
angular.module('App').controller('MouldIndustryReplyCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs3 = [
        {title: '今日回复', url: 'mould.reply.today'},
        {title: '昨日回复', url: 'mould.reply.yesterday'},
        {title: '更早回复', url: 'mould.reply.earlier'}
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
