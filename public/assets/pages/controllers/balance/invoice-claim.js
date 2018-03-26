/**
 * 发票索取
 *
 */
angular.module('App').controller('InvoiceCtrl', function($rootScope, $stateParams, $scope, $ajax ,$state) {

    $scope.currentTab = 'invoice.claim';

    $scope.showAleOn=true;
    $scope.showAleOFF= false;
    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.types = [{name: '全部', value: ''}, {name: '充值', value: 1}, {name: '消费', value: 2}];

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
    $scope.Total=0;
    $scope.TotalBan=0;
    $scope.Totalbtn = true;
    $scope.params = {
        type: $scope.types[0].value
    };

    $scope.tableData = [];
    $scope.load = function() {

        $ajax.post('/api/invoice/Invoice/askInvoice', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage
        }), function (result) {
            $scope.tableData = result.list;
            $scope.paginationConf.totalItems = result.count;
            if(result.amount_yes!=null){
                $scope.Total=result.amount_yes;
            }
            $scope.TotalBan=result.amount_no;
           
            if(result.assure.id!=''||result.assure.money!=''){
                $scope.showAleOn=false;
                $scope.showAleOFF= true;
                $scope.Assure=result.assure.id;
                $scope.TotalAmount=result.assure.money;
            }
        });
    };


//checkbox选择
    var MonArr=[];
    Array.prototype.sum = function (){
        var result = 0;
        for(var i = 0; i < this.length; i++) {
            result += Number(this[i]);
        }
        return result;
    };
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
        $scope.Maths();
        $scope.$apply();

    });
    $("#tbl").on('change', 'tbody tr .checkboxes', function () {
        $(this).parents('tr').toggleClass("active");
        $scope.Maths();
        $scope.$apply();
    });



    $scope.getSelectIds = function () {
       // var ids = "";
        var InArr = {ids:'',Moneys:''};
        $(".checkboxes").each(function () {
            var checked = $(this).is(":checked");
            if (checked) {
                InArr.ids += $(this).attr('value') + ",";
                InArr.Moneys += $(this).attr('data-id') + ",";
            }
        });
        if(InArr.ids||InArr.Moneys){
            InArr.ids = InArr.ids.substring(0,InArr.ids.length-1);
            InArr.Moneys = InArr.Moneys.substring(0,InArr.Moneys.length-1);
        }
        return InArr;
    };
    $scope.Maths = function () {
        if($scope.getSelectIds().Moneys==''){
            $scope.TotalAmount=0;
            $scope.Totalbtn=true;
        }else {
            MonArr = $scope.getSelectIds().Moneys.split(',');
            $scope.TotalAmount=MonArr.sum().toFixed(2);
            if($scope.TotalAmount>0){
                $scope.Totalbtn=false;
            }else {
                $scope.Totalbtn=true;
            }
        }

    }
    $scope.load();


    $scope.tosubmit =function () {
        $state.go('invoice.submit', {dataTic: $scope.getSelectIds().ids,dataMon:$scope.TotalAmount,Assure:$scope.Assure});
    }
});
