/**
 * 接口短信
 *
 */
angular.module('App').controller('IntlCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '国际概况', url: 'intl.report'},
        {title: '短信发送', url: 'intl.send'},
        {title: '签名报备', url: 'intl.sign'},
        {title: '模板报备', url: 'intl.template'},
        {title: '发送批次', url: 'intl.batch'},
        {title: '发送记录', url: 'intl.record'},
        {title: '账单明细', url: 'intl.bills'},
        {title: '发送统计', url: 'intl.sendReport'},
        {title: '国际价格', url: 'intl.price'}
    ];

    $scope.currentTab = 'intl.report';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }

});
