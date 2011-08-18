/* 
* Skeleton V1.0.3
* Copyright 2011, Dave Gamache
* www.getskeleton.com
* Free to use under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
* 7/17/2011
*/	
	

$(document).ready(function() {


	/* Tabs Activiation
	================================================== */
	var tabs = $('ul.tabs');
	
	/* hide tab content. Doing this with JS
     makes the tabs work when JS is enabled but
     CSS is not, an interesting accessibility
     edge case. Ensures that "active" is respected.
  */
  $("ul.tabs-content > li").each(function(t){
    if(!$(this).hasClass("active")){
       $(this).hide();
    };
  });
	
	tabs.each(function(i) {
		//Get all tabs
		var tab = $(this).find('> li > a');
		tab.click(function(e) {
			
			//Get Location of tab's content
			var contentLocation = $(this).attr('href');
			
			//Let go if not a hashed one
			if(contentLocation.charAt(0)=="#") {
			
				e.preventDefault();
			
				//Make Tab Active
				tab.removeClass('active');
				$(this).addClass('active');
				
				//Show Tab Content & add active class
				$(contentLocation).show().addClass('active').siblings().hide().removeClass('active');
				
			} 
		});
	}); 
	
});