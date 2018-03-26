/**
 * 个人认证
 *
 */
angular.module('App').controller('AccountAuthCtrl', function($rootScope, $scope, $ajax, FileUploader) {

    $scope.currentTab = 'account.auth';

    $scope.isActiveTab = function(url) {
        return url == $scope.currentTab;
    };
    var formData = [];
    $scope.data1={
        username:'',
        id_card:'',
        id_card_pic:null
    }
    $scope.data2={
        username:'',
        id_card:'',
        id_card_pic:null
}
    $scope.load = function() {
        //展示验证状态
        $ajax.post('/api/user/Authz/status' ,$.param({}), function(result) {
            $scope.id= result.id;
            // $scope.data1=result.person;
            // $scope.data2=result.company;
            // console.log($scope.data2)
            if (result.person != null) {
                $scope.data1.username = result.person.username;
                $scope.data1.id_card = result.person.id_card;
                $scope.data1.id_card_pic = result.person.id_card_pic;
                $scope.data1.id_card_pic2 = result.person.id_card_pic2;
                $scope.data1.reason = result.person.reason;//审核不通过原因

            } else if (result.company != null) {
                $scope.data2.username = result.company.username;
                $scope.data2.id_card = result.company.id_card;
                $scope.data2.id_card_pic = result.company.id_card_pic;
                $scope.data2.status = result.status;
                $scope.data2.reason = result.company.reason;//审核不通过原因
            }
            $scope.data1.authz = result.authz; //认证类型  0:未认证 1:企业认证 2:个人认证
            $scope.data1.authz_status = result.authz_status; //认证状态  0:未认证 -1:认证不通过 1:已认证 2:认证中
        })
    };
    $scope.load();


    //正面图片
    $scope.uploader1 = new FileUploader({
        url: '/api/upload/Person/deliver'+'?'+new Date().getTime(),
        alias:'image_file',
        formData: formData,
        queueLimit: 2,
        removeAfterUpload: true,
        autoUpload:true
    });

    $scope.uploader1.onProgressItem = function (item, process) {
        $scope.progress.width = process + '%';
        layer.msg('上传中......'+$scope.progress.width+'', {
            icon: 16,
            shade: 0.01,
            time: 0
        });

    };
    $scope.uploader1.onAfterAddingFile = function (item) {
        layer.msg('上传中......', {
            icon: 16,
            shade: 0.01,
            time: 0
        });
        if ($scope.uploader1.queue.length > 1) {
            $scope.uploader1.removeFromQueue(0);
        }
        if (item._file.size > 10485760) {
            layer.msg('最大支持10M的文件', {time: 1000, icon: 2});
            return false;
        }
        getObjectURL(item._file, $('#idCardImg'));
        // $scope.uploader1.uploadAll();
    };
    $scope.uploader1.onBeforeUploadItem = function (item) {
        var formData = [];
        formData.push($scope.data1);
        Array.prototype.push.apply(item.formData, formData);
    };

    $scope.uploader1.onSuccessItem = function(item, response, status, headers) {

        if (response.code == '10000000') {
            $('#idCardImg').attr('ng-src',response.data.origin)
            layer.msg('图片添加成功', {icon: 1, time: 2000})
        }else if(response.code == '40001007'){
            layer.open({
                title:"信息",
                // content:'短信发送成功!&nbsp;共计<span class=\'font-red\'>' + $scope.mobileData.successCount + '</span>个号码,<span class=\'font-red\'>' + $scope.mobileData.successCount * $scope.count + '</span>条短信',
                content:response.msg,
                yes:function () {
                    layer.closeAll();
                }
            });
        }else {
            layer.msg(response.msg, {time: 1000, icon: 2})
        }
        // formData.splice(0, formData.length);
    };

    //反面图片
    $scope.uploader3 = new FileUploader({
        url: '/api/upload/Person/deliver'+'?'+new Date().getTime(),
        alias:'image_file',
        formData: formData,
        queueLimit: 2,
        removeAfterUpload: true,
        autoUpload:true
    });

    //等待状态
    $scope.uploader3.onProgressItem = function (item, process) {
        $scope.progress.width = process + '%';
        layer.msg('上传中......'+$scope.progress.width+'', {
            icon: 16,
            shade: 0.01,
            time: 0
        });

    };
    $scope.uploader3.onAfterAddingFile = function (item) {
        layer.msg('上传中......', {
            icon: 16,
            shade: 0.01,
            time: 0
        });
        if ($scope.uploader1.queue.length > 1) {
            $scope.uploader1.removeFromQueue(0);
        }
        if (item._file.size > 10485760) {
            layer.msg('最大支持10M的文件', {time: 1000, icon: 2});
            return false;
        }
        getObjectURL(item._file, $('#idCardImg2'));
        // $scope.uploader1.uploadAll();
    };
    $scope.uploader3.onBeforeUploadItem = function (item) {
        var formData = [];
        formData.push($scope.data1);
        Array.prototype.push.apply(item.formData, formData);
    };

    $scope.uploader3.onSuccessItem = function(item, response, status, headers) {

        if (response.code == '10000000') {
            $('#idCardImg2').attr('ng-src',response.data.origin);
            layer.msg('图片添加成功', {icon: 1, time: 2000})
        }else if(response.code == '40001007'){
            layer.open({
                title:"信息",
                // content:'短信发送成功!&nbsp;共计<span class=\'font-red\'>' + $scope.mobileData.successCount + '</span>个号码,<span class=\'font-red\'>' + $scope.mobileData.successCount * $scope.count + '</span>条短信',
                content:response.msg,
                yes:function () {
                    layer.closeAll();
                }
            });
        }else {
            layer.msg(response.msg, {time: 1000, icon: 2})
        }
        // formData.splice(0, formData.length);
    };









    $scope.uploader2 = new FileUploader({
        url: '/api/upload/Company/deliver'+'?'+new Date().getTime(),
        alias:'image_file',
        formData: formData,
        queueLimit: 2,
        removeAfterUpload: true,
        autoUpload:true
    });
    $scope.progress = {width: 0 };
    $scope.uploader2.onProgressItem = function (item, process) {
        $scope.progress.width = process + '%';

        layer.msg('上传中......'+$scope.progress.width+'', {
            icon: 16,
            shade: 0.01,
            time: 0
        });
    };

    $scope.uploader2.onAfterAddingFile = function (item) {
        layer.msg('上传中......', {
            icon: 16,
            shade: 0.01,
            time: 0
        });
        if ($scope.uploader2.queue.length > 1) {
            $scope.uploader2.removeFromQueue(0);
        }
        if (item._file.size > 10485760) {
            layer.msg('最大支持10M的文件', {time: 1000, icon: 2});
            return false;
        }
        getObjectURL(item._file, $('#businessLicenceImg'));
    };
    $scope.uploader2.onBeforeUploadItem = function (item) {
        var formData = [];
        formData.push($scope.data2);
        Array.prototype.push.apply(item.formData, formData);
    };

    $scope.uploader2.onSuccessItem = function(item, response, status, headers) {
        if (response.code == '10000000') {
            $('#businessLicenceImg').attr('ng-src',response.data.origin);
            layer.msg('图片添加成功', {icon: 1, time: 2000});

        }else if(response.code == '40001007'){
            layer.open({
                title:"信息",
                // content:'短信发送成功!&nbsp;共计<span class=\'font-red\'>' + $scope.mobileData.successCount + '</span>个号码,<span class=\'font-red\'>' + $scope.mobileData.successCount * $scope.count + '</span>条短信',
                content:response.msg,
                yes:function () {
                    layer.closeAll();
                }
            });
        } else {
            layer.msg(response.msg, {time: 1000, icon: 2})
        }
        // formData.splice(0, formData.length);
    };

    function getObjectURL(file, imgObj) {
        var url = null ;
        if (window.createObjectURL!=undefined) { // basic
            url = window.createObjectURL(file) ;
        } else if (window.URL!=undefined) { // mozilla(firefox)
            url = window.URL.createObjectURL(file) ;
        } else if (window.webkitURL!=undefined) { // webkit or chrome
            url = window.webkitURL.createObjectURL(file) ;
        }
        imgObj.attr('src', url);
        return url ;
    };



    //个人认证
    $rootScope.modify1 = function () {
        var pic=$('#idCardImg').attr('ng-src');
        var picback=$('#idCardImg2').attr('ng-src');
        // console.log($scope.data1.username)
        if($scope.data1.username=='' || $scope.data1.username==undefined){
            layer.msg('请输入姓名', {icon: 2, time: 2000})
            return false;
        }
        if ($scope.data1.id_card=='' || $scope.data1.id_card==undefined){
            layer.msg('请输入身份证号码', {icon: 2, time: 2000});
            return false;
        }
        if(pic=='../public/assets/layout/img/sfzback.png'){
            layer.msg('请上传身份证正面照片', {icon: 2, time: 2000});
            return false;
        }
        if(picback=='../public/assets/layout/img/sfz.png'){
            layer.msg('请上传身份证反面照片', {icon: 2, time: 2000});
            return false;
        }
        $ajax.post('/api/user/Authz/person',$.param({
            id:$scope.id,
            username:$scope.data1.username,
            id_card:$scope.data1.id_card,
            id_card_pic:pic,
            id_card_pic2:picback
        }),function () {
            layer.msg('提交成功，我们将尽快审核！', {time: 2000, icon: 1},function () {
                $scope.load();
            });
            //    刷新页面
            // location.reload();
        })
    };


    //企业认证
    $rootScope.modifyBoss = function (continue1) {
        var pic2=$('#businessLicenceImg').attr('ng-src');


        if($scope.data2.username=='' || $scope.data2.username==undefined){
            layer.msg('请输入企业名称', {icon: 2, time: 2000})
            return false;
        }
        if ($scope.data2.id_card=='' || $scope.data2.id_card==undefined){
            layer.msg('请输入证件号码', {icon: 2, time: 2000})
            return false;
        }

        if(pic2=='../public/assets/layout/img/yyzz.png'){
            layer.msg('请上传证件照片', {icon: 2, time: 2000})
            return false;
        }

        $ajax.post('/api/user/Authz/company',$.param({
            id:$scope.id,
            username:$scope.data2.username,
            id_card:$scope.data2.id_card,
            id_card_pic:pic2,
            continue:continue1
        }),function () {
            layer.msg('提交成功，我们将尽快审核！', {time: 2000, icon: 1},function () {
                $scope.load();
            });
            //    刷新页面
            // location.reload();
        })
    };

});