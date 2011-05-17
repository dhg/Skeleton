/* 
* Skeleton V1.0
* Created by Dave Gamache
* www.getskeleton.com
* 5/15/2011
*/	
	

$(document).ready(function() {

	/* Tabs Activiation
	================================================== */
	var tabs = $('ul.tabs'),
	    tabsContent = $('ul.tabs-content');
	
	tabs.each(function(i) {
		//Get all tabs
		var tab = $(this).find('a');
		tab.click(function(e) {
			
			//Get Location of tab's content
			var contentLocation = this.href + "Tab";
			
			//Let go if not a hashed one
			if(contentLocation.charAt(0)=="#") {
			
				e.preventDefault();
			
				//Make Tab Active
				tab.removeClass('active');
				$(this).addClass('active');
				
				//Show Tab Content
				$(contentLocation).show().siblings().hide();
				
			} 
		});
	}); 
	
});