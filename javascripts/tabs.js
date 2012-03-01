
/**
 * Skeleton V1.1
 * Copyright 2011, Dave Gamache
 * www.getskeleton.com
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 8/17/2011
 */

jQuery(function ($) {
  // hash change handler
  function hashchange () {
    var hash = window.location.hash
      , el = $('ul.tabs [href*="' + hash + '"]')

    if (el.length) {
      $(el).closest('.tabs').find('.active').removeClass('active');
      $(el).addClass('active');

      $(hash).show().addClass('active').siblings().hide().removeClass('active');
    }
  }

  // listen on event and fire right away
  $(window).on('hashchange.skeleton', hashchange);
  hashchange();
});
