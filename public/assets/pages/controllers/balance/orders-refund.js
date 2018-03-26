/**
 * 订单列表
 *
 */
angular.module('App').controller('OrderRefundCtrl', function($rootScope, $stateParams, $scope, $ajax , $filter) {

    $scope.currentTab = 'orders.refund';

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

    // $scope.params = {
    //     status: $scope.payStatuses[0].value,
    //     type: $scope.payTypes[0].value
    // };
    $scope.params = {
        status: '',
        type: ''
    };


    $scope.tableData = [];
    $scope.refundload = function() {
        if($scope.params.status==''){
            $scope.params.status='all'
        }
        $ajax.post('/api/user/Refund/refundlist', $.param({
            limit: $scope.paginationConf.itemsPerPage,
            page: $scope.paginationConf.currentPage,
            // begin:$scope.date.startDate.unix(),
            // end: $scope.date.endDate.unix(),
            // order_num: $scope.params.number,
            // pay_status: $scope.params.status,
            // order_type : $scope.params.type
        }), function(result) {
            $scope.tableData = result.list;
            if(result.length==0){
                $scope.tableData = [];
            }
            $scope.paginationConf.totalItems = result.count;
        });
    };
    $scope.refundload();
    

    $scope.trueBtn = function (data) {
        layer.confirm('确认退款信息无误？', {
            title:'确认',
            btn: ['确认无误'] //按钮
        }, function(index){
            $ajax.post('/api/user/Refund/affirm', $.param({id:data.id,user_id:data.user_id}),function () {
                layer.msg('确认成功！财务将尽快为您退款，请耐心等待！！',{time:2000,icon:1});
                $scope.refundload();
            })
            layer.close(index);

        }, function(){
            $scope.refundload();
        });
    }
    $scope.falseBtn = function (data) {
        layer.open({
            type: 1
            // ,closeBtn:true
            ,title: "驳回" //不显示标题栏
            ,area: '360px;'
            ,shade: 0.2
            ,id: 'LAY_layuipro' //设定一个id，防止重复弹出
            ,resize: false
            ,btn: ['确定驳回']
            ,btnAlign: 'c'
            ,moveType: 1 //拖拽模式，0或者1
            ,content: '<div style="height: 150px;padding: 20px;"><textarea class="form-control input-sm ng-pristine ng-valid ng-empty ng-touched" style="resize: none;height: 100px;"  name="mobiles" id="refundText" placeholder="输入驳回原因"></textarea></div>'
            ,success : function () {
                $('.layui-layer-btn1').css({'margin-left':'50px','width':'104px','text-align':'center'})
            }
            ,yes: function(index, layero){
                // 确定不再转移
                console.log($('#refundText').val())
                if($('#refundText').val()==''){
                    layer.msg('驳回原因不能为空！');
                    return false;
                }

                $ajax.post('/api/user/Refund/reject', $.param({id:data.id,user_id:data.user_id,reason:$('#refundText').val()}),function () {
                    layer.close(index)
                    layer.msg('已驳回！我们将尽快处理您的反馈！！',{time:2000,icon:1});
                    $scope.refundload();
                    // setTimeout(function () {
                    //
                    // },2000)
                })

            }

        });
    }
});
