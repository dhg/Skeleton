/*
* Skeleton V1.1
* Copyright 2011, Dave Gamache
* www.getskeleton.com
* Free to use under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
* 8/17/2011
*/


;(function ( $, window, document, undefined ) {
    
    var pluginName = 'skeletonTabs',
        defaults = {
            activeClass: "active"
        };

    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options) ;
 
        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    }

    Plugin.prototype.init = function () {
    	var tabList = $(this.element).find('> ul');
    	var tabs = $(tabList).find('li');
    	var tabPanels = $(this.element).children().not('ul');

    	tabList.attr('role', 'tablist');

    	$(tabs).each(function(index) {

    		var ariaSelected = $(this).attr('aria-selected');
    		var id = $(this).attr('id');

    		if(!ariaSelected){
    			$(this).attr('aria-selected', 'false');	
    		}

    		if(!id){
    			$(this).attr('id', 'tab' + parseInt(index + 1));	
    		}

    		$(this).attr('role', 'tab');
        });

        // if there isn't already a selected tab, make the first one selected

        if($(tabList).find('[aria-selected="true"]').length == 0)
        {
        	$(tabs).first().attr('aria-selected', 'true'); 	
        }

        $(tabPanels).each(function(index) {

        	var id = $(this).attr('id');

        	if(!id){
    			$(this).attr('id', 'tabpanel' + parseInt(index + 1));	
    		}

    		$(this).attr('role', 'tabpanel');
    		$(this).attr('aria-labeledby', $(tabs[index]).attr('id'));
    		$(tabs[index]).attr('aria-controls', $(this).attr('id'));

			if($(tabs[index]).attr('aria-selected') == 'true'){
				$(this).attr('aria-hidden', 'false');	
			}else{
				$(this).attr('aria-hidden', 'true');
			}    		

        });
        
        $(tabs).click(function() {
        	var controls = $(this).attr('aria-controls');
			$(this).siblings().attr('aria-selected', 'false').removeClass(this.options.activeClass);
			$(this).attr('aria-selected', 'true').addClass(this.options.activeClass);
			$(tabPanels).attr('aria-hidden', 'true').css('display', 'none').removeClass(this.options.activeClass);
			$(tabPanels).filter('#' + controls).attr('aria-hidden', 'false').css('display', 'block').addClass(this.options.activeClass);
		});        
        
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    }

})(jQuery, window, document);