/**
 * 接口短信
 * Created by zhangm.
 */
angular.module('App').controller('MessageTemplateCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModal) {

    $scope.currentTab = 'message.hear.template';

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

    var username=$rootScope.username;
    if(username==undefined){
        username= sessionStorage.getItem("qrname");
    }
    $scope.params = {};

    $scope.tableData = [];
    $scope.load = function() {

        var data={page:$scope.paginationConf.currentPage,limit: 10, status:$scope.params.status, username:username,keyword:$scope.params.template};
        $ajax.post('/api/ordinary/Template/items',$.param(data),function (result) {
            // alert(result);
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();



    $scope.sign={};
    $scope.signslist=[];
    // 加载签名
    $scope.loadSignJk = function() {
        $ajax.post('/api/ordinary/Signature/items', $.param({username: username,limit:100}), function(result) {
            result.list.forEach(function (t,i) {
                if(t.status==1){
                    $scope.signslist.push(t)
                }
            })
        });
    };
    $scope.loadSignJk();



    $scope.search = function () {
        $scope.paginationConf.currentPage = 1;
        $scope.load();
    };

    $scope.open = function(data) {
        if($scope.signslist==''){
            layer.msg('暂无审核通过的签名，请先申请签名后再新增模板',{icon:2,time:2000});
            return false;
        }
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'signTemplate.html',
            controller: 'MessageTemplateEditCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        item: angular.copy(username),
                        signs:angular.copy($scope.signslist),
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
                $ajax.post('/api/ordinary/Template/remove',$.param({id: id}) , function () {
                    layer.msg('删除成功!', {time: 1000, icon: 1});
                    $scope.load();
                })
            }
        });

    };



});
angular.module('App').controller('MessageTemplateEditCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {
    // console.log()
    $scope.reStyle = function() {
        setTimeout(function(){
            var width = $('#signDiv').width();
            $('#contents').css('text-indent', width - 8);
        }, 200)

    };
    $scope.prames={};
    $scope.signs = data.signs;
    $scope.sign = $scope.signs[0];
    var num = $scope.signs[0].id;
    $scope.prames.sign = $scope.sign.content;

    $scope.reStyle();



    $scope.selectSign = function (id_name) {
        $scope.prames.sign = id_name.content;
        $scope.sign=id_name;
        $scope.data.sign_id=id_name.id;
        $scope.reStyle();
    }
    // $scope.$on('$viewContentLoaded', function() {
    //
    // });
    // $scope.categories = [];
    // $ajax.post('api/template/categories', {}, function (result) {
    //     $scope.categories = result;
    // });
    // $scope.testFlag = false;
    $scope.facePanel = false;
    $scope.onModShow=function () {
        $scope.facePanel = !$scope.facePanel;
    }

    $scope.data = {
        username: data.item,
        type:3,
        sign_id:num
    };
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
                var $t = $($('#contents'))[0];
                var startPos = $t.selectionStart;
                var endPos = $t.selectionEnd;
                $t.value = $t.value.substring(0, startPos) +"{" + (i + 1) + "}" + $t.value.substring(endPos, $t.value.length);
                $scope.data.content = $t.value;
                $('#contents').focus();
                break;
            }
        }
    };

    //用不到
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

    // $scope.data = data.item || {categoryId: 1};
    // var s = '新增';
    // var url = 'api/template/add';
    // if ($scope.data.id) {
    //
    //     // s = '编辑';
    //     // url = 'api/template/update';
    // }
    // var username=$rootScope.username;
    // if(username==undefined){
    //     username= sessionStorage.getItem("qrname");
    // }



    String.prototype.replaceAll = function(s1,s2){
        return this.replace(new RegExp(s1,"gm"),s2);
    };
    function isInteger(obj) {
        if(!/^\d+$/.test(obj)){
            return false;
        }
        return true;
    }
    var checkTemplate = function(content){
        var splitStr = "##";
        if(content.indexOf("##") >= 0){
            splitStr = "&&";
        }
        var arr = content.replaceAll("{", splitStr + "{").replaceAll("}", "}" + splitStr).split(splitStr);
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
        if($scope.data.content.indexOf("[") == 0 || $scope.data.content.indexOf("]") == ($scope.data.content.length-1)){
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

        $ajax.post('/api/ordinary/Template/add', $.param($scope.data), function (result) {
            layer.msg('保存成功!', {time: 1000, icon: 1});
            $uibModalInstance.dismiss(0);
            data.callback();
        })
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});

