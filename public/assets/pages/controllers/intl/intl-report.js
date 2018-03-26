/**
 * 国际短信
 *
 */
angular.module('App').controller('IntlReportCtrl', function($rootScope, $stateParams, $scope, $ajax) {

    $scope.currentTab = 'intl.report';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };

    $scope.smsCount = 0;
    $scope.templateCount = 0;
    $scope.signCount = 0;
    $scope.tableData = [];
    $scope.data = {};

    $scope.loadCounts = function() {
        $ajax.post('intl/counts',{}, function(result) {
            $scope.smsCount = parseFloat(result.smsCount).toFixed(3);
            $scope.templateCount = result.templateCount;
            $scope.signCount = result.signCount;
            $scope.data.total = result.total;
            $scope.data.success = result.success;
            $scope.data.fail = result.fail;
            $scope.data.unknown = result.unknown;
        });
    };
    // $scope.loadCounts();

    $scope.loadReport = function() {
        $ajax.post('intl/report', {}, function(result) {
            init(result.xAxisData, result.yAxisData, result.pAxisData);
            $scope.tableData = result.data;
        })
    };
    // $scope.loadReport();

    var init = function(xData, yData, pData) {
        require.config({
            paths: {
                echarts: '../assets/plugins/echarts/dist'
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
                        text: '发送统计',
                        subtext: '近30天内的统计数据，不包括今日'
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    legend: {
                        data:['发送总量']
                    },
                    toolbox: {
                        show : true,
                        feature : {
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
                        }
                    ],
                    series : [
                        {
                            name:'发送总量',
                            type:'line',
                            data:yData
                        }
                    ]
                };

                myChart.setOption(option);
                window.onresize = myChart.resize;
            }
        );
    }
});
