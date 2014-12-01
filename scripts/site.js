$(document).ready(function() {

  // Variables
  var codeIsActive = true,
      $codeSnippets = $('.code-example-body'),
      $sections = $('.docs-section'),
      $window = $(window),
      entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      }

  function init() {
    $('.code-toggler').on('click', toggleCode)
    buildSnippets();
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function buildSnippets() {
    $codeSnippets.each(function() {
      var newContent = escapeHtml($(this).html())
      $(this).html(newContent)
    })
  }

  function toggleCode() {
    var windowScrollTop = $window.scrollTop()
    var offsetHeight = windowScrollTop
    $sections.each(function (i) { 
      if($(this).children('.code-example').length > 0) {
        var codeExampleHeight = $(this).children('.code-example').outerHeight(true),
            sectionBottomPadding = parseInt($('.docs-section').css('padding-bottom'))
        if(windowScrollTop > $(this).offset().top + $(this).outerHeight() - sectionBottomPadding) {
          if(codeIsActive == false) {
            offsetHeight += codeExampleHeight
          } else {
            offsetHeight -= codeExampleHeight
          }
        }
      }
    })
    $('body').toggleClass('code-snippets-visible')
    codeIsActive = !codeIsActive
    $window.scrollTop(offsetHeight)
  }

  init();

});