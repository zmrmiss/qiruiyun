/**
 * 群发短信
 *
 */
angular.module('App').controller('MouldIndustrySignCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModal) {

    $scope.currentTab = 'mould.sign';

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
        $ajax.post('/api/marketing/Signature/items', $.param({
            username:apindustry,
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage,
            keyword: $scope.params.sign,
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

    $scope.open2 = function(data) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'signEdit.html',
            controller: 'MessageIndustrySignEditCtrl',
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


    $scope.DeleSign = function(id) {

        layer.msg('你确定删除吗？', {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                $ajax.post('/api/marketing/Signature/remove', $.param({
                    id:id,
                    username:apindustry
                }), function (result) {
                    layer.msg('删除成功', {time: 1500, icon: 1});
                    $scope.load();
                });
            }
        });
    }
});
angular.module('App').controller('MessageIndustrySignEditCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    var apindustry=$rootScope.apindustry;
    if(apindustry==undefined){
        apindustry= sessionStorage.getItem("apindustry");
    }

    // $scope.data = data.item ;
    var s = '新增';
    var url = '/api/marketing/Signature/add';
    // if ($scope.data) {
    //     $scope.data = {
    //         id: $scope.data.id,
    //         sign: $scope.data.sign,
    //         description: $scope.data.description
    //     };
    //     s = '编辑';
    //     url = 'plat/sign/update';
    // }
    $scope.data={
        username:'',
        content:'',
        remark:''
    }
    $scope.data.username=apindustry;
    $scope.ok = function () {
        $('#platSignEditForm').validate({
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
                    required: '签名长度为2至10个字符',
                    sign: '签名长度为{0}至{1}个字符'
                },
                remark: {
                    required: '备注长度为2至255个字符',
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

                $ajax.post(url, $.param($scope.data), function () {
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