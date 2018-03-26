/**
 * 提交发票申请
 *
 */
angular.module('App').controller('InvoiceSubmitCtrl', function($rootScope, $stateParams, $scope, $ajax ,$uibModal ,$state) {
    $scope.data={
        assureid:'',
        orderid:'',
        money:'',
        user_invoice_id:'',
        user_address_id:'',
        invoice_title:''
    }
    var MonArr,money,assureid;
    // console.log($stateParams.dataTic)
    MonArr = $stateParams.dataTic.split(',');
    $scope.ids = $stateParams.dataTic;
    money=$stateParams.dataMon;
    $scope.idLength=MonArr.length;
    assureid=$stateParams.Assure;

    $scope.invoicetitles = [ {name: '信息费', value: 1}, {name: '技术服务费', value: 2}];

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
    $scope.TotalAmount=0;
    $scope.Totalbtn = true;
    $scope.params = {
        // type: $scope.types[0].value
    };
    $scope.InvGood = {
        id:''
    }
    $scope.AddGood = {
        id:''
    }
    $scope.tableData = [];
    $scope.load = function() {

        $ajax.post('/api/user/Invoice/invoiceList', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage
        }), function (result) {
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
            $scope.InvGood.id = $scope.tableData[0].id;
            $scope.tableData.forEach(function (ino,i) {
                if(ino.is_default==1){
                    $scope.InvGood.id = $scope.tableData[i].id;
                    return false;
                }
            });
            // $scope.InvGood.id = $scope.tableData[0].id;
        });

    };
    $scope.load();

    $scope.loadAdd = function() {

        $ajax.post('/api/user/Address/addressList', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage
        }), function (result) {
            $scope.tableDataAdd = result.list;

            $scope.paginationConf.totalItems = result.count;
            if($scope.tableDataAdd==''){
                $scope.AddGood.id = '';
            }else {
                $scope.AddGood.id = $scope.tableDataAdd[0].id;
                $scope.tableDataAdd.forEach(function (add,i) {
                    if(add.is_default==1){
                        $scope.AddGood.id = $scope.tableDataAdd[i].id;
                        return false;
                    }
                });
            }

        });

    };
    $scope.loadAdd();


    //    新增发票
    $scope.openContactInvoice = function(id) {

        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'openContactInvoice.html',
            controller: 'openContactInvoice2Ctrl',
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


    //删除地址
    $scope.InvoiceAddDel = function (id) {
        layer.msg('你确定删除吗？', {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                // var id=JSON.stringify(id)
                var ids = id.split(",");
                $ajax.post('/api/user/Address/delAddress', $.param({
                    pid:JSON.stringify(ids)
                }), function (result) {
                    layer.msg('删除成功', {time: 1500, icon: 1});
                    $scope.loadAdd();
                });
            }
        });
    }


//    新增地址
    $scope.CreateAdd = function (id) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'openContactAdd.html',
            controller: 'openContactAdd2Ctrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        data: angular.copy(id),
                        callback: function() {
                            $scope.loadAdd();
                        }
                    }
                }
            }
        });
    }

    //提交
    $scope.submitbtn = function () {
        $scope.data={
            assureid:assureid,
            orderid:$scope.ids,
            money:money,
            user_invoice_id:$scope.InvGood.id,
            user_address_id:$scope.AddGood.id,
            invoice_title:$scope.data.invoice_title
        }
        if($scope.data.orderid==''&&$scope.data.assureid==''){
            layer.msg('操作失败', {time: 2000, icon: 2});
            return false;
        }
        if($scope.data.money==''){
            layer.msg('操作失败', {time: 2000, icon: 2});
            return false;
        }
        if($scope.data.user_invoice_id==''){
            layer.msg('开票信息为空！', {time: 2000, icon: 2});
            return false;
        }
        if($scope.data.user_address_id==''){
            layer.msg('收货地址为空！', {time: 2000, icon: 2});
            return false;
        }
        if($scope.data.invoice_title==''){
            layer.msg('请选择发票内容', {time: 2000, icon: 2});
            return false;
        }

        $ajax.post('/api/invoice/Invoice/askfor',$.param($scope.data),function (result) {
            layer.msg('提交成功！', {time: 2000, icon: 1});
            $state.go('invoice.record')
        })
    }
//    返回上一页
    $scope.goback = function () {
        $state.go('invoice.claim')
    }

});
//新增发票
angular.module('App').controller('openContactInvoice2Ctrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data, $uibModal , $filter ,FileUploader) {
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
                // console.log($scope.data)
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
                layer.msg('请输入开户银行账号!', {time: 2000, icon: 2});
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

//新建地址
angular.module('App').controller('openContactAdd2Ctrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data, $uibModal , $http) {
    $scope.provinceData = [];
    $scope.cityData = [];
    $scope.countyData = [];

    //获取地区数据
    $scope.getAreaCategory = function (param,callback) {
        $http.get("../public/assets/layout/login/js/AreaDatas.json",param).success(
            function (res) {
                var addressData = res;
                callback && callback(addressData[param.level]);
            }
        )
    };

    $scope.getAreaCategory({level:86},function (data) {
        $scope.provinceData = data;
    });
    // 选择省份
    $scope.changeProvince = function () {
        $scope.getAreaCategory({level:$scope.data.province.key,province:$scope.data.province.value},function (data) {
            $scope.cityData = data;
            $scope.data.city='请选择';
            $scope.data.region='请选择';
        });
    };


    $scope.getAreaId = function () {
        if($scope.data.county && $scope.data.county != '0'){
            for(var i=0;i<$scope.countyData.length;i++){
                if($scope.countyData[i].county == $scope.data.county){
                    return $scope.countyData[i].id;
                }
            }
        }
        return null;
    };
    $scope.hasDis = true;
    //选择城市
    $scope.changeCity = function () {

        $scope.getAreaCategory({level:$scope.data.city.key},function (data) {
            // console.log(data);
            // console.log($scope.data.city.key);
            $scope.data.region='请选择';
            if(data!=undefined){
                $scope.hasDis = true;
                $scope.countyData = data;
            }else {
                $scope.data.region='';
                $scope.hasDis = false;
                $scope.countyData = [];
            }
        });
    };

    $scope.data = {};
    $scope.data.province = '';
    $scope.data.city ='';
    $scope.data.region = '';

    //日期结束
    $scope.hasTadd=false;

    if(data.data==null){
        $scope.titleNe = '新增';
        url='/api/user/Address/creAddress';
    }else {
        $scope.titleNe = '修改';
        url='/api/user/Address/editAddress';
        var url2='/api/user/Address/getAddress';
        console.log(data.data)
        $ajax.post(url2,$.param({id:data.data}),function (result) {
            $scope.data= result;
            if(result.is_default==1){
                $scope.hasTadd=true
            }else {
                $scope.hasTadd=false
            }
            // $uibModalInstance.dismiss(0);
        })
    }


    $scope.ok = function () {
        if(!$scope.data.name){
            layer.msg('请填写姓名', {time: 2000, icon: 2});
            return false;
        }
        if($scope.data.province==''||$scope.data.city==''||$scope.data.province=='请选择'||$scope.data.city=='请选择'){
            layer.msg('请选择所在地区', {time: 2000, icon: 2});
            return false;
        }
        if($scope.hasDis&&$scope.data.region==''||$scope.hasDis&&$scope.data.region=='请选择'){
            layer.msg('请选择所在地区', {time: 2000, icon: 2});
            return false;
        }
        if(!$scope.data.address){
            layer.msg('请填写街道地址', {time: 2000, icon: 2});
            return false;
        }
        if(!$scope.data.postalcode){
            layer.msg('请填写邮政编码', {time: 2000, icon: 2});
            return false;
        }
        if(!$scope.data.mobile){
            layer.msg('请填写手机号', {time: 2000, icon: 2});
            return false;
        }
        $scope.data.province = $scope.data.province.value||$scope.data.province;
        $scope.data.city = $scope.data.city.value||$scope.data.city;
        $scope.data.region = $scope.data.region.value||$scope.data.region;
        $scope.data.is_default=$scope.hasTadd ?1:0;

        $ajax.post(url,$.param($scope.data),function () {
            data.callback();
            $uibModalInstance.dismiss(0);
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