$(document).ready(function() {
	
	
	// ----- GLOBAL VARIABLES -----

	var troveKey = 'jg79p9ghks94tkd3',
		mapKey = 'AIzaSyBl5D5R3IDFPQd53C_ILtRu9yAifsSCNvM',
		currLoc,
		lat,
		lng;
    

    // ----- INTRO PAGE FADEOUT -----
    $('#intro').fadeIn('fast').delay(2000).fadeOut('fast');
    $('#onboard').delay(2000).fadeIn('slow');
    
    // ----- ON CLICK: "GOT IT" -----
    $('#got-it').click(function() {
        $("#onboard").fadeOut('fast');
        $("#home").delay(200).fadeIn('fast');
        
        // ----- FIND USER'S LOCATION -----
        // NOTE: this only works when viewing the file in your browser (i.e. file:///Volumes/Mactinosh etc...). 

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
                $('#loc-denied').hide();
            }

            function error(err) {
                // Log error to console
                console.log(err);

                // Set default location to Canberra
                lat = -35.28346;
                lng = 149.12807;
                $('#loc-denied').show();
            }

            // Prompt the user for their location
            navigator.geolocation.getCurrentPosition(success, error);
        };
    });
    
    // ----- NAVIGATION -----
    
    // ----- HOME BUTTON -----
    $('.logo-small').click(function() {
        $("#home").fadeIn('fast');
        $("#about").fadeOut('fast');
    });
    
    // ----- ABOUT BUTTON -----
    $('.about-link').click(function() {
        $("#about").fadeIn('fast');
    });
    
    // ----- BACK BUTTON -----
    // From home page
    $('.back-link.home').click(function() {
        $("#home").fadeOut('fast');
        $("#onboard").fadeIn('fast');
    });
    // From about page
    $('.back-link.about').click(function() {
        $("#about").fadeOut('fast');
    });
    // From select page
    $('.back-link.select').click(function() {
        $("#home").fadeIn('fast');
        $("#select").fadeOut('fast');
    });
    // From results page
    $('.back-link.results').click(function() {
        $("#select").fadeIn('fast');
        $("#results").fadeOut('fast');
    });
    // From error page
    $('.back-link.error').click(function() {
        $("#location-error").fadeOut('fast');
        $("#select").fadeIn('fast');
    });

	
	// ----- GOOGLE MAP API: PLACES LIBRARY -----
	// Attribution policies can be found here: https://developers.google.com/places/web-service/policies
	
	$('#find-places').click(function() {
        
        // Show loading screen
        $("#loading").fadeIn('fast');
        $("#home").fadeOut('fast');
        
        // Remove any previous places
        $("#places").empty();

		var url = 'https://maps.googleapis.com/maps/api/js?key=' + mapKey + '&libraries=places&encoding=json&callback=?',
			service,
			map;
			
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
				
				
				// Set desired place types
				var desiredTypes = ['airport', 'amusement_park', 'aquarium', 'art_gallery', 'bank', 'campground', 'casino', 'cemetery', 'church', 'city_hall', 'courthouse',  'embassy', 'fire_station', 'hindu_temple', 'hospital', 'library', 'local_government_office', 'mosque', 'museum', 'park', 'police', 'post_office', 'school', 'stadium', 'synagogue', 'university', 'zoo', 'colloquial_area', 'country', 'locality', 'natural_feature', 'neighborhood', 'place_of_worship', 'political', 'street_address'];
				var desiredPlace = '';
				
				// Remove any duplicate places from results
				var trimmedResults = eliminateDuplicates(results, 'name');

				// Loop through all nearby place results
				for (var i = 0; i < trimmedResults.length; i++) {
					
					var place = trimmedResults[i].name,
						vicinity = trimmedResults[i].vicinity,
						types = trimmedResults[i].types;
																	
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
						$('#places').append('<button class="place">' + desiredPlace + '</button>');
						
						// Reset desired place  
						desiredPlace = '';
					}
				}
            }
                        
            // Display discovery page
            $("#select").fadeIn('fast');
            
            // Hide loading screen
            loadComplete();
            
            // ----- SELECT PLACE -----
            // K: I think this function needs to be here, AFTER places are appended
            $('.place').click(function() {
                
                // Set place selection
                var locQuery = $(this).html();
                
                // Parse place selection to remove html punctuation code (eg. turn &amp; into &)
                var parsedLocQuery = $.parseHTML(locQuery);
                var place = parsedLocQuery[0].data;
                
                console.log( "Place selected: " + place );
                
                // Remove any previously appended placenames
                $("#loading-place").empty();
                
                // Append placename to error page
                $("#loading-place").append(parsedLocQuery);
                
                // Show loading screen
                $("#discovering").fadeIn('fast');
                
                // Remove any previous results
                $(".all-results").empty();
                $("#place-name").empty();
                
                // Append place name to results page
                $("#place-name").append(place);
                
                // Encode place name for Trove API call (Eg. turn & into %26)
                var encodedPlace = encodeURIComponent(place);

                // Retrieve Flickr pics data from Trove
                trovePics(encodedPlace);
                
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

	function trovePics(place) {
	    
	    var url = 'http://api.trove.nla.gov.au/result?q="' + place + '"%20AND%20%22http://creativecommons.org/licenses/%22%20AND%20nuc:YUF&zone=picture&include=workversions&key=' + troveKey + "&encoding=json&callback=?";
	    
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
	                var versionImg = workArray[i].version[0].record[0].metadata.dc.mediumresolution,
                        versionTitle = workArray[i].title,
                        versionCreator = workArray[i].version[0].record[0].metadata.dc.creator,
                        versionCreatorLink = workArray[i].identifier[0].value,
                        versionDesc = workArray[i].version[0].record[0].metadata.dc.description.value,
                        versionTroveLink = workArray[i].troveUrl;
                    
                    // need to append more data in a hidden div so it can be retrived later when the item is selected
	                $('.all-results').append('<div class="result flickr-result"><div class="img-wrap"><img src="' + versionImg + '" class="result-img"></div><h3 class="result-title">' + versionTitle + '</h3><div class="hide"><a class="creator" href="' + versionCreatorLink + '">' + versionCreator + '</a><p class="snip">' + versionDesc + '</p><a href="' + versionTroveLink + '" class="button"></a></div></div>');
                }
                
                // Retrieve newspaper article data from Trove ('true' indicates there are pic results)
                troveNews(place,true);
	            
	        } else {
                // Just retrieve newspaper article data from Trove ('false' indicates there are NO pic results)
	            troveNews(place,false);
                
                console.log("No picture results");
	        };
	    });
	}
	

	// ----- TROVE API: NEWSPAPER ARTICLES -----

	function troveNews(place,pics) {
	    
	    var url = 'http://api.trove.nla.gov.au/result?q="' + place + '"%20date:[*%20TO%201900]%20NOT%20Advertising&zone=newspaper&reclevel=full&include=articletext&key=' + troveKey + "&encoding=json&callback=?";
	    
        console.log("Newspaper URL: " + url);
        
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
                        newspaper = articleArray[i].title.value,
                        date = moment(articleArray[i].date),
                        newsDate = date.format('Do MMMM YYYY'),
                        newsArticle = articleArray[i].articleText,
						newsText = $(newsArticle).text(),
                        newsTroveLink = articleArray[i].troveUrl;
                    
                    var randNews = randomInt(1,10);
	                
	                // Append to page
                    $('.all-results').append('<div class="result newspaper-result"><div class="img-wrap"><img src="images/newspapers/newspaper' + randNews + '.jpg" class="result-img"></div><h3 class="result-title">' + newsHeading + '</h3><div class="hide"><p id="newspaper-name">' + newspaper + '</p><p id="newsdate">' + newsDate + '</p><p id="news-text">' + newsText + '</p><a class="button" href="' + newsTroveLink + '"></a></div></div>');
                }
	            
	            // Hide place selection page
                $("#select").fadeOut('fast');

                // Display Results page
                $("#results").fadeIn('fast');

                // Hide loading screen
                loadComplete();
	            
	        } else {
                
                console.log("No newspaper results");
                
                // If there are no newspaper results, but there were picture results
                if (pics == true) {
                    
                    // Hide place selection page
                    $("#select").fadeOut('fast');
                    
                    // Display Results page
                    $("#results").fadeIn('fast');
                    
                    loadComplete();
                    
                // If there are no results at all
                } else {
                    // Hide place selection page
                    $("#select").fadeOut('fast');
                    // Remove any previously appended placenames
                    $("#errorPlace").empty();
                    // Append placename to error page
                    $("#errorPlace").append(decodeURIComponent(place));
                    // Show error message
                    $("#location-error").fadeIn('fast');

                    loadComplete();
                }
	        };
	    });
	}
	
	// ----- API CALL COMPLETE -----

	function loadComplete() {
	    // Hide loading screens
	    $("#loading").fadeOut('fast');
	    $("#discovering").fadeOut('fast');
        
        // randomise the results, source: http://jsfiddle.net/C6LPY/2/
        $(function () {
            var parent = $('.all-results');
            var divs = parent.children();
            while (divs.length) {
                parent.append(divs.splice(Math.floor(Math.random() * divs.length), 1)[0]);
            }
        });
	}
    
    // ----- NO RESULTS - BACK TO PLACE SELECTION -----

    $('#noresultsBack').click(function() {
	    // Hide error message
        $("#location-error").fadeOut('hide');
        // Show place selection page
        $("#select").fadeIn('show');        
	});
	
	// ----- GENERATE RANDOM WHOLE NUMBER -----
	
	function randomInt(minNum,maxNum) {
	    return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
	};

	// ----- REMOVE DUPLICATE PLACES FROM RESULTS -----

	function eliminateDuplicates(originalArray, objKey) {
	
		var trimmedArray = [];
		var values = [];
		var value;
	
		for(var i = 0; i < originalArray.length; i++) {
	    	value = originalArray[i][objKey];
	
			if(values.indexOf(value) === -1) {
				trimmedArray.push(originalArray[i]);
				values.push(value);
	    	}
		}
	
		return trimmedArray;
	}
	
}); // close document ready


// SELECT FLICKR RESULT (can't put in (document).ready as not in the DOM when page loaded)
$('body').on('click', '.flickr-result', function () {
    $('#results').fadeOut('fast');
    $('#flickr').fadeIn('fast');
    
    // find the data of the selected Flickr result
    var thisImg = $(this).find('.result-img').attr('src'),
        thisTitle = $(this).find('.result-title').text(),
        thisCreator = $(this).find('.creator').text(),
        thisCreatorLink = $(this).find('.creator').attr('href'),
        thisDesc = $(this).find('.snip').text(),
        thisTroveLink = $(this).find('.button').attr('href');
    
    // append to new result screen
    $('.artefact-img').attr('src', thisImg);
    $('#artefact-title').text(thisTitle);
    $('#contributor').html('Contributed by <a href="' + thisCreatorLink +'" target="_blank">' + thisCreator + '</a>');
    if (thisDesc != 'undefined') {
        $('#desc').text(thisDesc);
    }
    $('.result-button').attr('href', thisTroveLink);
    
});

$('body').on('click', '.newspaper-result', function() {
    $('#results').fadeOut('fast');
    $('#newspaper').fadeIn('fast');
    
    // find the data of the select newspaper result
    var thisHeading = $(this).find('.result-title').text(),
        thisNewspaper = $(this).find('#newspaper-name').text(),
        thisDate = $(this).find('#newsdate').text(),
        thisArticle = $(this).find('#news-text').text(),
        thisTroveLink = $(this).find('.button').attr('href');
        
    // append to new result screen
    $('#newspaper-title').text(thisHeading);
    $('#news-name').text(thisNewspaper);
    $('#date').text(thisDate);
    $('#newspaper-desc').text(thisArticle);
    $('.result-button').attr('href', thisTroveLink);
        
});

// BACK LINK FOR FLICKR RESULT
$('.back-link.flickr').click(function() {
    $('#flickr').fadeOut('fast');
    $('#results').fadeIn('fast');
});

// BACK LINK FOR NEWSPAPER RESULT
$('.back-link.newspaper').click(function() {
    $('#newspaper').fadeOut('fast');
    $('#results').fadeIn('fast');
});