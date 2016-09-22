// Agency Theme JavaScript

(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function(){ 
            $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

    // Popover
    $("[data-toggle='popover']").popover({
        container: 'body'
    }); 
})(jQuery); // End of use strict

// Header animations
$(document).ready(function() {
    $(".typed").typed({
        strings: ["hi, i'm jeremy", "i make android apps", "i like startups", "nice to meet you :)"],
        typeSpeed: 25,
        startDelay: 25,
        showCursor: true,
        callback: function() {
            setTimeout(function(){
                $(".typed-cursor").remove();
                lift();
            }, 1000);
        }
    }); 

    function lift() {
        $(".intro-lead-in").removeClass("noshow");
        $(".intro-heading").animate({'opacity': 0}, 250, function () {
            setTimeout(function() {
                $(".intro-heading").text(">/ hi, i'm jeremy");
                $(".intro-heading").animate({'opacity': 1}, 250);
                $(".head-animate").addClass("lift-text");
            }, 500)
        });
    }
});