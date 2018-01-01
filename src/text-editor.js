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
  var mode = prompt('Syntax mode', localStorage.bm_te_mode || 'javascript');
  //http://stackoverflow.com/questions/12864582/javascript-prompt-cancel-button-to-terminate-the-function
  if(mode === null) { return; }
  
  localStorage.bm_te_mode = mode;
  
  
  function setCode() {
    var cm = CodeMirror.fromTextArea(text, {
      lineNumbers: true,
      mode: mode,
      theme: 'mdn-like'
    });

    if(window.cmResize) {
      cmResize(cm);
    }
  }
  
  if(window.CodeMirror) {
    setCode();
  }
  else {
    addCSS("//cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/codemirror.min.css");
    addCSS("//cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/theme/mdn-like.min.css");

    addScripts(
      [
        "//cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/codemirror.min.js",
        //"//cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/mode/javascript/javascript.min.js",
        "//cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/mode/"+mode+"/"+mode+".min.js",
        "//cdn.rawgit.com/Sphinxxxx/cm-resize/v0.1/src/cm-resize.js",
      ],
      setCode
    );
  }
  
})();
