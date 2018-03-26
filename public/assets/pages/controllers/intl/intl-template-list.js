/**
 * 接口短信
 *
 */
angular.module('App').controller('IntlTemplateCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModal) {

    $scope.currentTab = 'intl.template';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

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
        $ajax.post('intl/template/list', {
            pageSize: $scope.paginationConf.itemsPerPage,
            currentPage: $scope.paginationConf.currentPage,
            template: $scope.params.template,
            applyStatus:$scope.params.applyStatus
        }, function (result) {
            $scope.tableData = result.result;
            $scope.paginationConf.totalItems = result.total;
        });
    };
    // $scope.load();

    $scope.search = function () {
        $scope.paginationConf.currentPage = 1;
        // $scope.load();
    };

    $scope.open = function(data) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'templateEdit.html',
            controller: 'intlTemplateEditCtrl',
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
            templateUrl: 'matchIntlTemplate.html',
            controller: 'IntlTemplateMatchCtrl',
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
                $ajax.post('intl/template/delete', {id: id}, function () {
                    layer.msg('删除成功!', {time: 1000, icon: 1});
                    $scope.load();
                })
            }
        });

    };
});
angular.module('App').controller('intlTemplateEditCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.categories = [];
    $ajax.post('intl/template/categories', {}, function (result) {
        $scope.categories = result;
    });

    $scope.testFlag = false;
    /**
     * 添加变量
     */
    $scope.addVar = function () {
        $scope.data.template = $scope.data.template || "";
        for(var i=0;i<10;i++){
            if((i+1) == 10 && $scope.data.template.indexOf("{10}") >=0){
                layer.msg('最多支持10个变量!', {time: 1500, icon: 2});
                return;
            }
            if($scope.data.template.indexOf("{" + (i + 1) + "}") >=0){
                continue;
            }else{
                $scope.data.template += "{" + (i + 1) + "}";
                break;
            }
        }
    };

    $scope.testMsgVar = function () {
        if(!$scope.data.template){
            layer.msg('请填写模板!', {time: 1000, icon: 2});
            return;
        }
        if(!$scope.data.content){
            layer.msg('请填写变量内容!', {time: 1000, icon: 2});
            return;
        }
        $ajax.post("plat/template/testMsgVar", $scope.data, function (content) {
            layer.open({
                title: '短信内容',
                content: content
            });
        })
    };

    $scope.data = data.item || {categoryId: 1};
    var s = '新增';
    var url = 'intl/template/add';
    if ($scope.data.id) {
        $scope.data = {
            id: $scope.data.id,
            templateName: $scope.data.templateName,
            categoryId: $scope.data.categoryId,
            template: $scope.data.template,
            description: $scope.data.description
        };
        s = '编辑';
        url = 'intl/template/update';
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
        if(!checkTemplate($scope.data.template)){
            return false;
        }
        //短信模板首尾不能添加[]且任意位置不能添加【】符号
        if($scope.data.template.indexOf("【") >= 0
            || $scope.data.template.indexOf("】") >= 0){
            layer.msg("短信模板不能包含 【 】 符号!", {time: 1500, icon: 2});
            return;
        }
        if($scope.data.template.indexOf("[") == 0
            || $scope.data.template.indexOf("]") == ($scope.data.template.length-1)){
            layer.msg("短信模板首尾不能添加 [ ] 符号", {time: 1500, icon: 2});
            return;
        }

        $ajax.post(url, $scope.data, function (result) {
            layer.msg('保存成功!', {time: 1000, icon: 1});
            $uibModalInstance.dismiss(0);
            data.callback();
        })
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});
angular.module('App').controller('IntlTemplateMatchCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.data = {};
    $scope.data.template = data.item;
    $scope.result = '';

    $scope.ok = function () {
        $('#intlTemplateMatchForm').validate({
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
