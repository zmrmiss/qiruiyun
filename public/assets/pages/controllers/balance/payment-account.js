/**
 * 充值产品
 *
 */
angular.module('App').controller('PaymentAccountCtrl', function($rootScope, $state, $scope, $ajax , $uibModal) {

    $scope.currentTab = 'payment.account';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.data = {
        payMode: '1'
    };
    $scope.amount = 0;

    // 获取账户余额
    $scope.loadAmount = function () {
        $ajax.post('/api/finance/Balance/index', $.param({}), function (result) {
            $scope.amount = result;
        })
    };
    $scope.loadAmount();

    $scope.change = function () {
        if(!$scope.data.amount || isNaN($scope.data.amount)){
            $scope.data.amount = 0;
        }else{
            $scope.data.amount = Math.abs($scope.data.amount);
        }
    };

    $scope.submit = function () {
        if(!$scope.data.amount || isNaN($scope.data.amount)){
            layer.msg('请输入正确的可支付金额!', {time: 2000, icon: 2});
            return;
        }
        $('#accountForm').validate({
            rules: {
                amount: {
                    required: true
                }
            },
            messages: {
                amount: {
                    required: '请输入充值金额'
                }
            },
            errorPlacement: function(error, element) {
                error.appendTo(element.parent());
            },
            // wrapper: 'div.error',
            // errorElement: 'span',
            // errorClass:"font-red bordered-red",
            // focusCleanup: true, //被验证的元素获得焦点时移除错误信息
            submitHandler: function() {
                if($scope.data.amount<100){
                    layer.msg('请输入正确的可支付金额!', {time: 2000, icon: 2});
                    return false;
                }
                var l = (screen.width - 650) / 2;
                var t = (screen.height - 400) / 2;
                // var newWin = window.open("_blank",'newwindow', "toolbar=no, directories=no, status=no, menubar=no, width=650, height=550, top=" + t + ", left=" + l);
                var newWin = window.open();
                $ajax.post('/api/finance/AlipayWallet/go',$.param({money:$scope.data.amount}),function (result) {
                    newWin.location.href = encodeURI(result);
                    layer.confirm('是否支付完成？', {
                        title:'支付状态',
                        btn: ['支付成功','支付失败'] //按钮
                    }, function(index){
                        layer.close(index);
                        $state.go('orders.all');
                        // $state.go('payment.product');
                    }, function(){
                        $state.go('orders.all');
                    });
                    // layer.msg('是否支付完成？', {
                    //     time: 0, //不自动关闭
                    //     icon: 0,
                    //     btn: ['支付成功', '支付失败'],
                    //     yes: function(index){
                    //         layer.close(index);
                    //         $state.go('orders.all');
                    //     },
                    //     no: function (index) {
                    //         layer.close(index);
                    //         $state.go('orders.all');
                    //     }
                    // });
                    //  var html= '<a href="'+result+'" id="btn" target="_blank"></a>'
                   //  console.log(html)
                   //  window.open(result)
                   //  $('body').append(html)
                   // $('#btn').onclick();
                   //  var newTab=window.open('about:blank');
                   //  if(result){
                   //      newTab.location.href=result;
                   //  }
                    //iframe
                   //  layer.open({
                   //      type: 2,
                   //      title: false,
                   //      closeBtn: 0, //不显示关闭按钮
                   //      shade: [0],
                   //      area: ['340px', '215px'],
                   //      offset: 'auto', //右下角弹出
                   //      time: 2000, //2秒后自动关闭
                   //      shift: 2,
                   //      content: [result, 'no'], //iframe的url，no代表不显示滚动条
                   //      end: function(){ //此处用于演示
                   //          layer.open({
                   //              type: 2,
                   //              title: '百度一下，你就知道',
                   //              shadeClose: true,
                   //              shade: false,
                   //              maxmin: true, //开启最大化最小化按钮
                   //              area: ['1150px', '650px'],
                   //              content: result
                   //          });
                   //      }
                   //  });
                    // window._iframeIndex = layer.open({
                    //     type: 2,
                    //
                    //     skin: 'layui-layer-rim', //加上边框
                    //
                    //     area: ['420px', '240px'], //宽高
                    //
                    //     content: result
                    // });

                    //弹出新窗口
                    // $uibModal.open({
                    //     backdrop: 'static',
                    //     templateUrl: 'accountPay.html',
                    //     controller: 'AccountPayCtrl',
                    //     size: 'lg',
                    //     resolve: {
                    //         data: function () {
                    //             return {
                    //                 // item: angular.copy(result),
                    //                 // mode: angular.copy($scope.data.amount),
                    //                 callback: function () {
                    //                     $scope.loadAmount()
                    //                 }
                    //             }
                    //         }
                    //     }
                    // });

                    //确认跳转页面
                    // layer.open({
                    //     type: 1
                    //     ,title: "open方式弹出层" //不显示标题栏   title : false/标题
                    //     ,closeBtn: true
                    //     ,area: '300px;'
                    //     ,shade: 0.8
                    //     ,id: 'LAY_layuipro' //设定一个id，防止重复弹出
                    //     ,resize: false
                    //     ,btn: ['火速围观', '残忍拒绝']
                    //     ,btnAlign: 'c'
                    //     ,moveType: 1 //拖拽模式，0或者1
                    //     ,content: '<div style="padding: 50px; line-height: 22px; background-color: #393D49; color: #fff; font-weight: 300;">内容<br>内容</div>'
                    //     ,success: function(layero){
                    //         var btn = layero.find('.layui-layer-btn');
                    //         btn.find('.layui-layer-btn0').attr({
                    //             href: result
                    //             ,target: '_blank'
                    //         });
                    //     }
                    // });
                })
                    // var newwindow=window.open("balance/account/recharge?amount=" + $scope.data.amount + '&mode=' + $scope.data.payMode);
                // window.focus();
                // layer.confirm('是否支付完成？', {
                //     btn: ['支付成功','支付失败'] //按钮
                // }, function(index){
                //     layer.close(index);
                //     $state.go('orders.all');
                // }, function(){
                //     $state.go('orders.all');
                // });
                // layer.msg('是否支付完成？', {
                //     time: 0, //不自动关闭
                //     icon: 0,
                //     btn: ['支付成功', '支付失败'],
                //     yes: function(index){
                //         layer.close(index);
                //         $state.go('orders.all');
                //     },
                //     no: function (index) {
                //         layer.close(index);
                //         $state.go('orders.all');
                //     }
                // });
            }
        });
    }
});
angular.module('App').controller('AccountPayCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

    // $scope.data = data.item;
    // $scope.data.mode = data.mode + '';

    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
        data.callback();
    };
});
