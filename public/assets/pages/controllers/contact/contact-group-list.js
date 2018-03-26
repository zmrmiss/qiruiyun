
angular.module('App').controller('ContactGroupCtrl', ['$rootScope', '$stateParams', '$scope', '$ajax','$uibModal', function($rootScope, $stateParams, $scope, $ajax,$uibModal) {
    $scope.$on('$viewContentLoaded', function() {

    });
    $scope.molds=[{name:'手机号',value:'1'},{name:'姓名',value:'2'},{name:'标签',value:'3'}];

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
// angular.module('App').controller('ContactGroupCtrl', function($rootScope, $stateParams, $uibModal, $scope, $ajax, FileUploader) {
    $scope.params = {};
    $scope.moldData = {
        type:$scope.molds[0].value,
        name:$scope.molds[0].name
    };
    $scope.stateItems={};
    $scope._selectedLevel=null;
    $scope._selectedId = null;
    $scope.selectData = {id:0};
    $scope._originalData = [];

    //修改悬浮提示搜索联系人手机号，姓名，标签时使用
    $scope.selectLxr = function (name) {
        $scope.moldData.name=name
    }

    //id
    $scope._getDataById = function (id) {
        for(var i=0;i<$scope._originalData.length;i++){
            if($scope._originalData[i].id == id){
                return $scope._originalData[i];
            }
        }
        return null;
    };

    $scope._getChildNameByParentId = function (id) {
        var c = 1;
        for(var i=0;i<$scope._originalData.length;i++){
            if($scope._originalData[i].parentId == id){
                c ++;
            }
        }
        for(var i=0;i<$scope._originalData.length;i++){
            if($scope._originalData[i].name == ('子分组' + c)){
                c ++;
            }
        }
        return ('子分组' + c);
    };

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
     * 自定义右键菜单
     * @param node
     * @returns {{Create: {separator_before: boolean, separator_after: boolean, label: string, action: action}, Rename: {separator_before: boolean, separator_after: boolean, label: string, action: action}, Remove: {separator_before: boolean, separator_after: boolean, label: string, action: action}}}
     */
    $scope.context_menu = function(node){
        var tree = $('#tree').jstree(true);
        var items = {
            "CreateContact": {
                "separator_before": false,
                "separator_after": false,
                "label": "新建联系人",
                "action": function (obj) {
                    $scope.openContact();
                }
            },
            "Create": {
                "separator_before": true,
                "separator_after": false,
                "label": "新建子分组",
                "action": function (obj) {
                    tree.create_node(node);
                }
            },
            "Rename": {
                "separator_before": false,
                "separator_after": false,
                "label": "重命名",
                "action": function (obj) {
                    tree.edit(node);
                }
            },
            "Remove": {
                "separator_before": false,
                "separator_after": false,
                "label": "删除分组",
                "action": function (obj) {
                    if($scope.tableData.length > 0){
                        layer.msg("该分组下面有联系人，不可以删除！", {time: 2000, icon: 2});
                    }else{
                        layer.confirm('确认删除该分组？', {
                            btn: ['删除','取消'] //按钮
                        }, function(index){
                            tree.delete_node(node);
                        })
                    }
                }
            },
            "SendMsg": {
                "separator_before": true,
                "separator_after": false,
                "label": "发行业短信",
                "action": function (obj) {
                    $scope.sendMsg(2);
                }
            },
            "SendIntlMsg": {
                "separator_before": true,
                "separator_after": false,
                "label": "发营销短信",
                "action": function (obj) {
                    $scope.sendIntlMsg(2);
                }
            },
            "ExportFz": {
                "separator_before": true,
                    "separator_after": false,
                    "label": "导出分组联系人",
                    "action": function (obj) {
                    $scope.ExportFz();
                }
            }
        };
        return items;
    };

    /**
     * 加载分组数
     * @param data
     */
    $scope.loadGroupData = function (data) {
        var tree = $("#tree");
        tree.jstree("destroy");
        tree.jstree({
            'core': {
                "themes" : {
                    "responsive": false
                },
                "check_callback" : true,
                'data': data
            },
            "types" : {
                "default" : {
                    "icon" : "fa fa-folder icon-state-warning icon-lg"
                },
                "file" : {
                    "icon" : "fa fa-file icon-state-warning icon-lg"
                }
            },
            "plugins" : ["wholerow", "contextmenu", "dnd", "state", "types" ],
            "contextmenu" : {
                "items": $scope.context_menu
            }
        });


        tree.jstree(true).settings.core.data = data;
        tree.jstree(true).refresh();

        tree.on("changed.jstree", function (e, data) {
            $scope._selectedId = data.selected[0];

            $scope.params.name = null;

            $scope.paginationConf.currentPage =1;
            $scope.paginationConf.itemsPerPage = 10;

            $scope.load();
        });
        tree.bind("create_node.jstree", function(event, data) {
            $scope.add();
        }).bind("delete_node.jstree", function(event, data) {
            $scope.delete();
        }).bind("rename_node.jstree", function(event, data) {
            $scope.update(data.node.text);
        });
    };
    //新建分组
    $scope.add = function () {

        $ajax.post('/api/contacts/createGroup', $.param({parent_id: $scope._selectedId, tname: $scope._getChildNameByParentId($scope._selectedId), level: parseInt($scope._selectedLevel)+1}),function (result) {//成功
            $rootScope._deptOriginalData = null;
            $scope.getContactGroup();
            layer.msg('新建分组成功！', {time: 1000, icon: 1});
        },function (result) {//失败
            $scope.getContactGroup();
            layer.msg(result.msg, {time: 2000, icon: 2});
        });
    };

    //修改分组
    $scope.update = function (nodeName) {

        $ajax.post('/api/contacts/editGroup', $.param({
            id: $scope._selectedId,
            tname: nodeName.split("(")[0]
        }),function (result) {//成功
            $rootScope._deptOriginalData = null;
            $scope.getContactGroup();
            layer.msg('修改分组成功！', {time: 1000, icon: 1});
        },function (result) {//失败
            $scope.getContactGroup();
            layer.msg(result.msg, {time: 2000, icon: 2});
        });
    };

    //删除分组
    $scope.delete = function () {
        var data=JSON.stringify(Array($scope._selectedId))
        $ajax.post(' /api/contacts/delGroup', $.param({pid:data}),function (result) {//成功
            $rootScope._deptOriginalData = null;
            $scope.getContactGroup();
            layer.msg('删除分组成功！', {time: 1000, icon: 1});
        },function (result) {//失败
            $scope.getContactGroup();
            layer.msg(result.msg, {time: 2000, icon: 2});
        });
    };

    $scope.getContactGroup();

    //新建分组
    $scope.openGroup = function() {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'openGroup.html',
            controller: 'openGroupCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        callback: function() {
                            $rootScope._deptOriginalData = null;
                            $scope.getContactGroup();
                        }
                    }
                }
            }
        });
    };
    //新建联系人
    $scope.openContact = function(contactId) {
        var selectData = $scope._getDataById($scope._selectedId);

        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'openContact.html',
            controller: 'openContactCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        contactId:contactId,
                        data: angular.copy(selectData),
                        callback: function() {
                            $scope.load();
                            $scope.getContactModule();
                        }
                    }
                }
            }
        });
    };

    //修改联系人信息
    $scope.openContactedit = function(contactId) {
        var selectData = $scope._getDataById($scope._selectedId);
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'openContactedit.html',
            controller: 'openContacteditCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        contactId:contactId,
                        data: angular.copy(selectData),
                        callback: function() {
                            $scope.load();
                            $scope.getContactModule();
                        }
                    }
                }
            }
        });
    };

    //获取分组联系人
    $scope.load = function (selectId) {
        $(".group-checkable").prop("checked", false);
        $(".group-checkable").removeClass("active");

        var selectId = selectId || $scope._selectedId || '';

        var sdata={};
        if($scope.moldData.type==1){
            //手机号状态（默认）
            sdata={
                page: $scope.paginationConf.currentPage,
                limit:10,
                mobile: $scope.params.name,
                type_id:selectId
            }
        }else if($scope.moldData.type==2){
        //    姓名搜索状态
            sdata={
                page: $scope.paginationConf.currentPage,
                limit:10,
                contact: $scope.params.name,
                type_id:selectId
            }

        }else if($scope.moldData.type==3){
        //    标签搜索状态
            sdata={
                page: $scope.paginationConf.currentPage,
                limit:10,
                tag: $scope.params.name,
                type_id:selectId
            }

        }
        $ajax.post('/api/contacts/getConsList', $.param(sdata), function (result) {
            $scope.tableData = result.list||[];
            if($scope.tableData!=''){
                $scope.tableData.forEach(function(a,i){

                    a.groupName = $rootScope.getGroupName(a.type_id);
                });
            }

            $scope.paginationConf.totalItems = result.count||0;
            result.count= result.count||0;
            if(selectId && !$scope.params.name){
                var selectData = $scope._getDataById(selectId);

                if(selectData){
                    $scope.selectData = selectData;
                    $scope._selectedLevel=$scope.selectData.level;

                    $("#" + selectId + "_anchor").html('<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning icon-lg jstree-themeicon-custom" role="presentation"></i>'+selectData.type_name + "(" + result.count + "人)");
                }
            }
        });
    };

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

    $scope.getSelectIds = function () {
        var ids = "";
        $(".checkboxes").each(function () {
            var checked = $(this).is(":checked");
            if (checked) {
                ids += $(this).val() + ",";
            }
        });
        if(ids){
            ids = ids.substring(0,ids.length-1);
        }
        return ids;
    };

    //删除联系人
    $scope.deleteContact = function(id) {
        layer.confirm('你确定删除此联系人吗？', {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                ids = id.split(",");

                var data=JSON.stringify(ids)
                $ajax.post('/api/contacts/delCons',  $.param({pid:data }), function () {
                    $rootScope._deptOriginalData = null;
                    $scope.getContactModule();
                    layer.msg('删除成功!', {time: 1000, icon: 1});
                    $scope.load();
                })
            }
        });
    };
    //转分组
    $scope.changeContactGroup = function(id) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'changeContactGroup.html',
            controller: 'changeContactGroupCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        id:id,
                        data: angular.copy(treeutil.transferNewDataByTreeData($scope._treeData,$scope._originalData)),
                        callback: function(selectId) {
                            $scope.load(selectId);
                            $scope.load();
                            $scope.getContactModule();
                        }
                    }
                }
            }
        });
    };
    //批量删除联系人
    $scope.deleteContacts = function () {
        var ids = $scope.getSelectIds();
        if(ids){
            $scope.deleteContact(ids);
        }else{
            layer.msg("请选择要删除的联系人", {time: 2000, icon: 2});
        }
    };
    //批量转分组
    $scope.changeContactGroups = function () {
        var ids = $scope.getSelectIds();
        if(ids){
            $scope.changeContactGroup(ids);
        }else{
            layer.msg("请选择要转分组的联系人", {time: 2000, icon: 2});
        }
    };
    //发送短信
    $scope.sendMsg = function (type,contact) {
        var mobiles = ""
        if(type == 0){//给单人发送短信

        }
        else if(type == 1){//给选中的人发送短信
            var ids = $scope.getSelectIds();
            if(!ids){
                layer.msg('请选择要发送的联系人!', {time: 1500, icon: 2});
                return;
            }
            var idArr = ids.split(",");
            idArr.forEach(function (id) {
                for(var i=0;i<$scope.tableData.length;i++){
                    if($scope.tableData[i].id == id){
                        mobiles += $scope.tableData[i].mobile + ","
                    }
                }
            });
            mobiles = mobiles.substring(0,mobiles.length-1);

        }else{//给分组发短信

        }

        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'sendMsgFromContact.html',
            controller: 'sendMsgFromContactCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        data: $scope._getDataById($scope._selectedId),
                        mobiles:mobiles,
                        contact:contact,
                        type:type,
                        callback: function() {
                        }
                    }
                }
            }
        });
    };

    //发送国际短信
    $scope.sendIntlMsg = function (type,contact) {
        var mobiles = ""
        if(type == 0){//给单人发送短信

        }else if(type == 1){//给选中的人发送短信
            var ids = $scope.getSelectIds();
            if(!ids){
                layer.msg('请选择要发送的联系人!', {time: 1500, icon: 2});
                return;
            }
            var idArr = ids.split(",");
            idArr.forEach(function (id) {
                for(var i=0;i<$scope.tableData.length;i++){
                    if($scope.tableData[i].id == id){
                        mobiles += $scope.tableData[i].mobile + ","
                    }
                }
            });
            mobiles = mobiles.substring(0,mobiles.length-1);

        }else{//给分组发短信

        }

        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'sendIntlMsgFromContact.html',
            controller: 'sendIntlMsgFromContactCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        data: $scope._getDataById($scope._selectedId),
                        mobiles:mobiles,
                        contact:contact,
                        type:type,
                        callback: function() {
                        }
                    }
                }
            }
        });
    };

    //导入联系人
    $scope.importConcat = function () {
        var selectData = $scope._getDataById($scope._selectedId);
        if($rootScope.stateItems.length==0){
            layer.msg( '请新建联系人分组！', {time: 3000, icon:2});
            return false;
        }
        if(selectData==null){
            layer.msg( '请选择联系人分组！', {time: 3000, icon:2});
        } else {
            $uibModal.open({
                backdrop: 'static',
                templateUrl: 'importContact.html',
                controller: 'importConcatCtrl',
                size: 'md',
                resolve:{
                    data : function(){
                        return {
                            data: selectData,
                            callback: function() {
                            }
                        }
                    }
                }
            });
        }

    };

    //导出全部联系人
    $scope.export = function(contactGroupId) {
        window.open('/api/contacts/exportCons');
    };

//    导出分组联系人
    $scope.ExportFz = function () {
        if($scope._getDataById($scope._selectedId).count==0){
            layer.msg('当前分组联系人为空!', {time: 1500, icon: 2});
            return false;
        }
        window.open('/api/contacts/exportCons?type_id='+$scope._getDataById($scope._selectedId).id);
    }

    $scope.ShowIf=true;
    $scope.ShowOff=false;
    $scope.remarkBz = function () {
        if($scope.ShowIf){
            $scope.ShowIf=false;
            $scope.ShowOff=true;
        }else {
            $scope.ShowIf=true;
            $scope.ShowOff=false;
        }

    }
}]);

//添加分组
angular.module('App').controller('openGroupCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data , $filter) {
    $scope.params = {};
    $scope.ok = function () {
        $ajax.post('/api/contacts/createGroup', $.param({
            // parentId: 0,
            parent_id:'',
            level:'',
            tname: $scope.params.name
        }),function (result) {//成功
            data.callback();
            layer.msg('添加分组成功！', {time: 1000, icon: 1});
            $uibModalInstance.dismiss(0);
        },function (result) {//失败
            data.callback();
            layer.msg(result.msg, {time: 2000, icon: 2});
        });
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});

//新建联系人
angular.module('App').controller('openContactCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data, $uibModal , $filter) {
    $scope.haszushow=true;
    $scope.group = data.data || {id:0};

    $scope.data = {
        birth:''
    };
    $scope.data.sex = 1;
    $scope.data.birth = moment();

    //日期结束

    if(data.contactId){
        // $ajax.post('/api/contacts/getOneCons', $.param({id:data.contactId}), function (data) {
        //     $scope.groupName = $rootScope.getGroupName(data.type_id);
        //
        //     $scope.data = data;
        //     $scope.data.ctime = null;
        //     $scope.data.ltime = null;
        //     $scope.data.sex = $scope.data.sex || 1;
        // })
    }else{
        if($scope.group.id!=0){
            $scope.haszushow=false;
            $scope.data.type_id=$scope.group.id
        }
        $scope.data.contactGroupId = $scope.group.id || 0;

        $scope.groupName = $rootScope.getGroupName($scope.data.contactGroupId);
    }

    $scope.ok = function () {
        if(!$scope.data.mobile || $scope.data.mobile.length < 8){
            layer.msg('请填写正确的手机号!', {time: 1500, icon: 2});
            return;
        }
        if(!$scope.data.contact){
            layer.msg('请填写联系人!', {time: 1500, icon: 2});
            return;
        }
        if(!$scope.data.type_id){
            layer.msg('请选择所属分组!', {time: 1500, icon: 2});
            return;
        }

        //检测标签长度
        if($scope.data.tag!=undefined){
            if($scope.data.tag.indexOf(',')>0){
                //    英文状态逗号
                var Array1= $scope.data.tag.split(',');
                for (var k in Array1){
                    if(Array1[k].length>12){
                        layer.msg('含有单个长度超过12个字符的标签!', {time: 2500, icon: 2});
                        return false;
                    }
                }

            }else if($scope.data.tag.indexOf('，')>0) {
                //    中文状态逗号
                var Array1= $scope.data.tag.split('，');
                for (var k in Array1){
                    if(Array1[k].length>12){
                        layer.msg('含有单个长度超过12个字符的标签!', {time: 2500, icon: 2});
                        return false;
                    }
                }

            }
        }


        $scope.data.birth=moment($scope.data.birth).format('YYYY-MM-DD');
        $ajax.post('/api/contacts/createCons', $.param($scope.data), function () {
            layer.msg('联系人保存成功!', {time: 1000, icon: 1});
            $uibModalInstance.dismiss(0);
            location.reload();
        })

    };

    $scope.moreFlag = false;
    $scope.more = function () {
        $scope.moreFlag = !$scope.moreFlag;
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});

//修改联系人信息
angular.module('App').controller('openContacteditCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data, $uibModal , $filter) {
    $scope.group = data.data || {id:0};

    $scope.data = {
    };
    $scope.data.sex = 1;
    $scope.data.birth = moment();
    $scope.popup1 = {
        opened: false
    };
    $scope.open1 = function () {
        $scope.popup1.opened = true;
    };

    if(data.contactId){
        $ajax.post('/api/contacts/getOneCons', $.param({id:data.contactId}), function (data) {
            $scope.groupName = $rootScope.getGroupName(data.type_id);
            $scope.data = data;
            if($scope.data.birth==''||$scope.data.birth==null){
                $scope.data.birth = moment();
            }
            $scope.data.ctime = null;
            $scope.data.ltime = null;
            $scope.data.sex = $scope.data.sex || 1;
        })
    }else{
        // $scope.data.contactGroupId = $scope.group.id || 0;
        $scope.groupName = $rootScope.getGroupName($scope.data.contactGroupId);
    }

    $scope.ok = function () {
        if(!$scope.data.mobile || $scope.data.mobile.length < 8){
            layer.msg('请填写正确的手机号!', {time: 1500, icon: 2});
            return;
        }
        if(!$scope.data.contact){
            layer.msg('请填写联系人!', {time: 1500, icon: 2});
            return;
        }
        if(!$scope.data.type_id){
            layer.msg('请选择分组!', {time: 1500, icon: 2});
            return;
        }




        //检测标签长度
        if($scope.data.tag!=undefined){
            if($scope.data.tag.indexOf(',')>0){
                //    英文状态逗号
                var Array1= $scope.data.tag.split(',');
                for (var k in Array1){
                    if(Array1[k].length>12){
                        layer.msg('含有单个长度超过12个字符的标签!', {time: 2500, icon: 2});
                        return false;
                    }
                }

            }else if($scope.data.tag.indexOf('，')>0) {
                //    中文状态逗号
                var Array1= $scope.data.tag.split('，');
                for (var k in Array1){
                    if(Array1[k].length>12){
                        layer.msg('含有单个长度超过12个字符的标签!', {time: 2500, icon: 2});
                        return false;
                    }
                }

            }
        }

        //
        // if($scope.data.birth._i==undefined){
        //     $scope.data.birth=$scope.data.birth;
        // }else {
        //     $scope.data.birth=$filter('date')($scope.data.birth._i,'yyyy-MM-dd');
        // }
        $scope.data.birth=moment($scope.data.birth).format('YYYY-MM-DD');
        $ajax.post('/api/contacts/editCons', $.param($scope.data), function () {
            layer.msg('联系人修改成功!', {time: 1000, icon: 1});
            $uibModalInstance.dismiss();
            // location.reload();
        })

    };

    $scope.moreFlag = false;
    $scope.more = function () {
        $scope.moreFlag = !$scope.moreFlag;
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});


//发行业短信
angular.module('App').controller('sendMsgFromContactCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data, $uibModal,$filter) {
    $scope.mobiles=[];
    //获取行业短信api账号
    $scope.load=function () {
        $ajax.post('/api/marketing/Account/is',$.param({purpose:0}), function(result) {
            $scope.apikey= result;
            $scope.loadSign(result);
            $scope.getTemplate(result);
        });
    }
    $scope.load();


    // 获取id
    $scope.group = data.data || {id:0};

    $scope.groupName = $rootScope.getGroupName($scope.group.id);
    $scope.contact = data.count;
    // var checkIsPhone = function (val) {
    //     var reg = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
    //     return reg.test(val);
    // };

    var type = data.type;
    if(type == 0){//给单个人发送短信
        $scope.mobiles = data.contact.mobile;
        $scope.slength= $scope.mobiles.length;
    }else if(type == 1){//给选中的人发送短信
        arr2=data.mobiles.split(',');
        $scope.mobiles=arr2.join('\n');
        $scope.slength= arr2.length;

    }else{
        $ajax.post('/api/contacts/getConsList', $.param({
            type_id:$scope.group.id
        }), function (mobiles) {
            var arr=[];
            $.each(mobiles.list,function (index,value) {
                arr.push(value.mobile);
                if(mobiles.list.length-1==index){
                    $scope.mobiles=arr.join('\n');
                    $scope.slength= arr.length;
                }
            })

        });
    }
    $scope.params = {};
    $scope.params.contactGroupId = $scope.group.id;
    if(data.contact && data.contact.id){
        $scope.params.id = data.contact.id;
    }
    $scope.ok = function () {
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
        $scope.changemount=$filter('date')(t,'yyyy-MM-dd HH:mm:ss ')
        var p = $.param({
            username:$scope.apikey,
            telephone:$scope.mobiles,
            content: '【'+$scope.data.sign+'】'+$scope.data.content,
            cancel:$scope.hasT ? '1' : '0',
            timer: $scope.hasTime ? $scope.changemount: '',
            origin:2
        });


        $ajax.post('/api/marketing/Dispatch3/run/', p, function() {
            layer.open({content:'短信发送成功!&nbsp;共计<span class=\'font-red\'>' + ($scope.mobiles.split("\n").length) + '</span>个号码'});
            $uibModalInstance.dismiss(0);
        },function (result) {
            layer.msg(result.msg, {time: 2000, icon: 2});
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

    $scope.getTimescope = function () {
        if($scope.hasTime){
            $ajax.post('/api/marketing/Prepare/datetime',$.param({username:$scope.apikey}),function (result) {
                $scope.data.scheduleSendTime=moment(result.timestamp*1000);
                $scope.time=result.timestamp*1000

            })
        }

    }

    $scope.hasTime = false;
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

    //定时时间
    $scope.showTip = true;
    $scope.changeTime = function () {
        var t = $scope.data.scheduleSendTime.toDate().getTime();
        $scope.showTip = $scope.hasTime && (t - $scope.time) < 1000*60*10;
    };
    $scope.setTime = function (unit, value) {
        $ajax.post('/api/marketing/Prepare/datetime',$.param({username:$scope.apikey}),function (result) {
            $scope.time=result.timestamp*1000
        })
        $scope.data.scheduleSendTime = moment($scope.time).add(value, unit);


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

    //load sign 获取签名
    $scope.loadSign = function (apikey) {
        $ajax.post('/api/marketing/Prepare/sign', $.param({username: $scope.apikey}), function(result) {
            $scope.signs = result;

            $scope.sign = $scope.signs[0];
            // $scope.data.content=$scope.mobiles2;
            if($scope.signs!=''){
                $scope.data.sign = $scope.sign.content;
                $scope.selectSign($scope.sign.content);
            }
            $scope.calWords();
        });
    }

    $scope.template={};
    $scope.getTemplate = function (apikey) {

        $ajax.post("/api/marketing/Prepare/templet", $.param({username:apikey,page:$scope.num}), function(result) {
            $scope.templates = result.list;
            $scope.templatesnum = result.count;
            $scope.template = $scope.templates[0];
            if($scope.templates!=''){
                //首次加载
                $scope.selectTemplate($scope.templates[0].content)
            }
        });
    };
    $scope.selectTemplate = function(item) {
        $scope.temp = item;

    };

    $scope.tempClick = function () {
        $scope.data.content=$scope.temp;
        $scope.calWords();
    }

});


//发营销短信
angular.module('App').controller('sendIntlMsgFromContactCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data, $uibModal , $filter) {
    $scope.mobiles=[];
    //获取营销短信api账号
    $scope.load=function () {
        $ajax.post('/api/marketing/Account/is',$.param({purpose:1}), function(result) {
            $scope.apikey= result;
            $scope.loadSign(result);
            $scope.getTemplate(result);
        });
    }
    $scope.load();


    // 获取id
    $scope.group = data.data || {id:0};

    $scope.groupName = $rootScope.getGroupName($scope.group.id);
    $scope.contact = data.count;

    // var checkIsPhone = function (val) {
    //     var reg = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
    //     return reg.test(val);
    // };

    var type = data.type;
    if(type == 0){//给单个人发送短信
        $scope.mobiles = data.contact.mobile;
        $scope.slength= $scope.mobiles.length;
    }else if(type == 1){//给选中的人发送短信
        arr2=data.mobiles.split(',');
        $scope.mobiles=arr2.join('\n');
        $scope.slength= arr2.length;
    }else{
        $ajax.post('/api/contacts/getConsList', $.param({
            type_id:$scope.group.id
        }), function (mobiles) {
            var arr=[];
            $.each(mobiles.list,function (index,value) {
                arr.push(value.mobile);
                if(mobiles.list.length-1==index){
                    $scope.mobiles=arr.join('\n');
                    $scope.slength= arr.length;
                }
            })


        });
    }
    $scope.params = {};
    $scope.params.contactGroupId = $scope.group.id;
    if(data.contact && data.contact.id){
        $scope.params.id = data.contact.id;
    }
    $scope.ok = function () {
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
        $scope.changemount=$filter('date')(t,'yyyy-MM-dd HH:mm:ss ')
        var p = $.param({
            username:$scope.apikey,
            telephone:$scope.mobiles,
            content: '【'+$scope.data.sign+'】'+$scope.data.content,
            cancel:$scope.hasT ? '1' : '0',
            timer: $scope.hasTime ? $scope.changemount: '',
            origin:2
        });

        $ajax.post('/api/marketing/Dispatch3/run/', p, function() {
            layer.open({content:'短信发送成功!&nbsp;共计<span class=\'font-red\'>' + ($scope.mobiles.split("\n").length) + '</span>个号码'});
            $uibModalInstance.dismiss(0);
        },function (result) {
            layer.msg(result.msg, {time: 2000, icon: 2});
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

    $scope.getTimescope = function () {
        if($scope.hasTime){
            $ajax.post('/api/marketing/Prepare/datetime',$.param({username:$scope.apikey}),function (result) {
                $scope.data.scheduleSendTime=moment(result.timestamp*1000);
                $scope.time=result.timestamp*1000

            })
        }

    }


    $scope.hasTime = false;
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

    //定时时间
    $scope.showTip = true;
    $scope.changeTime = function () {
        var t = $scope.data.scheduleSendTime.toDate().getTime();
        $scope.showTip = $scope.hasTime && (t - $scope.time) < 1000*60*10;
    };
    $scope.setTime = function (unit, value) {
        $ajax.post('/api/marketing/Prepare/datetime',$.param({username:$scope.apikey}),function (result) {
            $scope.time=result.timestamp*1000
        })
        $scope.data.scheduleSendTime = moment($scope.time).add(value, unit);
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

    //load sign 获取签名
    $scope.loadSign = function (apikey) {
        $ajax.post('/api/marketing/Prepare/sign', $.param({username: $scope.apikey}), function(result) {
            $scope.signs = result;

            $scope.sign = $scope.signs[0];
            // $scope.data.content=$scope.mobiles2;
            if($scope.signs!=''){
                $scope.data.sign = $scope.sign.content;
                $scope.selectSign($scope.sign.content);
            }
            $scope.calWords();
        });
    }

    $scope.template={};
    $scope.getTemplate = function (apikey) {

        $ajax.post("/api/marketing/Prepare/templet", $.param({username:apikey,page:$scope.num}), function(result) {
            $scope.templates = result.list;
            $scope.templatesnum = result.count;
            $scope.template = $scope.templates[0];
            if($scope.templates!=''){
                //首次加载
                $scope.selectTemplate($scope.templates[0].content)
            }
        });
    };
    $scope.selectTemplate = function(item) {
        $scope.temp = item;

    };

    $scope.tempClick = function () {
        $scope.data.content=$scope.temp;
        $scope.calWords();
    }


});


//导入联系人
angular.module('App').controller('importConcatCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data, $uibModal,FileUploader) {

    //获取分组id
    $scope.group = data.data || {id:0};

    //加载分组名称
    $scope.groupName = $rootScope.getGroupName($scope.group.id);
    $scope.params = {};
    $scope.ok = function () {
        $uibModalInstance.dismiss(0);
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
    $scope.uploader = new FileUploader({
        url: '/api/contacts/importExcel'+'?'+new Date().getTime(),
        alias:'excel_file',
        formData: [{type_id: $scope.group.id}],
        queueLimit: 1,
        removeAfterUpload: true
    });

    $scope.progress = {width: 0 };
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
        if (response.code == '10000000') {
            layer.msg('导入联系人成功', {time: 1500, icon: 1});
            // layer.msg('导入联系人成功!<br>' + response.data, {time: 1500, icon: 1});
            setTimeout(function () {
                layer.closeAll();
                location.reload();
            },1200);
        } else {
            layer.msg(response.msg, {time: 1000, icon: 2})
        }
        $scope.progress.width = 0;
    };


    //下载联系人行业
    $scope.download = function () {
        window.open(window.location.origin + '/download/%E5%90%AF%E7%91%9E%E4%BA%91%E8%81%94%E7%B3%BB%E4%BA%BA%E6%A8%A1%E6%9D%BF.xlsx');
    };
});



//转分组
angular.module('App').controller('changeContactGroupCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data, $uibModal) {
    $scope.data = data.data;
    $scope.params = {};
    $scope.params.groupId = 0;
    $scope.ok = function () {
        $rootScope._deptOriginalData = null;
        var idt=data.id;
        ids = idt.split(",");

        var datas=JSON.stringify(ids);
        $ajax.post('/api/contacts/ChangeGroup', $.param({pid:datas,type_id:$scope.params.type_id}), function (result) {
            layer.msg('联系人转分组成功!', {time: 1500, icon: 1});
            $uibModalInstance.dismiss(0);

            //备注以后有用
            data.callback($scope.params.groupId);
        })

    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});
