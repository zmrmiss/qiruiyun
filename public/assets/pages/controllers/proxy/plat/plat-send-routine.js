/**
 * 模板短信 短信发送
 * Created by wangys on 15/1/1.
 */
angular.module('App').controller('MessagePlatSendRoutineCtrl', function($rootScope, $stateParams, $uibModal, $scope, $ajax, FileUploader , $filter) {
    $scope.HtmlRen = true;
    if($rootScope.heardata!=undefined){
        if($rootScope.heardata.authz_status=='1'){
            $scope.HtmlRen = false;
        } else if($rootScope.heardata.authz_status=='0'){
            $scope.RzHtml= '依《中华人民共和国网络安全法》相关要求，平台账号必须完成真实身份信息认证后才可正常使用相关服务（测试除外），感谢您的理解和支持！请尽快提供相应认证资料，以免影响您的正常使用。<a ui-sref="account.auth" class="ng-binding" href="#/account/auth"> 立即认证 </a>'
        }else if($rootScope.heardata.authz_status=='2'){
            $scope.RzHtml= '您的认证正在审核中，未通过之前暂不能发送短信，敬请谅解！'
        }else if($rootScope.heardata.authz_status=='-1'){
            $scope.RzHtml= '您的认证未通过，暂不能发送短信，请重新提交认证！<a ui-sref="account.auth" class="ng-binding" href="#/account/auth"> 立即认证 </a>'
        }
    }



    $scope.$on('$viewContentLoaded', function() {
        $scope.reStyle();
    });
    //判断是否有联系人
    $scope.callMils = true;
    $scope.loadoff = function () {
        $ajax.post('/api/contacts/getConsList', $.param({
            type_id:''
        }), function (result) {
            if(result==''){
                $scope.callMils = false;
            }
        });
    }
    $scope.loadoff();
    var apikey=$rootScope.apikey;
    if(apikey==undefined){
        apikey= sessionStorage.getItem("ApiKey");
    }
    $scope.currentTab = 'plat.send.routine';

    $scope.isActiveTab = function(url) {
        return url === $scope.currentTab;
    };
    $scope.isActiveDay = function(url) {
        return url === $scope.currentTab;
    };

    $scope.sname='';

    //样式
    $scope.reStyle = function() {
        setTimeout(function(){
            var width = $('#signDiv').width();
            $('#content').css('text-indent', width - 8);
        }, 200)

    };

    //通讯录加入的手机号
    $rootScope.MaillistMobiles=0;

    // 检测获得的手机号
    $rootScope.batcheckMpbiles=0;

    //上传+缓存手机号
    $rootScope.batupLoadMpbiles=0;

    //手机号汇总
    $scope.batMobiles=0;

    //计费条数
    $scope.countForm=0;

    // 签名数据
    $scope.signs = [];
    // 选中的签名
    $scope.sign = {};
    $rootScope.data = {
        sign: '',
        content: '',
        mobiles: '',
        scheduleSendTime:'',
        disnone:''
    };
    $ajax.post('/api/marketing/Prepare/datetime',$.param({username:apikey}),function (result) {
        $rootScope.data.scheduleSendTime=moment(result.timestamp*1000);
        $scope.time=result.timestamp*1000

    })

    $scope.hasTime = false;
    $scope.totalWords = 70; //总字数
    $scope.inputWords = 0; //已输入字数
    $scope.signWords = 0;   //签名字数
    $scope.tWords = 0;      //回T退订字数
    $scope.hasT = false;
    $rootScope.mobileData = {
        total: 0,
        valid: 0,
        repeat: 0,
        invalid: 0
    };
    //通讯录导入号码
    $scope.Maillist = {
        total: 0,
        valid: 0,
        repeat: 0,
        invalid: 0
    };

    $scope.keys = [];


    //批量导入展示
    $scope.batchshow=false;
    $scope.batch = {
        total: 0,
        valid: 0,
        repeat: 0,
        invalid: 0
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
    // 加载签名
    $scope.loadSign = function() {
        $ajax.post('/api/marketing/Prepare/sign', $.param({username: apikey}), function(result) {
            $scope.signs = result;
            $scope.sign = $scope.signs[0];
            if($scope.signs!=''){
                $scope.data.disnone=false;
                $scope.data.sign = $scope.sign.content;
            }else {
                $scope.data.disnone=true;
            }
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


    //检测模板字数
    $scope.calWords = function() {
        $scope.signWords = $scope.data.sign.length + 2;
        $scope.tWords = $scope.hasT ? 4 : 0;
        $scope.inputWords = $scope.signWords + $scope.data.content.length + $scope.tWords;
        if ($scope.inputWords <= 70){
            $scope.totalWords = 70;
            $scope.count = 1;
        } else if ($scope.inputWords > 70 && $scope.inputWords <= 500) {
            $scope.count = Math.ceil($scope.inputWords / 64);
            $scope.totalWords = $scope.count * 64;
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

    $rootScope.routmobiles=[];
    //检测号码
    $scope.checkMobiles = function() {
        // if ($rootScope.data.mobiles.length === 0){}
        //     return false;
        var arr=''+$scope.data.mobiles+'';
        $rootScope.routmobiles=arr.split("\n");

        $ajax.post('/api/marketing/Write/check', $.param({
            content: $rootScope.data.mobiles,
            username:apikey}), function(result) {
            $rootScope.mobileData = result;
            $rootScope.batcheckMpbiles = result.valid;


        });
    };



    //手机号码缓存
    $scope.showResult=false;
    $scope.shower={
        total: 0,
        valid: 0,
        repeat: 0,
        invalid: 0
    }
    $scope.formcookie = function () {
        $ajax.post('/api/marketing/Ignore2/load/',$.param({username:apikey}),function (result) {
            if(result!=null){
                $scope.showResult=true;
                $scope.shower=result;
                $rootScope.batupLoadMpbiles=result.valid;
            }
        })
    }
    $scope.formcookie();

    $scope.clerrform = function () {
        layer.msg("你确认清空号码缓存吗？", {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                $ajax.post('/api/marketing/Ignore2/clean/',$.param({username: apikey}) , function () {
                    $scope.showResult=false;
                    $scope.batchshow=false;
                    $('#uploadpress1').html('');
                    $rootScope.batupLoadMpbiles=0;
                    layer.msg("号码清除成功！", {time: 2000, icon: 1});
                })
            }
        });
    }



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
        $scope.showTip = $scope.hasTime && (t - $scope.time) < 1000*60*10;
    };
    $scope.setTime = function (unit, value) {
        $ajax.post('/api/marketing/Prepare/datetime',$.param({username:apikey}),function (result) {
            $scope.time=result.timestamp*1000
        })
        $rootScope.data.scheduleSendTime = moment($scope.time).add(value, unit);
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
    $scope.num=1;
    $scope.getCommonTemplate = function () {
        $scope.templates.splice(0, $scope.templates.length);
        if ($scope.tplTab === 1) {
            $ajax.post("/api/marketing/Prepare/templet", $.param({username:apikey,limit:5,page:$scope.num}), function(result) {
                $scope.templates = result.list;
                $scope.templatesnum = result.count;
            });
        } else if ($scope.tplTab === 2) {
            $ajax.post('/api/marketing/Prepare/preset', $.param({username:apikey,limit:5,page:$scope.num}), function(result) {
                $scope.templates = result.list;
                $scope.templatesnum = result.count;
            });
        }
    };
    $scope.getCommonTemplate();

    $scope.getTemplateClick=function () {

        var scount=$scope.templatesnum/5;
        if (scount>1){
            $scope.num++;
            if(($scope.num-scount)>1){
                $scope.num=1
            }
        }
        $scope.getCommonTemplate();
    }

    $scope.changeTplTab = function (type) {
        $scope.num=1;
        $scope.templates.splice(0, $scope.templates.length);
        $scope.tplTab = type;
        $scope.getCommonTemplate();
    };

    //存放选用模板的变量
    $scope.ConArray = [];
    $scope.hasEdit = false;
    $scope.historyAll='';
    $scope.selectTpl = function (template) {
        $scope.data.content = template;
        $scope.data.content2 = template;

        $scope.calWords();
    //    是否含有变量，有变量执行
        $scope.ConArray=$scope.data.content2.match(/\{(.+?)\}/g);
        if($scope.ConArray!=null){
            $scope.hasEdit = true;
            if($scope.historyAll!=$scope.data.content2){
                sessionStorage.setItem("valMb", '');
            }
            $scope.ConTrains()
        }else{
            $scope.hasEdit = false;
            sessionStorage.setItem("valMb", '');
        }

        $scope.historyAll = template;
    };

    $scope.ConTrains = function () {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'openConTrains.html',
            controller: 'PlatConTrainsCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        ConArray:angular.copy($scope.ConArray),
                        ConTent:angular.copy($scope.data.content2),
                        callback: function(arr) {
                            $scope.data.content = arr;
                            $scope.calWords();
                        }
                    }
                }
            }
        });
    }

    $(document).ready(function () {
        $('#content').focus(function () {
            if ($scope.keys.length > 0) {
                document.getElementById('keybored').style.display = '';
            }

        })
    });

    //下载模板
    $scope.download = function () {
        window.open(window.location.origin + '/download/%E5%90%AF%E7%91%9E%E7%BE%A4%E5%8F%91%E6%89%B9%E9%87%8F%E4%B8%8A%E4%BC%A0%E6%A8%A1%E6%9D%BF.zip');
    };


    //输入手机号的黑名单检测
    $scope.opencheckedit = function() {
        $ajax.post('/api/marketing/Ignore/check', $.param({username:apikey}),
            function(result) {
            if(result.list!=null){
                $scope.sname='single';
                $uibModal.open({
                    backdrop: 'static',
                    templateUrl: 'openBlackRoster.html',
                    controller: 'PlatcheckeditCtrl',
                    size: 'md',
                    resolve:{
                        data : function(){
                            return {
                                sname:angular.copy($scope.sname),
                                item: angular.copy(result),
                                callback: function() {
                                    $scope.load();
                                }
                            }
                        }
                    }
                });
            }else {
                layer.msg("群发号码中无黑名单号码", {time: 2000, icon: 1});
            }
        });


    };

    //通讯录插入黑名单检测
    $scope.opencheckMail = function() {
        $ajax.post('/api/marketing/IgnoreBooks/check', $.param({username:apikey}),
            function(result) {
                if(result.list!=null){
                    $scope.sname='maillist';
                    $uibModal.open({
                        backdrop: 'static',
                        templateUrl: 'openBlackRoster.html',
                        controller: 'PlatcheckeditCtrl',
                        size: 'md',
                        resolve:{
                            data : function(){
                                return {
                                    sname:angular.copy($scope.sname),
                                    item: angular.copy(result),
                                    callback: function() {
                                        $scope.load();
                                    }
                                }
                            }
                        }
                    });
                }else {
                    layer.msg("群发号码中无黑名单号码", {time: 2000, icon: 1});
                }
            });


    };

    //上传文件手机号检测
    $scope.telCheck = function () {
        $ajax.post('/api/marketing/Handle/check',
            $.param({username:apikey}),
            function(result) {
                $scope.batchshow=true;
                $scope.batch = result;
                $scope.sname='batch';
                if($scope.batch.valid>0){
                    $rootScope.batupLoadMpbiles=$scope.batch.valid;
                    $scope.telDelete();
                }else if($scope.batch.valid==0){
                    $rootScope.batupLoadMpbiles=$scope.batch.valid;
                }
            });
    }


    $scope.telDelete = function () {
        $ajax.post('/api/marketing/Ignore2/check',
            $.param({username:apikey}),
            function(result) {
                if(result.list!=null){
                    $uibModal.open({
                        backdrop: 'static',
                        templateUrl: 'openBlackRoster.html',
                        controller: 'PlatcheckeditCtrl',
                        size: 'md',
                        resolve:{
                            data : function(){
                                return {
                                    sname:angular.copy($scope.sname),
                                    item: angular.copy(result),
                                    callback: function() {
                                        $scope.load();
                                    }
                                }
                            }
                        }
                    });
                }

            });
    }

    $scope.progress = {width: 0 };
    //加载上传文件
    $scope.$on('$viewContentLoaded', function() {
            $list = $('#thelist'),
            $btn = $('#ctlBtn'),
            state = 'pending',
            uploader;

        var uploader = WebUploader.create({
            resize: false, // 不压缩image
            swf: '../../public/js/webuploader/Uploader.swf', // swf文件路径
            server: '/api/batchs1/Routine/stream'+'?'+new Date().getTime(), // 文件接收服务端。
            formData: {
                username: apikey
            },
            pick: {id:'#picker',multiple: false}, // 选择文件的按钮。可选
            chunked: true, //是否要分片处理大文件上传
            chunkSize: 1024 * 1024, //分片上传，每片2M，默认是5M
            auto: true, //选择文件后是否自动上传
            chunkRetry: 3, //如果某个分片由于网络问题出错，允许自动重传次数
            thread: 1 ,// 最大上传并发数
            accept: {
                title: 'file',
                extensions: 'txt,csv,xls,xlsx,zip',
                mimeTypes: 'file/*'
            }
        });




        // 文件上传过程中创建进度条实时显示。
        uploader.on('uploadProgress', function (file, percentage) {


            // // 避免重复创建
                 var html = $('<div id="' + file.id + '" class="">' +
                     '<h4 class="info" style="width: 100%">'
                     + file.name + '</h4></div><div><span>上传中</span>:' +
                     '<span id="loadsize"></span></div>' +
                     '<div  style="background-color: #f5f5f5;">' +
                     '<div class="progress" style="height: 2px;margin-bottom: 10px;margin-top: 20px;background: #36c6d3;">' +
                     '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" ng-style="progress">' +
                     '<span class="sr-only"> {{progress.width}} </span>' +
                     '</div></div></div>');

                 //显示进度条和百分比
                 $('#uploadpress1').html(html);

                var bfb=Math.round(percentage*100)+ '%';
                $('#loadsize').html(bfb);
                html.css('width', percentage * 100 + '%');
        });
        // 文件上传成功
        uploader.on('uploadSuccess', function (file,response) {
            $scope.showResult=false;
            $scope.file=file;
            var html = $('<div id="' + file.id + '" class="">' +
                '<h4 class="info" style="width: 100%">' + file.name + '</h4>' +
                '</div><div><span>已上传</span></div>');
            $('#uploadpress1').html(html);

            if(response.data==null){
                layer.msg(response.msg, {time: 1000, icon: 2}, function(){});
                return false;
            }
            if(response.data.status==1){
                $scope.telCheck()
            }

        });

        // 文件上传失败，显示上传出错
        uploader.on('uploadError', function (file) {
            var html = $('<div id="' + file.id + '" class="">' +
                '<h4 class="info" style="width: 100%">' + file.name + '</h4>' +
                '</div><div><span>上传出错</span></div>');
            $('#uploadpress1').html(html);
        });

        //当文件被加入队列之前触发
        uploader.on('beforeFileQueued', function (file) {
            uploader.reset()
        });

        $("#picker").hover(function () {
            // uploader.remove()
            // uploader.reset();
            uploader.refresh();
        })
    });

    $scope.Summary = function () {
        // $scope.batMobiles=parseInt($rootScope.batcheckMpbiles)+parseInt($rootScope.batupLoadMpbiles)+parseInt($rootScope.MaillistMobiles);

        $rootScope.getAuthInfo(function (ret) {
            if (ret && ret.remind == '1') {
                if (ret && ret.authz_status == '1') {
                    $scope.SummarySub()
                }
            }else {
                $scope.SummarySub()
            }

        });

    }

    $scope.SummarySub = function () {
        if($scope.data.sign==''){
            layer.msg( '签名不能为空!', {time: 1000, icon:2});
            return false;
        }

        if($scope.data.content==''){
            layer.msg( '请输入短信内容!', {time: 1000, icon:2});
            return false;
        }

        var t = $scope.data.scheduleSendTime.toDate().getTime();
        if($scope.hasTime && (t - $scope.time) < 1000*55*10){
            layer.open({
                content:'定时发送时间须设置在10分钟后'
            });
            return;
        }

        $scope.changemount=$filter('date')(t,'yyyy-MM-dd HH:mm:ss');

        $ajax.post('/api/marketing/Duplicate/remove',$.param({username:apikey}),function (result) {
            $scope.batMobiles=result.valid;
            //计费条数
            $scope.countForm=$scope.batMobiles*$scope.count;
            $uibModal.open({
                backdrop: 'static',
                templateUrl: 'sendMsgSummary.html',
                controller: 'PlatSummaryCtrl',
                size: 'md',
                resolve:{
                    data : function(){
                        return {
                            mobiles:angular.copy($scope.batMobiles),
                            counts:angular.copy($scope.countForm),
                            username:angular.copy(apikey),
                            content:angular.copy( '【'+$scope.data.sign+'】'+$scope.data.content),
                            cancel:angular.copy($scope.hasT ? '1' : '0'),
                            timer: angular.copy($scope.hasTime ? $scope.changemount: ''),
                            // sname:angular.copy($scope.sname),
                            // item: angular.copy(result),
                            callback: function() {
                                // $scope.load();
                            }
                        }
                    }
                }
            });
        })
    }


//    过滤手机号
    $scope.openCheckFilteratet = function () {
        var regex = /^1([3578]\d|4[57])\d{8}$/;
        var arr=[];
        for (var k in $rootScope.routmobiles){
            if(!regex.test($rootScope.routmobiles[k])){
                // return;
            }else {
                arr.push($rootScope.routmobiles[k]);
            }
        }

        var resultArr = [];
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < resultArr.length; j++) {
                if (resultArr[j] == arr[i]) {
                    break;
                }
            }
            if (j == resultArr.length) {
                resultArr[resultArr.length] = arr[i];
            }
        }
        $('#mobileschange').val(resultArr.join('\n'));
        $rootScope.data.mobiles=resultArr.join('\n');
        $scope.checkMobiles();
    }

    /**
     * 获取通讯数据
     * @param callback
     */
    $scope.getContactModule = function (callback) {
        $rootScope.getContactGroup(function (result) {
            $scope._originalData = result;
            $scope._treeData = treeutil.getRoleTreeData(result);

            callback && callback();
        });
    };
    /**
     * 加载分组列表
     */
    $scope.getContactGroup = function () {
        $scope.getContactModule(function () {
            $scope.loadGroupData($scope._treeData);
        });
    };


    /**
     * 加载分组数
     * @param data
     */
    $scope.arr=[];
    $scope.arr2=[];
    $scope.arr3s = [];
    $scope.arr4s = [];
    $scope.arr5s = [];
    $scope.arr6s = [];
    Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
    Array.prototype.unique5 = function (array){
        var r = [];
        for(var i = 0, l = array.length; i < l; i++) {
            for(var j = i + 1; j < l; j++)
                if (array[i] === array[j]) j = ++i;
            r.push(array[i]);
        }

        return r;
    }
    Array.prototype.isContained = function (a, b){
        if(!(a instanceof Array) || !(b instanceof Array)) return false;
        if(a.length < b.length) return false;
        var aStr = a.toString();
        // console.info(aStr);
        for(var i = 0, len = b.length; i < len; i++){
            // console.info(aStr.indexOf(b[i]));
            if(aStr.indexOf(b[i]) == -1) return false;
        }
        return true;
    }

    $scope.loadGroupData = function (data) {

        var tree = $("#tree");
        tree.jstree("destroy");
        tree.jstree({
            'core': {
                "themes" : {
                    "responsive": false,
                    'icons':false
                },
                "check_callback" : true,
                'data': data,
                // 'expand_selected_onload': data,
                // 'multiple':false
            },
            "types" : {
                "default" : {
                    "icon" : "fa fa-folder icon-state-warning icon-lg"
                },
                "file" : {
                    "icon" : "fa fa-file icon-state-warning icon-lg"
                }
            },
            "plugins" : [ "types","checkbox" ,"themes"],
            'checkbox': {  // 去除checkbox插件的默认效果
                'tie_selection': false,
                'keep_selected_style': false,
                'whole_node': true,
                "three_state": true
                // "cascade":up

            }
        //    wholerow：把每个节点作为一行，便于选中。节点过多时，在旧的浏览器上会有性能问题。
        //    DND：提供拖放功能，重现整理树节点
        });
        // tree.jstree(true).settings.core.data = data;
        tree.jstree(true).refresh();

        tree.on("check_node.jstree", function (e, data) {
            $scope._selectedId = data.selected[0];
            $scope.arr4s.push(data.node.id);
            $scope.arr4s=$scope.arr4s.unique5($scope.arr4s);
            $scope.arr6s=[];
            $scope.arr5s=[];
            if($scope.arr4s.isContained($scope.arr4s,data.node.children_d)&&data.node.children_d!=''){
                if(data.node.parent=='#') {
                    $scope.children = function () {
                        $.each(data.node.children,function (index,value) {
                            $ajax.post('/api/contacts/getConsList', $.param({
                                type_id:value
                            }), function (mobiles) {
                                $.each(mobiles.list,function (index,value2) {
                                    $scope.arr6s.push(value2.mobile);
                                    $scope.arr5s.push(value2.mobile);
                                })
                                if(index==data.node.children.length-1){
                                    return postexp1();
                                }
                            });
                        })
                        // return postexp1();
                    }

                    //获取当前id下的手机号+原来的手机号
                    function postexp1() {
                        $ajax.post('/api/contacts/getConsList', $.param({
                            type_id:data.node.id
                        }), function (mobiles) {
                            if (mobiles!=''){
                                $.each(mobiles.list,function (index,value) {
                                    $scope.arr.push(value.mobile);
                                    if(mobiles.list.length-1==index){
                                        return gex1();
                                    }
                                })

                            }else {
                                return gex1();
                            }


                        });
                    }

                    function gex1() {
                        // $scope.arr6s=$scope.arr6s.unique5($scope.arr6s);
                        if($scope.arr6s.unique5($scope.arr6s).length<2){
                            return temps($scope.arr6s);
                        }else {
                            return temps($scope.arr6s);
                        }

                        function temps() {
                            if ($scope.arr6s!=''){
                                $.each($scope.arr6s,function (index,value) {
                                    $scope.arr.remove(value);
                                    if ($scope.arr6s.length-1==index){
                                        return CheckList();
                                    }
                                })


                                // $ajax.post('/api/marketing/Books/check', $.param({
                                //     content: $scope.arr.join('\n'),
                                //     username:apikey}), function(result) {
                                //     //展示手机号检测详情
                                //     $scope.Maillist = result;
                                //     // 带加入手机号总和
                                //     $rootScope.MaillistMobiles = result.valid;
                                // });
                                // $scope.arr6s=[]
                            }else {
                                return CheckList();
                            }
                        }


                        function CheckList() {
                            $.each($scope.arr,function (a,b) {
                                $scope.arr5s.remove(b)
                            })
                            $scope.arr=$scope.arr.concat($scope.arr5s)
                            $ajax.post('/api/marketing/Books/check', $.param({
                                content: $scope.arr.join('\n'),
                                username:apikey}), function(result) {
                                //展示手机号检测详情
                                $scope.Maillist = result;
                                // 带加入手机号总和
                                // $rootScope.MaillistMobiles = result.valid;
                            });
                            $scope.arr6s=[]
                        }

                    }
                    // $scope.arr4s=[];不能加
                    $scope.children();
                    return false;
                }
                else if(data.node.parent!='#'&&data.node.children_d!='') {
                    var arr1 = $scope.arr4s; //数组A
                    var arr2 = data.node.children_d;//数组B
                    var temp = []; //临时数组1
                    var temparray1 = [];//临时数组2
                    var temparray2 = [];//临时数组2
                    for (var i = 0; i < arr2.length; i++) {
                        temp[arr2[i]] = true;//巧妙地方：把数组B的值当成临时数组1的键并赋值为真
                    };
                    for (var i = 0; i < arr1.length; i++) {
                        if (!temp[arr1[i]]) {
                            temparray1.push(arr1[i]);//巧妙地方：同时把数组A的值当成临时数组1的键并判断是否为真，如果不为真说明没重复，就合并到一个新数组里，这样就可以得到一个全新并无重复的数组
                        }else {
                            temparray2.push(arr1[i]);
                        };

                    };
                    $scope.arr6s=[];
                    $scope.children2 = function () {
                        if(temparray2!=''){
                            $.each(temparray2,function (index,value) {
                                $ajax.post('/api/contacts/getConsList', $.param({
                                    type_id:value
                                }), function (mobiles) {
                                    $.each(mobiles.list,function (index2,value2) {
                                        $scope.arr6s.push(value2.mobile);
                                    })
                                    if(index==temparray2.length-1){
                                        return postexp2();
                                    }

                                });
                            })
                        }else {
                            return postexp2();
                        }

                    }
                    //获取当前id下的手机号+原来的手机号
                    function postexp2() {
                        $ajax.post('/api/contacts/getConsList', $.param({
                            type_id:data.node.id
                        }), function (mobiles) {
                            $.each(mobiles.list,function (index,value) {
                                $scope.arr.push(value.mobile);
                            })
                            return gex2();
                        });
                    }
                    // $scope.arr4s=[];不能加
                    function gex2() {
                        $scope.arr6s=$scope.arr6s.unique5($scope.arr6s);

                        if ($scope.arr6s!=''){
                            $.each($scope.arr6s,function (index,value) {
                                $scope.arr.remove(value);
                                if($scope.arr6s.length-1==index){
                                    return ckeckList2();
                                }
                            })

                        }else {
                            return ckeckList2();
                        }
                        function ckeckList2() {
                            $ajax.post('/api/marketing/Books/check', $.param({
                                content: $scope.arr.join('\n'),
                                username:apikey}), function(result) {
                                //展示手机号检测详情
                                $scope.Maillist = result;
                                // 带加入手机号总和
                                // $rootScope.MaillistMobiles = result.valid;
                            });

                        }
                    }
                    $scope.children2();
                    return false;
                }
                else {
                    // $.each(data.node.children_d,function (index,value) {
                    //     $scope.arr4s.push(value);
                    // });

                    $ajax.post('/api/contacts/getConsList', $.param({
                        type_id:data.node.id
                    }), function (mobiles) {

                        $.each(mobiles.list,function (index,value) {
                            $scope.arr.push(value.mobile);
                        })
                        $ajax.post('/api/marketing/Books/check', $.param({
                            content: $scope.arr.join('\n'),
                            username:apikey}), function(result) {
                            //展示手机号检测详情
                            $scope.Maillist = result;
                            // 带加入手机号总和
                            // $rootScope.MaillistMobiles = result.valid;
                        });
                    });
                    $scope.arr4s=[];
                    return false;
                }
            }else{
                // $.each(data.node.children_d,function (index,value) {
                //     $scope.arr4s.push(value);
                // })
                var arr1 = $scope.arr4s; //数组A
                var arr2 = data.node.children_d;//数组B
                var temp = []; //临时数组1
                var temparray1 = [];//临时数组2
                var temparray2 = [];//临时数组2
                for (var i = 0; i < arr2.length; i++) {
                    temp[arr2[i]] = true;//巧妙地方：把数组B的值当成临时数组1的键并赋值为真
                };
                for (var i = 0; i < arr1.length; i++) {
                    if (!temp[arr1[i]]) {
                        temparray1.push(arr1[i]);//巧妙地方：同时把数组A的值当成临时数组1的键并判断是否为真，如果不为真说明没重复，就合并到一个新数组里，这样就可以得到一个全新并无重复的数组
                    }else {
                        temparray2.push(arr1[i]);
                    };
                };

                $scope.children3 = function () {
                    if (temparray2!=''){
                        $.each(temparray2,function (index,value) {
                            $ajax.post('/api/contacts/getConsList', $.param({
                                type_id:value
                            }), function (mobiles) {
                                $.each(mobiles.list,function (index2,value2) {
                                    $scope.arr6s.push(value2.mobile);
                                    $scope.arr5s.push(value2.mobile);

                                })
                                if(index==temparray2.length-1){
                                    return pex3();
                                }
                            });
                        })

                    }else {
                        return pex3();
                    }

                }
                $scope.children3();
                function pex3() {
                    $ajax.post('/api/contacts/getConsList', $.param({
                        type_id:data.node.id
                    }), function (mobiles) {
                        $.each(mobiles.list,function (index,value) {
                            $scope.arr.push(value.mobile);
                            if(mobiles.list.length-1==index){
                                return IfChick();
                            }
                        })


                    });
                }

                function IfChick() {
                    if ($scope.arr6s!=''){
                        $scope.arr6s=$scope.arr6s.unique5($scope.arr6s);
                        $.each($scope.arr6s,function (index,value) {
                            $scope.arr.remove(value)
                            if ($scope.arr6s.length-1==index){
                                return postexp3();
                            }
                        })

                    }else {
                        return postexp3()
                    }
                }

                function postexp3() {
                    $.each($scope.arr,function (a,b) {
                        $scope.arr5s.remove(b)
                    })
                    $scope.arr=$scope.arr.concat($scope.arr5s)
                    $ajax.post('/api/marketing/Books/check', $.param({
                        content: $scope.arr.join('\n'),
                        username:apikey}), function(result) {
                        //展示手机号检测详情
                        $scope.Maillist = result;
                        // 带加入手机号总和
                        // $rootScope.MaillistMobiles = result.valid;
                    });

                }
                // $scope.arr4s=[];不能加
            }
            // tree.jstree(true).get_all_checked = function(full) {
            //     var tmp=new Array;
            //     for(var i in this._model.data){
            //         if(this.is_undetermined(i)||this.is_checked(i)){tmp.push(full?this._model.data[i]:i);}
            //     }
            //     return tmp;
            // };
            // var checkedNodes = tree.jstree(true).get_all_checked(false);
            // console.log(checkedNodes)
        });

        tree.on("uncheck_node.jstree", function (e, data) {
            // $scope.arr4s.remove(data.node.children_d);
            $scope.arr4s.remove(data.node.children_d)
            $.each(data.node.children_d,function (index,value) {
                $scope.arr4s.remove(value);
            })
            $scope._selectedId = data.selected[0];
            // $.each(data.node.children_d,function (index,value) {
            //     $scope.arr4s.remove(value);
            //     $scope.arr5s.push(value)
            // })

            $ajax.post('/api/contacts/getConsList', $.param({
                type_id:data.node.id
            }), function (mobiles) {
                $.each(mobiles.list,function (index,value) {
                    $scope.arr.remove(value.mobile)
                })
//                 //做比较的两个数组
//                 var array1 = $scope.arr;//数组1
//                 var array2 = $scope.arr2;//数组2
//
// //临时数组存放
//                 var tempArray1 = [];//临时数组1
//                 var tempArray2 = [];//临时数组2
//
//                 for(var i=0;i<array2.length;i++){
//                     tempArray1[array2[i]]=true;//将数array2 中的元素值作为tempArray1 中的键，值为true；
//                 }
//
//                 for(var i=0;i<array1.length;i++){
//                     if(!tempArray1[array1[i]]){
//                         tempArray2.push(array1[i]);//过滤array1 中与array2 相同的元素；
//                     }
//                 }
//                 $scope.arr=tempArray2;
                if(tree.jstree('get_checked')==''){
                    $scope.arr=[]
                }
                $scope.arr2=[];
                $ajax.post('/api/marketing/Books/check', $.param({
                    content: $scope.arr.join('\n'),
                    username:apikey}), function(result) {
                    $scope.Maillist = result;
                    // 带加入手机号总和
                    // $rootScope.MaillistMobiles = result.valid;
                });
            });
        });

        $scope.uncheck_all = function () {
            tree.jstree(true).uncheck_all();
            $scope.arr=[];
            $ajax.post('/api/marketing/Books/check', $.param({
                content: $scope.arr.join('\n'),
                username:apikey}), function(result) {
                $scope.Maillist = result;
                // $rootScope.MaillistMobiles = result.valid;
            });
        }
        $scope.check_all = function () {
            $scope.arr=[];
            $ajax.post('/api/contacts/getConsList', $.param({
                type_id:''
            }), function (mobiles) {
                $.each(mobiles.list,function (index,value) {
                    $scope.arr.push(value.mobile)
                })
                $ajax.post('/api/marketing/Books/check', $.param({
                    content: $scope.arr.join('\n'),
                    username:apikey}), function(result) {
                    $scope.Maillist = result;
                    // $rootScope.MaillistMobiles = result.valid;


                });
            });
            tree.jstree(true).check_all()
        }
    };
    $scope.getContactGroup()

});
//模板含有变量弹框
angular.module('App').controller('PlatConTrainsCtrl', function($rootScope, $stateParams, $uibModal,$scope, $ajax, $uibModalInstance, data) {
    $scope.sendConArray=data.ConArray;
    $scope.sendConTent=data.ConTent;
    $scope.sendConTents=data.ConTent;
    $scope.conf=[];
    $scope.val=sessionStorage.getItem("valMb")||[];


    $scope.ok = function() {

        $scope.conf=[];
        $("input[name='variable']").each(function (i,f) {
            $scope.conf.push(f.value)
        })
        for (var i=0;i<$scope.sendConArray.length;i++){
            if($scope.conf[i]==''){
                $scope.sendConTent=$scope.sendConTent;
            }else {
                $scope.sendConTent=$scope.sendConTent.replace($scope.sendConArray[i],$scope.conf[i])
            }

        }
         sessionStorage.setItem("valMb", $scope.conf);
        data.callback($scope.sendConTent);
        $uibModalInstance.dismiss(0);
    };
    setTimeout(function () {
        // console.log($scope.val)
        if($scope.val.length>0){
            $("input[name='variable']").each(function (i,f) {
                $(this).val($scope.val.split(',')[i])
            })

            $scope.sendConTent=data.ConTent;
            for (var i=0;i<$scope.sendConArray.length;i++){
                if($scope.val.split(',')[i]==''){
                    $scope.sendConTent=$scope.sendConTent.replace($scope.sendConArray[i],$scope.sendConArray[i]);
                }else {
                    $scope.sendConTent=$scope.sendConTent.replace($scope.sendConArray[i],$scope.val.split(',')[i])
                }

            }
            $scope.sendConTents=$scope.sendConTent;
            $scope.$apply()
            sessionStorage.setItem("valMb",$scope.val.split(','));
        }

    },100)


    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };

    $scope.changeContent = function () {
        $scope.sendConTent=data.ConTent;
        $scope.conf=[]
        $("input[name='variable']").each(function (i,f) {
            $scope.conf.push(f.value)
        })
        // console.log($scope.conf)
        for (var i=0;i<$scope.sendConArray.length;i++){
            if($scope.conf[i]==''){
                $scope.sendConTent=$scope.sendConTent.replace($scope.sendConArray[i],$scope.sendConArray[i]);
            }else {
                $scope.sendConTent=$scope.sendConTent.replace($scope.sendConArray[i],$scope.conf[i])
            }

        }
        $scope.sendConTents=$scope.sendConTent;
        sessionStorage.setItem("valMb", $scope.conf);

    }

});


//短信发送前弹框
angular.module('App').controller('PlatSummaryCtrl', function($rootScope, $stateParams, $uibModal,$scope, $ajax, $uibModalInstance, data) {
    $scope.sendData=data;
    $scope.submit = function() {
        $ajax.post('/api/marketing/Dispatch/run/', $.param({
            username:$scope.sendData.username,
            content:$scope.sendData.content,
            cancel:$scope.sendData.cancel,
            timer: $scope.sendData.timer
        }), function() {
            $uibModalInstance.dismiss(0);
            layer.open({
                title:"信息",
                content:'提交成功！稍后请到发送记录里查看发送结果',
                // content:'短信发送成功!&nbsp;共计<span class=\'font-red\'>' + $scope.sendData.mobiles + '</span>个号码,<span class=\'font-red\'>' + $scope.sendData.counts + '</span>条短信',
                // content:'短信发送成功!',
                yes:function () {
                    layer.closeAll();
                    location.reload();
                }
            });
        });
    };


    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };

});

//黑名单选择选项
angular.module('App').controller('PlatcheckeditCtrl', function($rootScope, $stateParams, $uibModal,$scope, $ajax, $uibModalInstance, data) {
    $scope.option=data.sname;
    var apikey=$rootScope.apikey;
    if(apikey==undefined){
        apikey= sessionStorage.getItem("ApiKey");
    }
    //分页信息
    $scope.data=[];
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
    $scope.eidtall=function () {
        $("#tbl").find('.group-checkable').change(function () {
            var set = $(this).attr("data-set");
            var checked = $(this).is(":checked");
            $(set).each(function () {
                if (checked) {
                    $(this).prop("checked", true);
                    $(this).parents('tr').addClass("active");
                } else {
                    $(this).prop("checked", false);
                    $(this).parents('tr').removeClass("active");
                }
            });
        });
    }

    //获取黑名单名单
    $scope.load = function () {
        $(".group-checkable").prop("checked", false);
        $(".group-checkable").removeClass("active");

        $scope.tableData = data.item.list;
        $scope.paginationConf.totalItems = data.item.count;

    };
    $scope.load();

    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };

    $(function () {
        //checkbox选择
        $("#tbl").find('.group-checkable').change(function () {
            var set = $(this).attr("data-set");
            var checked = $(this).is(":checked");
            $(set).each(function () {
                if (checked) {
                    $(this).prop("checked", true);
                    $(this).parents('tr').addClass("active");
                } else {
                    $(this).prop("checked", false);
                    $(this).parents('tr').removeClass("active");
                }
            });
        });
        $("#tbl").on('change', 'tbody tr .checkboxes', function () {
            $(this).parents('tr').toggleClass("active");
        });

        $scope.getSelectIds = function (ids,mobile) {
            var all={ids : '',mobile:''}
            $(".checkboxes").each(function () {
                var checked = $(this).is(":checked");
                if (checked) {
                    all.ids += $(this).attr('value') + ",";
                    all.mobile += $(this).attr('data-id') + ",";
                }
            });
            if(all.ids||all.mobile){
                all.ids = all.ids.substring(0,all.ids.length-1);
                all.mobile = all.mobile.substring(0,all.mobile.length-1);
            }
            return all;

        };
    });

    $scope.getId = function () {
        var data = $scope.getSelectIds();

        if(data.ids){
            if($scope.option=='single'){
                var telEdit = data.mobile.split(",");

                //做比较的两个数组
                var array1 = $rootScope.routmobiles;//数组1
                var array2 = telEdit;//数组2

//临时数组存放
                var tempArray1 = [];//临时数组1
                var tempArray2 = [];//临时数组2

                for(var i=0;i<array2.length;i++){
                    tempArray1[array2[i]]=true;//将数array2 中的元素值作为tempArray1 中的键，值为true；
                }

                for(var i=0;i<array1.length;i++){
                    if(!tempArray1[array1[i]]){
                        tempArray2.push(array1[i]);//过滤array1 中与array2 相同的元素；
                    }
                }

                //筛选后输出
                if(tempArray2==''){
                    $rootScope.data.mobiles=''
                }else {
                    $rootScope.data.mobiles=tempArray2.join('\n')
                    $ajax.post('/api/marketing/Write/check', $.param({
                        content: $rootScope.data.mobiles,
                        username:apikey}), function(result) {
                        $rootScope.mobileData = result;
                    });
                }


                $ajax.post('/api/marketing/Ignore/remove', $.param({
                    ids: data.ids,
                    username:apikey}), function(result) {
                    $rootScope.batcheckMpbiles=$rootScope.batcheckMpbiles-array2.length;
                    layer.msg("操作成功", {time: 2000, icon: 1});
                });

                $('#mobileschange').val(tempArray2.join('\n'))
            } else if($scope.option=='batch'){
                $ajax.post('/api/marketing/Ignore2/remove', $.param({
                    ids: data.ids,
                    username:apikey}), function(result) {
                    $rootScope.batupLoadMpbiles=$rootScope.batupLoadMpbiles-data.ids.split(",").length;
                    layer.msg("操作成功", {time: 2000, icon: 1});
                });
            }else if($scope.option=='maillist'){
                $ajax.post('/api/marketing/IgnoreBooks/remove', $.param({
                    ids: data.ids,
                    username:apikey}), function(result) {
                    // $rootScope.MaillistMobiles=$rootScope.MaillistMobiles-data.ids.split(",").length;
                    layer.msg("操作成功", {time: 2000, icon: 1});
                });
            }

            $uibModalInstance.dismiss(0);


        }else{
            layer.msg("请选择操作的联系人", {time: 2000, icon: 1});
        }
    };


});



