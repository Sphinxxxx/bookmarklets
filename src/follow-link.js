(function(undefined) {
	var _linkSelector;

	function findLink(doc) {
		var link = doc.querySelector(_linkSelector);
		if(link) {
			link = link.getAttribute('href');
		}
		return link;
	}
	
	function followLink(link) {
		if(!link) {
			console.log('No further link found.');
			return;
		}
		console.log('Following link: ' + link);

		//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Making_fetch_requests
		fetch(link)
			.then(response => response.text())
			.then(html => {
				var parser = new DOMParser();
				var fetchedDoc = parser.parseFromString(html, "text/html");
				//console.log(fetchedDoc, fetchedDoc.querySelector('.next'));

				//Find the next link *before* we rip this document apart:
				var nextLink = findLink(fetchedDoc);

				document.body.appendChild(fetchedDoc.body);
				followLink(nextLink);
			});
	}

	_linkSelector = prompt('(Recursive) link selector:', '.next');
	if(_linkSelector) {
		followLink(findLink(document));
	}
	
})();