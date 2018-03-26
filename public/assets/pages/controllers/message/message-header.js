/**
 * 接口短信 API账号list
 *
 */
angular.module('App').controller('MessageHeader', function($rootScope,$state, $scope, $ajax,$uibModal , $compile) {
    $scope.searchOff=false;
    $scope.key='';
    var html=' <div class="tabbable-line" style="text-align: center;;margin: 150px auto;border: 0"> '+
        '<div style="padding-top: 0;padding-bottom: 0;"> <img src="../public/assets/layout/img/noapi.png" alt="">' +
        '</div> <div class="btn btn-sm btn-info" style="color: #fff;white-space: nowrap;width: 30%;text-align: center;margin:20px auto;height: 50px;line-height: 50px;background-color: #30a5ff;" ng-click="CreateAccount(1)">创建一个API账号</div></div> ';
    var $html = $compile(html)($scope);

    $rootScope.loadCountsHeader = function(cre) {
        $ajax.post('/api/ordinary/Account/items',$.param({}), function(result) {
            $scope.key = result;
            $scope.length=result.length;
            if($scope.length==0){
                $('#key_border').html($html)
            } else {

                if(cre==1){
                    $scope.isActiveKey = function(username) {
                        return username == sessionStorage.getItem("qrname");
                    }
                }else {
                    $rootScope.username= $scope.key[0].username;
                    $rootScope.remind= $scope.key[0].remind;
                    sessionStorage.setItem("qrname", $scope.key[0].username);
                    sessionStorage.setItem("remind", $scope.key[0].remind);
                }



                if($scope.length<=5){
                    $("#clickbotprev").hide();
                    $("#clickbotnext").hide();
                }else {
                    $("#clickbotprev").show();
                    $("#clickbotnext").show();
                    $scope.searchOff=true;
                }
            }

        });
    };

    $rootScope.loadCountsHeader();

    $scope.onClickKey = function(key,remind) {
        // console.log($rootScope.username)
        $rootScope.username=key;
        $rootScope.remind=remind;
        sessionStorage.setItem("qrname",key);
        $scope.$watch(['username'],function () {
            //测试重置签名
            $rootScope.changeSign='启瑞云';
            $rootScope.signLoad();
            //测试重置定时器
            $rootScope.clearTimetwo();
            //图表
            $rootScope.loadReport($rootScope.username);
            //短信条数
            $rootScope.loadCounts($rootScope.username);

        }, false)

    };




    $scope.isActiveKey = function(username) {
        // console.log(username)
        return username == $rootScope.username;
    }


    $scope.CreateAccount = function(newone) {
        $uibModal.open({
            backdrop: 'static',
            templateUrl: 'create.html',
            controller: 'CreateSafeCtrl',
            size: 'md',
            resolve:{
                data : function(){
                    return {
                        newone: angular.copy(newone),
                        callback: function() {
                            $scope.load();
                        }
                    }
                }
            }
        });
    };

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
                            $state.go('message.hear.report')
                            $scope.key=result;
                            $rootScope.username=result[0].username;
                            sessionStorage.setItem("qrname", result[0].username);
                            //图表
                            $rootScope.loadReport($rootScope.username);
                            //短信条数
                            $rootScope.loadCounts($rootScope.username);
                            if (result.length>5){
                                $("#clickbotprev").show();
                                $("#clickbotnext").show();
                            }else {
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


angular.module('App').controller('CreateSafeCtrl', function($rootScope, $stateParams, $scope, $ajax, $uibModalInstance, data) {

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
               $rootScope.loadCountsHeader(1);
               $uibModalInstance.dismiss(0);
               if(data.newone==1){
                   location.reload();
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
        title:sessionStorage.getItem("serTitle")||'',
        api_key:sessionStorage.getItem("serApikey")||''
    };


    $scope.ok = function () {
        $ajax.post('/api/ordinary/Account/search/',$.param($scope.dataSearch),function (result) {
            sessionStorage.setItem("serTitle", $scope.dataSearch.title);
            sessionStorage.setItem("serApikey", $scope.dataSearch.api_key);
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