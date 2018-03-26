/**
 * 群发短信
 *
 */
angular.module('App').controller('MessageIndustryCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '营销概况', url: 'industry.report'},
        {title: '短信发送', url: 'industry.send.routine'},
        {title: '签名报备', url: 'industry.sign'},
        {title: '模板报备', url: 'industry.template'},
        {title: '发送队列', url: 'industry.batch.today'},
        {title: '发送记录', url: 'industry.record.today'},
        // {title: '历史记录', url: 'plat.history'},
        {title: '回复记录', url: 'industry.reply.today'},
        {title: '充值记录', url: 'industry.bills'},
        {title: '发送统计', url: 'industry.sendReport'},
        {title: '设置', url: 'industry.setting'}
    ];

    $scope.currentTab = 'plat.report';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }



});
