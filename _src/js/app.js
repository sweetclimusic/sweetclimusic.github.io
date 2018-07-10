window.onload = function(){
  var sliders = "undefined";
  Particles.init({
    selector: '.particles',
    color: '#f4ff81',
    connectParticles: false,
    maxParticles: 300
  });
};


(function($){ 

    /**
     * Copyright 2012, Digital Fusion
     * Licensed under the MIT license.
     *
     * @author Digital Fusion
     * @desc A small plugin that checks whether elements are within
     *     the user visible viewport of a web browser.
     *     only accounts for vertical position, not horizontal.
     */

    $.fn.visible = function(partial) {
      
      var $t            = $(this),
          $w            = $(window),
          viewTop       = $w.scrollTop(),
          viewBottom    = viewTop + $w.height(),
          _top          = $t.offset().top,
          _bottom       = _top + $t.height(),
          compareTop    = partial === true ? _bottom : _top,
          compareBottom = partial === true ? _top : _bottom;
    
      return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
    };

    /**
     * Copyright 2018, Green Farm Games
     * Licensed under the MIT license.
     *
     * @author Ashlee Muscroft
     * @desc plugin to enable and disable fix navbar and play animation
     * uses offsetWidth to trigger a reflow so animations can start over.
     */
    $.fn.initStickyHeader = function() {
        var firstScroll = true;
        var navbar = $(".navbar-fixed");
        $(window).on("scroll", function() {
            var fromTop = $(window).scrollTop();
            //figure out when to move header nav
            if(fromTop > 100){
              if(firstScroll){
                $(".navbar-fixed").removeClass("hide");
              }
              $(".navbar-fixed").removeClass("hide-transition");

              //reset reflow to replay animation
              void navbar.offsetWidth;
              $("#particle-container").removeClass("reset-top");
              $(".navbar-fixed").addClass("show-transition");
              
              
            }
            else{
              $(".navbar-fixed").removeClass("show-transition");
              //reset reflow to replay animation
              void navbar.offsetWidth;

              $(".navbar-fixed").addClass("hide-transition");
              $("#particle-container").addClass("reset-top");
              
            }
              //Slid in transition for Our Story, Projects, Clients.
              var sliders = $(".slideItem");

              $(sliders).each(function(index,el){
                var even = index % 2;
                if($(el).visible(true)){
                  $(el).addClass(
                    (index%2 == 0 ? "slidein-right" : "slidein")
                  );
                }
              });
        });
    };
    //performance helpers
    /**
     * Copyright 2018, Green Farm Games
     * Licensed under the MIT license.
     *
     * @author Ashlee Muscroft
     * @desc plugin to cache object we will be slideing in and out.
     * uses offsetWidth to trigger a reflow so animations can start over.
     */
    $.fn.initSliderCache = function() {
      var sliders = $(".slideItem");
      $(sliders).each(function(i,el){
        //already visible don't play any animation.
        if($(el).visible(true)){
          $(el).addClass("played");
          $(el).removeClass("toplay");
        }
        $(el).addClass(
            (i%2 == 0 ? "toplay-right" : "toplay")
        );
        //add to all slider elements.
        $(el).on("animationend",animationListener,false);
      });
    };

    //static Image Swap to gif
    /**
     * https://stackoverflow.com/questions/33479804/show-static-image-but-swap-with-animated-gif-once-gif-if-fully-loaded
     * @param {*} i 
     * @param {*} img 
     */
    $.fn.preload = function (i, img) {
    console.log(img);
    var $img, url, $pre;

    $img = $(img);

    // incoming <img/> must have a 'data-gif' attribute
    if (! $img || ! $img.data('gif')) {
      return;
    }

    url = $img.data('gif');
    $pre = $('<img />');

    // Set up handler to replace original images's 'src' attribute
    // with the data-gif URL once the replacement is loaded
    $pre.on('load', function() {
      $img.attr('src', url);
    });

    $pre.attr('src', url);
    };
})(jQuery);   



  function animationListener(event){
    $(event).addClass("played");
    $(event).removeClass("toplay");
  }
  $(document).initStickyHeader();
  $(document).initSliderCache();