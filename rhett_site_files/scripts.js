(function ($) {
  Drupal.behaviors.COLHomepageBottomCarousel = {
    attach: function (context, settings) {
      $('.pane-homepage-explore-corgov-data-carousel .carousel').owlCarousel({
        pagination: false,
        navigation: true,
        navigationText: ["",""],
        items: 5,
        itemsTablet: [1280,3]
      });
    }
  };
  Drupal.behaviors.COLHideBlock = {
    attach: function (context, settings) {
      if ($('.view-node-detail h2.pane-title').size() > 0) {
        $('.view-node-detail h2.pane-title').each(function(i,v){
          $(v).once('hide-block',function(){
            $(v).click(function(){
              $(this).parent().toggleClass('hide-content').find('.view-node-detail-content').slideToggle();
            });
          })
        });
      }
    }
  };
  Drupal.behaviors.COLAddHideBlock = {
    attach: function (context, settings) {
      if ($('#block-columbia-pages-company-news h2.block-title').size() > 0) {
        $('#block-columbia-pages-company-news h2.block-title').each(function(i,v){
          $(v).once('hide-block',function(){
            $(v).click(function(){
              $(this).parent().toggleClass('hide-content').find('.company-news-main-wrapper').slideToggle();
            });
          })
        });
      }
    }
  };
  Drupal.behaviors.COLDetailHideBlock = {
    attach: function (context, settings) {
      if ($('.detail-header-info-wrapper h2').size() > 0) {
        $('.detail-header-info-wrapper h2').each(function(i,v){
          $(v).once('hide-block',function(){
            $(v).click(function(){
              $(this).parent().toggleClass('hide-content').find('.content').slideToggle();
            });
          })
        });
      }
    }
  };
  Drupal.behaviors.HomeHTML = {
    attach: function (context, settings) {
      $('.region.region-content-main-additional-articles > section .node').each(function (i, v) {
        $(v).once('process-html', function () {
          $(this).find('.content').insertBefore($(this).find('h2'));

        });
      });

      $('.region.region-content-main-featured-article .node').each(function (i, v) {
        $(v).once('process-html', function () {
          if ($(this).find('.field.field-name-field-image.field-type-image').size() > 0) {
            $(this).prepend($(this).find('.field.field-name-field-image.field-type-image')[0].outerHTML);
            $(this).find('.content .field.field-name-field-image.field-type-image').remove();
          }
        });
      });
    }
  };
}(jQuery));
