function blogwidget_pluginAppObj_1264() {
    
    x5engine.boot.push(function(){

       if ("online" != 'uipreview') {
            $("#pluginAppObj_1264 .post_title").on("click", function (event) {
                
                var link = "";
                if($(location).attr("href").indexOf("blog/") == -1){
                   link += "blog/";
                }
                link += $(this).attr("data-link");
                $(this).attr("href",  link);
                $(this)[0].click();
                event.stopPropagation();
            }); 
        }

    });//close boot
}