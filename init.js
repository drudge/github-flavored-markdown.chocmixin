/*!
 * Github Flavored Markdown mixin for Chocolat
 * Copyright(c) 2012 Nicholas Penree <nick@penree.com>
 * MIT Licensed
 */
 
/**
 * Module dependencies.
 */

var ghm = require("github-flavored-markdown")
  , request = require('request');

function getMarkdown(text, cb) {
  request({
      url: 'https://api.github.com/markdown/raw'
    , method: 'POST'
    , headers: {
        'Content-Type': 'text/x-markdown'
      }
    , body: text
  }, function(err, r, body) {
    if (err || r.statusCode !== 200 || !body) {
      body = ghm.parse(text);
    }
    
    cb(body);
  });
}

/**
* Hook up menu items.
*/

//TODO: This seems to create a duplicate Markdown menu item. The first time it adds the 
//      item to the new menu, all subsequent reloads put it under the existing one.
Hooks.addMenuItem('Actions/Markdown/Preview Github Flavored Markdown', 'cmd-alt-p', function() {
  var doc = Document.current()
    , win = new Window()
    , html = "";

  if (doc.rootScope() !== 'html.markdown.text') {
    Alert.beep();
    return;
  }

  win.title = doc.displayName();
  win.htmlPath = "preview.html";
  win.run();

  getMarkdown(doc.text, function(html) {    
    if (html) {
      win.applyFunction(function (data) { 
        document.body.innerHTML = data;
      }, [html]);
    }

    win.setFrame({x: 0, y: 0, width: 750, height: 750}, false);
    win.center();
  });
});

Hooks.addMenuItem('Actions/Markdown/Convert Github Flavored Markdown to HTML', 'cmd-alt-shift-p', function() {
  var doc = Document.current();
  
  if (doc.rootScope() !== 'html.markdown.text') {
    Alert.beep();
    return;
  }
  
  getMarkdown(doc.text, function(html) {    
    if (!html) {
      Alert.beep();
      return;
    }
    
    Document.open(null, MainWindow, function(newdoc) {
      if (typeof newdoc === 'string') {
        newdoc = new Document(newdoc);
      }
      
      try {
        var editors = newdoc.editors();
        
        if (editors.length) {
          Recipe.runOn(editors[0], function(r) {
            r.text = html;
          });
        }
      } catch (err) {
        Alert.beep();
      }
    });
  });
});