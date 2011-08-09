/* 
* Skeleton V1.0.3
* Copyright 2011, Dave Gamache
* www.getskeleton.com
* Free to use under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
* 7/17/2011
*/	
	

$(document).ready(function() {
	
	/* 	Prevent iPhone and iPad to autoscale the page when rotated 
		(http://adactio.com/journal/4470/)
	================================================================ */

  	if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
   	  var viewportmeta = document.querySelector('meta[name="viewport"]');
   	  if (viewportmeta) {
   	    viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0';
   	    document.body.addEventListener('gesturestart', function() {
   	      viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
   	    }, false);
   	  }
   	}




	/* Tabs Activiation
	================================================== */
	var tabs = $('ul.tabs');
	
	tabs.each(function(i) {
		//Get all tabs
		var tab = $(this).find('> li > a');
		tab.click(function(e) {
			
			//Get Location of tab's content
			var contentLocation = $(this).attr('href') + "Tab";
			
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