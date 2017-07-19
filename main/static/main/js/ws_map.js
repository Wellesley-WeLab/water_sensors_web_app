(() => {

    var locationSantiagoIsland = { lat: 15.082677, lng: -23.6210796 }
    var mapConnections = []; // connections between items in the map
    var searchField = document.getElementById('map-search');

    /**
     * @param {integer} id the id of the reservoir to search
     * @return {reservoir} the reservoir with the id, if found. undefined if not found
     */
    window.findReservoirById = (id) => {
        var found = window.reservoirs.filter((r) => r.id == id);
        return found.length != 0 ? found[0] : undefined;
    }

    /**
     * @param {integer} id the id of the pump to search
     * @return {pump} the pump with the id, if found. undefined if not found
     */
    window.findPumpById = (id) => {
        var found = window.pumps.filter((r) => r.id == id);
        return found.length != 0 ? found[0] : undefined;
    }

    /**
     * will load the map into the html page and show
     * the reservoir locations
     */
    window.loadMap = () => {
        window.myMap = new google.maps.Map(document.getElementById('map'), {
            zoom: 11,
            center: locationSantiagoIsland
        });

        // load the data for the first time
        loadData();
    }

    /**
     * To layout the data in the mapa
     */
    window.loadData = () => {

        // add the pump and reservoir markers to the map
        for (var i = 0; i < window.reservoirs.length; i++)
            addReservoirToMap(window.reservoirs[i]);
        for (var i = 0; i < window.pumps.length; i++)
            addPumpToMap(window.pumps[i]);

        // add the connections between the reservoirs
        for (var i = 0; i < window.reservoirCons.length; i++) {
            var con = window.reservoirCons[i];
            var a   = findReservoirById(con.reservoirA__res_id);
            var b   = findReservoirById(con.reservoirB__res_id);
            if (a !== undefined && b !== undefined)
                addConnectionToMap(a.marker, b.marker, con.flowDirection);
        }
        // add the connections between the pumps and the reservoirs
        for (var i = 0; i < window.pumpCons.length; i++) {
            var con = window.pumpCons[i];
            var res = findReservoirById(con.reservoir__res_id);
            var pmp = findPumpById(con.pump__pump_id);
            if (res !== undefined && pmp !== undefined)
                addConnectionToMap(res.marker, pmp.marker, 1);
        }
    }

    /**
     * Add a marker of a reservoir location in the map
     * @param {object} reservoirData should contain the location and address name of the reservoir
     */
    window.addReservoirToMap = (reservoirData) => {
        reservoirData.marker = new google.maps.Marker({
            position: reservoirData.position,
            title: reservoirData.address,
            map: window.myMap,
            icon: {
                url: window.RESERVOIR_ICON,
                scaledSize: new google.maps.Size(20, 20)
            }
        });
    }

    /**
     * Add a marker of a pump location in the map
     * @param {object} pumpData should contain the location and address name of the pump
     */
    window.addPumpToMap = (pumpData) => {
        pumpData.marker = new google.maps.Marker({
            position: pumpData.position,
            title: pumpData.address,
            map: window.myMap,
            icon: {
                url: window.PUMP_ICON,
                scaledSize: new google.maps.Size(20, 20)
            }
        });
    }

    /**
     * Removes all current markers and connections from the map
     */
    window.removeItemsFromMap = () => {
        var i = window.reservoirs.length;
        while (i-- > 0) {
            // remove from map and from array
            window.reservoirs[i].marker.setMap(null);
            window.reservoirs.splice(i ,1);
        }

        i = window.pumps.length;
        while (i-- > 0) {
            // remove from map and from array
            window.pumps[i].marker.setMap(null);
            window.pumps.splice(i, 1);
        }

        i = mapConnections.length;
        while (i-- > 0) {
            // remove from map and from array
            mapConnections[i].setMap(null);
            mapConnections.splice(i, 1);
        }
    }

    /**
     * Add a line connecting two markers in the map
     * @param {google.maps.Marker} a
     * @param {google.maps.Marker} b
     * @param {number} directionAtoB if positive the connection has an arrow from a to a
     *                               if negative the connection has an arrow from b to a
     *                               if it has now arrow
     */
    window.addConnectionToMap = (a, b, directionAtoB) => {
        var line = new google.maps.Polyline({
            path: [ a.position, b.position ],
            geodesic: true,
            strokeColor: '#24aebd',
            strokeOpacity: 1,
            strokeWeight: 1.5
        });

        if (directionAtoB > 0) {
            line.setOptions({
                icons: [{
                    icon: { path: google.maps.SymbolPath.FORWARD_CLOSE_ARROW },
                    offset: '0%',
                    repeat: '20px'
            }]});
        } else if (directionAtoB < 0) {
            line.setOptions({
                icons: [{
                    icon: { path: google.maps.SymbolPath.BACKWARD_CLOSE_ARROW },
                    offset: '0%',
                    repeat: '20px'
            }]});
        }

        line.setMap(window.myMap);
        mapConnections.push(line);
    }

    /**
     * Search pumps and reservois according the locations in the search box
     */
    window.searchMap = () => {
        var searchText = searchField.value;
        var url = MAP_PATH + "?region=" + searchText + "&res-type=json";
        $.get(url)
        .done((results) => {
            var jsonRes   = JSON.parse(results);

            // remove existing items
            removeItemsFromMap();
            
            reservoirs    = jsonRes.reservoirs;
            reservoirCons = jsonRes.reservoirCons;
            pumps         = jsonRes.pumps;
            pumpCons      = jsonRes.pumpCons;

            loadData();
        })
        .fail(() => {
            Util.showErroMsg('Não foi possivel obter os dados. Verifique a sua conexão á internet');
        })
    }

    /* set the map search callback */
    // document.getElementById('map-search-bt').onclick = searchMap;
    searchField.onkeyup = searchMap;

})();
