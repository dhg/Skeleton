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
            propertyName: "value"
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

    		// if there is no aria selected role present, set it to false

    		var selectedVar = $(this).attr('aria-selected');

    		if(!selectedVar){
    			$(this).attr('aria-selected', 'false');	
    		}

    		// add IDs to tabs

    		$(this).attr('id', 'tab' + index + 1);

        });

        // if there isn't already a selected tab, make the first one selected

        if($(tabList).find('[aria-selected="true"]').length == 0)
        {
        	$(tabs).first().attr('aria-selected', 'true'); 	
        }

        // add IDs to tab panels

        $(tabPanels).each(function(index) {
        	$(this).attr('id', 'tabpanel' + index + 1);
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