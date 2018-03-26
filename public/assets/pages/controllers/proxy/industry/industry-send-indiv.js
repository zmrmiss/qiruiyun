/**
 * 群发短信 短信发送
 *
 */
angular.module('App').controller('MessageIndustryIndivSendCtrl', function($rootScope, $stateParams, $uibModal, $scope, $ajax, FileUploader, $uibModal,$filter) {

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



    var apindustry=$rootScope.apindustry;
    if(apindustry==undefined){
        apindustry= sessionStorage.getItem("ApiIndustry");
    }
    $scope.currentTab = 'industry.send.routine';
    $scope.currentTab2 = 'industry.send.indiv';

    $scope.isActiveTab = function(url) {
        return url === $scope.currentTab;
    };
    $scope.isActiveDay = function(url) {
        return url === $scope.currentTab2;
    };

    //上传文件后为true
    $scope.judgment=false;


    //样式
    $scope.reStyle = function() {
        setTimeout(function(){
            var width = $('#signDiv').width();
            $('#content').css('text-indent', width - 8);
        }, 200)

    };
    //获取号码总数
    $rootScope.mobilenumber2=0;

    // 签名数据
    $scope.signs = [];
    // 选中的签名
    $scope.sign = {};
    $rootScope.data = {
        sign: '',
        content: '',
        mobiles: '',
        Preview: '',
        scheduleSendTime:'',
        disnone:'',
        cookie:''
    };
    $ajax.post('/api/marketing/Prepare/datetime',$.param({username:apindustry}),function (result) {
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
    $scope.keys = [];


    //批量导入展示
    $scope.batchshow=false;
    //直接清除手机号
    $scope.clearShow=false;
    $scope.batch = {
        total: 0,
        valid: 0,
        repeat: 0,
        invalid: 0
    };

    //个性化修改20170913
    //展示table
    $scope.Personatable=[];

    //序列组
    $scope.SequencelListS=[];

    //添加序列组
    $scope.SequencelListCreate=[];

    //添加单个到文本框
    $scope.cterte= {SeqListCre:''};


    //首选序列号
    $scope.order={
        SeqList:''
    }

    //是否上传文件或是否缓存了
    $scope.upOpenCookie=false;

    //号码序列号首次不展示、和添加获取的变量
    $scope.SeqListShow=false;
    $scope.SeqListCre=false;

    $scope.init = function () {
        $scope.data.mobiles = '';
        $scope.data.content = '';
        $scope.totalWords = 70; //总字数
        $scope.inputWords = 0; //已输入字数
        $scope.signWords = 0;   //签名字数
        $scope.tWords = 0;      //回T退订字数
        $scope.hasT = false;
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
        $ajax.post('/api/marketing/Prepare/sign', $.param({username: apindustry}), function(result) {
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
        $scope.inputWords = $scope.signWords + $scope.data.content.length;
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
        // $scope.data.content=$scope.data.cookie;
        $scope.calWords();
    };


    //手机号码缓存
    $scope.showResult=false;
    $scope.shower={
        total: 0,
        valid: 0,
        repeat: 0,
        invalid: 0
    }
    //检测号码缓存
    $scope.formcookie = function () {
        $ajax.post('/api/marketing/Ignore3/load/',$.param({username:apindustry}),function (result) {
            if(result!=null){
                $scope.judgment=true;
                $scope.showResult=true;
                $scope.upOpenCookie=true;
                $scope.shower=result;
                $rootScope.mobilenumber2=result.total;

                //有号码缓存操作
                $ajax.post('/api/marketing/SpecialSheet/check/',
                    $.param({username:apindustry}),
                    function(result) {
                        $.each(result.column,function (index,value) {
                            $scope.SequencelListCreate.push(index);
                            $scope.cterte.SeqListCre=$scope.SequencelListCreate[0]
                        })
                        //上传文件后展示
                        $scope.SeqListCre=true;
                    });
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
                $ajax.post('/api/marketing/Ignore3/clean/',$.param({username: apindustry}) , function () {
                    $scope.showResult=false;
                    $scope.judgment=false;
                    $scope.SeqListCre=false;
                    $scope.upOpenCookie=false;
                    $scope.clearShow=false;
                    $scope.SeqListShow=false;
                    $rootScope.mobilenumber2=0;
                    $scope.data.Preview= '';
                    $scope.batchshow=false;
                    $('#uploadpress').html('');
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
        $ajax.post('/api/marketing/Prepare/datetime',$.param({username:apindustry}),function (result) {
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
        // console.log($scope.btn.list)
        // console.log(elementId)
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

                if($t.value.substring(startPos, startPos-1)=='{'&&$t.value.substring(startPos, startPos+1)=='}'){
                    //长度为1

                    $t.value = $t.value.substring(0, startPos-1) + '{'+value+'}' + $t.value.substring(endPos+1, $t.value.length);

                }else if($t.value.substring(startPos, startPos-1)=='{'&&$t.value.substring(startPos+1, startPos+2)=='}'){
                    //长度为1

                    $t.value = $t.value.substring(0, startPos-1) + '{'+value+'}' + $t.value.substring(endPos+2, $t.value.length);
                }else if($t.value.substring(startPos, startPos-1)=='{'&&$t.value.substring(startPos+2, startPos+3)=='}'){
                    //长度为1
                    $t.value = $t.value.substring(0, startPos-1) + '{'+value+'}' + $t.value.substring(endPos+3, $t.value.length);
                }else  if($t.value.substring(startPos-1, startPos-2)=='{'&&$t.value.substring(startPos, startPos+1)=='}'){
                    //长度为2

                    $t.value = $t.value.substring(0, startPos-2) + '{'+value+'}' + $t.value.substring(endPos+1, $t.value.length);

                }else if($t.value.substring(startPos-1, startPos-2)=='{'&&$t.value.substring(startPos+1, startPos+2)=='}'){
                    //长度为2

                    $t.value = $t.value.substring(0, startPos-2) + '{'+value+'}' + $t.value.substring(endPos+2, $t.value.length);

                }else if($t.value.substring(startPos-1, startPos-2)=='{'&&$t.value.substring(startPos+2, startPos+3)=='}'){
                    //长度为2

                    $t.value = $t.value.substring(0, startPos-2) + '{'+value+'}' + $t.value.substring(endPos+2, $t.value.length);

                }else if($t.value.substring(startPos-2, startPos-3)=='{'&&$t.value.substring(startPos, startPos+1)=='}'){
                    //长度为2

                    $t.value = $t.value.substring(0, startPos-3) + '{'+value+'}' + $t.value.substring(endPos+1, $t.value.length);

                }else {
                    $t.value = $t.value.substring(0, startPos) + '{'+value+'}' + $t.value.substring(endPos, $t.value.length);
                }

                $('#' + elementId).focus();
                // console.log($t.value.substring(startPos-2, startPos-1))
                // $('#' + elementId).focus(function () {
                //     document.getElementById('keybored').style.display = '';
                // });
                // $t.selectionStart = startPos + value.length;
                // $t.selectionEnd = startPos + value.length;
                // $t.scrollTop = scrollTop;

                // if (arguments.length == 2) {
                //     $t.setSelectionRange(startPos - 2,
                //         $t.selectionEnd + 2);
                //     // $('#' + elementId).focus();
                // }
            } else {
                $('#' + elementId).val($('#' + elementId).val() + '{'+value+'}');
                $('#' + elementId).focus();
                // $('#' + elementId).focus(function () {
                //     document.getElementById('keybored').style.display = '';
                // });
            }
        }
        $scope.data.content = $('#content').val();
        // $scope.data.cookie = $('#content').val();
    };

    $scope.templates = [];
    $scope.tplTab = 1;
    $scope.num=1;
    // 获取模板
    $scope.getCommonTemplate = function () {
        $scope.templates.splice(0, $scope.templates.length);
        if ($scope.tplTab === 1) {
            $ajax.post("/api/marketing/Prepare/templet", $.param({username:apindustry,limit:5,page:$scope.num}), function(result) {
                $scope.templates = result.list;
                $scope.templatesnum = result.count;
            });
        } else if ($scope.tplTab === 2) {
            $ajax.post('/api/marketing/Prepare/preset', $.param({username:apindustry,limit:5,page:$scope.num}), function(result) {
                $scope.templates = result.list;
                $scope.templatesnum = result.count;
            });
        }
    };
    $scope.getCommonTemplate();

    //模板换一批
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

    $scope.selectTpl = function (template) {
        $scope.data.content = template;
        // $scope.data.cookie = template;
        $rootScope.checkContent();
        $scope.calWords();
    };

    //签名样式
    $scope.$on('$viewContentLoaded', function() {
        $scope.reStyle();
    });

    $scope.Personalized = function () {
        $ajax.post('/api/marketing/SpecialSheet/check/',
            $.param({username:apindustry}),
            function(result) {
                // $scope.Personatable=result.column;
                // $.each(result.column,function (index,value) {
                //     $scope.SequencelListS.push(index);
                //     // $scope.order.SeqList=$scope.SequencelListS[0]
                //     $scope.SequencelListCreate.push(index);
                //     $scope.cterte.SeqListCre=$scope.SequencelListCreate[0]
                // })
                // //上传文件后展示
                // $scope.SeqListShow=true;
                // $scope.SeqListCre=true;

                $scope.Personatable=result.column;
                var arr1=[];
                var arr2=[];
                $.each(result.column,function (index,value) {
                    arr1.push(index);
                    arr2.push(index);
                })
                $scope.SequencelListS=arr1;
                // $scope.order.SeqList=$scope.SequencelListS[0]
                $scope.SequencelListCreate=arr2;
                $scope.cterte.SeqListCre=arr2[0];
                //上传文件后展示
                $scope.SeqListShow=true;
                $scope.SeqListCre=true;
            });
    }
    //选择号码所在列执行
    $scope.selectLetter = function (letter) {
        $scope.popcheck(letter)
    }

    //上传检测手机号码多少
    $scope.popcheck = function (letter) {
        $scope.judgment=false;
        $ajax.post('/api/marketing/Special/check/',
            $.param({username:apindustry,specify:letter}),
            function(result) {
                //判断时候选择号码所在列
                $scope.judgment=true;

                $scope.batchshow=true;
                $scope.clearShow=false;
                $scope.batch = result;
                if($scope.batch.valid>0){
                    $rootScope.mobilenumber2=$scope.batch.valid;
                    $scope.blackcheck()
                }else if($scope.batch.valid==0){
                    $rootScope.mobilenumber2=$scope.batch.valid;
                }
            });
    }

    //检测是否有黑名单
    $scope.blackcheck = function () {
        $ajax.post('/api/marketing/Ignore3/check',
            $.param({username:apindustry}),
            function(result) {
                if(result.list!=null){
                    $uibModal.open({
                        backdrop: 'static',
                        templateUrl: 'openBlackRoster.html',
                        controller: 'IndustrycheckeditCtrl',
                        size: 'md',
                        resolve:{
                            data : function(){
                                return {
                                    item: angular.copy(result),
                                    callback: function() {
                                        $scope.load();
                                    }
                                }
                            }
                        }
                    });
                } else {
                    if($scope.data.content!=''){
                        $rootScope.checkContent()
                    }

                }

            });
    }

    // //上传 文件后弹框
    // $scope.OpenUploaer = function () {
    //     $uibModal.open({
    //         backdrop: 'static',
    //         templateUrl: 'sendMsgFromUp.html',
    //         controller: 'PlatLoaderCtrl',
    //         size: 'md',
    //         resolve:{
    //             data : function(){
    //                 return {
    //                     // item: angular.copy(result),
    //                     // callback: function() {
    //                     //     $scope.load();
    //                     // }
    //                 }
    //             }
    //         }
    //     });
    // }

    $(document).ready(function () {
        $('#content').focus(function () {
            if ($scope.keys.length > 0) {
                document.getElementById('keybored').style.display = '';
            }

        })
    });

    //下载模板
    $scope.download = function () {
        window.open(window.location.origin + '/download/%E4%B8%AA%E6%80%A7%E7%BE%A4%E5%8F%91%E6%A8%A1%E6%9D%BF%E5%8F%8A%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E.zip');
    };



    //加载上传文件
    $scope.$on('$viewContentLoaded', function() {
        $list = $('#thelist'),
            $btn = $('#ctlBtn'),
            state = 'pending',
            uploader;
        var uploader = WebUploader.create({
            resize: false, // 不压缩image
            swf: '../../public/js/webuploader/Uploader.swf', // swf文件路径
            server: '/api/batchs2/Routine/stream'+'?'+new Date().getTime(), // 文件接收服务端。
            formData: {
                username: apindustry
            },
            pick:{id:'#picker',multiple: false}, // 选择文件的按钮。可选
            chunked: true, //是否要分片处理大文件上传
            chunkSize: 1024 * 1024, //分片上传，每片2M，默认是5M
            auto: true, //选择文件后是否自动上传
            fileSingleSizeLimit: 50 * 1024 * 1024 ,// 单个文件大小50 M
            chunkRetry: 3, //如果某个分片由于网络问题出错，允许自动重传次数
            thread: 1 ,// 最大上传并发数
            accept: {
                title: 'file',
                extensions: 'csv,xls,xlsx',
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
            $('#uploadpress').html(html);
            var bfb=Math.round(percentage*100)+ '%';
            $('#loadsize').html(bfb);
            html.css('width', percentage * 100 + '%');
        });
        // 文件上传成功
        uploader.on('uploadSuccess', function (file,response) {
            // $scope.judgment=true;
            //是否上传文件或是否缓存了
            $scope.upOpenCookie=true;

            //显示列表
            $scope.showResult=false;

            //直接清除选项
            $scope.clearShow=true;

            //文件
            $scope.file=file;
            var html = $('<div id="' + file.id + '" class="">' +
                '<h4 class="info" style="width: 100%">' + file.name + '</h4>' +
                '</div><div><span>已上传</span></div>');
            $('#uploadpress').html(html);
            if(response.data==null){
                layer.msg(response.msg, {time: 1000, icon: 2}, function(){});
                return false;
            }
            if(response.data.status==1){
                $scope.Personalized()
            }

        });


        // 文件上传失败，显示上传出错
        uploader.on('uploadError', function (file) {
            var html = $('<div id="' + file.id + '" class="">' +
                '<h4 class="info" style="width: 100%">' + file.name + '</h4>' +
                '</div><div><span>上传出错</span></div>');
            $('#uploadpress').html(html);
        });


        //当文件被加入队列之前触发
        uploader.on('beforeFileQueued', function (file) {
            uploader.reset()
        });

        $("#picker").hover(function () {
            uploader.refresh();
        })
    });

    /**
     * 添加变量
     */
    $scope.addVar = function () {
        $scope.data.content = $scope.data.content || "";
        var character =["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","X","Y","Z"];
        for(var i=0;i<26;i++){
            if((i+1) == 26 && $scope.data.content.indexOf("{Z}") >=0){
                layer.msg('最多支持26个变量!', {time: 1500, icon: 2});
                return;
            }
            if($scope.data.content.indexOf("{" + (character[i]) + "}") >=0){
                continue;
            }else{
                $scope.data.content += "{" + (character[i]) + "}";
                // $scope.data.cookie += "{" + (character[i]) + "}";

                break;
            }
            i+1;
        }

        $rootScope.checkContent()
    };

    //检测输入框内容加载号码预览
    $rootScope.checkContent = function() {

        if($scope.judgment){
            if($scope.data.content!=''){
                if($scope.data.sign!=''){
                    $rootScope.sendPreview();
                }else {
                    layer.msg('请添加签名!', {time: 1500, icon: 2});
                }

            }else {
                $scope.data.Preview= '';
            }

        }
    };
    //发送预览
    $rootScope.sendPreview = function () {
        $ajax.post('/api/marketing/Preview/view/', $.param({
                templet:'【'+$scope.data.sign+'】'+ $scope.data.content,
                username:apindustry}),
            function(result) {
                $scope.data.Preview= result.join('\n');
            });
    }
    $scope.SummaryIndiv = function () {
        $rootScope.getAuthInfo(function (ret) {
            if (ret && ret.remind == '1') {
                if (ret && ret.authz_status == '1') {
                    $scope.SummarySubDiv2()
                }
            }else {
                $scope.SummarySubDiv2()
            }

        });
    }
    $scope.SummarySubDiv2 = function () {
        if(!$scope.upOpenCookie){
            layer.msg( '请选择上传文件!', {time: 1000, icon:2});
            return false;
        }

        if(!$scope.judgment){
            layer.msg( '请选择号码所在列!', {time: 1000, icon:2});
            return false;
        }

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
        if($rootScope.mobilenumber2==0){
            layer.msg( '请导入文件!', {time: 1000, icon:2});
            return false;
        }

        $scope.changemount=$filter('date')(t,'yyyy-MM-dd HH:mm:ss');

        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'sendMsgSummary.html',
            controller: 'IndustrySummaryIndivCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        mobiles:angular.copy($rootScope.mobilenumber2),
                        username:angular.copy(apindustry),
                        content:angular.copy( '【'+$scope.data.sign+'】'+$scope.data.content),
                        timer: angular.copy($scope.hasTime ? $scope.changemount: ''),
                        callback: function() {
                            // $scope.load();
                        }
                    }
                }
            }
        });
    }
    
});


//短信发送前弹框
angular.module('App').controller('IndustrySummaryIndivCtrl', function($rootScope, $stateParams, $uibModal,$scope, $ajax, $uibModalInstance, data) {
    $scope.sendData=data;
    $scope.submit = function() {
        $ajax.post('/api/marketing/Dispatch2/run/', $.param({
            username:$scope.sendData.username,
            templet: $scope.sendData.content,
            timer:$scope.sendData.timer
        }),function() {
            $uibModalInstance.dismiss(0);
            layer.open({
                title:"信息",
                content:'提交成功！稍后请到发送记录里查看发送结果',
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
angular.module('App').controller('IndustrycheckeditCtrl', function($rootScope, $stateParams, $uibModal,$scope, $ajax, $uibModalInstance, data) {

    var apindustry=$rootScope.apindustry;
    if(apindustry==undefined){
        apindustry= sessionStorage.getItem("ApiIndustry");
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
        $rootScope.checkContent();
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
            $ajax.post('/api/marketing/Ignore3/remove', $.param({
                ids: data.ids,
                username:apindustry}), function(result) {
                $rootScope.mobilenumber2=$rootScope.mobilenumber2-data.ids.split(",").length;
                $rootScope.checkContent()
                layer.msg("操作成功", {time: 2000, icon: 1});
            });

            $uibModalInstance.dismiss(0);


        }else{
            layer.msg("请选择操作的联系人", {time: 2000, icon: 1});
        }
    };


});