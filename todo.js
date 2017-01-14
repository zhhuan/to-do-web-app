window.onload = function () {
    var dropLevelOne = document.querySelector("#task-sort-head");
    EventUtil.addHandler(dropLevelOne,"click",function(event){
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);

        if(target.classList.contains('task-spread-level1-icon')){
            var levelTwo;
            var lists = target.parentNode.querySelectorAll(".task-spread-level2");
            for(var j = 0;j < lists.length;j++){
                levelTwo = lists[j];
                levelTwo.classList.toggle("hide");
            }
        }else if(target.parentNode.classList.contains("task-sort-all")){
            var levelAll = target.parentNode.querySelector("#task-spread-all");
            levelAll.classList.toggle("hide");
        }else if(target.parentNode.classList.contains("task-sort-sortlist")){
            var levelOne = target.parentNode.querySelector("#task-spread-level1");
            levelOne.classList.toggle("hide");
        }else if(target.parentNode.classList.contains("task-spread-level2-item")){
            var levelTwos = document.querySelectorAll(".task-spread-level2-item");
            var levelTwo;
            var len = levelTwos.length;
            for(var i = 0;i < len;i++){
                levelTwo = levelTwos[i];
                if(levelTwo.classList.contains("item-active")){
                    levelTwo.classList.remove("item-active");
                }
            }
            target.parentNode.classList.add("item-active");
        }
    });
};
    