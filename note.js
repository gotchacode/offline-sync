var editor, statusline, savebutton, idletimer;

window.onload = function () {
	"use strict";
	if (localStorage.note === null) localStorage.note = "";
	if (localStorage.lastModified === null) localStorage.lastModified = 0;
	if (localStorage.lastSaved === null) localStorage.lastSaved = 0;

	editor = document.getElementById("editor");
	statusline = document.getElementById("statusline");
	savebutton = document.getElementById("savebutton");

	editor.addEventlistener("input",
							  	function(e) {
									localStorage.note = editor.value;
									localStorage.lastModified = Date.now();
									if (idletimer) clearTimeout(idletimer);
									idletimer = setTimeout(save, 5000);
									savebutton.disabled = false;
								}, false);

								sync();
};



window.onbeforeunload = function () {
		"use strict";
		if ( localStorage.lastModified > localStorage.lastSaved)
			save();
};

window.onoffline = function () { status('Offline');}

window.ononline = function () { sync();};


window.applicationCache.onupdateready = function () {
		status("A new version of this application is avaliable, Reload to run it");
};

window.applicationCache.onnoUpdate = function () {
		status("You are running the latest verison of the application");
};


function status(msg) { statusline.innerHTML = msg; }


function save() {
		if(idletimer) clearTimeout(idletimer);
		idletimer = null;
	
		if (navigator.online) {
				var xhr = new XMLHttpRequest();
				xhr.open("PUT","/note");
				xhr.send(editor.value);
				xhr.onload = function () {
						localStorage.lastSaved = Date.now();
						savebutton.disabled = true;
				};
		}
}


function sync() {
	if(navigator.onLine) {

		var xhr = new XMLHttpRequest();
		xhr.send("GET","/note");
		xhr.send();
		xhr.onload = function () {
			var remoteModTime = 0;
			if(xhr.status == 200){
				var remoteModTime = xhr.getAllResponseHeaders("Last-Modified");
				remoteModTime = new Date(remoteModTime).getTime();
			}
			if (remoteModTime > localStorage.lastModified) {
				status("Newer note found on server");
				var useit = confirm("There is a newer note on server, confirm to use that note, click on to use that version , or click cancel to use this one");

				var now = Date.now();
				if (useit) {
					editor.value = localStorage.note = xhr.responseText;
					localStorage.lastSaved = now;
					status("newest version downloaded");

				} else {

					status("ignoring new version of the note");
					localStorage.lastModified = now;
				} else status("You are edition the current version of the note");
									if(localStorage.lastModified > localStorage.lastSaved) {
										save();
									}
									editor.disabled = false;
									editor.focus();
								}
							} else {
								status("can't sync while offline");
								editor.disabled = false;
								editor.focus();
							}


}

		
