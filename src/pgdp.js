(function() {
    function doIt() {
        var $ = jQuery;
    
    	var d = document,
    		paragraphStart,
    		selectSpaces,
    		startsWithParagraph,
    		selectionModeActive = true;
    	

        //
    	//  Step 1: If frames, navigate to full-screen:
    	//
    	
    	var frame1 = window.frames['proofframe'];
    	if(frame1) {
    		var frame2 = frame1.frames['textframe'];
    		window.location = frame2.location;
    		return;
    		//d = frame2;
    	}
    	
    
        //
    	//  Step 2: In full-screen, create image editor:
    	//
    	
    	var form = $('form#editForm', d);
    	var text = $('#text_data', d);
    	var sourceImgUrl = $('a[target="lg_image"], d').attr('href');

    	//Auto-fixes:
    	var t = text.val();
    	
    	//Spaces: Before punctuation...
    	t = t.replace(/\s+\;/g, ';');
    	t = t.replace(/\s+\?/g, '?');
    	t = t.replace(/\s+\!/g, '!');
    	//...or two or more in a row...
    	t = t.replace(/[ \t]+/g, ' ');
    	//...or at the start or end of a line:
    	t = t.replace(/^[ \t]+/gm, '');
    	t = t.replace(/[ \t]+$/gm, '');

    	//We can't just remove spaces around all quotes, because we don't know which side the quotation is on,
    	//but we can at least remove space around those that are at the start or end of a line:
    	t = t.replace(/^'\s+/gm, "'");
    	t = t.replace(/^"\s+/gm, '"');
    	t = t.replace(/\s+'$/gm, "'");
    	t = t.replace(/\s+"$/gm, '"');

    	//End-of-line hyphens that need to be joined:
    	t = t.replace(/\-$/gm,	"-****");
    	
    	text.val(t);
    	
    	
    	//Source image with tools:
    	var source =			$('<div>', { id: 'source' });
    	var imgWrapper =		$('<div>', { id: 'img-wrapper' });
    	var paragraphs =		$('<div>', { id: 'paragraphs' });
    	var paragraphPreview =	$('<div>', { id: 'paragraph-preview' });
    	var mergedArea =		$('<div>', { id: 'merged-lines' });
    	var refArea =           $('<div>', { id: 'reference' });
    	
    	var img = $('<img>', { src: sourceImgUrl, width: '100%' });
    	img.load(function() {
    		text.css('min-height', (img.height()-150)+'px');
    	});
    	
    	source.append(imgWrapper.append(img)
    							.append(paragraphs)
    							.append(paragraphPreview)
    							.append(mergedArea));
    	form.before(source);
    	form.after(refArea);
    	form.parent().css('white-space', 'nowrap');

    
    	var controlsTop = $(`<div id="tools-top">
    		<div id="marker-margin-left" class="marker-margin" ></div>
    		<div id="marker-margin-left-indent" class="marker-margin" ></div>
    		<div id="selection-settings">
    			<label>
    				<input type="radio" name="selection-mode" id="selection-select-spaces" checked >
    				Mark spaces between paragraphs
    			</label>
    			<label>
    				<input type="radio" name="selection-mode" >
    				Mark paragraphs
    			</label>
    			<button id="selection-clear" >Clear selection</button>
    		</div>
    	</div>`);
    	var controlsBottom = $(`<div id="tools-bottom">
    		Make sure all the text is selected, and...
    		<button id="merge" >Merge lines</button>
    	</div>`);
    	source.prepend(controlsTop)
    		  .append(controlsBottom);
    			 
        //
    	//  Step 3: Mark each paragraph in the source image
    	//
    	function clearSelection() {
    		paragraphs.empty();
    		mergedArea.empty();
    		paragraphStart = undefined;
    		selectionModeActive = true;
    	}
    	function findElementXY(element, clientX, clientY) {
    		var elementBounds = element.getBoundingClientRect();
    		var xy = {  x: clientX - elementBounds.left,
    					y: clientY - elementBounds.top };
    		return xy;
    	}
    	
    	selectSpaces = d.querySelector('#selection-select-spaces');
    	$('#selection-clear').click(clearSelection);
    	
    	function markParagraph(endY) {
    		if(paragraphStart) {
    			paragraphPreview.removeAttr('style');
    			
    			var ui = $('<div>', { class: 'paragraph-overlay', 
    								  css: { top: paragraphStart, height: (endY-paragraphStart) }
    								});
    			paragraphs.append(ui);
    			paragraphStart = undefined;
    		}
    	}
    	imgWrapper.mousedown(function(e) {
    		if(!selectionModeActive) { return; }
    		var mousePos = findElementXY(this, e.clientX, e.clientY);
    		console.log('mousedown', e, mousePos);
    
    		if(selectSpaces.checked) {
    			//We're about to mark a new space, meaning we're done with another paragraph:
    			markParagraph(mousePos.y);
    		}
    		else {
    			paragraphStart = mousePos.y;
    		}
    	});
    	imgWrapper.mousemove(function(e) {
    		if(!selectionModeActive) { return; }
    		if(paragraphStart) {
    			var mousePos = findElementXY(this, e.clientX, e.clientY);
    			paragraphPreview.css({ top: paragraphStart, height: (mousePos.y-paragraphStart) });
    		}
    	});
    	imgWrapper.mouseup(function(e) {
    		if(!selectionModeActive) { return; }
    		var mousePos = findElementXY(this, e.clientX, e.clientY);
    		//console.log('mouseup', mousePos);
    
    		if(selectSpaces.checked) {
    			paragraphStart = mousePos.y;
    		}
    		else {
    			markParagraph(mousePos.y);
    		}
    	});
    	
    	
    	//
    	//  Step 4: Make room for, and insert textboxes under each line in the source image
    	//
    	function distributeLines() {
    		if(selectionModeActive) { return; }
    		console.log('Distributing lines...');
    
    		var textLines = text.val().split('\n').map(function(l) { return l.trim() }),
    			textParagraphs = [],
    			currParagraph = [];
    			
    		startsWithParagraph = (textLines[0] === '');
    		//console.log(startsWithParagraph, textLines);
    		
    		mergedArea.empty();
    			
    		textLines.forEach(function(l) {
    			//Double newline -> end of paragraph:
    			if(currParagraph.length && !l.length) {
    				textParagraphs.push(currParagraph);
    				currParagraph = [];
    			}
    			else if(l.length) {
    				currParagraph.push(l);
    			}
    		});
    		if(currParagraph.length) {
    			textParagraphs.push(currParagraph);
    		}
    		//console.log(textParagraphs);
    		
    		//http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
    		var imgParagraphs = $('.paragraph-overlay').sort(function(x, y) { return parseInt(x.style.top) - parseInt(y.style.top); });
    		//console.log(imgParagraphs);
    		
    		if(imgParagraphs.length !== textParagraphs.length) {
    			alert('Paragraph mismatch: Image has ' +imgParagraphs.length+ ' paragraphs, while text has ' +textParagraphs.length+ '.');
    			return;
    		}
    		
    		var imgHeight = img.height();
    		var imgWidth = img.width();
    		function addImageLine(container, lineTop, lineBottom) {
				/* Use canvas instead, to sample colors and find where the text starts and stops...
    			var mergedImgLine = $('<div>', {
    				class: 'merged-line', 
    				//The mergedArea div somehow changes the page layout slightly.
    				//Because we use pixel background positioning, we must lock the div to be as wide as the original image...
    				width: imgWidth, 
    				height: (lineBottom - lineTop)
    			});
    			mergedImgLine.css({ 'background-image': "url('" +sourceImgUrl+ "')", 
    			                    'background-position': 'center -' + lineTop + 'px' });
    			container.append(mergedImgLine);
    			*/
				
				//http://stackoverflow.com/questions/8751020/how-to-get-a-pixels-x-y-coordinate-color-from-an-image
				var canvas = document.createElement('canvas');
				canvas.width = imgWidth;
				canvas.height = (lineBottom - lineTop);

                var imgElm = img[0];
				var zoom = imgElm.naturalWidth/imgWidth;
				canvas.getContext('2d').drawImage(imgElm, 
												  0,lineTop*zoom,	canvas.width*zoom,canvas.height*zoom,
												  0,0,				canvas.width,canvas.height);
				var textRange = findTextRange(canvas)
				$(canvas).data('textrange', textRange);
				
				container.append(canvas);
				return textRange;
    		}
			function findTextRange(canvas) {
				var ctx = canvas.getContext('2d'),
					w = canvas.width,
					h = canvas.height,
					sampleRows = 2;

				function searchPixelRow(y) {
					var firstDarkX, lastDarkX;
					y = Math.floor(y);
					
					var row = ctx.getImageData(0,y, w,1).data;
					for(var x=0; x<w; x++) {
						var gray = row[x*4];
						if(gray < 130) {
							if(!firstDarkX) { firstDarkX = x; }
							lastDarkX = x;
						}
					}

					return [firstDarkX, lastDarkX];
				}

				var textStartX = w, 
					textEndX = 0,
					sampleDistance = h/(sampleRows+1);
				for(var r=1; r<=sampleRows; r++) {
					var y = sampleDistance * r;
					var sample = searchPixelRow(y);
					textStartX = Math.min(textStartX, sample[0]);
					textEndX = Math.max(textEndX, sample[1]);
				}
				
				return [textStartX, textEndX-textStartX];
			}
	
    		var imgPosY = 0;
    		imgParagraphs.each(function(i) {
    			var imgParTop = parseInt(this.style.top)+2;
    			//Gap between paragraphs:
    			if(imgParTop > imgPosY) {
    			    addImageLine(mergedArea, imgPosY, imgParTop);
    			    imgPosY = imgParTop;
    			}
    			
    			var textPar = textParagraphs[i];
    			var imgLineHeight = this.clientHeight/textPar.length;
    			
    			var mergedPar = $('<div>', { class: 'merged-paragraph' });
    			textPar.forEach(function(t, j) {
    				var imgLineTop = imgPosY;
    				var imgLineBottom = imgParTop + (imgLineHeight * (j+1));
					var textRange = addImageLine(mergedPar, imgLineTop, imgLineBottom);
					
					var textStyle = { 'margin-left': (textRange[0]-2)+'px', 
									   width: (textRange[1]+10)+'px' };
					var mergedTextLine = $('<input>', { value: t, css: textStyle })
							.on('input', function() { setLetterSpacing(this); collectText(); });
    				mergedPar.append(mergedTextLine);
    				
    				imgPosY = imgLineBottom;
    			});
    			
    			mergedArea.append(mergedPar);
    		});
    		addImageLine(mergedArea, imgPosY, imgHeight);
    		
			setLetterSpacingAll();
    	}
    	
		function setLetterSpacingAll() {
			$('.merged-paragraph input').each(function() {
				setLetterSpacing(this);
			});
		}
		function setLetterSpacing(textbox) {
			if(!textbox.scrollWidth) {
				console.log(textbox.value, " - Can't find textbox width. Not loaded/rendered yet?");
			}
		
			var targetWidth = textbox.clientWidth;
			//console.log(textbox.value, targetWidth);
			
			var letterSpacing = parseFloat(textbox.style.letterSpacing) || 0;
			function tryLetterSpacing() {
				textbox.style.letterSpacing = letterSpacing+'em';
				//console.log('..spacing', letterSpacing, '->', textbox.scrollWidth);
			}
			while(textbox.scrollWidth <= targetWidth) {
				letterSpacing += 0.1;
				tryLetterSpacing();
			}
			while(textbox.scrollWidth > targetWidth) {
				letterSpacing -= 0.01;
				tryLetterSpacing();
			}
		}

    	function collectText() {
    		if(selectionModeActive) { return; }
    		console.log('Collecting text...');
    	
    		var collected = startsWithParagraph ? '\n' : '';
    		collected += $('.merged-paragraph').map(function() {
    			var p = $(this).find('input').map(function() {
    				return $(this).val();
    			}).get().join('\n');
    			
    			return p;
    		}).get().join('\n\n');
    		
    		//console.log(collected);
    		text.val(collected);
    	}
    	
    	text.on('input', distributeLines);
    	$('#merge').click(function() {
    		selectionModeActive = false;
    		distributeLines();
    		
    		//Debug: Programmatic changes don't fire the input event:
    		//setInterval(function() { text.value = '123\n' + text.value; }, 1000);
    	});
    
        
        //
        //  Step 5: Create an area for a reference text with diffing functionality
        //
        (function($, textOCR, refPanel) {
            var textRef =       $('<textarea>', { id: 'text-ref' }),
                doDiff  =       $('<button>', { id: 'do-diff', text: 'Diff' }),
                diffResult =    $('<div>', { id: 'diff-result' });

            function loadLocal() {
                textRef.val(localStorage.abo_textref || textRef.value);
            }
            function storeLocal() {
                localStorage.abo_textref = textRef.val();
            }
            
            function diffTexts() {
                storeLocal();
                
        		//http://ejohn.org/projects/javascript-diff-algorithm/
        		//
        		//We pass the textarea arguments in this order 
        		//to preserve the paragraph breaks from textOCR in diffHtml.
        		//
                var diffHtml = diffString(textRef.val(), textOCR.val());
                diffResult.html(diffHtml);
            }
            
            //Init
            refPanel.append(textRef)
                    .append(doDiff)
                    .append(diffResult);
            loadLocal();
        
            doDiff.click(diffTexts);
            diffResult.click(function(e) {
                //https://developer.mozilla.org/en-US/docs/Web/API/Event/target
                //http://www.javascripter.net/faq/eventtargetsrcelement.htm
                var target = e.target || e.srcElement;
                
                function nodeHasName(node, names) {
                    if(!(node && names)) { return false; }
                    
                    if(Array.isArray(names)) {
                        return (names.indexOf(node.localName) >= 0);
                    }
                    return (node.localName === names);
                }
                
                //Replace the "wrong" text in t1 with the "correct" text in t2:
                if(nodeHasName(target, ['ins', 'del'])) {
                    console.log(target);
                    
                    //"target" may be only one of many consecutive <ins> tags if the diff spans more than one word,
                    //and similarly, there may be more than one corresponding <del> tag:
                    //
                    //  t1: I did it my way
                    //  t2: I do things my way
                    //  diff: I <del>did </del><del>it </del><ins>do </ins><ins>things </ins> my  way
                    //
        
                    //Move to the end of the <ins> tags, find 'textAfter',
                    //then move backwards and build 'correctText' from all <del>s
                    //and 'wrongText' from all <ins>s, and then find 'textBefore'...
                    var nodeSearch = target,
                        textCorrect, textWrong,
                        textBefore, textAfter;
                    
                    function textIfTextNode(node) {
                        if(node && (node.nodeType === Node.TEXT_NODE)) {
                            return node.textContent;
                        }
                        return '';
                    }
                    function collectNodeText(nodeName) {
                        var text = '';
                        while(nodeSearch && (nodeSearch.localName === nodeName)) {
                            text = nodeSearch.textContent + text;
                            nodeSearch = nodeSearch.previousSibling;
                        }
                        return text;
                    }
        
                    //Move past the *current* <del>/<ins> pair...
                    while(nodeHasName(nodeSearch.nextSibling, 'del')) {
                        nodeSearch = nodeSearch.nextSibling;
                    }
                    while(nodeHasName(nodeSearch.nextSibling, 'ins')) {
                        nodeSearch = nodeSearch.nextSibling;
                    }
                    //..and then collect all text as described above:
                    textAfter = textIfTextNode(nodeSearch.nextSibling);
                    textWrong = collectNodeText('ins');
                    textCorrect = collectNodeText('del');
                    textBefore = nodeSearch ? nodeSearch.textContent : '';
                    
                    //console.log(textBefore + textWrong + textAfter, '-->',
                    //            textBefore + textCorrect + textAfter);
                    
                    
                    if(textBefore || textAfter) {
                        function getWords(text) {
                            var words = text.replace(/\s+/g, ' ').trim().split(' ');
                            return words;
                        }
                        function escapeRegex(str) {
                            //http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
                            return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                        };
                        
                        //What's inside the <del> and <ins> tags (textWrong/textCorrect) can be compared as-is,
                        //but the surrounding text may be formatted (whitespaced) differently than the original text:
                        var wordsBefore = getWords(textBefore);
                        var wordsAfter  = getWords(textAfter);
                        
                        var regexSearch = '('+ wordsBefore.map(escapeRegex).join('\\s+') +'\\s*)' +
                                          escapeRegex(textWrong) +
                                          '(\\s*'+ wordsAfter.map(escapeRegex).join('\\s+') +')';
                        var regexReplace = '$1' + textCorrect + '$2';
                        console.log(regexSearch, '->', regexReplace);
                        
                        //Update t1 and run a new diff:
                        textOCR.val(textOCR.val().replace(new RegExp(regexSearch), regexReplace));
                        diffTexts();
                    }
                    else {
                        console.log("Can't find a wider string to search for. Confused by too many diffs(?)");
                    }
        
                }
            });

        })(jQuery, text, refArea);
    
    }
    
    var addedDependencies = false;
    function init() {
        if(window.jQuery && window.diffString) {
            doIt();
        }
        else {
            if(addedDependencies) {
                console.log('Waiting for jQuery & diffString... Script(s) missing?');
            }
            else {
                var d = document, b = d.body, s;
                var s = d.createElement("script"); s.src = "https://code.jquery.com/jquery-1.11.3.min.js";
                b.appendChild(s);
                var s = d.createElement("script"); s.src = "http://ejohn.org/files/jsdiff.js";
                b.appendChild(s);
                
                addedDependencies = true;
            }
            setTimeout(init, 200);
        }
    }
    init();

})();