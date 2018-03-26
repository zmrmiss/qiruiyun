/**
 * 国际短信 签名
 *
 */
angular.module('App').controller('IntlSignCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModal) {

    $scope.currentTab = 'intl.sign';

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
        $ajax.post('intl/sign/list', {
            pageSize: $scope.paginationConf.itemsPerPage,
            currentPage: $scope.paginationConf.currentPage,
            sign: $scope.params.sign,
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
            templateUrl: 'signEdit.html',
            controller: 'IntlSignEditCtrl',
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
});
angular.module('App').controller('IntlSignEditCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    $scope.data = data.item ;
    var s = '新增';
    var url = 'intl/sign/add';
    if ($scope.data) {
        $scope.data = {
            id: $scope.data.id,
            sign: $scope.data.sign,
            description: $scope.data.description
        };
        s = '编辑';
        url = 'intl/sign/update';
    }

    $scope.ok = function () {
        $('#intlSignEditForm').validate({
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