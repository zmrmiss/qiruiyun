/**
 * 模板短信
 *
 */
angular.module('App').controller('MessagePlatSendTabCtrl', function($rootScope, $scope, $ajax) {


    $scope.tabs2 = [
        {title: '常规模板', url: 'plat.send.routine'},
        {title: '个性模板', url: 'plat.send.indiv'}
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
