/* 
* Skeleton V1.0.3
* Copyright 2011, Dave Gamache
* www.getskeleton.com
* Free to use under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
* 7/17/2011
* un-jQuerified by Eric Kever
*/	
	

if(window.addEventListener){
    var BIND_HANDLER = "addEventListener";
    var BIND_HANDLER_PREFIX = "";
}else if(window.attachEvent){
    var BIND_HANDLER = "attachEvent";
    var BIND_HANDLER_PREFIX = "on";
}

function getElementsByClassName(context, tag, cls){
    var ele = context.getElementsByTagName(tag),
        ret = [],
        current,
		classes;
    
    for(var i = 0, j = ele.length; i < j; i++){
        current = ele[i];
        classes = (current.getAttribute("className") || current.className).split(" ");
        for(var k = 0, l = classes.length; k < l; k++){
            if(classes[k] === cls){
                ret.push(current);
                break;
            }
        }
    }
    
    return ret;
}

function addClass(element, name){
    var classes = (element.getAttribute("className") || element.className).split(" "),
        exists = false;
    
    for(i = 0, j = classes.length; i < j; i++){
        if(classes[i] === name){
            exists = true;
            break;
        }
    }
    if(!exists){
        classes.push(name);
        element.className = classes.join(" ");
    }
}

function removeClass(element, name){
    var classes = (element.getAttribute("className") || element.className).split(" "),
        exists = false;
    
    for(var i = 0, j = classes.length; i < j; i++){
        if(classes[i] === name){
            exists = true;
            break;
        }
    }
    if(exists){
        classes.splice(i, 1);
        element.className = classes.join(" ");
    }
}

function doFancyExpensiveTabThings(){
    var tabs = (document.getElementsByClassName ? document.getElementsByClassName("tabs") : getElementsByClassName(document, "ul", "tabs"));
    
    for(var i = 0, j = tabs.length; i < j; i++){
        var tabList = tabs[i].getElementsByTagName('li');
        for(var k = 0, l = tabList.length; k < l; k++){
            (function(){  //Need this because the click handler isn't called with the proper context in IE7/8.
                var tab = tabList[k].getElementsByTagName('a')[0];
                
                tab[BIND_HANDLER](BIND_HANDLER_PREFIX + "click", function(e){
                    var contentLocation = tab.href.substr(tab.href.indexOf("#")) + "Tab",
                        event = e || window.event,
                        contentElement,
                        siblings;
                    
                    if(contentLocation.charAt(0) === "#"){
                        if(e.preventDefault){
                            e.preventDefault();
                        }else{
                            e.returnValue = false;
                            e.cancelBubble = true;
                        }
                        
                        for(var m = 0; m < k; m++){
                            removeClass(tabList[m].getElementsByTagName('a')[0], "active");
                        }
                        addClass(tab, "active");
                        
                        contentElement = document.getElementById(contentLocation.substr(1));
                        addClass(contentElement, "active");
                        
                        siblings = contentElement.parentNode.getElementsByTagName('li');
                        for(m = 0, n = siblings.length; m < n; m++){
                            if(siblings[m] !== contentElement){
                                removeClass(siblings[m], "active");
                            }
                        }
                    }
                    return false;
                }, false);
            })();
        }
    }
}

window[BIND_HANDLER](BIND_HANDLER_PREFIX + "load", doFancyExpensiveTabThings, false);