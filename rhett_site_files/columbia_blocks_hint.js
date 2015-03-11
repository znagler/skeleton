(function ($) {
  Drupal.behaviors.COLBlockHint = {
    attach: function (context, settings) {
      $('.icon-info-small').each(function(i,v){
        var hint = $(v).find('.hint').html();
        $(v).tipsy({
          gravity:function(){
            var delta = $(window).width()-$(this).offset().left
            if (delta < 200) {
              return 'e';
            }
            return 'w';
          },
          fallback:hint,
          html: true,
          opacity:1
        })
      });
    }
  };
}(jQuery));
