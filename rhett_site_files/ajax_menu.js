(function ($) {
  google.load('visualization', '1.0', { 'packages': ['corechart','table']});

  Drupal.behaviors.COLAjaxMenu = {
    attach: function (context, settings) {
      var self = this;
      $('.region.region-sidebar-submenu ul.menu').once('ajax-menu', function(){
        $(this).find('li a').click(function(){
          $('.region.region-sidebar-submenu ul.menu li a').removeClass('active');
          var url = $(this).attr('href');
          var $link = $(this);
          if (url.length < 1 ) return true;
          $('body').append('<div class="ajax-backdrop"><div class="loader" ></div><p>' + Drupal.t('Loading, please wait...') + '</p></div>');
          $.get(url,function(data){
            var content = $(data).find('#page-content-wrapper .ajax-content-wrapper').html();
            if (content.length > 0) {
              self.parseScript(data, context, settings);
              $link.addClass('active');
            }
            $('div.ajax-backdrop').remove();
          });
          return false;
        });

        $('.region.region-sidebar-submenu ul.menu li:first-child a').trigger('click');
      });

      if ($('.region.region-sidebar-submenu ul.menu').size() > 0) {
        $('#block-system-main').once('ajax-menu', function(){
          $(this).find('a').click(function(){
            var url = $(this).attr('href');
            if (url.length < 1 ) return true;
            $('body').append('<div class="ajax-backdrop"><div class="loader" ></div><p>' + Drupal.t('Loading, please wait...') + '</p></div>');
            $.get(url,function(data){
              var content = $(data).find('#page-content-wrapper .ajax-content-wrapper').html();
              if (content.length > 0) {
                self.parseScript(data, context, settings);
              }
              $('div.ajax-backdrop').remove();
            });
            return false;
          });
        });
      }
    },
    parseScript: function(strcode, context, settings) {
      var scripts = new Array();         // Array which will store the script's code

      // Strip out tags
      while(strcode.indexOf("<script") > -1 || strcode.indexOf("</script") > -1) {
        var s = strcode.indexOf("<script");
        var s_e = strcode.indexOf(">", s);
        var e = strcode.indexOf("</script", s);
        var e_e = strcode.indexOf(">", e);

        // Add to scripts array
        if (strcode.substring(s_e+1, e).length > 0) {
          scripts.push(strcode.substring(s_e+1, e));
        } else {
          var scripts_src = $(strcode.substring(s, s_e+1)).attr('src');
          if (scripts_src.length > 0 && scripts_src.indexOf('millstein_visualization') > 0) {
            var script = document.createElement('script');
            script.src = scripts_src;
            document.head.appendChild(script);
          }
        }
        // Strip from strcode
        strcode = strcode.substring(0, s) + strcode.substring(e_e+1);
      }
      for(var i=0; i<scripts.length; i++) {
        try {
          eval(scripts[i]);
        }
        catch(ex) {
          console.log("error with ajax JS")
        }
      }
      $('#page-content-wrapper .ajax-content-wrapper').html($(strcode).find('#page-content-wrapper .ajax-content-wrapper').html());
      Drupal.attachBehaviors(context, settings);
    }
  };
}(jQuery));
