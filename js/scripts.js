$(document).ready(function() {
	
	
	// ----- GLOBAL VARIABLES -----

	var troveKey = 'jg79p9ghks94tkd3',
		search = $( "#locSearch" );
		
			
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