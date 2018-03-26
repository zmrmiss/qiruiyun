/**
 * 发票信息
 *
 */
angular.module('App').controller('InvoiceNewsCtrl', function($rootScope, $stateParams, $scope, $ajax , $filter,$uibModal ,FileUploader) {

    $scope.currentTab = 'invoice.news';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.payStatuses = [
        {name: '全部', value: ''},
        {name: '开票处理中', value: 1},
        {name: '邮寄中', value:2},
        {name: '已开发票', value:3},
        {name: '已驳回', value:4}
        ];

    // 日期控制初始化参数
    $scope.opts = {
        locale: {
            applyClass: 'btn-green',
            applyLabel: "确定",
            fromLabel: "从",
            toLabel: "至",
            cancelLabel: '取消',
            customRangeLabel: '自定义范围',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            firstDay: 1,
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月',
                '十月', '十一月', '十二月'
            ]
        },
        ranges: {
            '今天': [moment(), moment()],
            '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '最近7天': [moment().subtract(6, 'days'), moment()],
            '最近30天': [moment().subtract(30, 'days'), moment()],
            '本月': [moment().startOf('month'), moment().endOf('month')]
        }
    };
    //初始化日期查询参数
    $scope.date = {
        startDate: moment().startOf('month'),
        endDate: moment().endOf('month')
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

    // $scope.params = {
    //     status: $scope.payStatuses[0].value,
    //     type: $scope.payTypes[0].value
    // };
    $scope.params = {
        status: '',
        type: ''
    };


    $scope.tableData = [];
    $scope.load = function() {
        $ajax.post('/api/user/Invoice/invoiceList', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage
        }), function(result) {
            $scope.tableData = result.list;
            if(result.length==0){
                $scope.tableData = [];
            }
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();

    //删除发票
    $scope.InvoiceDel = function (id) {
        layer.msg('你确定删除吗？', {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                // var id=JSON.stringify(id)
                var ids = id.split(",");
                $ajax.post('/api/user/Invoice/delInvoice', $.param({
                    pid:JSON.stringify(ids)
                }), function (result) {
                    layer.msg('删除成功', {time: 1500, icon: 1});
                    $scope.load();
                });
            }
        });
    }

//    新增发票
    $scope.openContactInvoice = function(id) {

        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'openContactInvoice.html',
            controller: 'openContactInvoiceCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        data: angular.copy(id),
                        callback: function() {
                            $scope.load();
                            // $scope.getContactModule();
                        }
                    }
                }
            }
        });
    };
    

});
//新增发票
angular.module('App').controller('openContactInvoiceCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data, $uibModal , $filter ,FileUploader) {
    $scope.data={};
    $scope.hasTI = false;
    $scope.invoiceClick1=true;
    if(data.data==null){
        $scope.titleNe = '新增';
        url='/api/user/Invoice/creInvoice'
    }else {
        $scope.titleNe = '修改';
        url='/api/user/Invoice/editInvoice';
        var url2='/api/user/Invoice/getInvoice';
        $ajax.post(url2,$.param({id:data.data}),function (result) {
            $scope.data= result;
            if(result.is_default==1){
                $scope.hasTI=true
            }else {
                $scope.hasTI=false
            }
            if(result.type==2){
                $scope.invoiceClick1=false;
                $scope.invoiceClick2=true;
                $scope.invoiceClick=true;
            }
            // $uibModalInstance.dismiss(0);
        })
    }

    $scope.ToggleSwitch = function () {
        $scope.invoiceClick2=false;
        $scope.invoiceClick=false;
        $scope.invoiceClick1=true;
    }
    $scope.ToggleSwitch2 = function () {
        $scope.invoiceClick1=false;
        $scope.invoiceClick2=true;
        $scope.invoiceClick=true;
    }

    var formData = [];
    //上传一般纳税人证明
    $scope.uploaders = new FileUploader({
        url: '/api/upload/Invoice/deliver'+'?'+new Date().getTime(),
        alias:'image_file',
        formData: formData,
        queueLimit: 2,
        removeAfterUpload: true,
        autoUpload:true
    });

    $scope.uploaders.onProgressItem = function (item, process) {
        // $scope.progress.width = process + '%';
        // layer.msg('上传中......'+$scope.progress.width+'', {
        //     icon: 16,
        //     shade: 0.01,
        //     time: 0
        // });

    };
    $scope.uploaders.onAfterAddingFile = function (item) {
        layer.msg('上传中......', {
            icon: 16,
            shade: 0.01,
            time: 0
        });
        if ($scope.uploaders.queue.length > 1) {
            $scope.uploaders.removeFromQueue(0);
        }
        if (item._file.size > 10485760) {
            layer.msg('最大支持10M的文件', {time: 1000, icon: 2});
            return false;
        }
        // getObjectURL(item._file, $('#idCardImg'));
        //
        // $scope.uploader1.uploadAll();
    };
    $scope.uploaders.onBeforeUploadItem = function (item) {
        var formData = [];
        formData.push($scope.data1);
        Array.prototype.push.apply(item.formData, formData);
    };

    $scope.uploaders.onSuccessItem = function(item, response, status, headers) {

        if (response.code == '10000000') {
            $('#idCardImg').text('上传成功')
            $scope.data.taximg = response.data.origin;
            layer.msg('上传成功', {icon: 1, time: 2000})
        }else if(response.code == '40001007'){
            layer.open({
                title:"信息",
                // content:'短信发送成功!&nbsp;共计<span class=\'font-red\'>' + $scope.mobileData.successCount + '</span>个号码,<span class=\'font-red\'>' + $scope.mobileData.successCount * $scope.count + '</span>条短信',
                content:response.msg,
                yes:function () {
                    layer.closeAll();
                }
            });
        }else {
            layer.msg(response.msg, {time: 1000, icon: 2})
            $scope.data.taximg='';
        }
        // formData.splice(0, formData.length);
    };

    function getObjectURL(file, imgObj) {
        var url = null ;
        if (window.createObjectURL!=undefined) { // basic
            url = window.createObjectURL(file) ;
        } else if (window.URL!=undefined) { // mozilla(firefox)
            url = window.URL.createObjectURL(file) ;
        } else if (window.webkitURL!=undefined) { // webkit or chrome
            url = window.webkitURL.createObjectURL(file) ;
        }
        imgObj.attr('src', url);
        return url ;
    };

    $scope.ok = function () {
        if($scope.data.title==''||$scope.data.title==undefined){
            layer.msg('请输入发票抬头!', {time: 2000, icon: 2});
            return false;
        }
        if($scope.data.taxid==''||$scope.data.taxid==undefined){
            layer.msg('请输入发票抬头!', {time: 2000, icon: 2});
            return false;
        }
        if($scope.invoiceClick1){
            $scope.data.type=1
        }else {
            $scope.data.type=2;
            if($scope.data.bankname==''||$scope.data.bankname==undefined){
                layer.msg('请输入开户银行名称!', {time: 2000, icon: 2});
                return false;
            }
            if($scope.data.bankaccount==''||$scope.data.bankaccount==undefined){
                layer.msg('请输入正确的开户银行账号!', {time: 2000, icon: 2});
                return false;
            }
            if($scope.data.address==''||$scope.data.address==undefined){
                layer.msg('请输入注册场所地址!', {time: 2000, icon: 2});
                return false;
            }
            if($scope.data.telephone==''||$scope.data.telephone==undefined){
                layer.msg('请输入注册固定电话!', {time: 2000, icon: 2});
                return false;
            }
            if($scope.data.taximg==''||$scope.data.taximg==undefined){
                layer.msg('请上传一般纳税人证明照片!', {time: 2000, icon: 2});
                return false;
            }
        }
        if($scope.data.type==1){
            $scope.data.bankname='';
            $scope.data.bankaccount='';
            $scope.data.address='';
            $scope.data.telephone='';
            $scope.data.taximg='';
        }
        $scope.data.is_default=$scope.hasTI ?1:0;

        $ajax.post(url, $.param($scope.data), function () {
            layer.msg('操作成功!', {time: 1000, icon: 1});
            $uibModalInstance.dismiss(0);
            data.callback();
            // location.reload();
        })

    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});