function triggerGoogleMapsLoaded() {
    _jq(window).trigger('GoogleMapsLoaded');
}

function paGoogleMaps(id, fullWidth) {
    var jqContainer = _jq('#' + id);

    var obj = {};
    obj.container = jqContainer;
    obj.createIFrame = function (url, width) {
        var w = width ? width : '100%';
        var iframe = _jq('<iframe width="' + w + '" height="' + w + '" frameborder="0" style="border:0; max-width: 100%; vertical-align: bottom;" src="' + url + '"></iframe>');
        jqContainer.append(_jq('<div class="container ' + (fullWidth ? 'fullWidth' : 'normalWidth') + '" />').append(_jq('<div class="map_container" />').append(iframe)));
        return iframe;
    };
    obj.loadMap = function (address, url) {
        new google.maps.Geocoder().geocode({ address: address }, function (results, status) {
            var lat = results[0].geometry.location.lat();
            var lng = results[0].geometry.location.lng();
            obj.createIFrame(url + lat + ',' + lng);
        });
    };
    obj.loadGMAPI = function (key) {
        var gm_script = _jq('#gm_script');
        if (gm_script.length === 0) {
            jqContainer.append('<script id="gm_script" src=\"https://maps.googleapis.com/maps/api/js?key=' + key + '&callback=triggerGoogleMapsLoaded\" async defer></script>')
        }
    };
    return obj;
}