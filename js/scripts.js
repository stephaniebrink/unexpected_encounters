$(document).ready(function() {
	
	
	// ----- GLOBAL VARIABLES -----

	var troveKey = 'jg79p9ghks94tkd3',
		mapKey = 'AIzaSyBl5D5R3IDFPQd53C_ILtRu9yAifsSCNvM',
		search = $( '#locSearch' ),
		currLoc,
		lat,
		lng;


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
    
	
	// ----- GOOGLE MAP API: PLACES LIBRARY -----
	// Attribution policies can be found here: https://developers.google.com/places/web-service/policies
	
	$('#find-places').click(function() {

		var url = 'https://maps.googleapis.com/maps/api/js?key=' + mapKey + '&libraries=places&encoding=json&callback=?',
			service,
			map;
			
			console.log('find places clicked');
			
		// Search for nearby places
		$.getJSON(url, function(data) {
			
			// TRY: Coordinates for Canberra Centre
 			// currLoc = new google.maps.LatLng(-35.2791,149.1338);
			
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
			    radius: '500',
			    type: ['point-of-interest']
			};
		
			service = new google.maps.places.PlacesService(map);
			service.nearbySearch(request, callback);
		})
		
		function callback(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					
					var place = results[i].name,
						vicinity = results[i].vicinity;
					
					// Log place name and vicinity to console	
					console.log('A place has been found: ' + place);
					console.log("It's vicinity is: " + vicinity);
					
					// Append places to page
					$('#places').append('<p>' + place + '</p>');
					// createMarker(results[i]);
		    	}
		  	}
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


	// ----- LOCATION SEARCH -----

	$("#locSubmit").click(function(){
    
	    // Set location query
	    var locQuery = $('#locQuery').val();
	    
	    // Stay on page if location not entered
	    if (locQuery == '') {
	        return;
	    }
	    
	    // Show loading screen
	    $("#loading").css("display","block");
	    
	    // Prevent button from refreshing the page
	    event.preventDefault()
	    
	    // Reset location query text
	    $('#locQuery').val("");
	    
	    // Trove API call
	    trovePics(locQuery);
	    
	});


	// ----- TROVE API: FLICKR PICTURES -----

	function trovePics(locQuery) {
	    
	    var url = 'http://api.trove.nla.gov.au/result?q=' + locQuery + '%20AND%20%22http://creativecommons.org/licenses/%22%20AND%20nuc:YUF&zone=picture&include=workversions&key=' + troveKey + "&encoding=json&callback=?";
	    
	    $.getJSON(url, function(data) {
	        
	        // Log data
	        console.log("Flickr results");
	        console.log(data);
	    
	        var zoneArray = data.response.zone;
	        	        
	        // If Trove found a match
	        if (zoneArray[0].records.n > 0) {
	            
	            // Hide intro screen and search box
	            search.css("opacity","0");
	            search.css("z-index","8");
	            search.css("bottom","-10vh");
	            $("#intro").css("display","none");
	            
	            // Hide error messaage
	            $("#locError").css("display","none");
	            
	            // Change query placeholder text
	            $("#locQuery").attr("placeholder", "Where to now?");
	            
	            // Display images
	            var workArray = zoneArray[0].records.work;
	            
	            for (i = 0; i < workArray.length; i++) {
	                var versionImg = workArray[i].version[0].record[0].metadata.dc.mediumresolution;
	                $("#pictures").append('<img class="troveImg" src="' + versionImg + '" />');
	            }
	            
	            troveNews(locQuery);
	            
	        } else {
	            troveNews(locQuery);
	        };
	    });
	}
	

	// ----- TROVE API: NEWSPAPER ARTICLES -----

	function troveNews(locQuery) {
	    
	    var url = 'http://api.trove.nla.gov.au/result?q=' + locQuery + '%20date:[*%20TO%201930]&zone=newspaper&reclevel=full&include=articletext&key=' + troveKey + "&encoding=json&callback=?";
	    
	    $.getJSON(url, function(data) {
	        
	        // Log data
	        console.log("Newspaper results");
	        console.log(data);
	        
	        var newsZone = data.response.zone[0];
	        
	        // If Trove found a match
	        if (newsZone.records.n > 0) {
	            
	            // Hide intro screen and search box
	            search.css("opacity","0");
	            search.css("z-index","8");
	            search.css("bottom","-10vh");
	            $("#intro").css("display","none");
	            
	            // Hide error messaage
	            $("#locError").css("display","none");
	            
	            // Display images
	            var articleArray = newsZone.records.article;
	            
	            for (i = 0; i < articleArray.length; i++) {
	                var pageUrl = articleArray[i].trovePageUrl,
	                	pageNum = pageUrl.split("http://trove.nla.gov.au/ndp/del/page/").slice(1),
		                pdfUrl = 'http://trove.nla.gov.au/newspaper/rendition/nla.news-page' + pageNum + '.pdf',
	                	newsHeading = articleArray[i].heading,
						newsText = articleArray[i].articleText;
	                
	                // Append to page
					$("#newspapers").append('<object width="500" height="700" data="' + pdfUrl + '"></object>');
	                $("#newspaper-text").append('<div class="newsArticle"><h3 class="newsArticleHead">' + newsHeading + '</h3>' + newsText + '</div>');
	            }
	            
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