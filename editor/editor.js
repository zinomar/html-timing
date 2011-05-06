var _STATE = ""; // "cleared", "created", "playing"
var _SLIDESHOW;  
var _TIMESHEET;           
var _FROM;     

function preloadTimeSheet () { 
  var timesheets; 
  _TIMESHEET = document.getElementsByTagName("timesheet")[0];
  if (! _TIMESHEET) {
    timesheets = QWERY.selectExtTimesheets();
    if (timesheets.length > 0) {
      if (window.ActiveXObject) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
        xhr.open("GET", timesheets[0].href, true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            // overrideMimeType("text/xml") doesn't work on IE6
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.loadXML(xhr.responseText);
            var tsNodes = xmlDoc.getElementsByTagName("timesheet");
            if (tsNodes && tsNodes.length) {
              _TIMESHEET = tsNodes[0];
            } else {
              alert('Failed to load timesheet file ' + timesheets[0].href);
            }
          }
        };
        xhr.send(null);
      }
      else if (window.XMLHttpRequest) {
        // note that Chrome won't allow loading any local timesheet with XHR
        xhr = new XMLHttpRequest();
        xhr.overrideMimeType("text/xml");
        xhr.open("GET", timesheets[0].href, true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            var tsNodes = xhr.responseXML.getElementsByTagName("timesheet");
            if (tsNodes && tsNodes.length) {
              _TIMESHEET = tsNodes[0];
            } else {
              alert('Failed to load timesheet file ' + timesheets[0].href);
            }
          }
        };
        xhr.send(null);
      }        
    }
    else {
      alert('Missing timesheet !');
    }
  }
}

function playOnDemand() {                 
  var cur, pl = document.getElementById("slideshow");

  // Resets previous slide show
  if (_STATE === "done") {
  	while (cur = pl.firstChild) {
  		pl.removeChild (cur);
  	}    
    _SLIDESHOW.erase();    
  } else {                 

  }
  
  // Swaps editor / player views
  var ed = document.getElementById("editor");
  var nav = document.getElementById("nav");
  nav.style.display = 'block';    
  ed.style.display = 'none';
  pl.style.display = 'block';
               
  // Generates current slideshow document inside a temporary <div>
  var dump = new xtiger.util.DOMLogger ();
  _FORM.serializeData (dump);
  var xmlString = dump.dump();                    
  var slidesTxt = xmlString.substring(11, xmlString.indexOf('</slideshow>'));
  var tmp = document.getElementById('nomansland');    
  tmp.innerHTML = slidesTxt;
               
  // Transfers the temporary <div> content inside the player's <div>
	while (cur = tmp.firstChild) {
		tmp.removeChild (cur); // FIXME: maybe useless (DOM API removes nodes when moving them) ?
		pl.appendChild (cur); // FIXME: maybe no cross-browser !!! 
	}    
  
  // Starts SMIL library
  _SLIDESHOW = document.createTimeContainer(pl);
  if (! _TIMESHEET) {
    alert('Timesheet missing, playing anyway...');
  } else {
    document.applyTimeSheet(_TIMESHEET);
  }
  _SLIDESHOW.show();
  EVENTS.trigger(window, "SMILContentLoaded");
  document.bindNavControls(_SLIDESHOW, "arrows; hash");
  
  // Adjusts Play / Edit UI
  n = document.getElementById('gotoPlay');
  n.style.display = 'none';
  n = document.getElementById('gotoEdit');
  n.style.display = 'inline';

  _STATE = "done";
}               

function editOnDemand() {     
   
  // Swaps editor / player views    
  var ed = document.getElementById("editor");
  var pl = document.getElementById("slideshow");
  var nav = document.getElementById("nav");
  nav.style.display = 'none';
  pl.style.display = 'none';
  ed.style.display = 'block';
  
  // Adjusts Play / Edit UI
  n = document.getElementById('gotoEdit');
  n.style.display = 'none';
  n = document.getElementById('gotoPlay');
  n.style.display = 'inline';    

  // Returns full control to editor
  document.unbindNavControls(_SLIDESHOW, "arrows; click");
}                 

function dump () {
  var dump = new xtiger.util.DOMLogger ();
  _FORM.serializeData (dump);
  var xmlString = dump.dump();
  var n = document.getElementById('content');
  n.firstChild.data = xmlString;
}                     

function init(templatefn, datafn) {     
    preloadTimeSheet();
    var result= new xtiger.util.Logger();
  	var xtDoc = xtiger.cross.loadDocument(templatefn, result);
  	if (! result.inError()) {	
      _FORM = new xtiger.util.Form('../axel/bundles');
      _FORM.setTemplateSource(xtDoc);
    	_FORM.setTargetDocument (document, 'template', true);      
      _FORM.enableTabGroupNavigation();
      if (! _FORM.transform()) { 
        alert(this ._FORM.msg); 
      } else {                 
        var data = xtiger.cross.loadDocument(datafn, result);
        if (data) {
          var dataSrc = new xtiger.util.DOMDataSource(data);
          _FORM.loadData(dataSrc, result);
        }
        
      }  
    }
    if (result.inError()) { alert(result.printErrors()); }  
}                                                        

               

