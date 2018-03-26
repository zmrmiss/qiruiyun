//控制台
angular.module('App').controller('DesktopCtrl', function($rootScope, $scope, $uibModal, $ajax) {

    $scope.data = {
        name:'',
        amount:0,
        totalAmount:0
    };
    $scope.apinum = 0;
    $scope.amount = 0;
    $scope.totalAmount = 0;
    $scope.load = function () {
        //获取认证状态
        $ajax.post('/api/user/Authz/status', $.param({}), function (result) {
            $scope.data = result;
            if( $scope.data.company!=null){
                $scope.data.name=$scope.data.company.username
            }
            if( $scope.data.person!=null){
                $scope.data.name=$scope.data.person.username
            }
        })

        // 获取账户余额
        $ajax.post('/api/finance/Balance/index', $.param({}), function (result) {
            $scope.amount = result;
        })
        //获取昨日消费
        $ajax.post('/api/finance/Wallet/consume/',$.param({day:-1}), function (result) {
            $scope.totalAmount = result;
        })
        //获取api账号个数
        $ajax.post('/api/ordinary/Account/total',$.param({}),function (result) {
            $scope.apinum=result;
        })
    };
    $scope.load();

    $scope.loadReport = function () {
        $ajax.post('/api/bridge2/ProfileAll/report', $.param({}), function(result) {
            init(result.xAxisData, result.noticeAxisData, result.marketing1AxisData, result.marketing2AxisData);
            $scope.tableData = result.data;
        })
    };
    $scope.loadReport();

    var init = function(xData, identifyData, marketingData, intlData) {
        require.config({
            paths: {
                echarts: '../../public/assets/plugins/echarts/dist'
            }
        });
        require(
            [
                'echarts',
                'echarts/chart/line',
                'echarts/chart/pie'
            ],
            function(e) {
                var myChart = e.init(document.getElementById('sendR'));
                option = {
                    title : {
                        // text: '未来一周气温变化',
                        subtext: '近30天的发送统计'
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    legend: {
                        data:['接口短信', '营销短信','行业短信']
                    },
                    toolbox: {
                        show : true,
                        feature : {
                            // mark : {show: true},
                            // dataView : {show: true, readOnly: false},
                            // magicType : {show: true, type: ['line', 'bar']},
                            // restore : {show: true},
                            saveAsImage : {show: true}
                        }
                    },
                    calculable : true,
                    xAxis : [
                        {
                            type : 'category',
                            boundaryGap : false,
                            data : xData
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value',
                            axisLabel : {
                                formatter: '{value} '
                            }
                        }
                    ],
                    series : [
                        {
                            name:'接口短信',
                            type:'line',
                            data: identifyData
                            // markPoint : {
                            //     data : [
                            //         {type : 'max', name: '最大发送量'},
                            //         {type : 'min', name: '最小发送量'}
                            //     ]
                            // },
                            // markLine : {
                            //     data : [
                            //         {type : 'average', name: '平均发送量'}
                            //     ]
                            // }
                        },
                        {
                            name:'营销短信',
                            type:'line',
                            data:intlData
                            // markPoint : {
                            //     data : [
                            //         {type : 'max', name: '最大发送量'},
                            //         {type : 'min', name: '最小发送量'}
                            //     ]
                            // },
                            // markLine : {
                            //     data : [
                            //         {type : 'average', name : '平均发送量'}
                            //     ]
                            // }
                        },
                        {
                            name:'行业短信',
                            type:'line',
                            data:marketingData
                            // markPoint : {
                            //     data : [
                            //         {type : 'max', name: '最大发送量'},
                            //         {type : 'min', name: '最小发送量'}
                            //     ]
                            // },
                            // markLine : {
                            //     data : [
                            //         {type : 'average', name : '平均发送量'}
                            //     ]
                            // }
                        }
                    ]
                };
                myChart.setOption(option);
                window.onresize = myChart.resize;
            }
        );
    }

    $scope.showKey = function () {
        var accessKey = $('#accessKey').val();
        var accessSecret = $('#accessSecret').val();
        layer.open({
            type: 1,
            title: '我的密钥',
            skin: 'layui-layer-demo', //样式类名
            closeBtn: 0, //不显示关闭按钮
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            content: '<div class="form-horizontal" role="form"><div class="form-body"><div class="row"><div class="col-md-6"><div class="form-group"><label class="control-label col-md-3">特服号</label><div class="col-md-9"><p class="form-control-static" ng-bind="data.id">  </p></div></div></div></div><div class="row"><div class="col-md-6"><div class="form-group"><label class="control-label col-md-3">账号类别</label><div class="col-md-9"><p class="form-control-static" ng-bind="data.category == 1 ? "企业" : "个人"">  </p></div></div></div></div></div></div>',
            scrollbar: false
        });
    };

    $scope.open = function() {

        var accessKey = $('#accessKey').val();
        var accessSecret = $('#accessSecret').val();
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'key.html',
            controller: 'accessKeyCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        accessKey: angular.copy(accessKey),
                        accessSecret: angular.copy(accessSecret),
                        callback:function (newSecret) {
                            $('#accessSecret').val(newSecret)
                        }
                    }
                }
            }
        });
    };
});
angular.module('App').controller('accessKeyCtrl', function($uibModalInstance, $scope, $ajax, data) {
    $scope.showSecret = false;
    $scope.data = {
        accessKey: data.accessKey,
        accessSecret: data.accessSecret
    };

    $scope.ok = function () {
        $uibModalInstance.dismiss(0);
        data.callback && data.callback($scope.data.accessSecret);
    };

    $scope.changeSecret = function() {
        layer.confirm('确认修改AccessSecret吗？', {
            btn: ['确认','取消'] //按钮
        }, function(index){
            $ajax.get("changeSecret",{}, function(result) {
                $scope.data.accessSecret = result;
                $scope.showSecret = true;
                layer.msg('修改AccessSecret成功!', {time: 1200, icon: 1});
            });
            layer.close(index);
        }, function(index){
            layer.close(index);
        });
    }
});
