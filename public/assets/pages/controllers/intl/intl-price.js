/**
 * 国际短信
 *
 */
angular.module('App').controller('IntlPriceCtrl', function($rootScope, $stateParams, $scope, $ajax) {

    $scope.currentTab = 'intl.price';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.areas = [{name: '全部', value: ''}, {name: "欧洲", value: 3}, {name: "亚洲", value: 2}, {name: "非洲", value: 1}, {name: "北美洲", value: 4}, {name: "南美洲", value: 5}, {name: "大洋洲", value: 6}, {name: "南极洲", value: 7}];

    $scope.params = {};

    $scope.tableData = [];
    $scope.load = function() {
        $ajax.get('intl/price', {
            name: $scope.params.name,
            ename: $scope.params.ename,
            areaCode: $scope.params.areaCode,
            area: $scope.params.area
        }, function (result) {
            $scope.tableData = result;
        });
    };
    // $scope.load();
});
