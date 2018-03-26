/**
 * 国际短信发送
 *
 */
angular.module('App').controller('IntlSendCtrl', function($rootScope, $stateParams, $uibModal, $scope, $ajax, FileUploader) {

    $scope.$on('$viewContentLoaded', function() {
        $scope.reStyle();
    });
    $scope.currentTab = 'intl.send';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    //样式
    $scope.reStyle = function() {
        setTimeout(function(){
            var width = $('#signDiv').width();
            $('#content').css('text-indent', width - 4);
        }, 200)

    };

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
    $scope.hasTime = false;
    $scope.mobileData = {};
    $scope.totalWords = 70; //总字数
    $scope.inputWords = 0; //已输入字数
    $scope.signWords = 0;   //签名字数
    // $scope.tWords = 0;      //回T退订字数
    // $scope.hasT = true;

    $scope.init = function () {
        $scope.data.mobiles = '';
        $scope.data.content = '';
        $scope.mobileData = {
            mobileCount: 0,
            successCount: 0,
            invalidCount: 0,
            repeatCount: 0,
            keyList: []
        };
        $scope.totalWords = 70; //总字数
        $scope.inputWords = 0; //已输入字数
        $scope.signWords = 0;   //签名字数
        // $scope.tWords = 0;      //回T退订字数
        // $scope.hasT = true;
    };
    $scope.init();

    $scope.loadSign = function() {
        $ajax.post('customer/signs', {appId: 3}, function(result) {
            $scope.signs = result;
            $scope.sign = $scope.signs[0];
            $scope.data.sign = $scope.sign.sign;
            $scope.calWords();
        });
    };
    // $scope.loadSign();

    /**
     * 下拉框事件
     * @param item
     */
    $scope.selectSign = function(item) {
        $scope.data.sign = item;
        $scope.reStyle();
        $scope.calWords();
    };

    $scope.calWords = function() {
        var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        var maxLen = 160;//单条最大字数
        var moreLen = 153;//超过最大值后计费字数
        if (reg.test($scope.data.content) || reg.test($scope.data.sign)) {
            maxLen = 70;
            var moreLen = 67;
            console.log("有汉字")
        }
        $scope.signWords = $scope.data.sign.length;
        $scope.inputWords = $scope.signWords + $scope.data.content.length;
        if ($scope.inputWords <= maxLen){
            $scope.totalWords = maxLen;
            $scope.count = 1;
        } else if ($scope.inputWords > maxLen && $scope.inputWords <= 500) {
            $scope.count = Math.ceil($scope.inputWords / moreLen);
            $scope.totalWords = $scope.count * moreLen;
        }  else {
            layer.alert('最大发送内容不超过500个字数。');
            $scope.data.content = $scope.data.content.substr(0, 500 - $scope.signWords);
            return false;
        }
    };

    $scope.change = function() {
        $scope.calWords();
    };

    $scope.checkMobiles = function() {
        $ajax.post('intl/mobile/check', {mobiles: $scope.data.mobiles}, function(result) {
            $scope.mobileData = result;
        });
    };

    var curTab = 1;
    $scope.changeTab = function(tab) {
        if (tab == curTab)
            return false;
        $scope.data.mobiles = '';
        $scope.mobileData.mobileCount = 0;
        $scope.mobileData.successCount = 0;
        $scope.mobileData.invalidCount = 0;
        $scope.mobileData.repeatCount = 0;
        $scope.mobileData.keyList.splice(0,$scope.mobileData.keyList.length);
        $scope.fileItem = {};
        curTab = tab;
    };

    // $scope.submit = function() {
    //     $ajax.post('intl/send/manual', {
    //         mobiles: curTab == 1 ? $scope.data.mobiles : "",
    //         fileId: curTab == 2 ? $scope.data.fileId : -1,
    //         content: $scope.data.content,
    //         sign: $scope.data.sign,
    //         scheduleSendTime: $scope.hasTime ? $scope.data.scheduleSendTime.toDate().getTime() : ''
    //     }, function() {
    //         layer.msg('短信发送成功!&nbsp;共计<span class=\'font-red\'>' + $scope.mobileData.successCount + '</span>个号码,<span class=\'font-red\'>' + $scope.mobileData.successCount * $scope.count + '</span>条短信', {
    //             time: 0, //不自动关闭
    //             icon: 1,
    //             btn: ['确定'],
    //             yes: function(index){
    //                 layer.close(index);
    //             }
    //         });
    //         $scope.init();
    //     });
    // };

    $scope.showTip = true;
    $scope.changeTime = function () {
        var t = $scope.data.scheduleSendTime.toDate().getTime();
        $scope.showTip = $scope.hasTime && (t - new Date().getTime()) < 1000*60*10;
    };
    $scope.setTime = function (unit, value) {
        $scope.data.scheduleSendTime = moment().add(value, unit);
    }

    Array.prototype.distinct = function () {
        var newArr = [],obj = {};
        for(var i=0, len = this.length; i < len; i++){
            if(!obj[typeof(this[i]) + this[i]]){
                newArr.push(this[i]);
                obj[typeof(this[i]) + this[i]] = 'new';
            }
        }
        return newArr;
    }

    $scope.submit = function() {
        var url = 'intl/send/manual';
        if (curTab == 1) {
            // console.log('手动');
            url = 'intl/send/manual';
        } else if (curTab == 2) {
            // console.log('导入');
            url = 'intl/send/import'
        } else if (curTab == 3) {
            // console.log('通讯');
            url = 'intl/send/contact';
        }

        var t = $scope.data.scheduleSendTime.toDate().getTime();
        if($scope.hasTime && (t - new Date().getTime()) < 1000*55*10){
            layer.open({
                content:'定时发送时间须设置在10分钟后'
            });
            return;
        }

        $ajax.post(url, {
            fileId: curTab == 2 ? $scope.data.fileId : -1,
            mobiles: curTab == 1 ? $scope.data.mobiles.replace(/[,|\n|\s]+/g,',').split(",").distinct().join(',') : "",
            content: $scope.data.content.trim(),
            sign: $scope.data.sign,
            scheduleSendTime: $scope.hasTime ? t : ''
        }, function() {
            layer.open({
                title:"信息",
                content:'短信发送成功!&nbsp;共计<span class=\'font-red\'>' + $scope.mobileData.successCount + '</span>个号码,<span class=\'font-red\'>' + $scope.mobileData.successCount * $scope.count + '</span>条短信',
                yes:function () {
                    layer.closeAll();
                    location.reload();
                }
            });
        });
    };

    $scope.uploader = new FileUploader({
        url: 'sms/file/analysis',
        formData: [{appId: 3}],
        queueLimit: 1,
        removeAfterUpload: true
    });
    $scope.progress = {width: 0 }
    $scope.uploader.onProgressItem = function (item, process) {
        $scope.progress.width = process + '%';
        if (item.progress == 100) {
            layer.msg('正在解析文件，请稍后......', {
                icon: 16,
                shade: 0.01,
                time: 0
            });
        }
    };
    $scope.uploader.onAfterAddingFile = function (item) {
        if (item._file.size > 157286400) {
            layer.msg('最大支持150M的文件', {time: 1000, icon: 2});
            return false;
        };

        $scope.fileItem = item._file;
        $scope.uploader.uploadAll();
    };
    $scope.uploader.onSuccessItem = function(item, response, status, headers) {
        if (response.code == 200) {
            $scope.mobileData.keyList.splice(0,$scope.mobileData.keyList.length);
            $scope.data.fileId = response.data.fileId;
            $scope.data.mobiles = response.data.mobiles;
            $scope.mobileData.mobileCount = response.data.totalCount;
            $scope.mobileData.successCount = response.data.successCount;
            $scope.mobileData.invalidCount = response.data.invalidCount;
            $scope.mobileData.repeatCount = response.data.repeatCount;
            for (var i = 0; i < response.data.keyList.length; i++) {
                var v = response.data.keyList[i];
                $scope.mobileData.keyList.push('#' + v + '#');
            }
            layer.closeAll();
        } else {
            layer.msg(response.codeInfo, {time: 1000, icon: 2})
        }
        $scope.progress.width = 0;
    };


    $scope.insertAtCaret = function (elementId, value) {
        var $t = $($('#' + elementId))[0];
        //IE
        if (document.selection) {
            $('#' + elementId).focus();
            // $('#' + elementId).focus(function () {
            //     document.getElementById('keybored').style.display = '';
            // });
            sel = document.selection.createRange();
            sel.text = value;
            this.focus();
        } else {
            //!IE
            if ($t.selectionStart || $t.selectionStart == "0") {
                var startPos = $t.selectionStart;
                var endPos = $t.selectionEnd;
                var scrollTop = $t.scrollTop;
                $t.value = $t.value.substring(0, startPos) + value + $t.value.substring(endPos, $t.value.length);
                $('#' + elementId).focus();
                // $('#' + elementId).focus(function () {
                //     document.getElementById('keybored').style.display = '';
                // });
                $t.selectionStart = startPos + value.length;
                $t.selectionEnd = startPos + value.length;
                $t.scrollTop = scrollTop;
            } else {
                $('#' + elementId).val($('#' + elementId).val() + value);
                $('#' + elementId).focus();
                // $('#' + elementId).focus(function () {
                //     document.getElementById('keybored').style.display = '';
                // });
            }
        }
        $scope.data.content = $('#content').val();
    };

    $scope.getCommonTemplate = function () {
        $ajax.get('plat/getCommonTemplate', {type: 2}, function(result) {
            $scope.templates = result;
        });
    };
    // $scope.getCommonTemplate();

    $scope.selectTpl = function (template) {
        $scope.data.content = template;
    }

    $(document).ready(function () {
        $('#content').focus(function () {
            if ($scope.mobileData.keyList && $scope.mobileData.keyList.length > 0) {
                document.getElementById('keyboard').style.display = '';
            }

        })
    })

    //下载模板
    $scope.download = function () {
        window.open(window.location.origin + ':8088/download/%E5%9B%BD%E9%99%85%E7%9F%AD%E4%BF%A1%E6%A8%A1%E6%9D%BF.zip');
    };
});
