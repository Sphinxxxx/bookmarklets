(function() {
  var d = document,
      b = d.body;

  //https://developer.mozilla.org/en/docs/Web/API/HTMLScriptElement
  function addScripts(srcs, callback) {
    if(srcs.length === 0) {
      callback();
    }
    else {
      var script = d.createElement("script"),
          src = srcs[0];

      //script.onerror = loadError;
      script.onload = () => addScripts(srcs.slice(1), callback);

      b.appendChild(script);
      script.src = src;
    }
  }
  function addCSS(href) {
    var css = b.appendChild(d.createElement('link'));
    css.rel = 'stylesheet';
    css.href = href;
  }
  
  
  var text = d.activeElement,
      tag = text.nodeName.toLowerCase();
  if(tag !== 'textarea') {
    alert('Select/focus a <textarea>. ' + tag + ' is not a textarea.');
    return;
  }
  var mode = prompt('Syntax mode', 'javascript');
  
  function setCode() {
    //if(!window.CodeMirror) { return; }
    //clearInterval(poller);
    
    CodeMirror.fromTextArea(text);
  }
  
  if(window.CodeMirror) {
    setCode();
  }
  else {
    addCSS("//cdnjs.cloudflare.com/ajax/libs/codemirror/5.24.2/codemirror.min.css");
    addScripts(["//cdnjs.cloudflare.com/ajax/libs/codemirror/5.24.2/codemirror.min.js",
                //"//cdnjs.cloudflare.com/ajax/libs/codemirror/5.24.2/mode/javascript/javascript.min.js",
                "//cdnjs.cloudflare.com/ajax/libs/codemirror/5.24.2/mode/"+mode+"/"+mode+".min.js"],
              setCode);
  }
  //var poller = setInterval(setCode, 500);
  
})();
