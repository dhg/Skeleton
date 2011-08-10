/* 
* Skeleton V1.0.3
* Copyright 2011, Dave Gamache
* www.getskeleton.com
* Free to use under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
* 7/17/2011
* un-jQuerified by Eric Kever
*/	

(function(){
	var Skeleton = {
		getElementsByClassName : function(context, cls){
			if(context.getElementsByClassName){
				return context.getElementsByClassName(cls);
			}
			
			var ele = context.getElementsByTagName("*"),
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
		},
		
		filterTags : function(list, tags){
			var exists = false;
			
			for(var i = 0, j = list.length; i < j; i++){
				for(var k = 0, l = tags.length; k < l; k++){
					if(list[i].tagName === tags[k]){
						exists = true;
						break;
					}
				}
				if(exists === true){
					list.splice(i, 1);
				}
			}
			
			return list;
		},
		
		addClass : function(element, name){
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
		},
		
		removeClass : function(element, name){
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
		},
		
		addListener : function(element, on, fn, last){
			last = (last || false);
			var BH;
			
			if(window.addEventListener){  //AddEventListener takes precedence here
				BH = "addEventListener";
			}else if(window.attachEvent){
				BH = "attachEvent";
				on = "on" + on;
			}
			
			element[BH](on, function(e){
				var event = e || window.event;
				return fn.call(element, event);  //Force it to call the handler in the proper context (IE 7 & 8 do not)
			}, last);
		}
	};
	
	window.Skeleton = Skeleton;
})();

function doFancyExpensiveTabThings(){
	var tabs = Skeleton.filterTags(Skeleton.getElementsByClassName(document, "tabs"), ["ul"]);
	
	for(var i = 0, j = tabs.length; i < j; i++){
		var tabList = tabs[i].getElementsByTagName("li");
		for(var k = 0, l = tabList.length; k < l; k++){
			Skeleton.addListener(tabList[k].getElementsByTagName('a')[0], "click", function(e){
				var contentLocation = this.href.substr(this.href.indexOf("#")) + "Tab",
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
						Skeleton.removeClass(tabList[m].getElementsByTagName('a')[0], "active");
					}
					
					Skeleton.addClass(this, "active");
					
					contentElement = document.getElementById(contentLocation.substr(1));
					Skeleton.addClass(contentElement, "active");
					
					siblings = contentElement.parentNode.getElementsByTagName('li');
					for(m = 0, n = siblings.length; m < n; m++){
						if(siblings[m] !== contentElement){
							Skeleton.removeClass(siblings[m], "active");
						}
					}
				}
				return false;
			});
		}
	}
}

Skeleton.addListener(window, "load", doFancyExpensiveTabThings);