(function() {
    var selector = prompt('CSS selector to cover up:', '.annoying');
    if(!selector) { return; }

    var d = document, s = d.createElement('style');

    var css = selector+' { display:block; position:relative; }' + 
              selector+'::after { content:""; display:block; position:absolute; top:0;left:0;bottom:0;right:0; background:yellow; }' + 
              selector+':hover::after { display:none; }';

    //http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
    //http://jonraasch.com/blog/javascript-style-node
    s.type = 'text/css';
    if (s.styleSheet){
        s.styleSheet.cssText = css;
    } else {
        s.appendChild(d.createTextNode(css));
    }
    d.head.appendChild(s);
})();