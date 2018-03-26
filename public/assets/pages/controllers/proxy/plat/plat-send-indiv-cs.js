/**
 * 群发短信 短信发送
 * Created by wangys on 15/1/1.
 */
angular.module('App').controller('MessagePlatIndivSendCtrl', function($rootScope, $stateParams, $uibModal, $scope, $ajax, FileUploader, $uibModal,$filter, $compile) {


    $scope.$on('$viewContentLoaded', function() {
        $scope.reStyle();
    });
    var apikey=$rootScope.apikey;
    if(apikey==undefined){
        apikey= sessionStorage.getItem("ApiKey");
    }
    $scope.currentTab = 'plat.send.routine';
    $scope.currentTab2 = 'plat.send.indiv';

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
            $scope.swidth=width;
            // $('#content').css('text-indent', width - 8);
        }, 200)

    };
    //获取号码总数
    $rootScope.mobilenumber=0;

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
    $scope.substance={
        eq0:''
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
    $scope.hasT = true;
    $rootScope.mobileData = {
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
        $scope.inputWords = $scope.signWords + $scope.data.content.length;
        if ($scope.inputWords <= 70){
            $scope.totalWords = 70;
            $scope.count = 1;
        } else if ($scope.inputWords > 70 && $scope.inputWords <= 500) {
            $scope.count = Math.ceil($scope.inputWords / 67);
            $scope.totalWords = $scope.count * 67;
        }
    };

    $scope.change = function() {
        $scope.data.content=$scope.data.cookie;
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
        $ajax.post('/api/marketing/Ignore3/load/',$.param({username:apikey}),function (result) {
            if(result!=null){
                $scope.judgment=true;
                $scope.showResult=true;
                $scope.upOpenCookie=true;
                $scope.shower=result;
                $rootScope.mobilenumber=result.total;

                //有号码缓存操作
                $ajax.post('/api/marketing/SpecialSheet/check/',
                    $.param({username:apikey}),
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
                $ajax.post('/api/marketing/Ignore3/clean/',$.param({username: apikey}) , function () {
                    $scope.showResult=false;
                    $scope.judgment=false;
                    $scope.SeqListCre=false;
                    $scope.upOpenCookie=false;
                    $rootScope.mobilenumber=0;
                    $scope.data.Preview= '';
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
        $scope.data.cookie = $('#content').val();
    };

    $scope.templates = [];
    $scope.tplTab = 1;
    $scope.num=1;
    // 获取模板
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
        $scope.colors = [
            {name:'black', shade:'dark'},
            {name:'white', shade:'light'},
            {name:'red', shade:'dark'},
            {name:'blue', shade:'dark'},
            {name:'yellow', shade:'light'}
        ];
        // $scope.SequencelListCreate=["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"];
        // $scope.object = {
        //     dark: "black",
        //     light: "red",
        //     lai: "red"
        // };
        $("#content").html(' ');
        $scope.data.content='';
        $scope.data.content = template;
        $scope.data.cookie = template;

        // var html='<div><ui-select ng-model="cterte.SeqListCre" theme="bootstrap" search-enabled="false"  class="ui-select-container ui-select-bootstrap dropdown ng-valid" style="width: 90px;height: 30px;padding: 0 5px" ng-if="SeqListCre"> <ui-select-match placeholder="">{{$select.selected}}</ui-select-match> <ui-select-choices repeat="SeqListCre as SeqListCre in SequencelListCreate | filter: $select.search">{{SeqListCre}} </ui-select-choices> </ui-select></div>';
        // var $html = $compile('<div style="display: inline-block">' +
        //     '<ui-select ng-model="cterte.SeqListCre" theme="bootstrap" search-enabled="false"  class="ui-select-container ui-select-bootstrap dropdown ng-valid" style="width: 90px;height: 30px;padding: 0 5px" > ' +
        //     '<ui-select-match placeholder="">{{$select.selected}}</ui-select-match> ' +
        //     '<ui-select-choices repeat="SeqListCre as SeqListCre in SequencelListCreate | filter: $select.search">{{SeqListCre}} </ui-select-choices> ' +
        //     '</ui-select>' +
        //     '</div>')($scope);
        // var $html= $compile('<select ng-model="myColor" ng-options="color.name for color in colors"></select>')($scope);
        // $scope.names = ["Google", "Runoob", "Taobao"];
        //
        // var $html= '<ui-select ng-model="cterte.SeqListCre"> <ui-select-match> ' +
        //     '<span ng-bind="$select.selected"> </span> ' +
        //     '</ui-select-match> ' +
        //     '<ui-select-choices ng-repeat="SeqListCre as SeqListCre in SequencelListCreate | filter: $select.search"> ' +
        //     '<span ng-bind="SeqListCre"> </span> ' +
        //     '</ui-select-choices> ' +
        //     '</ui-select> ';
        //w2
        var $html= $compile('<select style="float: left;width: 60px;margin-left: 40px;text-align: center" ng-model="mycolors" ng-options="color for color in SequencelListCreate"></select>')($scope);
        //3
        // var $html= $compile('<select ng-init="selectedName = names[0]" ng-model="selectedName" ng-options="x for x in SequencelListCreate">')($scope);
        // 4
        // var $html=$compile('<select class="form-control" ui-select2 multiple="multiple" ng-model="container.cpuset" style="width:53%"> <option ng-repeat="key for key in SequencelListCreate" selected value="{{item.cpuset}}">{{key}}</option> </select>')($scope)


        // console.log($scope.data.content.split((/([^\{\}]+)(?=\})/g)));
        var arr=[];
        arr=$scope.data.content.split((/([^\{\}]+)(?=\})/g)).splice(/^[0-9]\d*$/);

        //去除数字字段
        for(var i=0;i<arr.length;i++){
            for(var k in arr[i]){
                if(arr[k]==1||arr[k]==2){
                    arr.splice(k, 1);
                }
            }
        }
        console.log(arr)



        $scope.calWords();
        $scope.data.content='';
        for (var s=0;s<arr.length;s++){
            if(s==arr.length-1){
                $("#content").append('<span ng-model="substance.eq'+s+'" class="clearfix" style="float: left">'+arr[s]+'</span>')
                // $scope.data.content +='<span>'+arr[s]+'</span>' ;
                console.log($scope.substance.eq0)
            }else if(s==0){
                // $scope.data.content +='<span>'+arr[s]+'</span>' ;
                // $scope.data.content +=html
                $("#content").append('<span ng-model="substance.eq'+s+'" class="clearfix conten_fist" style="float: left;">'+arr[s]+'</span>');
                $('.conten_fist').css('padding-left',$scope.swidth+'px')
                $("#content").append($html[0].outerHTML)
            }else {
                // $scope.data.content +='<span>'+arr[s]+'</span>' ;
                // $scope.data.content +=html
                $("#content").append('<span ng-model="substance.eq'+s+'" class="clearfix" style="float: left">'+arr[s]+'</span>')
                $("#content").append($html[0].outerHTML);

            }
        }
        // var head = $("head").remove("script[role='reload']");
        // $("<scri" + "pt>" + "</scr" + "ipt>").attr({ role: 'reload', src:"../../../public/assets/uiangular/select.min.js", type: 'text/javascript' }).appendTo(head);
        // var link = document.createElement("link");
        // link.rel = "stylesheet";
        // link.type = "text/css";
        // link.href = '../../../public/assets/layout/css/select.min.css';
        // document.getElementsByTagName("head")[0].appendChild(link);

        $rootScope.checkContent();

        $scope.arr()
    };


    $scope.arr= function () {
        console.log($scope.substance.eq0)
    }
    $scope.Personalized = function () {
        $ajax.post('/api/marketing/SpecialSheet/check/',
            $.param({username:apikey}),
            function(result) {
                $scope.Personatable=result.column;
                $.each(result.column,function (index,value) {
                    $scope.SequencelListS.push(index);
                    // $scope.order.SeqList=$scope.SequencelListS[0]
                    $scope.SequencelListCreate.push(index);

                    $scope.cterte.SeqListCre=$scope.SequencelListCreate[0]
                })
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
            $.param({username:apikey,specify:letter}),
            function(result) {
                //判断时候选择号码所在列
                $scope.judgment=true;

                $scope.batchshow=true;
                $scope.batch = result;
                if($scope.batch.valid>0){
                    $rootScope.mobilenumber=$scope.batch.valid;
                    $scope.blackcheck()
                }else if($scope.batch.valid==0){
                    $rootScope.mobilenumber=$scope.batch.valid;
                }
            });
    }

    //检测是否有黑名单
    $scope.blackcheck = function () {
        $ajax.post('/api/marketing/Ignore3/check',
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
                username: apikey
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
            html = $('<div id="' + file.id + '" class="">' +
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
            $scope.upOpenCookie=true;
            $scope.showResult=false;
            $scope.file=file;
            html = $('<div id="' + file.id + '" class="">' +
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
            html = $('<div id="' + file.id + '" class="">' +
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
                $scope.data.cookie += "{" + (character[i]) + "}";
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
                username:apikey}),
            function(result) {
                $scope.data.Preview= result.join('\n');
            });
    }

    $scope.SummaryIndiv = function () {

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
        if($rootScope.mobilenumber==0){
            layer.msg( '请导入文件!', {time: 1000, icon:2});
            return false;
        }

        $scope.changemount=$filter('date')(t,'yyyy-MM-dd HH:mm:ss');

        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'sendMsgSummary.html',
            controller: 'PlatSummaryIndivCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        mobiles:angular.copy($rootScope.mobilenumber),
                        username:angular.copy(apikey),
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

//上传文件后弹框
angular.module('App').controller('PlatLoaderCtrl', function($rootScope, $stateParams, $uibModal,$scope, $ajax, $uibModalInstance, data) {

    //分页信息
    $scope.data=[];





    $scope.cancel = function () {
        $rootScope.checkContent();
        $uibModalInstance.dismiss(0);
    };



});


//短信发送前弹框
angular.module('App').controller('PlatSummaryIndivCtrl', function($rootScope, $stateParams, $uibModal,$scope, $ajax, $uibModalInstance, data) {
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
                content:'短信发送成功!&nbsp;共计<span class=\'font-red\'>' + $scope.sendData.mobiles + '</span>个号码',
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
                username:apikey}), function(result) {
                $rootScope.mobilenumber=$rootScope.mobilenumber-data.ids.split(",").length;
                $rootScope.checkContent();
                layer.msg("操作成功", {time: 2000, icon: 1});
            });

            $uibModalInstance.dismiss(0);


        }else{
            layer.msg("请选择操作的联系人", {time: 2000, icon: 1});
        }
    };


});