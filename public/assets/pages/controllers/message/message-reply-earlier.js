/**
 * 接口短信
 *
 */
angular.module('App').controller('MessageReplyEarlierCtrl', function($rootScope, $stateParams, $scope, $ajax,$uibModal,$filter ,$state) {

    $scope.currentTab = 'message.hear.reply.today';
    $scope.currentTab2 = 'message.hear.reply.earlier';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.isActiveDayRep = function(day) {
        return day == $scope.currentTab2;
    };



    // 日期控制初始化参数
    $scope.opts = {
        locale: {
            applyClass: 'btn-green',
            applyLabel: "确定",
            fromLabel: "从",
            toLabel: "至",
            cancelLabel: '取消',
            customRangeLabel: '自定义范围',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            firstDay: 1,
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月',
                '十月', '十一月', '十二月'
            ]
        },
        ranges: {
            // '今天': [ moment().startOf('day'),  moment().startOf('day')],
            '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '最近7天': [moment().subtract(6, 'days'), moment()],
            '最近30天': [moment().subtract(30, 'days'), moment()],
            '本月': [moment().startOf('month'), moment().endOf('month')]
        }
    };
    //初始化日期查询参数
    $scope.date = {
        startDate:'',
        endDate: ''
    };
    //日期开始
    //日期控件
    $scope.params = {};




    //分页信息
    $scope.paginationConf = {
        currentPage : $stateParams.currentPage || 1,
        totalItems : 0,
        itemsPerPage : $stateParams.itemsPerPage || 10,
        pagesLength : 10,
        perPageOptions : [ 10, 20, 30, 40, 50 ],
        onChange : function() {
            $scope.load();
        }
    };

    var username=$rootScope.username;
    if(username==undefined){
        username= sessionStorage.getItem("qrname");
    }



    $scope.tableData = [];
    $scope.load = function() {
        var start_date,end_date;
        if ($scope.date.startDate==''){
            start_date='';
            end_date='';
        }else {
            start_date=$scope.date.startDate.format('YYYY-MM-DD');
            end_date=$scope.date.endDate.format('YYYY-MM-DD');
        }
        var data={
            page:$scope.paginationConf.currentPage,
            limit: 10,
            username:username,
            telephone:$scope.params.telephone,
            'start_date':start_date,
            'end_date':end_date,
            'keyword': $scope.params.content
        };
        $ajax.post('/api/bridge2/ReplyAll/items',$.param(data),function (result) {
            // alert(result);
            // console.log(result)
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });






        // $ajax.post('http://sms.qirui.com/api/bridge1/Up/items', {
        //     pageSize: $scope.paginationConf.itemsPerPage,
        //     currentPage: $scope.paginationConf.currentPage,
        //     startDate: $scope.date.startDate.unix()*1000,
        //     endDate: $scope.date.endDate.unix()*1000,
        //     mobile: $scope.params.mobile
        // }, function (result) {
        //     $scope.tableData = result.result;
        //     $scope.paginationConf.totalItems = result.total;
        // });
    };
    $scope.load();

    $scope.ReplyHistoryList = function () {
        var Ptime;
        Ptime=$scope.date.endDate-$scope.date.startDate;

        if(moment.duration(Ptime).asDays()==0){
            layer.msg( '请选择查询日期!', {time: 3000, icon:2});
            return false;
        }else if(moment.duration(Ptime).asDays()>31){
            layer.msg( '导出跨度不能超过1个月!', {time: 3000, icon:2});
            return false;
        }
        var start_date,end_date;
        if ($scope.date.startDate==''){
            start_date='';
            end_date='';
        }else {
            start_date=$scope.date.startDate.format('YYYY-MM-DD');
            end_date=$scope.date.endDate.format('YYYY-MM-DD');
        }
        var downData={
            username:username,
            start_date:start_date,
            end_date:end_date,
            telephone:$scope.params.telephone,
            keyword: $scope.params.content,
            scope:0
        };
        $ajax.post('/api/bridge2/ReplyExport/query/',$.param(downData),function (result) {
            $state.go('Export.export');
        })
    }

    $scope.export = function () {
        $ajax.post('api/mo/listExport', {
            startDate: $scope.date.startDate.unix()*1000,
            endDate: $scope.date.endDate.unix()*1000,
            mobile: $scope.params.mobile
        }, function (fileUrl) {
            if(fileUrl){
                window.open(fileUrl);
            }else{
                layer.msg("没有记录！", {time: 2000, icon: 2});
            }
        });
    };

    $scope.black = function (mobile) {
        layer.msg('功能暂未实现！', {time: 1000, icon: 2});
        //自己注销，，待修改
        // return;
        layer.confirm('是否加黑该手机号' + mobile +'？',{
            btn: ['确认','取消'] //按钮
        }, function(index){
            layer.close(index);

            $ajax.post('plat/mobile/black', {
                mobile: mobile
            }, function () {
                layer.msg('加黑成功！', {time: 1000, icon: 1});
                $scope.load();
            });
        }, function(index){
            layer.close(index);
        });
    };

    $scope.delete = function (id) {
        layer.confirm('是否删除该条回复记录？', {
            btn: ['确认','取消'] //按钮
        }, function(index){
            layer.close(index);

            $ajax.post('plat/mo/delete', {
                id: id
            }, function () {
                layer.msg('删除成功！', {time: 1000, icon: 1});
                $scope.load();
            });
        }, function(index){
            layer.close(index);
        });
    };
    //发送短信
    $scope.sendMsg = function (mobile) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'sendMsgFromMessage.html',
            controller: 'sendMsgFromMessageCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        mobile:mobile,
                        callback: function() {
                        }
                    }
                }
            }
        });
    };
});
angular.module('App').controller('sendMsgFromMessageCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data, $uibModal) {
    $scope.params = {};
    $scope.params.mobile = data.mobile;

    $scope.ok = function () {
        var p = {
            content: $scope.data.content + ($scope.hasT ? '回T退订' : ''),
            sign: $scope.data.sign,
            mobiles:$scope.params.mobile
        };

        $ajax.post('sms/send/manual', p, function() {
            layer.open({content:'短信发送成功!'});
            $uibModalInstance.dismiss(0);
        },function (result) {
            layer.msg(result.codeInfo, {time: 2000, icon: 2});
        });
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };

    //================初始化样式======================
    //样式
    $scope.reStyle = function() {
        setTimeout(function(){
            var width = $('#signDiv').width();
            $('#content').css('text-indent', width - 8);
        }, 200)

    };
    $scope.reStyle();
    // 签名数据
    $scope.signs = [];
    // 选中的签名
    $scope.sign = {};
    $scope.data = {
        sign: '',
        content: '',
        mobiles: '',
        scheduleSendTime: moment()
    };

    $scope.init = function () {
        $scope.data.mobiles = '';
        $scope.data.content = '';
        $scope.totalWords = 70; //总字数
        $scope.inputWords = 0; //已输入字数
        $scope.signWords = 0;   //签名字数
        $scope.tWords = 0;      //回T退订字数
        $scope.hasT = true;
        $scope.mobileData = {
            mobileCount: 0,
            successCount: 0,
            invalidCount: 0,
            repeatCount: 0
        };
        $scope.keys = [];
    };

    $scope.calWords = function() {
        $scope.signWords = $scope.data.sign.length + 2;
        $scope.tWords = $scope.hasT ? 4 : 0;
        $scope.inputWords = $scope.signWords + $scope.data.content.length + $scope.tWords;
        if ($scope.inputWords <= 70){
            $scope.totalWords = 70;
            $scope.count = 1;
        } else if ($scope.inputWords > 70 && $scope.inputWords <= 500) {
            $scope.count = Math.ceil($scope.inputWords / 67);
            $scope.totalWords = $scope.count * 67;
        }  else {
            layer.alert('最大发送内容不超过500个字数。');
            $scope.inputWords = 500;
            $scope.totalWords = 500;
            $scope.data.content = $scope.data.content.substr(0, 500 - $scope.signWords - ($scope.hasT ? 4 : 0));
            return false;
        }

    };
    $scope.init();
    /**
     * 下拉框事件
     * @param item
     */
    $scope.selectSign = function(item) {
        $scope.data.sign = item;
        $scope.reStyle();
        $scope.calWords();
    };
    $scope.change = function() {
        $scope.calWords();
    };

    //load sign
    $rootScope.loadSign(function (signs) {
        $scope.signs = signs;
        $scope.sign = $scope.signs[0];
        $scope.data.sign = $scope.sign.sign;
        $scope.calWords();
    });
});