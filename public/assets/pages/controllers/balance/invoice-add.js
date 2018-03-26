/**
 * 发票
 *
 */
angular.module('App').controller('InvoiceAddCtrl', function($rootScope, $stateParams, $scope, $ajax , $uibModal) {

    $scope.currentTab = 'invoice.add';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.payStatuses = [
        {name: '全部', value: 'all'},
        {name: '开票处理中', value: '0'},
        {name: '邮寄中', value:1},
        {name: '已开发票', value:-1},
        {name: '已驳回', value:2}
        ];

    $scope.payTypes = [
        {name: '全部', value: ''},
        {name: '短信充值', value: 1},
        {name: '钱包充值', value:2},
        {name: '注册赠送', value:3},
        {name: '体验赠送', value:4},
        {name: '钱包代充', value:5}
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
        if($scope.params.status==''){
            $scope.params.status='all'
        }
        $ajax.post('/api/user/Address/addressList', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage,
            begin:$scope.date.startDate.unix(),
            end: $scope.date.endDate.unix(),
            order_num: $scope.params.number,
            pay_status: $scope.params.status,
            order_type : $scope.params.type
        }), function(result) {
            $scope.tableData = result.list;
            if(result.length==0){
                $scope.tableData = [];
            }
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.load();
    
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
                    $scope.load();
                });
            }
        });
    }
    
    
//    新增地址
    $scope.CreateAdd = function (id) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'openContactAdd.html',
            controller: 'openContactAddCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        data: angular.copy(id),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    }
});
//新建地址
angular.module('App').controller('openContactAddCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data, $uibModal , $http) {
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
            $scope.countyData = [];
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