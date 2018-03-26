/**
 * 群发短信
 *
 */
angular.module('App').controller('MessageIndustryCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '模板概况', url: 'mould.report'},
        // {title: '短信发送', url: 'mould.send.routine'},
        {title: '签名报备', url: 'mould.sign'},
        {title: '模板报备', url: 'mould.template'},
        {title: '发送队列', url: 'mould.batch.today'},
        {title: '发送记录', url: 'mould.record.today'},
        // {title: '历史记录', url: 'plat.history'},
        {title: '回复记录', url: 'mould.reply.today'},
        {title: '充值记录', url: 'mould.bills'},
        {title: '发送统计', url: 'mould.sendReport'},
        // {title: '设置', url: 'mould.setting'}
    ];

    $scope.currentTab = 'mould.report';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }



});
