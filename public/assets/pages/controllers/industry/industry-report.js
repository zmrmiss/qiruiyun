/**
 * 群发短信
 *
 */
angular.module('App').controller('MessageIndustryReportCtrl', function($rootScope, $stateParams, $scope, $ajax ,$filter) {

    $scope.currentTab = 'industry.report';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.load=function () {
        $ajax.post('/api/marketing/Account/is',$.param({purpose:1}), function(result) {
            $rootScope.apindustry= result;
            sessionStorage.setItem("ApiIndustry", result);
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

    $scope.smsSign = function (apindustry) {
        $ajax.post('/api/marketing/Signature/total',$.param({username:apindustry}), function(result) {
            $scope.signCount= result;
        });
        $ajax.post('/api/bridge1/Statistics/items',$.param({username:apindustry,date:$scope.yesterdayTIME}),function (result) {
            if(result.data!=''){
                $scope.yesterdayCount=result.data.send;
            }
        })
        $ajax.post('/api/marketing/Template/total',$.param({username:apindustry}), function(result) {
            $scope.templateCount= result;
        });
    }


    $scope.loadCounts = function(apindustry) {
        $ajax.post('/api/bridge1/Balance/detail',$.param({username:apindustry,scope:1}), function(result) {
            $scope.smsCount = result;
            // $scope.templateCount = result.templateCount;
            // $scope.yesterdayCount = result.yesterdayCount;
            // $scope.signCount = result.signCount;
        });
    };


    $scope.loadReport = function(apindustry) {
        $ajax.post('/api/bridge2/Profile/detail', $.param({username:apindustry , scope:1}), function(result) {
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
    }
});
