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
	================================================= */
	$('ul.tabs > li').live('click', function(e) {
	    var $tab = $(this);
	    var $href = $tab.find('a:first');
	    var $otherHrefs = $tab.siblings().find('a');
	    var contentLocation = $href.attr('href');

	    //Let go if not a hashed one
	    if(contentLocation[0]=="#") {
	        e.preventDefault();

	        $otherHrefs.removeClass('active');

	        //Make Tab Active
	        if (!$href.hasClass('active')){
	            $href.addClass('active');
	        }

	        //Show Tab Content & add active class
	        $(contentLocation)
	        	.show()
	        	.addClass('active')
	        	.siblings()
	        	.hide()
	        	.removeClass('active');
	    }
	});
});