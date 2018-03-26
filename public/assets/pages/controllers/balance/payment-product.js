/**
 * 产品充值
 *
 */
angular.module('App').controller('PaymentProductCtrl', function($rootScope, $scope, $state, $ajax ,$compile , $uibModal) {

    $scope.searchOff=false;
    $scope.currentTab = 'payment.product';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.default = {
        name: "自定义套餐",
        price: 0,
        quantity: 0
    };
    $scope.Pay={
        Username:'',
        Combotype:''
    };
    $scope.ApiPay=true;
    $scope.data = {
        type: 0,
        product: {},
        payMode: 0,
        quantity: 0,
        Combotype:''
    };

    $scope.goods = [];
    $scope.good = {};
    $scope.loadGood = function(type) {

        $scope.data.type = type;
        $ajax.post('/api/user/Target/items',$.param({purpose:$scope.data.type-1}), function(result) {
            //

            //无api账号加载
            var html='<div style="padding-top: 10px"><span style="font-size:14px;line-height: 30px;height: 30px;display: inline-block;margin-top: 3px;float: left;">暂无API账号，</span> <a href="javascript:;" style="width: 115px;border-radius: 0" class="form-control input-sm btn btn-sm blue" ng-click="CreateAccount(2)">创建一个API账号</a></div> <div style="color: #6b6b6b;font-size: 14px">API接入简单，可嵌入应用及二次开发，常用语验证码、订单通知、会员服务等</div>';
            var $html = $compile(html)($scope);
            $scope.key = result;
            $scope.length=result.length;

            if ($scope.data.type==0){
                $('#swiperContainer').show();
                $scope.toggle='';
                $scope.Pay.Username='';
                if($scope.length==1&&$scope.data.type==0){
                    $scope.Pay.Username=result[0].username;
                    $scope.toggle=$scope.Pay.Username;
                    $scope.loadList()
                }else if($scope.length==0){
                    $('#createHtml').html($html);
                    $scope.loadList()
                }else {
                    $scope.loadList()
                }
            }else if($scope.data.type==1){
                $('#swiperContainer').hide();
                if(result==''){
                    $ajax.post('/api/marketing/Account/is',$.param({purpose:0}), function(result) {
                        $scope.Pay.Username = result;
                    });
                }else {
                    $scope.Pay.Username = result[0].username;
                }
                $scope.loadList()
            }else if($scope.data.type==2){
                $('#swiperContainer').hide();
                if(result==''){
                    $ajax.post('/api/marketing/Account/is',$.param({purpose:1}), function(result) {
                        $scope.Pay.Username = result;
                    });
                }else {
                    $scope.Pay.Username = result[0].username;
                }
                $scope.loadList()
            }


            // if($scope.length==0){
            //     $('#key_border').html($html)
            // } else {
            if($scope.length<5){
                $("#clickbotprev").hide();
                $("#clickbotnext").hide();
            }else {
                $scope.searchOff=true;
                $("#clickbotprev").show();
                $("#clickbotnext").show();
            }
            // }
            
        });

        //接口短信调用
        $scope.onClickKey = function(key) {
            $scope.toggle=key;
            $scope.Pay.Username=key;
            $scope.loadList();
        };
        $scope.isActiveKey = function(username) {
            return username == $scope.toggle;
        }


    };
    $scope.loadGood($scope.data.type);


    //创建api账号
    $scope.CreateAccount = function(newone) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'create.html',
            controller: 'CreateSafeCtrlcomn',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        newone: angular.copy(newone),
                        callback: function() {
                            // $scope.loadGood(0);
                            location.reload();
                        }
                    }
                }
            }
        });
    };


    $scope.loadList = function () {
        //套餐列表
        $ajax.post('/api/finance/Product/items',$.param({
            username:$scope.Pay.Username,
            type: $scope.data.type
        }), function (result) {
            $scope.goods = result.first;
            $scope.goods2 =result.Second;

            $scope.goods.forEach(function (good,i) {
                good.Combotype = 'first';
            });
            $scope.goods2.forEach(function (good,i) {
                good.Combotype = 'Second';
            });
            $scope.data.product = $scope.goods[0];

        })
    }
    var title_msg;
    //支付宝支付
    $scope.PaySubmit = function () {

        if($scope.data.product == null) {
            layer.msg('请选择套餐！', {time: 1000, icon: 2});
            event.preventDefault();
            return false;
        }
        if($scope.Pay.Username == '') {
            layer.msg('请选择需要充值的API账号！', {time: 1000, icon: 2});
            event.preventDefault();
            return false;
        }



        if($scope.data.type==0){
            title_msg = '您是否确定充值该产品（接口短信）？充值之后短信不可逆转，请知悉。'
        }else if($scope.data.type==1) {
            title_msg ='您是否确定充值该产品（行业短信）？充值之后短信不可逆转，请知悉。'
        }else if($scope.data.type==2) {
            title_msg = '您是否确定充值该产品（营销短信）？充值之后短信不可逆转，请知悉。'
        }else {
            title_msg = '您是否确定充值该产品？充值之后短信不可逆转，请知悉。'
        }
        layer.msg(title_msg, {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);

                var l = (screen.width - 650) / 2;
                var t = (screen.height - 400) / 2;
                // var newWin = window.open("_blank",'newwindow', "toolbar=no, directories=no, status=no, menubar=no, width=650, height=550, top=" + t + ", left=" + l);
                var newWin = window.open();
                $ajax.post('/api/finance/AlipayProduct/go/', $.param({
                    username:$scope.Pay.Username,
                    type: $scope.data.type,
                    product_id: $scope.data.product.id,
                    product_type: $scope.data.product.Combotype
                }), function (result) {
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
                });
            }
        })

    };

    //钱包支付
    $scope.submit = function () {

        if($scope.data.product == null) {
            layer.msg('请选择套餐！', {time: 1000, icon: 2});
            event.preventDefault();
            return false;
        }
        if($scope.Pay.Username == '') {
            layer.msg('请选择需要充值的API账号！', {time: 1000, icon: 2});
            event.preventDefault();
            return false;
        }

        if($scope.data.type==0){
            title_msg = '您是否确定充值该产品（接口短信）？充值之后短信不可逆转，请知悉。'
        }else if($scope.data.type==1) {
            title_msg ='您是否确定充值该产品（行业短信）？充值之后短信不可逆转，请知悉。'
        }else if($scope.data.type==2) {
            title_msg = '您是否确定充值该产品（营销短信）？充值之后短信不可逆转，请知悉。'
        }else {
            title_msg = '您是否确定充值该产品？充值之后短信不可逆转，请知悉。'
        }
        layer.msg(title_msg, {
            time: 0, //不自动关闭
            icon: 0,
            btn: ['确定', '取消'],
            yes: function(index){
                layer.close(index);
                $ajax.post('/api/finance/PayProduct/go/', $.param({
                    username:$scope.Pay.Username,
                    type: $scope.data.type,
                    product_id: $scope.data.product.id,
                    product_type: $scope.data.product.Combotype
                }), function (result) {
                    layer.msg('充值成功！', {time: 2000, icon: 1});
                    setTimeout(function () {
                        layer.close();
                        $state.go('orders.all');
                    },2000)
                });
            }
        });

    };

    $scope.recharge = function (event) {
        if($scope.data.product == null) {
            layer.msg('请选择套餐！', {time: 1000, icon: 2});
            event.preventDefault();
            return false;
        }
        layer.confirm('是否支付完成？', {
            btn: ['支付成功','支付失败'] //按钮
        }, function(index){
            layer.close(index);
            $state.go('orders.all');
        }, function(){
            $state.go('orders.all');
        });
        return true;
    };

    //搜索账号
    $scope.SearchAccount = function() {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'search.html',
            controller: 'SearchSafeCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        // newone: angular.copy(newone),
                        callback: function(result) {
                            $scope.key=result;
                            $scope.toggle='';
                            $scope.Pay.Username='';
                            if (result.length>5){
                                $scope.isActiveKey = function(username) {
                                    return username == $scope.toggle;
                                }
                                $("#clickbotprev").show();
                                $("#clickbotnext").show();
                            }else {
                                $scope.isActiveKey = function(username) {
                                    return username == $scope.toggle;
                                }
                                if (result.length==1){
                                    $scope.Pay.Username=result[0].username;
                                    $scope.isActiveKey = function(username) {
                                        return username == result[0].username;
                                    }
                                }
                                $("#clickbotprev").hide();
                                $("#clickbotnext").hide();
                            }
                            // $scope.load();
                        }
                    }
                }
            }
        });
    };
});

angular.module('App').controller('CreateSafeCtrlcomn', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {
    $scope.step = 1;

    $scope.data = {
        title: '',
        type:''
    };

    $scope.ok = function () {
        if($scope.data.type){
            $ajax.post('/api/ordinary/Account/create',$.param({ type:$scope.data.type,
                title: $scope.data.title}),function () {
                layer.msg('添加API账号成功！', {time: 1500, icon: 1});
                $uibModalInstance.dismiss();
                if(data.newone==2){
                    data.callback();
                }
            })

        }else {
            layer.msg('请选择短信类型', {time: 2000, icon: 2});
        }
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };


});


angular.module('App').controller('SearchSafeCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {
    $scope.step = 1;

    $scope.dataSearch = {
        title:sessionStorage.getItem("serTitleDd")||'',
        api_key:sessionStorage.getItem("serApikeyDd")||''
    };


    $scope.ok = function () {
        $ajax.post('/api/ordinary/Account/search/',$.param($scope.dataSearch),function (result) {
            sessionStorage.setItem("serTitleDd", $scope.dataSearch.title);
            sessionStorage.setItem("serApikeyDd", $scope.dataSearch.api_key);
            if(result==''){
                layer.msg('暂未查到符合条件的API账号！', {time: 2000, icon: 2});

            }else {
                data.callback(result);

            }
            $uibModalInstance.dismiss(0);
        })

    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };


});