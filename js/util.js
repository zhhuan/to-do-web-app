var EventUtil = {
    addHandler: function(element,type,handler){
        if(element.addEventListener){
            element.addEventListener(type,handler,false);
        }else if(element.attachEvent){
            element.attachEvent("on"+type,handler);
        }else{
            element["on"+type] = handler;
        }
    },
    getEvent : function(event){
        return event ? event:window.event;

    },
    getTarget : function(event){
        return event.target || event.srcElement;
    },
    removeHandler: function(element,type,handler){
        if(element.removeEventListener){
            element.removeEventListener(type,handler,false);
        }else if(element.detachEvent){
            element.detachEvent("on"+type,handler);
        }else{
            element["on"+type] = null;
        }
    }
};

/**
 * 根据索引删除数组中的元素
 * @param  {Array} arr   数组
 * @param  {number} index 索引
 * @return {Array}       新的数组
 */
function deleteInArray (arr,index) {
    if (Array.isArray(arr)&&index<arr.length) {
        return arr.slice(0, index).concat(arr.slice(index+1));
    } else{
        console.error("not a arr or index error");
    }
}

/**
 *给指定元素添加样式
 *@param {Object} element   元素
 *@param {String} className 样式名
 */
function addClass(element,className){
    element.classList.add(className);
}

/**
 *删除指定元素的样式
 *@param {Object} element   元素
 *@param {String} className 样式名 
 */

 function removeClass(element,className){
    element.classList.remove(className);
 }