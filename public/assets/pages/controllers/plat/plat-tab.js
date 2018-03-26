/**
 * 模板短信
 *
 */
angular.module('App').controller('MessagePlatCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '行业概况', url: 'plat.report'},
        {title: '短信发送', url: 'plat.send.routine'},
        {title: '签名报备', url: 'plat.sign'},
        {title: '模板报备', url: 'plat.template'},
        {title: '发送队列', url: 'plat.batch.today'},
        {title: '发送记录', url: 'plat.record.today'},
        // {title: '历史记录', url: 'plat.history'},
        {title: '回复记录', url: 'plat.reply.today'},
        {title: '充值记录', url: 'plat.bills'},
        {title: '发送统计', url: 'plat.sendReport'},
        {title: '设置', url: 'plat.setting'}
    ];

    $scope.currentTab = 'plat.report';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }



});
