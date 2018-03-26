/**
 * 线下充值
 *
 */
angular.module('App').controller('PaymentOfflineCtrl', function($rootScope, $scope, $ajax) {

    $scope.currentTab = 'payment.offline';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.data = {};

    $scope.load = function() {
        $ajax.post('/api/recharge/recharge/offline', $.param({}), function(result) {
            $scope.DataList = result.account;
            $scope.remark=result.remark
        });
        //
        // $.each('.offline-content-is',function (index,value) {
        //     console.log(index)
        // })
    };
    $scope.load();

    $scope.adStyle='对公账户';
    $scope.isActiveStyle = function (url) {
        return url== $scope.adStyle
    }
});