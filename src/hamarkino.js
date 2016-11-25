(function() {

	var allShows, 
	    titles, 
	    showsDict = {}, 
	    hours = {},
	    table,
	    tablePlacement;

	function getText(container, selector) {
		var elm = container.find(selector);
		var txt = elm.text();
		return txt.trim();
	}
	function getTitle(container, selector) {
	    var title = getText(container, selector);
	    //Sometimes, version info (2D/3D, dubbed/original) is added in parenthesis. We show version info separately.
	    title = title.split('(')[0];
	    return title.trim();
	}
	function parseShowsFrontPage() {
	    var allShows = [];
    	$('.programMovie').each(function() {
    		var container = $(this);
    		var show = {
    			poster: container.find('.posterContainerInner>a'),
    			title: getTitle(container, 'h4'),
    			time: getText(container, '.showStart'),
    			length: getText(container, '.facts span:first-child'),
    			/*
    			screen: getText(container, '.screenName'),
    			version: getText(container, '.version')
    			*/
    			info: container.find('.ticketButton')
    		};
            allShows.push(show);
    	});
    	return allShows;
	}
	function parseShowsProgramPage() {
	    var allShows = [];
    	$('.programMovie').each(function() {
    		var movie = $(this);
    		
    		var shows = movie.find('.ticketButtonContainer');
    		shows.each(function() {
    		    var show = $(this);
        		var parsed = {
        			//poster: movie.find('.posterContainer>a'),
        			poster: movie.find('.movieInfo .posterContainer a'),
        			title: getTitle(movie, 'h3'),
        			time: getText(show, '.showStart'),
    			    length: getText(movie, '.facts span:last-child'),
        			info: show.find('.ticketButton')
        		};
        		
        		allShows.push(parsed);
    		});
    	});
        return allShows;
	}
	

    if($('#programFrontpageContainer').length) {
    	//Stop the image slider at the top (front page only) from changing height and pushing the rest of the page up or down:
    	var caro = $('.carouselContainer');
    	caro.height(caro.height());
    	
        allShows = parseShowsFrontPage();
        tablePlacement = function(t) { $('.programLinks').after(t); };
    }
    else {
        allShows = parseShowsProgramPage();
        tablePlacement = function(t) { $('#programContainer').prepend(t); };
    }
    //console.log('allShows', allShows);
    //Kinodagen:
    allShows.forEach(function(show) {
        console.log(show.title +'\t'+ show.length +'\t'+ getText(show.info, '.screenName') +'\t'+ show.time);
    });

	allShows.forEach(function(show) {
		var title = show.title;
		
		if(showsDict[title]) {
			showsDict[title].push(show);
		}
		else {
			showsDict[title] = [show];
		}

		hours[show.time.split(':')[0]] = '';
	});

	titles = Object.keys(showsDict);
	hours = Object.keys(hours);
	hours.sort();

	table = $('<table>', { class: 'abo-overview' }).css({ 'min-width': (titles.length*70)+'px' });
	function createTR() {
		var tr = $('<tr>').appendTo(table);
		return tr;
	}
	function createTD(tr) {
		var td = $('<td>').appendTo(tr);
		return td;
	}
	for(var r=0; r<hours.length; r++) {
		//Header row:
		if(r === 0) {
			var header = createTR();
			createTD(header);
			
			titles.forEach(function(title) {
				var poster = showsDict[title][0].poster.clone();
				poster.append('<div>' +title+ '</div>');
				createTD(header).append(poster);
			});
		}

		var hour = hours[r];
		
		var row = createTR();
		createTD(row).text(hour);

		titles.forEach(function(title) {
			var cell = createTD(row)
		
			var shows = showsDict[title].filter(function(show) { return (show.time.split(':')[0] === hour) });
			shows.forEach(function(show) {
				var info = show.info.clone();
				var screen = info.find('.screenName');
				//"Sal 3" -> "3"
				screen.text(screen.text().slice(4));
				
				//http://stackoverflow.com/questions/2596833/how-to-move-child-element-from-one-parent-to-another-using-jquery
				info.find('.showStart').after(screen);
				
				cell.append(info);
			});
		});
	}

    //console.log(table);
	tablePlacement(table);

})();