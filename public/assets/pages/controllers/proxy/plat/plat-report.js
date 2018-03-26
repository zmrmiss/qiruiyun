/**
 * 模板短信
 * Created by zhangm .
 */
angular.module('App').controller('MassPlatReportCtrl', function($rootScope, $stateParams, $scope, $ajax ,$filter ,$uibModal) {

    $scope.currentTab = 'mass.report';

    // console.log($stateParams)
    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.load=function () {
        $ajax.post('/api/marketing/Account/is',$.param({purpose:0}), function(result) {
            $rootScope.apikey= result;
            sessionStorage.setItem("ApiKey", result);
            $scope.loadCounts(result);
            $scope.loadReport(result);
            $scope.smsSign(result);
        });



    }
    $scope.load();



    $scope.smsCount = 0;
    $scope.yesterdayCount = 0;
    $scope.templateCount = 0;
    $scope.signCount = 0;
    $scope.tableData = [];

    $scope.ts=moment().add('-24','hours').toDate().getTime();
    $scope.yesterdayTIME=$filter('date')($scope.ts,'yyyy-MM-dd');

    $scope.smsSign = function (apikey) {
        $ajax.post('/api/marketing/Signature/total',$.param({username:apikey}), function(result) {
            $scope.signCount= result;
        });
        $ajax.post('/api/bridge1/Statistics/items',$.param({username:apikey,date:$scope.yesterdayTIME}),function (result) {
            if(result.data!=''){
                $scope.yesterdayCount=result.data.send;
            }
        })
        $ajax.post('/api/marketing/Template/total',$.param({username:apikey}), function(result) {
            $scope.templateCount= result;
        });
    }

    $scope.loadCounts = function(apikey) {
        $ajax.post('/api/bridge1/Balance/detail',$.param({username:apikey,scope:1}), function(result) {
            $scope.smsCount = result;
            // $scope.templateCount = result.templateCount;
            // $scope.yesterdayCount = result.yesterdayCount;
            // $scope.signCount = result.signCount;
        });
    };


    $scope.loadReport = function(apikey) {
        $ajax.post('/api/bridge2/Profile/detail', $.param({username:apikey , scope:1}), function(result) {
            if (result.pAxisData) {
                init1(result.xAxisData, result.yAxisData, result.pAxisData);
            } else {
                init2(result.xAxisData, result.yAxisData);
            }
            $scope.tableData = result.data;
        })
    };


    var init1 = function(xData, yData, pData) {
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
                    title: {
                        text: '发送统计',
                        subtext: '近30天内的统计数据，不包括今日',
                        textStyle: {
                            fontSize: 14,
                            fontWeight: 'bolder',
                            color: '#333'
                        }
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    calculable : true,
                    legend: {
                        color: ['red', 'green', 'red', 'yellow'],
                        data:['发送总量','发送成功','发送失败','等待返回', '无效发送']
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
                    xAxis : [
                        {
                            type : 'category',
                            splitLine : {show : false},
                            data : xData
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value',
                            position: 'left'
                        }
                    ],
                    series : [

                        {
                            name:'发送总量',
                            type:'line',
                            data: yData
                        },
                        {
                            name:'状态分析',
                            type:'pie',
                            tooltip : {
                                trigger: 'item',
                                formatter: '{a} <br/>{b} : {c} ({d}%)'
                            },
                            center: [160,130],
                            radius : [0, 50],
                            itemStyle :　{
                                normal : {
                                    labelLine : {
                                        length : 10
                                    }
                                }
                            },
                            data: pData
                        }
                    ]
                };
                myChart.setOption(option);
                window.onresize = myChart.resize;
            }
        );
    };
    var init2 = function(xData, yData, pData) {
        require.config({
            paths: {
                echarts: '../assets/plugins/echarts/dist'
            }
        });
        require(
            [
                'echarts',
                'echarts/chart/line'
            ],
            function(e) {
                var myChart = e.init(document.getElementById('sendR'));
                option = {
                    title: {
                        text: '发送统计',
                        subtext: '近30天内的统计数据，不包括今日',
                        textStyle: {
                            fontSize: 14,
                            fontWeight: 'bolder',
                            color: '#333'
                        }
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    calculable : true,
                    legend: {
                        data:['发送总量']
                    },
                    toolbox: {
                        show : true,
                        feature : {
                            saveAsImage : {show: true}
                        }
                    },
                    xAxis : [
                        {
                            type : 'category',
                            splitLine : {show : false},
                            data : xData
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value',
                            position: 'left'
                        }
                    ],
                    series : [

                        {
                            name:'发送总量',
                            type:'line',
                            data: yData
                        }
                    ]
                };
                myChart.setOption(option);
                window.onresize = myChart.resize;
            }
        );
    };


    $scope.InterfaceTransfer = function() {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'InterfaceZy.html',
            controller: 'PlatInterfaceCtrls',
            windowClass:'width400',
            resolve:{
                data : function(){
                    return {
                        // item: angular.copy(apikey),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    };
});
angular.module('App').controller('PlatInterfaceCtrls', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {
    $scope.data = {
        amount:'',
        api_username: '',
        total:'',
        transfer:''
    };

    $ajax.post('/api/transfer/Transfer/balance', $.param({}), function (result) {
        $scope.data.total=result.total;
        $scope.data.transfer=result.transfer
    })

    $scope.listLoad = function () {
        $ajax.get('/api/ordinary/Account/search/', $.param({api_key:$scope.data.api_username}), function (result2) {
            $scope.usernames= result2
        })
    }
    $scope.listLoad();








    $scope.ok = function () {
        if($scope.data.transfer<100){
            layer.msg("可转移的条数不足100", {time: 2000, icon: 2});
            return false;
        }
        if($scope.data.amount==''){
            layer.msg("请输入需要转移的条数", {time: 2000, icon: 2});
            return false;
        }
        if($scope.data.amount<100){
            layer.msg("单次转移条数需大于等于100条!", {time: 2000, icon: 2});
            return false;
        }
        if(parseFloat($scope.data.amount)>parseFloat($scope.data.transfer)){
            layer.msg("转移条数大于可转移条数，请重新输入!", {time: 2000, icon: 2});
            return false;
        }
        if($scope.data.api_username==''||$scope.data.api_username==undefined){
            layer.msg("请选择接口账号!", {time: 2000, icon: 2});
            return false;
        }

        layer.open({
            type: 1
            ,closeBtn:false
            ,title: "转移确认" //不显示标题栏
            ,area: '400px;'
            ,shade: 0.2
            ,id: 'LAY_layuipro4' //设定一个id，防止重复弹出
            ,resize: false
            ,btn: ['确定转移','我再想想']
            ,btnAlign: 'c'
            ,moveType: 1 //拖拽模式，0或者1
            ,content: '<div style="height: 210px;padding:15px 30px; line-height: 32px;background-color: #fff;font-weight: 400;font-size: 13px;text-align: center;padding-top: 65px; color: #f00;">确定转移 '+$scope.data.amount+' 条至接口账号： '+$scope.data.api_username+'   ？</div>'
            ,success : function () {
                $('.layui-layer-btn1').css({'margin-left':'50px','width':'104px','text-align':'center'})
            }
            ,yes: function(index, layero){
                $ajax.post('/api/transfer/Transfer/move2', $.param({amount:$scope.data.amount,api_username:$scope.data.api_username}),function () {
                    layer.msg('转移成功！',{time:2000});
                    $uibModalInstance.dismiss(0);
                    layer.close(index);
                    $scope.$apply();
                })

            }
            ,btn2: function(index, layero){
                layer.close(index)
            }
        });
        // $ajax.post('', $.param($scope.data), function () {
        //     layer.msg('操作成功!', {time: 1000, icon: 1});
        //     $uibModalInstance.dismiss(0);
        //     data.callback();
        // })
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss(0);
    };
});