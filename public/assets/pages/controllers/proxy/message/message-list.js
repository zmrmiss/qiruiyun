/**
 * 接口短信
 *
 */
angular.module('App').controller('MessageSignCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModal) {

    $scope.currentTab = 'message.hear.sign';

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

        var data={page:$scope.paginationConf.currentPage,limit: 10, status:$scope.params.status, username:username,keyword:$scope.params.sign};
        $ajax.post('/api/ordinary/Signature/items',$.param(data),function (result) {
            // alert(result);
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();

    $scope.search = function () {
        $scope.paginationConf.currentPage = 1;
        $scope.load();
    };

    $scope.open = function(data) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'signEdit.html',
            controller: 'MessageSignEditCtrl',
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
    }



    $scope.DelSign = function(id) {

        layer.msg('你确定删除吗？', {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                $ajax.post('/api/ordinary/Signature/remove', $.param({
                    id:id
                }), function (result) {
                    layer.msg('删除成功', {time: 1500, icon: 1});
                    $scope.load();
                });
            }
        });
    }
});
angular.module('App').controller('MessageSignEditCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {
    $scope.data = {
        content1:'',
        remark:''
    }
    var url = '/api/ordinary/Signature/add';
    $scope.ok = function () {

        $('#signForm').validate({
            rules: {
                sign: {
                    required: true,
                    sign: [2, 10]
                },
                remark: {
                    required: true,
                    remark: [2, 255]
                }
            },
            messages: {
                sign: {
                    required: '签名长度为2-10个字符',
                    sign: '签名长度为{0}至{1}个字符'
                },
                remark: {
                    required: '备注长度为2至255个字符',
                    remark: '备注长度为{0}至{1}个字符'
                }
            },
            errorPlacement: function(error, element) {
                error.appendTo(element.parent());

            },

            submitHandler: function() {
                var datas={username: $rootScope.username, content: $scope.data.content1, remark: $scope.data.remark};
                $ajax.post(url, $.param(datas), function () {
                    layer.msg('签名新增成功!', {time: 1000, icon: 1});
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