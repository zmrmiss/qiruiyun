/**
 * 模板短信 短信发送
 * Created by zhangm on 17/9/1.
 */
angular.module('App').controller('MessagePlatSendCtrl', function($rootScope, $stateParams, $uibModal, $scope, $ajax, FileUploader, $uibModal) {

    $scope.$on('$viewContentLoaded', function() {
        $scope.reStyle();
    });
    $scope.currentTab = 'plat.send';

    $scope.isActiveTab = function(url) {
        return url === $scope.currentTab;
    };

    //样式
    $scope.reStyle = function() {
        setTimeout(function(){
            var width = $('#signDiv').width();
            $('#content').css('text-indent', width - 8);
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
    // 加载签名
    $scope.loadSign = function() {
        $ajax.post('customer/signs', {appId: 2}, function(result) {
            $scope.signs = result;
            $scope.sign = $scope.signs[0];
            $scope.data.sign = $scope.sign.sign;
            $scope.calWords();
        });
    };
    $scope.loadSign();

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

    $scope.change = function() {
        $scope.calWords();
    };

    $scope.checkMobiles = function() {
        if ($scope.data.mobiles.length === 0)
            return false;
        $ajax.post('plat/mobile/check', {mobiles: $scope.data.mobiles}, function(result) {
            $scope.mobileData = result;
        });
    };

    var curTab = 1;
    $scope.changeTab = function(tab) {
        if (tab === curTab)
            return false;
        $scope.data.mobiles = '';
        $scope.mobileData.mobileCount = 0;
        $scope.mobileData.successCount = 0;
        $scope.mobileData.invalidCount = 0;
        $scope.mobileData.repeatCount = 0;
        $scope.keys = [];
        $scope.fileItem = {};
        curTab = tab;
    };

    $scope.showTip = true;
    $scope.changeTime = function () {
        var t = $scope.data.scheduleSendTime.toDate().getTime();
        $scope.showTip = $scope.hasTime && (t - new Date().getTime()) < 1000*60*10;
    };
    $scope.setTime = function (unit, value) {
        $scope.data.scheduleSendTime = moment().add(value, unit);
    };

    Array.prototype.distinct = function () {
        var newArr = [],obj = {};
        for(var i=0, len = this.length; i < len; i++){
            if(!obj[typeof(this[i]) + this[i]]){
                newArr.push(this[i]);
                obj[typeof(this[i]) + this[i]] = 'new';
            }
        }
        return newArr;
    };

    $scope.submit = function() {

        var url = 'sms/send/manual';
        if (curTab === 1) {
            // console.log('手动');
            url = 'sms/send/manual';
        } else if (curTab === 2) {
            // console.log('导入');
            url = 'sms/send/import'
        } else if (curTab === 3) {
            // console.log('通讯');
            url = 'sms/send/contact';
        }

        var t = $scope.data.scheduleSendTime.toDate().getTime();
        if($scope.hasTime && (t - new Date().getTime()) < 1000*55*10){
            layer.open({
                content:'定时发送时间须设置在10分钟后'
            });
            return;
        }

        $ajax.post(url, {
            fileId: $scope.data.fileId,
            mobiles: curTab === 1 ? $scope.data.mobiles.replace(/[,|\n|\s]+/g,',').split(",").distinct().join(',') : "",
            content: $scope.data.content + ($scope.hasT ? '回T退订' : ''),
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
        formData: [{appId: 2}],
        queueLimit: 1,
        removeAfterUpload: true
    });
    $scope.progress = {width: 0 };
    $scope.uploader.onProgressItem = function (item, process) {
        $scope.progress.width = process + '%';
        if (item.progress === 100) {
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
        }

        $scope.fileItem = item._file;
        $scope.uploader.uploadAll();

    };
    $scope.uploader.onSuccessItem = function(item, response, status, headers) {
        if (response.code === 200) {
            $scope.data.fileId = response.data.fileId;
            $scope.data.mobiles = response.data.mobiles;
            $scope.mobileData.mobileCount = response.data.totalCount;
            $scope.mobileData.successCount = response.data.successCount;
            $scope.mobileData.invalidCount = response.data.invalidCount;
            $scope.mobileData.repeatCount = response.data.repeatCount;
            if (response.data.keyList !== null) {
                for (var i = 0; i < response.data.keyList.length; i++) {
                    var v = response.data.keyList[i];
                    $scope.keys.push('#' + v + '#');
                }
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
            if ($t.selectionStart || $t.selectionStart === "0") {
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

    $scope.templates = [];
    $scope.tplTab = 1;
    $scope.getCommonTemplate = function () {
        // if (type === null) {
        //     type = 1;
        // }
        $scope.templates.splice(0, $scope.templates.length);
        if ($scope.tplTab === 1) {
            $ajax.get("plat/template/random", {}, function(result) {
                $scope.templates = result;
            });
        } else if ($scope.tplTab === 2) {
            $ajax.get('plat/getCommonTemplate', {}, function(result) {
                $scope.templates = result;
            });
        }
    };
    $scope.getCommonTemplate();

    $scope.changeTplTab = function (type) {
        $scope.templates.splice(0, $scope.templates.length);
        $scope.tplTab = type;
        $scope.getCommonTemplate();
    };

    $scope.selectTpl = function (template) {
        $scope.data.content = template;
    };

    $(document).ready(function () {
        $('#content').focus(function () {
            if ($scope.keys.length > 0) {
                document.getElementById('keybored').style.display = '';
            }

        })
    });

    //下载模板
    $scope.download = function () {
        window.open(window.location.origin + ':8088/download/%E7%9F%AD%E4%BF%A1%E6%A8%A1%E6%9D%BF.zip');
    };

    $scope.openSign = function() {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'platSignAdd.html',
            controller: 'PlatSignAddCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        // item: angular.copy(data),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    };
    $scope.buildShortUrl = function() {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'platShortUrl.html',
            controller: 'PlatShortUrlCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        // item: angular.copy(data),
                        callback: function(url) {
                            $scope.insertAtCaret('content', ' ' + url + ' ')
                        }
                    }
                }
            }
        });
    }
});
angular.module('App').controller('PlatSignAddCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.data = {
    } ;
    var s = '新增';
    var url = 'plat/sign/add';

    $scope.ok = function () {
        $('#platSignAddForm').validate({
            rules: {
                sign: {
                    required: true,
                    sign: [2, 12]
                },
                remark: {
                    required: true,
                    remark: [2, 100]
                }
            },
            messages: {
                sign: {
                    required: '签名长度为2至12个字符',
                    sign: '签名长度为{0}至{1}个字符'
                },
                remark: {
                    required: '备注长度为2至100个字符',
                    remark: '备注长度为{0}至{1}个字符'
                }
            },
            errorPlacement: function(error, element) {
                // if (element.is(':radio') || element.is(':checkbox')) {
                //     var eid = element.attr('name');
                //     error.appendTo(element.parent());
                // } else {
                error.appendTo(element.parent());
                // }
            },
            // errorElement: 'span',
            // debug: true,
            submitHandler: function() {

                $ajax.post(url, $scope.data, function () {
                    layer.msg('签名' + s + '成功!', {time: 1000, icon: 1});
                    $uibModalInstance.dismiss(0);
                    data.callback();
                })
            }
        });

    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});
angular.module('App').controller('PlatShortUrlCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.data = {longUrl: ''} ;

    $scope.ok = function () {

        if ($scope.data.longUrl.length < 1) {
            layer.msg('请输入网址', {time: 2000, icon: 2});
            return;
        }
        var reg = /^((https|http|ftp|rtsp|mms)?:\/\/)*[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/;
        if (!reg.test($scope.data.longUrl)) {
            layer.msg('网址格式不正确', {time: 2000, icon: 2});
            return;
        }

        $ajax.get('../common/short_url', {
            url: $scope.data.longUrl
        }, function (result) {
            layer.msg('短链接生成成功!', {time: 1000, icon: 1});
            $uibModalInstance.dismiss(0);
            data.callback(result);
        })

    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});