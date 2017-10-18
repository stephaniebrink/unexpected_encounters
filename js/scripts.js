$(document).ready(function() {
	
	
	// ----- GLOBAL VARIABLES -----

	var troveKey = 'jg79p9ghks94tkd3',
		mapKey = 'AIzaSyBl5D5R3IDFPQd53C_ILtRu9yAifsSCNvM',
		currLoc,
		lat,
		lng;
    

    // ----- LEAVE INTRO PAGE -----
    $('#intro').click(function() {
        $("#intro").css("display","none");
        $("#onboard").css("display","block");
    });
    
    // ----- ON CLICK: "DISCLAIMER" -----
    $('#disclaimerButton').click(function() {
        $("#disclaimer").css("display","block");
    });
    
    // ----- ON CLICK: DISCLAIMER "OK" -----
    $('#disclaimerOk').click(function() {
        $("#disclaimer").css("display","none");
    });
    
    // ----- ON CLICK: "GOT IT" -----
    $('#gotIt').click(function() {
        $("#onboard").css("display","none");
        $("#home").css("display","block");
        
        // ----- FIND USER'S LOCATION -----
        // NOTE: this only works when viewing the file in your browser (i.e. file:///Volumes/Mactinosh etc...). 
        // We may need to see if we can get the user's location using the Google Maps API instead
        // Because otherwise Typekit won't work.

        if (navigator.geolocation) {
            console.log(navigator.geolocation);

            function success(pos) {           
                // Store the current coordinates
                var crds = pos.coords;

                // Log coordinates to console
                console.log(crds);
                console.log('My current position is: ');
                console.log('Latitude: ' + crds.latitude);
                console.log('Longitude: ' + crds.longitude);
                console.log('More or less: ' + crds.accuracy + ' metres.');

                // Add coordinates to variables
                lat = crds.latitude;
                lng = crds.longitude;
            }

            function error(err) {
                // Log error to console
                console.log(err);

                // Set default location to Canberra
                // This doesn't do anything at the moment
                var defaultLocation = '-35.28346,149.12807';
            }

            // Prompt the user for their location
            navigator.geolocation.getCurrentPosition(success, error);
        };
    5});
    
    // ----- ABOUT BUTTON -----
    $('#aboutButton').click(function() {
        $("#about").css("display","block");
    });
    
    $('#aboutBack').click(function() {
        $("#about").css("display","none");
    });

	
	// ----- GOOGLE MAP API: PLACES LIBRARY -----
	// Attribution policies can be found here: https://developers.google.com/places/web-service/policies
	
	$('#find-places').click(function() {
        
        // Show loading screen
        $("#loading").css("display","block");

		var url = 'https://maps.googleapis.com/maps/api/js?key=' + mapKey + '&libraries=places&encoding=json&callback=?',
			service,
			map;
			
			console.log('find places clicked');
			
		// Search for nearby places
		$.getJSON(url, function(data) {
			
			// TRY: Coordinates for Canberra Centre
//  			currLoc = new google.maps.LatLng(-35.2791,149.1338);
			
			// TRY: Coordinates for National Library of Australia  			
//  			currLoc = new google.maps.LatLng(-35.296623,149.129822);

			// Current location coordinates
			currLoc = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
			console.log('current location: ' + currLoc);
			
			// Don't think we need this
			map = new google.maps.Map(document.getElementById('map'), {
		    	center: currLoc,
				zoom: 15
		    });
			
			// Parametres for places request - radius is in metres
			// Find docs on 'type' here: https://developers.google.com/places/supported_types
			var request = {
			    location: currLoc,
			    radius: '500'
  			};
		
			service = new google.maps.places.PlacesService(map);
			service.nearbySearch(request, callback);
		})
		
		function callback(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				
				console.log(results);
				
				// Set desired place types
				var desiredTypes = ['airport', 'amusement_park', 'aquarium', 'art_gallery', 'bank', 'campground', 'casino', 'cemetery', 'church', 'city_hall', 'courthouse',  'embassy', 'fire_station', 'hindu_temple', 'hospital', 'library', 'local_government_office', 'mosque', 'museum', 'park', 'police', 'post_office', 'school', 'stadium', 'synagogue', 'university', 'zoo', 'colloquial_area', 'country', 'locality', 'natural_feature', 'neighborhood', 'place_of_worship', 'political', 'street_address'];
				var desiredPlace = '';

				// Loop through all nearby place results
				for (var i = 0; i < results.length; i++) {
					
					var place = results[i].name,
						vicinity = results[i].vicinity,
						types = results[i].types;
																	
					// Log place name, vicinity and types to console	
					console.log('A place has been found: ' + place);
					console.log('The vicinity is: ' + vicinity);
					console.log('The types are: ' + types);
				
					// Loop through all desired types
					for (var d = 0; d < desiredTypes.length; d++) {
					
						// Loop through types for each place result
 						for (var t = 0; t < types.length; t++) {
 							
 							// If there's a match, put place in desired place variable
 							if (types[t] == desiredTypes[d]) {
	 							desiredPlace = place;
 							}
						}
		    		}	
					
					// If desired place is not blank
					if (desiredPlace != '') {
						
						// Append place name to page
						$('#places').append('<p class="place">' + desiredPlace + '</p>');
						
						// Reset desired place  
						desiredPlace = '';
					}
				}
            }
            
            // Hide homepage
            $("#home").css("display","none");
            
            // Display Discovery page
            $("#select").css("display","block");
            
            // Hide loading screen
            loadComplete();
            
            // ----- SELECT PLACE -----
            // K: I think this function needs to be here, AFTER places are appended
            $('.place').click(function() {
                
                console.log( "Place selected: " + $(this).html() );
                
                // Show loading screen
                $("#loading").css("display","block");
                
                // Set place selection
                var locQuery = $(this).html()
                
                // Append place name to results page
                $("#resultsList").append('<h2 id="place-name">' + locQuery + '</h2>')

                
                // Retrieve Flickr pics data from Trove
                trovePics(locQuery);
                
            });
		}
        
	})
	
	// This is the data that a Nearby Places call returns: 
	/* 
	{"geometry":
		{"location":
			{"lat":-35.1799609,"lng":149.3109945},
			"viewport":
			{"south":-35.2255402,"west":149.25235769999995,"north":-35.1221184,"east":149.40517869999996}
		},
		"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
		"id":"a3f62ca41932bb9d716eafc47827e23ab0f3948a",
		"name":"Bywong",
		"photos":[{"height":1836,"html_attributions":["<a href=\"https://maps.google.com/maps/contrib/110840162992236573478/photos\">Reeves Papaol</a>"],"width":3264}],
		"place_id":"ChIJle2eKNb3FmsRANxDkLQJBgQ",
		"reference":"CmRbAAAAQ074M2gH7KZ9c798-88Z3pbrMmp_P2AcHX54GSf_zEOZazB57n_zUpYMueWbCzazI860a3ADhjr34m32A3CYzIusIr7N3DXNIA763TqJ7ARJATW8Plo98bQ_Z26agIrcEhDMjOocP4Z0WHz-FdICXh1lGhTkdJsNpiYfxGKM7UYLa0C_fTPnKQ",
		"scope":"GOOGLE",
		"types":["locality","political"],
		"vicinity":"Bywong",
		"html_attributions":[]} (scripts.js, line 88)			
	*/
    
    
	// ----- TROVE API: FLICKR PICTURES -----

	function trovePics(locQuery) {
	    
	    var url = 'http://api.trove.nla.gov.au/result?q="' + locQuery + '"%20AND%20%22http://creativecommons.org/licenses/%22%20AND%20nuc:YUF&zone=picture&include=workversions&key=' + troveKey + "&encoding=json&callback=?";
	    
	    $.getJSON(url, function(data) {
	        
	        // Log data
	        console.log("Flickr results");
	        console.log(data);
	    
	        var zoneArray = data.response.zone;
	        	        
	        // If Trove found a match
	        if (zoneArray[0].records.n > 0) {
	            
	            // Display images
	            var workArray = zoneArray[0].records.work;
	            
	            for (i = 0; i < workArray.length; i++) {
	                // *** there seems to be an issue with the below line, when returning results Canberra Museum & Gallery *** 
	                var versionImg = workArray[i].version[0].record[0].metadata.dc.mediumresolution;
                    var versionTitle = workArray[i].title;
	                $("#resultsList").append('<div class="results"><img src="' + versionImg + '" class="results-img"><h3 class="results-title">' + versionTitle + '</h3></div>')
                }
	            
                // Retrieve newspaper article data from Trove
                troveNews(locQuery);
	            
	        } else {
                // Retrieve newspaper article data from Trove
	            troveNews(locQuery);
	        };
	    });
	}
	

	// ----- TROVE API: NEWSPAPER ARTICLES -----

	function troveNews(locQuery) {
	    
	    var url = 'http://api.trove.nla.gov.au/result?q="' + locQuery + '"%20date:[*%20TO%201900]&zone=newspaper&reclevel=full&include=articletext&key=' + troveKey + "&encoding=json&callback=?";
	    
	    $.getJSON(url, function(data) {
	        
	        // Log data
	        console.log("Newspaper results");
	        console.log(data);
	        
	        var newsZone = data.response.zone[0];
	        
	        // If Trove found a match
	        if (newsZone.records.n > 0) {
	            
	            // Display images
	            var articleArray = newsZone.records.article;
	            
	            for (i = 0; i < articleArray.length; i++) {
	                var pageUrl = articleArray[i].trovePageUrl,
	                	pageNum = pageUrl.split("http://trove.nla.gov.au/ndp/del/page/").slice(1),
		                pdfUrl = 'http://trove.nla.gov.au/newspaper/rendition/nla.news-page' + pageNum + '.pdf',
	                	newsHeading = articleArray[i].heading,
						newsText = articleArray[i].articleText;
	                
	                // Append to page
                    $("#resultsList").append('<div class="results"><img src="images/newspaper01.jpg" class="results-img"><h3 class="results-title">' + newsHeading + '</h3></div>')
                    //$("#newspapers").append('<object width="500" height="700" data="' + pdfUrl + '"></object>');
	                //$("#newspaper-text").append('<div class="newsArticle"><h3 class="newsArticleHead">' + newsHeading + '</h3>' + newsText + '</div>');
	            }
	            
	            // Hide place selection page
                $("#select").css("display","none");

                // Display Results page
                $("#results").css("display","block");

                // Hide loading screen
                loadComplete();
	            
	        } else {
	            // Show error message
	            $("#locError").css("display","block");
	            
	            // Hide loading screen
	             $("#loading").css("display","none");
	        };
	    });
	}
	
	
	// ----- API CALL COMPLETE -----

	function loadComplete() {
	    // Hide loading screen
	    $("#loading").css("display","none");
	}
	
}); // close document ready