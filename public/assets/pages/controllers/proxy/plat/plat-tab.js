/**
 * 模板短信
 *
 */
angular.module('App').controller('MassTabCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '群发概况', url: 'mass.report'},
        // {title: '短信发送', url: 'mass.send.routine'},
        {title: '签名报备', url: 'mass.sign'},
        {title: '模板报备', url: 'mass.template'},
        {title: '发送队列', url: 'mass.batch.today'},
        {title: '发送记录', url: 'mass.record.today'},
        // {title: '历史记录', url: 'mass.history'},
        {title: '回复记录', url: 'mass.reply.today'},
        {title: '充值记录', url: 'mass.bills'},
        {title: '发送统计', url: 'mass.sendReport'},
        // {title: '设置', url: 'mass.setting'}
    ];

    $scope.currentTab = 'mass.report';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }



});
