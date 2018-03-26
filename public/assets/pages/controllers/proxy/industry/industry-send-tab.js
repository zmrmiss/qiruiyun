/**
 * 群发短信
 *
 */
angular.module('App').controller('MessageIndustrySendTabCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs2 = [
        {title: '常规群发', url: 'industry.send.routine'},
        {title: '个性群发', url: 'industry.send.indiv'}
    ];

    $scope.currentTab2 = 'plat.report.today';

    $scope.onClickDay = function(day) {
        // console.log(day)
        $scope.currentTab2 = day.url;
    };

    $scope.isActiveDay = function(day) {
        return day == $scope.currentTab2;
    }

});
