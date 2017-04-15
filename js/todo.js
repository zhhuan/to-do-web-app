//全局变量
var currentCateId = -1; //当前分类id
var currentCateTable = "AllCate"; //当前分类表
var currentTaskId = -1; //当前任务 id

initAll();

function initAll() {
    // localStorage.clear();
    initDataBase(); //初始化数据表
    initCates(); //初始化分类
    initModal(); //初始化模态框
    document.querySelector(".task-list").innerHTML = createTaskList(queryAllTasks()); //初始化任务列表
    cateTaskStatusController(); //任务状态分类
    generateTaskById(-1); //初始化任务详细
    addClass(document.querySelector("[taskid]"), "active"); //将第一个有 taskid 属性的元素高亮
}


//*******数据库设计************

/**
 *
 * 使用数据库的思想，构建3张表。
 * cateJson 分类
 * childCateJson 子分类
 * taskJson 任务
 *
 * 分类表 cate
 * ----------------------
 * id* | name | child(fk)
 * ----------------------
 *
 * 子分类表 childCate
 * ----------------------------
 * id* | pid | name | child(fk)
 * ----------------------------
 *
 * 任务表 task
 * ------------------------------------------
 * id* | pid | finish | name | date | content
 * ------------------------------------------
 */

function initDataBase(){
    if (!localStorage.cate || !localStorage.childCate || !localStorage.task){
        var cateJson = [{
            "id":0,
            "name":"默认分类",
            "child":[0]
        },{
            "id": 1,
            "name": "工作",
            "child": [1, 2]
        },{
            "id": 2,
            "name": "生活",
            "child": [3]
        }];

        var childCateJson = [{
            "id":0,
            "pid":0,
            "name":"默认子分类",
            "child":[-1]
        },{
            "id": 1,
            "pid": 1,
            "name":"task1",
            "child":[0]
        },{
            "id": 2,
            "pid": 1,
            "name": "task2",
            "child":[1,2]
        },{
            "id":3,
            "pid":2,
            "name":"电影",
            "child":[]
        }];

        var taskJson = [{
            "id":-1,
            "pid":0,
            "finish":true,
            "name":"使用说明",
            "date":"2017-03-01",
            "content":"本应用为离线应用，数据将存储在本地硬盘<br><br>左侧为分类列表<br>中间为当前分类下的任务列表<br>右侧为任务详情<br><br>可以添加删除分类，添加任务，修改任务，以及给任务标记是否完成等功能"
        },{
            "id":0,
            "pid":1,
            "finish":true,
            "name":"划分功能",
            "date":"2017-03-02",
            "content":"划分整个to-do应用功能，抽象出函数。定义各个部分的函数名，输入、输出。"
        },{
            "id":1,
            "pid":2,
            "finish":false,
            "name":"编写函数",
            "date":"2017-03-05",
            "content":"编写各个功能部分的函数，完成分类、子分类、任务各部分的模块。"
        },{
            "id":2,
            "pid":2,
            "finish":true,
            "name":"编写样式",
            "date":"2017-03-05",
            "content":"完成任务模块的样式"
        }];

        localStorage.cate = JSON.stringify(cateJson);
        localStorage.childCate = JSON.stringify(childCateJson);
        localStorage.task = JSON.stringify(taskJson);
    }
}

//**********************query***********************

/**
 *查询所有分类
 *@return {Object Array} 分类对象数组
 */

function queryCates(){
    var cates = JSON.parse(localStorage.cate);
    return cates;
}


/**
 * 通过id查询分类  
 * @param  {number} id
 * @return {Object}    一个分类对象
 */
function queryCateById(id) {
    var cate = JSON.parse(localStorage.cate);
    for (var i = 0; i < cate.length; i++) {
        if (cate[i].id == id) {
            return cate[i];
        }
    }
}

/**
 * 根据主分类 id 查询任务个数
 * @param  {number} id 主分类 id
 * @return {number}    任务个数
 */
function queryTasksLengthByCateId(id) {
    var cate = queryCateById(id);
    var result = 0;
    if (cate.child.length !== 0) {
        for (var i = 0; i < cate.child.length; i++) {
            var childCate = queryChildCatesById(cate.child[i]);
            result += childCate.child.length;
        }
    }
    return result;
}

/**
 *查询所有子分类
 *@return {Object Array} 子分类对象数组
 */

 function queryAllChildCates(){
    var childCates = JSON.parse(localStorage.childCate);
    return childCates;
 }

/**
 * 根据 id 查找子分类
 * @param  {number} id
 * @return {Object} 子分类对象
 */
function queryChildCatesById(id) {
    var childCate = JSON.parse(localStorage.childCate);
    for (var i = 0; i < childCate.length; i++) {
        if (childCate[i].id == id) {
            return childCate[i];
        }
    }
}

/**
 * 根据主分类查询任务个数
 * @param  {Object} cateObject 主分类对象
 * @return {number}            任务个数
 */
function queryTasksLengthByCate(cateObject) {
    var result = 0;
    if (cateObject.child.length !== 0) {
        for (var i = 0; i < cateObject.child.length; i++) {
            var childCate = queryChildCatesById(cateObject.child[i]);
            result += childCate.child.length;
        }
    }
    return result;
}

/**
 * 根据一个 id 数组查询子分类
 * @param  {Array} idArr id 数组
 * @return {Array}       子分类对象数组
 */
function queryChildCatesByIdArray(idArr) {
    if (Array.isArray(idArr)) {
        var cateArr = [];
        for (var i = 0; i < idArr.length; i++) {
            cateArr.push(queryChildCatesById(idArr[i]));
        }
        return cateArr;
    }
}

/**
 * 查询所有任务
 * @param {boolean} status 任务完成状态
 * @return {Array} 任务对象数组
 */
function queryAllTasks(status) {
    var tasksArr = JSON.parse(localStorage.task);
    var resultArr = [];
    if (status !== undefined) {
        for (var i = 0; i < tasksArr.length; i++) {
            if (status) {
                if (tasksArr[i].finish === true) {
                    resultArr.push(tasksArr[i]);
                }
            } else {
                if (tasksArr[i].finish === false) {
                    resultArr.push(tasksArr[i]);
                }
            }
        }
        return resultArr;
    } else {
        return tasksArr;
    }
}

/**
 * 根据日期在指定任务列表中查询任务
 * @param  {String} date 日期字符串
 * @param  {Array}  taskArr 指定任务对象列表
 * @return {Array}      任务对象数组
 */
function queryTasksByDateInTaskArr(date, taskArr) {
    var tasks = [];
    // var allTasks = queryAllTasks();
    for (var i = 0; i < taskArr.length; i++) {
        if (taskArr[i].date == date) {
            tasks.push(taskArr[i]);
        }
    }
    return tasks;
}

/**
 * 根据 id 查询任务
 * @param  {number} id 任务 id
 * @return {Object}    一个任务对象
 */
function queryTaskById(id) {
    var allTasks = queryAllTasks();
    for (var i = 0; i < allTasks.length; i++) {
        if (allTasks[i].id == id) {
            return allTasks[i];
        }
    }
}


/**
 * 根据子分类 id 查询任务
 * @param  {number}  id     子分类id
 * @param  {boolean} status 任务完成状态
 * @return {Array}          任务对象数组
 */
function queryTasksByChildCateId(id, status) {
    var resultArr = [];
    var tempArr = queryChildCatesById(id).child;
    for (var i = 0; i < tempArr.length; i++) {
        var task = queryTaskById(tempArr[i]);
        if (status !== undefined) {
            console.log(status);
            if (status) {
                if (task.finish === true) {
                    resultArr.push(task);
                }
            } else {
                if (task.finish === false) {
                    resultArr.push(task);
                }
            }
        } else {
            resultArr.push(task);
        }
    }
    return resultArr;
}

/**
 * 根据主分类 id 查询任务
 * @param  {number} id 主分类 id
 * @param  {String} status 任务完成状态
 * @return {Array}    任务对象数组
 */
function queryTasksByCateId(id, status) {
    var resultArr = [];
    var cateChild = queryCateById(id).child;
    for (var i = 0; i < cateChild.length; i++) {
        if (status !== undefined) {
            resultArr = resultArr.concat(queryTasksByChildCateId(cateChild[i], status));
        } else {
            resultArr = resultArr.concat(queryTasksByChildCateId(cateChild[i]));
        }
    }
    return resultArr;
}


//**********************ADD**************************
/**
 * 添加分类
 * @param {String} name 分类名称
 */

 function addCate(name){
    if(!name){
        console.log('name is not defined');
    }else{
        var cateJsonTemp = JSON.parse(localStorage.cate);
        var newCate = {};
        newCate.id = cateJsonTemp[cateJsonTemp.length - 1].id + 1;
        newCate.name = name;
        newCate.child = [];
        cateJsonTemp.push(newCate);
        localStorage.cate = JSON.stringify(cateJsonTemp);
    }
 }

/**
 * 添加子分类
 *@param {String} name 子分类名称
 *@param {number} pid  父节点id
 */

function addChildCate(pid,name){
    if(!name || !pid){
        console.log("pid or name is undefined");
    }else{
        var childCateJsonTemp = JSON.parse(localStorage.childCate);
        var newChlidCate = {};
        newChlidCate.id = childCateJsonTemp[childCateJsonTemp.length-1].id + 1;
        newChlidCate.pid = pid;
        newChlidCate.name = name;
        newChlidCate.child = [];
        childCateJsonTemp.push(newChlidCate);
        localStorage.childCate = JSON.stringify(childCateJsonTemp);

        //向父分类的 chlid 中添加数字
        updateCateChildByAdd(pid,newChlidCate.id);
    }
}

/**
 *添加一个任务
 *@param {Object} taskObject 任务对象，但不包含id属性
 */

function addTask(taskObject){
    var taskArr = queryAllTasks();
    taskObject.id = taskArr[taskArr.length-1].id + 1; //生成id
    taskArr.push(taskObject);

   
    updateChildCateChildByAdd(taskObject.pid,taskObject.id);  //更新子分类的child字段
    localStorage.task = JSON.stringify(taskArr);    

    return taskObject.id; //将当前任务 id 返回，方便调用
}


//****************UPDATE**************
/**
 * 更新分类的 child 字段
 * 添加一个 childId 到 这个 id 的分类对象里
 * @param  {number} id      要更新的分类的 id
 * @param  {number} childId 要添加的 childId 
 */

 function updateCateChildByAdd(id,childId){
    var cate = JSON.parse(localStorage.cate);
    for(var i = 0;i < cate.length;i++){
        if(cate[i].id == id){
            cate[i].child.push(childId); 
        }
    }
    localStorage.cate = JSON.stringify(cate);
 }

/**
 *更新分类的 child字段
 *删除一个 childId 在这个id的主分类对象中
 *@param {number} id 要更新的主分类的 id
 *@param {number} childId 要删除的 childId 
 */

function updateCateChildByDelete(id,childId){
    var cate = JSON.parse(localStorage.cate);
    for(var i = 0;i < cate.length;i++){
        if(cate[i].id === id){
            for (var j = 0; j < cate[i].child.length; j++) {
                if (cate[i].child[j] == childId) {
                    cate[i].child = deleteInArray(cate[i].child, j);
                }
            }
        }
    };

    localStorage.cate = JSON.stringify(cate);
}

/**
 * 更新子分类的 child 字段
 * 添加一个 childId 在这个 id 的子分类对象里
 * 添加一个 task 时使用
 * @param  {number} id      子分类 id
 * @param  {number} childId 要添加的 childId
 */

 function updateChildCateChildByAdd(id,childId){
    var childCate = JSON.parse(localStorage.childCate);
    for(var i = 0;i < childCate.length;i++){
        if(childCate[i].id == id){
            childCate[i].child.push(childId);
        }
    }
    localStorage.childCate = JSON.stringify(childCate);
 }

 /**
 * 修改任务
 * @param  {number} id      任务id
 * @param  {String} name    任务标题
 * @param  {String} date    任务日期
 * @param  {String} content 任务内容
 */

 function updateTaskById(id,name,date,content){
    var allTasks = queryAllTasks();
    for(var i = 0;i < allTasks.length;i++){
        if(allTasks[i].id === id){
            allTasks[i].name = name;
            allTasks[i].date = date;
            allTasks[i].content = content;
        }
    }
    localStorage.task = JSON.stringify(allTasks);
 }

//***************Delete***********

/**
 *根据 id 删除分类
 *@param {number} id 主分类id
 */

function deleteCate(id){
    var result = [];
    var cateArr = JSON.parse(localStorage.cate);
    for(var i = 0;i < cateArr.length;i++){
        if(cateArr[i].id == id){
            result = deleteInArray(cateArr, i);
            if (cateArr[i].child.length !== 0) {
                for (var j = 0; j < cateArr[i].child.length; j++) {
                    deleteChildCate(cateArr[i].child[j]);
                }
            }
        }
    }
    localStorage.cate = JSON.stringify(result);
}

/**
 * 根据 id 删除子分类
 * @param  {number} id 子分类id
 */
function deleteChildCate(id) {
    var result = [];
    var childCateArr = queryAllChildCates();
    for (var i = 0; i < childCateArr.length; i++) {
        if (childCateArr[i].id == id) {
            result = deleteInArray(childCateArr, i);
            //更新父节点中的 childId 字段
            updateCateChildByDelete(childCateArr[i].pid, childCateArr[i].id);
            //查看 child
            if (childCateArr[i].child.length !== 0) {
                for (var j = 0; j < childCateArr[i].child.length; j++) {
                    deleteTaskById(childCateArr[i].child[j]);
                }
            }
        }
    }
    localStorage.childCate = JSON.stringify(result); //save
}

/**
 * 根据 id 删除一条任务
 * @param  {number} id 任务id
 */
function deleteTaskById(id) {
    var result = [];
    var allTasksArr = queryAllTasks();
    for (var i = 0; i < allTasksArr.length; i++) {
        if (allTasksArr[i].id == id) {
            result = deleteInArray(allTasksArr, i);
        }
    }
    localStorage.task = JSON.stringify(result); //save
}

//*************************页面控制****************

//初始化分类
function initCates(){
    var cate = JSON.parse(localStorage.cate);
    var defaultChildCate = queryChildCatesById(0);
    var tempStr = "<ul>";
    for(var i = 0;i < cate.length;i++){
        var liStr = "";
        if(cate[i].child.length === 0){
            liStr = '<li><h2 cateid=' + cate[i].id + ' onclick="clickCate(this)"><img class="folder" src="img/folder.svg">' + cate[i].name + '(' + queryTasksLengthByCate(cate[i]) + ')<img class="delete" src="img/delete.svg" onclick="del(event,this)"></h2></li>';
        }else {
            if (i === 0) {
                liStr = '<li><h2 cateid=0 onclick="clickCate(this)"><img class="folder" src="img/folder.svg">' + cate[i].name + '(1)</h2><ul><li><h3 cateid=0 onclick="clickCate(this)"><img class="form" src="img/form.svg">' + defaultChildCate.name + '(' + defaultChildCate.child.length + ')</h3></li>';
            } else {
                liStr = '<li><h2 cateid=' + cate[i].id + ' onclick="clickCate(this)"><img class="folder" src="img/folder.svg">' + cate[i].name + '(' + queryTasksLengthByCate(cate[i]) + ')<img class="delete" src="img/delete.svg" onclick="del(event,this)"></h2><ul>';
                var childCateArr = queryChildCatesByIdArray(cate[i].child);
                for (var j = 0; j < childCateArr.length; j++) {
                    var innerLiStr = "";
                    innerLiStr = '<li><h3 cateid=' + childCateArr[j].id + ' onclick="clickCate(this)"><img class="form" src="img/form.svg">' + childCateArr[j].name + '(' + childCateArr[j].child.length + ')<img class="delete" src="img/delete.svg" onclick="del(event,this)"></h3></li>';
                    liStr += innerLiStr;
                }
                liStr += '</ul></li>';
            }
        }
        tempStr += liStr;
    }
    tempStr += "</ul>";
    //写入列表内容区
    document.querySelector("#cate-content").innerHTML = tempStr;
    //设置所有任务个数
    document.querySelector("#cate-all span").innerHTML = queryAllTasks().length;
}


/**
 * 点击垃圾桶图标
 * @param  {Object} e       事件对象
 * @param  {Object} element 元素
 */

function del(e,element) {
    //这里要阻止事件冒泡
    e = EventUtil.getEvent(e);
    e.stopPropagation();
    var cateClicked = element.parentNode;
    if(cateClicked.tagName.toLowerCase() === 'h2'){
        var cateId = cateClicked.getAttribute('cateid');
        var result = confirm('是否删除分类');
        if(result === true){
            deleteCate(cateId);
        }
    }else if(cateClicked.tagName.toLowerCase() === 'h3'){
        var cateId = cateClicked.getAttribute('cateid');
        var result = confirm('是否删除分类');
        if(result === true){
            deleteChildCate(cateId);
        }
    }
    initCates();
    document.querySelector('.task-list').innerHTML = createTaskList(queryAllTasks()); //初始化任务列表
}

/**
 *添加分类
 */
function clickAddCate(){
    var cover = document.querySelector(".cover");
    cover.style.display = "block";
}


/**
 *初始化模态框
 */
 function initModal(){
    var cate = queryCates();
    var selectContent = '<option value="-1">新增主分类</option>';
    for (var i = 1; i < cate.length; i++) {
        selectContent += '<option value="' + cate[i].id + '">' + cate[i].name + '</option>';
    }
    document.querySelector("#modal-select").innerHTML = selectContent;
    document.querySelector("#newCateName").value = "";
 }

/**
 * 取消按钮
 */
function cancel() {
    document.querySelector(".cover").style.display = "none";
}

/**
 * 确认按钮
 */
function ok() {
    var selectValue = document.querySelector("#modal-select").value;
    var newCateName = document.querySelector("#newCateName").value;
    if (newCateName === "") {
        alert("请输入分类名称");
    } else {
        if (selectValue == -1) {
            addCate(newCateName);
        } else {
            addChildCate(selectValue, newCateName);
        }
        initCates(); //初始化分类
        document.querySelector(".cover").style.display = "none";
    }
    initModal();
}

/**
 * 点击分类
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
function clickCate(element) {
    var taskList = document.querySelector(".task-list");
    setHighLight(element); //设置高亮

    var cateId = element.getAttribute("cateid");
    if (cateId == -1) { //点击所有分类
        taskList.innerHTML = createTaskList(queryAllTasks());
        currentCateId = -1;
        currentCateTable = "AllCate";
    } else { //点击在主分类或子分类上
        if (element.tagName.toLowerCase() == "h2") {
            console.log("main cate--->" + cateId);
            taskList.innerHTML = createTaskList(queryTasksByCateId(cateId));
            currentCateId = cateId;
            currentCateTable = "cate";
        } else {
            console.log("childCate--->" + cateId);
            //子分类
            console.log(queryTasksByChildCateId(cateId));
            taskList.innerHTML = createTaskList(queryTasksByChildCateId(cateId));
            currentCateId = cateId;
            currentCateTable = "childCate";
        }
    }

    //状态按钮默认跳到所有上面
    cleanAllActiveOnStatusButton();
    addClass(document.querySelector("#all-tasks"), "active");
    addClass(document.querySelector("[taskid]"), "active"); //将第一个有 taskid 属性的元素高亮

    generateTaskById(currentTaskId);
}

/**
 * 设置高亮
 * @param {Object} element 点击的 element 对象
 */
function setHighLight(element) {
    cleanAllActive();
    addClass(element, "active");
}

/**
 * 清除所有高亮
 * @return {[type]} [description]
 */
function cleanAllActive() {
    removeClass(document.querySelector("#cate-all"), "active");
    var h2Elements = document.querySelector("#cate-content").getElementsByTagName('h2');
    for (var i = 0; i < h2Elements.length; i++) {
        removeClass(h2Elements[i], "active");
    }
    var h3Elements = document.querySelector("#cate-content").getElementsByTagName('h3');
    for (var j = 0; j < h3Elements.length; j++) {
        removeClass(h3Elements[j], "active");
    }
}

/**
 * 创建任务列表
 * @param  {Array} taskArr 任务对象数组
 * @return {String}        字符串形式的html代码
 */
function createTaskList(taskArr) {
    var tempStr = "";
    console.log("dateTasksArr------->");
    console.log(taskArr);
    if (taskArr.length === 0) {
        tempStr = "";
    } else {
        var dateTasksArr = createDateData(taskArr);
        console.log("dateTasksArr------->" + dateTasksArr);
        for (var i = 0; i < dateTasksArr.length; i++) {
            var innerLiStr = "<div>" + dateTasksArr[i].date + "</div><ul>";
            for (var j = 0; j < dateTasksArr[i].tasks.length; j++) {
                var finishOrNotStr = "";
                if (dateTasksArr[i].tasks[j].finish) {
                    finishOrNotStr = '<li class="task-done" taskid="' + dateTasksArr[i].tasks[j].id + '" onclick="clickTask(this)"><img class="finished" src="img/selected.svg">' + dateTasksArr[i].tasks[j].name + '</li>';
                } else {
                    finishOrNotStr = '<li taskid="' + dateTasksArr[i].tasks[j].id + '" onclick="clickTask(this)">' + dateTasksArr[i].tasks[j].name + '</li>';
                }
                innerLiStr += finishOrNotStr;
            }
            innerLiStr += "</ul>";
            tempStr += innerLiStr;
        }
    }
    // console.log(tempStr);
    return tempStr;
}

/**
 * 创建日期数据格式
 * @param  {Array} taskArr 任务数组
 * @return {Array}         日期任务对象数组
 */
function createDateData(taskArr) {
    var dateArr = []; //日期数组
    var newDateTasks = []; //日期数据格式数组
    //想让任务根据日期归档
    //1.先把出现的所有日期提取出来
    //2.对日期排序
    //3.根据日期查询出任务对象数组
    //4.组合日期和任务对象数组

    //取出所有时间
    for (var i = 0; i < taskArr.length; i++) {
        if (dateArr.indexOf(taskArr[i].date) == -1) {
            dateArr.push(taskArr[i].date);
        }
    }
    console.log(dateArr);
    console.log(taskArr);

    //对日期排序
    dateArr = dateArr.sort();

    //根据时间查找任务对象
    for (var j = 0; j < dateArr.length; j++) {
        var tempObject = {};
        tempObject.date = dateArr[j];
        tempObject.tasks = queryTasksByDateInTaskArr(dateArr[j], taskArr);
        newDateTasks.push(tempObject);
    }
    currentTaskId = newDateTasks[0].tasks[0].id;
    return newDateTasks;
}


/**
 * 分类任务状态控制按钮
 * @return {[type]} [description]
 */
function cateTaskStatusController() {
    EventUtil.addHandler(document.querySelector("#all-tasks"),"click", function() {
        cateTaskStatusControllerHelper(this);
    });
    EventUtil.addHandler(document.querySelector("#unfinish-tasks"),"click",function() {
        cateTaskStatusControllerHelper(this, false);
    });
    EventUtil.addHandler(document.querySelector("#finished-tasks"),"click",function() {
        cateTaskStatusControllerHelper(this, true);
    });
}

/**
 * 任务列表状态切换辅助
 * 根据状态不同，修改不同的html代码
 *
 * @param  {boolean} finish 完成状态
 */
function cateTaskStatusControllerHelper(element, finish) {
    cleanAllActiveOnStatusButton(); //清除状态按钮高亮
    addClass(element, "active");

    var taskList = document.querySelector(".task-list");

    if (currentCateId == -1) {
        taskList.innerHTML = createTaskList(queryAllTasks(finish));
    } else {
        if (currentCateTable == "cate") {
            taskList.innerHTML = createTaskList(queryTasksByCateId(currentCateId, finish));
        } else {
            taskList.innerHTML = createTaskList(queryTasksByChildCateId(currentCateId, finish));
        }
    }
}

/**
 * 清除状态按钮高亮
 */
function cleanAllActiveOnStatusButton() {
    removeClass(document.querySelector("#all-tasks"), "active");
    removeClass(document.querySelector("#unfinish-tasks"), "active");
    removeClass(document.querySelector("#finished-tasks"), "active");
}

/**
 * 点击任务
 * @param  {Object} element 点击的 li 对象
 * @return {[type]}         [description]
 */
function clickTask(element) {

    var taskId = element.getAttribute("taskid");
    currentTaskId = taskId;

    generateTaskById(taskId);
    cleanTasksHighLight();
    addClass(element, "active");
}


/**
 * 根据任务 id 生成右边的具体内容
 * @param  {number} taskId 任务id
 * @return {[type]}        [description]
 */
function generateTaskById(taskId) {
    var task = queryTaskById(taskId);

    document.querySelector(".todo-name").innerHTML = task.name;
    document.querySelector(".task-date span").innerHTML = task.date;
    document.querySelector(".task-content").innerHTML = task.content;

    document.querySelector(".button-area").style.display = "none";

    var manipulate = document.querySelector(".manipulate");
    if (task.finish) { //若已完成
        manipulate.innerHTML = "";
    } else { //未完成
        manipulate.innerHTML = '<img class="success" src="img/success.svg" onclick="checkTaskDone()"><img class="edit" src="img/edit.svg" onclick="changeTask()">';
    }
}

/**
 * 清除任务列表的高亮
 */
function cleanTasksHighLight() {
    var aLi = document.querySelector(".task-list").getElementsByTagName('li');
    for (var i = 0; i < aLi.length; i++) {
        removeClass(aLi[i], "active");
    }
}


/**
 * 点击增加任务按钮
 * @return {[type]} [description]
 */
function clickAddTask() {
    if (currentCateId != -1 && currentCateTable == "cate" && queryCateById(currentCateId).child.length === 0) {
        alert("请先建立子分类");
    } else {
        document.querySelector(".todo-name").innerHTML = '<input type="text" class="input-title" placeholder="请输入标题">';
        document.querySelector(".manipulate").innerHTML = "";
        document.querySelector(".task-date span").innerHTML = '<input type="date" class="input-date">';
        document.querySelector(".task-content").innerHTML = '<textarea class="textarea-content" placeholder="请输入任务内容"></textarea>';
        document.querySelector(".button-area").innerHTML = '<span class="info"></span> <button class="save">保存</button> <button class="cancel-save">放弃</button>';
        document.querySelector(".button-area").style.display = "block";
        clickSaveOrCancel();
    }
}

/**
 * 点击保存任务或放弃保存
 * @return {[type]} [description]
 */
function clickSaveOrCancel() {
    EventUtil.addHandler(document.querySelector(".save"), "click",function() {
        console.log("save");
        console.log(currentCateId);
        console.log(currentCateTable);

        var title = document.querySelector(".input-title");
        var content = document.querySelector(".textarea-content");
        var date = document.querySelector(".input-date");
        var info = document.querySelector(".info");

        if (title.value === "") {
            info.innerHTML = "标题不能为空";
        } else if (date.value === "") {
            info.innerHTML = "日期不能为空";
        } else if (content.value === "") {
            info.innerHTML = "内容不能为空";
        } else {
            var taskObject = {};
            taskObject.finish = false;
            taskObject.name = changeCode(title.value);
            taskObject.content = content.value;
            taskObject.date = changeCode(date.value);

            //对 pid 的处理
            if (currentCateTable === "AllCate") { //如果焦点在所有分类上
                taskObject.pid = 0;
            } else if (currentCateTable === "cate") {
                taskObject.pid = queryCateById(currentCateId).child[0];
            } else {
                taskObject.pid = currentCateId;
            }
            console.log(taskObject);

            var curTaskId = addTask(taskObject);

            initCates(); //初始化分类

            //更新任务列表
            var taskList = document.querySelector(".task-list");
            if (currentCateTable === "AllCate") { //如果焦点在所有分类上
                taskList.innerHTML = createTaskList(queryAllTasks());
            } else if (currentCateTable === "cate") {
                taskList.innerHTML = createTaskList(queryTasksByCateId(currentCateId));
            } else {
                taskList.innerHTML = createTaskList(queryTasksByChildCateId(currentCateId));
            }
            //更新详细内容区
            currentTaskId = curTaskId;
            generateTaskById(curTaskId); //初始化任务详细
        }
    });

    EventUtil.addHandler(document.querySelector(".cancel-save"),"click",function() {
        console.log("cancel save");
        generateTaskById(currentTaskId);
    });
}

/**
 * 点击完成
 * @return {[type]} [description]
 */
function checkTaskDone() {
    var r = confirm("确定将任务标记为已完成吗？");
    if (r) {

        console.log(currentTaskId);
        updateTaskStatusById(currentTaskId); //更新状态
        listAllStorage();
        console.log(currentTaskId);
        generateTaskById(currentTaskId);
        console.log(currentTaskId);
        var temp = currentTaskId;
        //更新任务列表
        var taskList = document.querySelector(".task-list");
        if (currentCateTable === "AllCate") { //如果焦点在所有分类上
            taskList.innerHTML = createTaskList(queryAllTasks());
        } else if (currentCateTable === "cate") {
            taskList.innerHTML = createTaskList(queryTasksByCateId(currentCateId));
        } else {
            taskList.innerHTML = createTaskList(queryTasksByChildCateId(currentCateId));
        }

        currentTaskId = temp;
    }
}

/**
 * 点击修改
 * @return {[type]} [description]
 */
function changeTask() {
    var task = queryTaskById(currentTaskId);
    document.querySelector(".todo-name").innerHTML = '<input type="text" class="input-title" placeholder="请输入标题" value="' + task.name + '">';
    document.querySelector(".manipulate").innerHTML = "";
    document.querySelector(".task-date span").innerHTML = '<input type="date" class="input-date" value="' + task.date + '">';
    document.querySelector(".task-content").innerHTML = '<textarea class="textarea-content" placeholder="请输入任务内容">' + task.content + '</textarea>';
    document.querySelector(".button-area").innerHTML = '<span class="info"></span><button class="save">保存修改</button><button class="cancel-save">放弃</button>';
    document.querySelector(".button-area").style.display = "block";
    changeSaveOrNot();
}

/**
 * 保存修改或不修改
 * @return {[type]} [description]
 */
function changeSaveOrNot() {
    EventUtil.addHandler(document.querySelector(".save"),"click",function() {

        var title = document.querySelector(".input-title");
        var content = document.querySelector(".textarea-content");
        var date = document.querySelector(".input-date");
        var info = document.querySelector(".info");

        if (title.value === "") {
            info.innerHTML = "标题不能为空";
        } else if (date.value === "") {
            info.innerHTML = "日期不能为空";
        } else if (content.value === "") {
            info.innerHTML = "内容不能为空";
        } else {
            console.log("before save change, check currentTaskId");
            console.log(currentTaskId);
            updateTaskById(currentTaskId, title.value, date.value, content.value);
            generateTaskById(currentTaskId);
            console.log(currentTaskId);
            var temp = currentTaskId;
            //更新任务列表
            var taskList = document.querySelector(".task-list");
            if (currentCateTable === "AllCate") { //如果焦点在所有分类上
                taskList.innerHTML = createTaskList(queryAllTasks());
            } else if (currentCateTable === "cate") {
                taskList.innerHTML = createTaskList(queryTasksByCateId(currentCateId));
            } else {
                taskList.innerHTML = createTaskList(queryTasksByChildCateId(currentCateId));
            }

            currentTaskId = temp;
        }
    });

   EventUtil.addHandler(document.querySelector(".cancel-save"),"click",function() {
        generateTaskById(currentTaskId);
    });
}


/**
 * 转码 XSS 防护
 * @param  {String} str 用户输入的字符串
 * @return {String}     转码后的字符串
 */
function changeCode(str) {
    str = str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#x27;")
              .replace(/\//g, "&#x2f;");
    return str;
}