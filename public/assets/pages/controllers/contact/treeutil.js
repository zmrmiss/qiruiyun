
var treeutil = treeutil || {};
/**
 * 获取角色数
 * @param arr
 * @returns {Array}
 */
treeutil.getRoleTreeData = function (arr) {
    var _userList = [];

    var User = function(data){
        this.id = data.id;
        this.parentId = data.parent_id;
        this.oldName = data.type_name;
        this.url = data.url || "";
        this._count = data.count;
        this.count = data.count;
        this.text = data.type_name + "(" + this.count + "人)";
        this.tag = data.tag;
        this.siteId = data.siteId;
        this.url = data.url || "";
        this.state = {opened:true};
        this.children = [
            // {
            //     "text" : "Child node 1",
            //     "state" : { "selected" : true },
            //     "icon" : "glyphicon glyphicon-flash"
            // },
            // { "text" : "Child node 2", "state" : { "disabled" : true } }
        ];
        this.addChild = function (obj) {
            this._count += obj.count;
            this.text = data.type_name + "(" + this.count + "人)";
            this.children.push(obj);
        };
        if(this.parentId > 0){
            getChildren(this);
        }
    };

    var getChildren = function (obj) {
        for(var i=0;i<_userList.length;i++){
            if(_userList[i].id == obj.parentId){
                // _userList[i].children.push(obj);
                _userList[i].addChild(obj);
            }
        }
        return null;
    };
    for(var i=0;i<arr.length;i++){
        _userList.push(new User(arr[i]));
    }

    for(var i=_userList.length-1;i>=0;i--){
        if(_userList[i].parentId > 0){
            _userList.splice(i,1);
        }
    }
    // JSON.stringify(_userList);
    return _userList;
};

treeutil.transferNewDataByTreeData = function (treeData,oldData) {
    var _userList = [];
    var User = function (data) {
        this._onlyId = data._onlyId || this.id;
        this.id = data.id;
        this.parentId = data.parent_id;
        this.name = data.type_name;
        this.oldName = data.oldName || data.type_name;
        this.url = data.url || "";
        this.count = data.count;
        this.tag = data.tag;
        this.siteId = data.siteId;
        this.addBlank = function () {
            this.type_name = "------" + this.type_name;
        };

        this.getParentId = function (parent_id) {
            for(var i=0;i<oldData.length;i++){
                if(parent_id && ((oldData[i].moduleCode && oldData[i].moduleCode == parent_id) || oldData[i].id == parent_id)){
                    this.addBlank();
                    if(oldData[i].parent_id){
                        this.getParentId(oldData[i].parent_id);
                    }
                }
            }
        };
        this.getParentId(this.parent_id);
    };
    var addUserList = function (data) {
        for(var i=0;i<data.length;i++){
            _userList.push(new User(data[i]));
            if(data[i].children && data[i].children.length > 0){
                addUserList(data[i].children);
            }
        }
    };
    addUserList(treeData);
    return _userList;
};

/**
 * 获取模块数
 * @param arr
 * @returns {Array}
 */
treeutil.getModuleTreeData = function (arr) {
    var _userList = [];

    var User = function(data){
        this._onlyId = data.id;
        this.id = data.id;
        this.parentId = data.parent_id;
        this.moduleIcon = data.moduleIcon;
        this.text = data.type_name + "("+data.count+")";
        this.name = this.text;
        this.oldName = data.type_name;
        this.url = data.url || "";
        this.siteId = data.siteId;
        this.state = {opened:true};
        this.children = [];
        this.addChild = function (obj) {
            this.children.push(obj);
        };
        if(this.parentId > 0){
            getChildren(this);
        }
    };

    var getChildren = function (obj) {
        for(var i=0;i<_userList.length;i++){
            if(_userList[i].id == obj.parent_id){
                // _userList[i].children.push(obj);
                _userList[i].addChild(obj);
            }
        }
        return null;
    };
    for(var i=0;i<arr.length;i++){
        _userList.push(new User(arr[i]));
    }

    for(var i=_userList.length-1;i>=0;i--){
        if(_userList[i].parent_id > 0){
            _userList.splice(i,1);
        }
    }
    // JSON.stringify(_userList);
    return _userList;
};

treeutil.getModuleNewTreeDataByOldData = function (arr) {
    var newArr = treeutil.getModuleTreeData(arr);

    var User = function(data){
        this.id = data._onlyId;
        this.text = data.text;
        this.state = {opened:true};
        this.children = [];
        if(data.children.length > 0){
            data.children.forEach(function (d) {
                this.children.push(new User(d));
            }.bind(this));
        }
    };
    var _userList = [];
    newArr.forEach(function (d) {
        _userList.push(new User(d));
    });
    return _userList;
};