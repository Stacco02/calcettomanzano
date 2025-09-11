function logoslider_pluginAppObj_3_985(param) {
    
    var MIN_WIDTH_SIZE = 128;
    var resizing = false;
    var itemVisible = param.itemVisible;
    var pluginAppObj_3_985_resizeTo = null,
		pluginAppObj_3_985_width = 0;
    
    x5engine.boot.push(function(){     
        addEvents();
        init();
    
        x5engine.utils.onElementResize(document.getElementById("pluginAppObj_3_985"), function (rect, target) {
            if (pluginAppObj_3_985_width == rect.width) {
                return;
            }
            pluginAppObj_3_985_width = rect.width;
            if (!!pluginAppObj_3_985_resizeTo) {
                clearTimeout(pluginAppObj_3_985_resizeTo);
            }
            if ( false && (rect.width == 0 || document.hidden) ) {
                //if the window was hidden/minimized so will jump eventResize
                resizing = true;
            }
            pluginAppObj_3_985_resizeTo = setTimeout(function() {}, 50);   
        });
    });

    function init() {
        setPathImage();
        setup();
    }

    function setPathImage() {
        if ( false ) {
            return;    
        }
            
        var imagesPath = ['pluginAppObj/pluginAppObj_3_985/logo_BANCA_360_FVG.png','pluginAppObj/pluginAppObj_3_985/logo_ediciano_design.png','pluginAppObj/pluginAppObj_3_985/logo_DEBER.png','pluginAppObj/pluginAppObj_3_985/logo_BERNARDIS.png'];
             
        $('#pluginAppObj_3_985 .logo-slide-img').each(function(i, obj) {
            var path = x5engine.settings.currentPath + imagesPath[i];
            $(this).css("background-image", 'url(' + path + ')');
            $(this).find("img").attr("src", path);
        });
    }
    
    function setup() {
        param.carousel.owlCarousel({
            items: itemVisible,
            loop: param.autoplay ? true: false,
            margin: param.margin,
            nav: false,
            autoplay: param.autoplay,
            smartSpeed: param.animationDuration,
            autoplayTimeout: param.autoplayMode == "continuousScrolling" &&  param.autoplay ? param.animationDuration : param.autoplayTimeout,
            autoplaySpeed: param.animationDuration,
            slideTransition: param.autoplayMode == "continuousScrolling" &&  param.autoplay ? 'linear' : 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            autoplayHoverPause: param.autoplayHoverPause,
            dots: param.dots
        });
    }

    function addEvents() {
        param.carousel.on('refresh.owl.carousel', eventResize);   
        $("#pluginAppObj_3_985_container .owl-carousel .item").bind('touchstart', function(event) {
            $(this).addClass("zoom");
        });     
        $("#pluginAppObj_3_985_container .owl-carousel .item").bind('touchend', function(event) {
            $(this).removeClass("zoom");
        });
    }

    function eventResize() {
        if(resizing){
            return;
        }
        resizing = true;
        resize();
        resizing = false;
    }

    function resize() {
        var widthSlider = getWidthSingleSlider(); 
        if(param.preview || ((widthSlider >= MIN_WIDTH_SIZE) && (itemVisible == param.itemVisible))){
            setBackgroundSize(widthSlider);
            return;
        }
        else if((widthSlider > MIN_WIDTH_SIZE) && (itemVisible < param.itemVisible)){
            do {
                itemVisible++;
                itemVisible = Math.min(itemVisible, param.itemVisible); //security control
                widthSlider = getWidthSingleSlider(); 
            } while((widthSlider > MIN_WIDTH_SIZE) && (itemVisible < param.itemVisible));
        }
        else if(widthSlider < MIN_WIDTH_SIZE){
            if(itemVisible > 1) {
                do {
                    itemVisible--;
                    itemVisible = Math.max(itemVisible, 1); //security control
                    widthSlider = getWidthSingleSlider(); 
                } while(widthSlider < MIN_WIDTH_SIZE);
            }
        }
        //destroy and reinizialize
        param.carousel.owlCarousel('destroy'); 
        init();
        setBackgroundSize(widthSlider);
    }

    function getWidthSingleSlider() {
        return parseInt((param.container.width() / itemVisible) - (param.margin / 2))
    }

    function setBackgroundSize(widthSlider) {
        var realImageWidth = 0;
        var realImageHeight = 0;
        var maxHeight = 0;
        if(!param.preview){
            $("#pluginAppObj_3_985_container .owl-carousel .owl-item .logo-slide-img").css("background-size", ""); 
            $("#pluginAppObj_3_985_container .owl-carousel .owl-item .logo-slide-img").each(function(index,item){
                var imageWidth = $(item).data("width");
                var imageHeight = $(item).data("height");
                if(imageWidth > imageHeight){
                    realImageHeight = parseInt((imageHeight * widthSlider)/ imageWidth);
                    realImageWidth = widthSlider;
                }
                else{
                    realImageWidth = parseInt((imageWidth * widthSlider)/ imageHeight);
                    realImageHeight = widthSlider;
                }
                
                var finalImageHeight;     
                if(realImageWidth > imageWidth && realImageHeight > imageHeight) {
                    $(item).css("background-size", imageWidth + "px " + imageHeight + "px");
                    finalImageHeight = imageHeight;
                }
                else {
                    finalImageHeight = realImageHeight;
                }
                maxHeight = Math.max(finalImageHeight, maxHeight);
            });
            $("#pluginAppObj_3_985_container .owl-carousel .owl-stage .owl-item").css("height", maxHeight);
        }
    }
  
}