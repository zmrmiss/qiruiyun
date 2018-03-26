/**
 * 接口短信
 *
 */
angular.module('App').controller('MessageSettingCtrl', function($rootScope, $scope, $ajax) {

    $scope.tabs = [
        {title: '接口概况', url: 'message.hear.report'},
        {title: '签名报备', url: 'message.hear.sign'},
        {title: '模板报备', url: 'message.hear.template'},
        {title: '发送记录', url: 'message.hear.record.today'},
        // {title: '三天内记录', url: 'message.hear.third'},
        // {title: '历史记录',   url: 'message.hear.history'},
        {title: '回复记录', url: 'message.hear.reply.today'},
        {title: '充值记录', url: 'message.hear.bills'},
        {title: '发送统计', url: 'message.hear.sendReport'},
        {title: '设置', url: 'message.hear.setup'}
    ];
    $scope.currentTab = 'message.hear.report';

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.url;
    };

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    }

});
