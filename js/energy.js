    //var map = L.map('map', {maxZoom: 20, minZoom: 6, zoomControl: false});
    var map = L.map('map', {maxZoom: 20, zoomControl: false}).setView([35.1391,128.9178], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19,opacity: 0.75,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var lat;
    var lng;   
    map.on('click', function(e) {
        //console.log(e.latlng);  //So you can see if it's working
        lat = e.latlng.lat;
        lng = e.latlng.lng;
    });

    var retrieved_data = function getdata(){
        var tmp=null;
        $.ajax({
          url: "./data/grid_area.json",           
            type: 'GET',
            dataType: 'json',
            success: function (data) {
              tmp=data;
            }
          })
        return tmp;
      }();

    console.log(retrieved_data);
    

    var E = function (id) {
      return document.getElementById(id);
    };

    var GriStyle = {fillColor: '#FFFFFF',"color": "#000000",fillOpacity:0.1,"weight": 1,"opacity": 0.9};
    var HouStyle = {fillColor: '#AD9B58',"color": "#AD9B58",fillOpacity:0.9,"weight": 0,"opacity": 0.9};
    var FacStyle = {fillColor: '#AC6F5A',"color": "#AC6F5A",fillOpacity:0.9,"weight": 0,"opacity": 0.9};
    var GovStyle = {fillColor: '#0058AC',"color": "#0058AC",fillOpacity:0.9,"weight": 0,"opacity": 0.9};
    var ComStyle = {fillColor: '#6C61A6',"color": "#6C61A6",fillOpacity:0.9,"weight": 0,"opacity": 0.9};
    var ParStyle = {fillColor: '#018120',"color": "#018120",fillOpacity:0.9,"weight": 0,"opacity": 0.9};

    var House = new L.GeoJSON.AJAX('./data/House.geojson', {style: HouStyle}).addTo(map);       
    var Factory = new L.GeoJSON.AJAX('./data/Factory.geojson', {style: FacStyle}).addTo(map);       
    var Gov = new L.GeoJSON.AJAX('./data/Government.geojson', {style: GovStyle}).addTo(map); 
    var Comm = new L.GeoJSON.AJAX('./data/Commercial.geojson', {style: ComStyle}).addTo(map);        
    var Park = new L.GeoJSON.AJAX('./data/Park.geojson', {style: ParStyle}).addTo(map); 
    
    var gui = {};
    var VIS = "visible";

    function ON_CLICK(id, listener) {
        var e = document.getElementById(id);
        if (e) e.addEventListener("click", listener);
    }
    gui.clean = function () {
        gui.popup.hide();
        gui.popupforecast.hide();
        if (gui.layerPanel.initialized) gui.layerPanel.hide();
      };
    
    popup = {
        modal: false,
        content: null,
        timerId: null,
        isVisible: function () {
          return E("popup").classList.contains(VIS);
        },
        show: function (obj, title, modal, duration) {

          if (modal) app.pause();
          else if (this.modal) app.resume();
    
          this.modal = Boolean(modal);
    
          var e = E("layerpanel");
          if (e) e.classList.remove(VIS);
    
          var content = E("popupcontent");
          [content, E("queryresult"), E("pageinfo")].forEach(function (e) {
            if (e) e.classList.remove(VIS);
          });
    
          if (obj == "queryresult" || obj == "pageinfo") {
            E(obj).classList.add(VIS);
          }
          else {
            if (obj instanceof HTMLElement) {
              content.innerHTML = "";
              content.appendChild(obj);
            }
            else {
              content.innerHTML = obj;
            }
            content.classList.add(VIS);
          }
          E("popupbar").innerHTML = title || "";
          E("popup").classList.add(VIS);
    
          if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
          }
    
          if (duration) {
            this.timerId = setTimeout(function () {
              gui.popup.hide();
            }, duration);
          }
        },
    
        hide: function () {
          E("popup").classList.remove(VIS);
          if (this.timerId !== null) clearTimeout(this.timerId);
          this.timerId = null;
          this.content = null;
          if (this.modal) app.resume();
        }
    };

    var cleanView = function () {
        popup.hide();
      };

    // popup
    ON_CLICK("closebtn", cleanView);
      
    var showQueryResult = function (lat,lng,x,y,id) {
        var e = E("qr_layername");
        console.log(retrieved_data);
        var da = retrieved_data[id];
        if (layer && e) e.innerHTML = 'House: '+(da["House_PCT"]*100).toFixed(2).toString()
                    +' % <br> Factory :'+(da["Factory__1"]*100).toFixed(2).toString()                      
                                +' % <br> Gov. Building :'+(da["Govern_PCT"]*100).toFixed(2).toString()
                                +' % <br> Comm. Building :'+(da["Commerc_PC"]*100).toFixed(2).toString()
                    +' % <br> Park :'+(da["Park_PCT"]*100).toFixed(2).toString()                            
                    +' %';   
        
        e = E("qr_coords_table");
        if (e) {
          if (lng) {
            e.classList.remove("hidden");
            e = E("qr_coords");
            e.innerHTML = [lat.toFixed(3), lng.toFixed(3), id].join(", ");
          }
          else {
            e.classList.add("hidden");
          }
        }
    
        e = E("qr_attrs_table");
        if (e) {
          for (var i = e.children.length - 1; i >= 0; i--) {
            if (e.children[i].tagName.toUpperCase() == "TR") e.removeChild(e.children[i]);
          }
        }
          else {
            e.classList.add("hidden");
          }
        popup.show("queryresult");   
    }

    var grid200m = new L.GeoJSON.AJAX('./data/grid200m_box.geojson', {style: GriStyle, onEachFeature: function (feature, layer) {
        layer.on('mouseover', function () {
          this.setStyle({
            'fillColor': '#0000ff', 
          });
        });
        
        layer.on('mouseout', function () {
          this.setStyle({
            fillColor: '#FFFFFF',"color": "#000000",fillOpacity:0.1,"weight": 1,"opacity": 0.9
          });
        }); 
        layer.on('click', function () {
          // Let's say you've got a property called url in your geojsonfeature:
            console.log(lat,lng,feature.properties.x,feature.properties.y,feature.properties.id);
          //window.location = feature.properties.url;
          showQueryResult(lat,lng,feature.properties.x,feature.properties.y,feature.properties.id);  
        });
      }}).addTo(map);      
    var grid = {"Grid 200m": grid200m};    

    L.control.scale({
        position : 'bottomright',
        maxWidth : 200
    }).addTo(map);    

    L.control.zoom({position: 'bottomright'}).addTo(map);

    // Define Base Maps
    // MAP BOX STREET
    var baseMapStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,opacity: 0.75,id: 'mapbox.streets',
    });

    //MAP BOX outdoor
    var baseMapOutdoor = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 18,opacity: 0.75,
        id: 'mapbox.outdoors',
        accessToken: 'pk.eyJ1IjoiaGl0YWRldmVsb3BlciIsImEiOiJjam40N3ljbjQwMXFoM3FtaWFhdmE0ZHU4In0.-k3XXQjWfjWM5fgL-e25sA'
    });

    //google maps
    var baseMapGoogleStreet = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20, opacity: 0.75,subdomains:['mt0','mt1','mt2','mt3']
    });

    //google maps hybrid
    var baseMapGoogleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
        maxZoom: 20,opacity: 0.75,subdomains:['mt0','mt1','mt2','mt3']
    });

    //google map satelite
    var baseMapGoogleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 20,opacity: 0.75,subdomains:['mt0','mt1','mt2','mt3']
    });

    //google map terrain
    var baseMapGoogleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
        maxZoom: 20,opacity: 0.75,subdomains:['mt0','mt1','mt2','mt3']
    });


    var baseMapsControl = {
        "Open Street Map": baseMapStreet,
        "Open Street Map Outdoor": baseMapOutdoor,
        "Google Street" : baseMapGoogleStreet,
        "Google Hybrid" : baseMapGoogleHybrid,
        "Google Satelite" : baseMapGoogleSat,
        "Google Terain" : baseMapGoogleTerrain,
    };

    var layerControl = L.control.layers(baseMapsControl, grid).addTo(map);

    //L.control.layers(baseMapsControl).addTo(map);
    //L.control.addOverlay(grid, "Grid 200 m");
    layerControl.addOverlay(House, "House");
    layerControl.addOverlay(Factory, "Factory");
    layerControl.addOverlay(Gov, "Government Building");
    layerControl.addOverlay(Comm, "Commercial Office");
    layerControl.addOverlay(Park, "Park");
