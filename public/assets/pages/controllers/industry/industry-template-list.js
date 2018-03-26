/**
 * 群发短信
 *
 */
angular.module('App').controller('MessageIndustryTemplateCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModal) {

    $scope.currentTab = 'industry.template';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    var apindustry=$rootScope.apindustry;
    if(apindustry==undefined){
        apindustry= sessionStorage.getItem("ApiIndustry");
    }

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

    $scope.params = {};

    $scope.tableData = [];
    $scope.load = function() {
        $ajax.post('/api/marketing/Template/items', $.param({
            username:apindustry,
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage,
            keyword: $scope.params.template,
            status:$scope.params.status
        }), function (result) {
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();

    $scope.search = function () {
        $scope.paginationConf.currentPage = 1;
        $scope.load();
    };

    $scope.open3 = function(data) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'signTemplate.html',
            controller: 'MessageIndustryTemplateEditCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        item: angular.copy(data),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    };

    $scope.openMatch = function(template) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'matchPlatTemplate.html',
            controller: 'IndustryTemplateMatchCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        item: angular.copy(template),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    };

    $scope.delete = function (id) {
        layer.msg('你确定删除该模板吗？', {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                $ajax.post('/api/marketing/Template/remove', $.param({id: id , username:apindustry}), function () {
                    layer.msg('删除成功!', {time: 1000, icon: 1});
                    $scope.load();
                })
            }
        });

    };
});
angular.module('App').controller('MessageIndustryTemplateEditCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    var apindustry=$rootScope.apindustry;
    if(apindustry==undefined){
        apindustry= sessionStorage.getItem("apindustry");
    }
    $scope.facePanel = false;
    $scope.onModShow=function () {
        $scope.facePanel = !$scope.facePanel;
    }

    $scope.data = {
        username:'',
        content: '',
        remark: '',
        type:3
    };


    $scope.data.username=apindustry;
    // $scope.categories = [];
    // $ajax.post('plat/template/categories', {}, function (result) {
    //     $scope.categories = result;
    // });
    // $scope.testFlag = false;

    /**
     * 添加变量
     */
    $scope.addVar = function () {
        $scope.data.content = $scope.data.content || "";
        for(var i=0;i<30;i++){
            if((i+1) == 30 && $scope.data.content.indexOf("{30}") >=0){
                layer.msg('最多支持30个变量!', {time: 1500, icon: 2});
                return;
            }
            if($scope.data.content.indexOf("{" + (i + 1) + "}") >=0){
                continue;
            }else{
                var $t = $($('#contents2'))[0];
                var startPos = $t.selectionStart;
                var endPos = $t.selectionEnd;
                $t.value = $t.value.substring(0, startPos) +"{" + (i + 1) + "}" + $t.value.substring(endPos, $t.value.length);
                $scope.data.content = $t.value;
                $('#contents2').focus();
                break;
            }
        }
    };
    $scope.testMsgVar = function () {
        if(!$scope.data.content){
            layer.msg('请填写模板!', {time: 1000, icon: 2});
            return;
        }
        // if(!$scope.data.content){
        //     layer.msg('请填写变量内容!', {time: 1000, icon: 2});
        //     return;
        // }
        // $ajax.post("plat/template/testMsgVar", $scope.data, function (content) {
        //     layer.open({
        //         title: '短信内容',
        //         content: content
        //     });
        // })
    };

    // $scope.data = data.item || {categoryId: 1};
    var s = '新增';
    var url = '/api/marketing/Template/add';
    if ($scope.data.id) {
        $scope.data = {
            id: $scope.data.id,
            templateName: $scope.data.templateName,
            categoryId: $scope.data.categoryId,
            template: $scope.data.template,
            description: $scope.data.description
        };
        s = '编辑';
        url = 'plat/template/update';
    }

    String.prototype.replaceAll = function(s1,s2){
        return this.replace(new RegExp(s1,"gm"),s2);
    };

    function isInteger(obj) {
        if(!/^\d+$/.test(obj)){
            return false;
        }
        return true;
    }
    var checkTemplate = function(template){
        var splitStr = "##";
        if(template.indexOf("##") >= 0){
            splitStr = "&&";
        }
        var arr = template.replaceAll("{", splitStr + "{").replaceAll("}", "}" + splitStr).split(splitStr);
        for(var i=0;i<arr.length;i++){
            if(arr[i].indexOf("{") >= 0){
                var aa = arr[i].replaceAll("{","").replaceAll("}","")
                if(!isInteger(aa)){
                    layer.msg("包含了非法的模板变量:" + arr[i], {time: 1500, icon: 2});
                    return false;
                }
            }
        }
        return true;
    };

    $scope.ok = function () {
        // if(!checkTemplate($scope.data.content)){
        //     return false;
        // }

        //短信模板首尾不能添加[]且任意位置不能添加【】符号
        if($scope.data.content.indexOf("【") >= 0
            || $scope.data.content.indexOf("】") >= 0){
            layer.msg("短信模板不能包含 【 】 符号!", {time: 1500, icon: 2});
            return;
        }
        if($scope.data.content.indexOf("[") == 0
            || $scope.data.content.indexOf("]") == ($scope.data.content.length-1)){
            layer.msg("短信模板首尾不能添加 [ ] 符号", {time: 1500, icon: 2});
            return;
        }
        if($scope.data.remark==''){
            layer.msg("请填写备注内容", {time: 1500, icon: 2});
            return false
        }
        if($scope.data.type==''){
            layer.msg("请选择短信类型", {time: 1500, icon: 2});
            return false
        }

        $ajax.post(url, $.param($scope.data), function () {
            layer.msg('保存成功!', {time: 1000, icon: 1});
            $uibModalInstance.dismiss(0);
            data.callback();
        })
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});
angular.module('App').controller('IndustryTemplateMatchCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.data = {};
    $scope.data.template = data.item;
    $scope.result = '';

    $scope.ok = function () {
        $('#platTemplateMatchForm').validate({
            rules: {
                content: {
                    required: true
                }
            },
            messages: {
                content: {
                    required: '短信内容必填'
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

                $ajax.post('api/template/match', $scope.data, function (result) {
                    $scope.result = result;
                    // layer.msg('签名' + s + '成功!', {time: 1000, icon: 1});
                    // $uibModalInstance.dismiss(0);
                    // data.callback();
                })
            }
        });
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});
