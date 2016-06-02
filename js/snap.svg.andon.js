/**
 * snap.svg.andon.js
 *
 * Copyright (c) 2015 Marco Innocente <sansacugnisiun@gmail.com>
 *
 * https://github.com/innoxapp/snap.svg.andon.js
 *
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * This software is based on the use of the snap.svg library that you find at:
 * http://snapsvg.io/
 * https://github.com/adobe-webplatform/Snap.svg
 *
 *
 *  -------------- snap.svg.andon.js history -----------------
 *  Rev. | Date       | Description
 *	----------------------------------------------------------
 *   1.0 - 18/03/2016 - First Release
 *   1.1 - 01/06/2016 - Added updColorFieldInsideSVG function
 *                      Added getJsonDataRequest function
 *
 */
 
function AndonScreen(sAndonId, sSvgPlaceHolderTag, sSvgSrcFile, bSilent) {

	var that = this;
	var s = Snap(sSvgPlaceHolderTag);
	this.AndonId = sAndonId;

	var OldJsonData;

	//
	// Load the SVG image file inside the container with Snap.svg
	//
	var l = Snap.load(sSvgSrcFile, onSVGLoaded);


	//
	// Callback fnction after SVG load (Snap.js)
	//
	function onSVGLoaded(data) {
		s.append(data);
	};

	
	//
	// Download Json Data from server with a simple request (now is available also the metod getJsonDataRequest for a 'complex' request
	//
	this.getJsonData = function (sJsonUrl) {
		$.getJSON(sJsonUrl, {
			AndonId : this.AndonId
		})
		.done(function (data) {
			that.manageJsonData(data);
		})
		.fail(function (jqxhr, textStatus, error) {
			var err = textStatus + ", " + error;
			alert("getJsonData() -> Request Failed: " + err);
		});
	};

	
	//
	// Download Json Data from server with structured request header 
	//
	this.getJsonDataRequest = function (sJsonUrl) {
	
	if( sJsonUrl != undefined ) {
		url = sJsonUrl;
	}
	else {
		url = "../../../yourdefaulturl.action";
	}
	if ( timeout == undefined ) {
		timeout = 300000;
	}
	var object = {
		id: "@new@-1",
		clientId: "@new@-1",
		attached: false,
		entitytype: "andon",
		response: ""
	};
	
	var paramsJsonStringhified = JSON.stringify({
		content: {
			cacheId: "@new@-1",
			currentId: "@new@-1",
			currentType: object.entitytype,
			objects: [object]
		},
		deep: 3,
		operation: "andonDataName",
		type: "andon"
	});
	
	var timeout = 300000;
	
	$.ajax({
		type: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		cache: false,
		data: paramsJsonStringhified,
		url: url,
		timeout: timeout,
		context: this,
		async: true,
		success: function(response, textStatus, jqXHR) {
			var msg = response['reason'];
			
			var result;
			if (response['success']) {
				
				var content = response['object'];
				var newObject = null;
				if( content != null && content.objects != null ) {
					for(var i = 0; i < content.objects.length && newObject == null; i++) {
						var obj = content.objects[i];
						if(object.entitytype == obj.entitytype) {
							newObject = obj;
						}
					}
				}
				if( newObject != null ) {
					// To get response string (that is supposed to be a json):
					//object.response = newObject.response;
									
					// To get a parsed object (from the json response)
					object.response = JSON.parse(newObject.response);
					
					// Use the parsed object to the data manager function
					this.manageJsonData(object.response);
					
				} else {
					//  TODO manage if the response is null
				}
				
			} else {
				// TODO manage errors
			}
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// TODO manage errors cases
			if (bSilent != 1) {
				var err = textStatus + ", " + errorThrown;
				alert("getJsonData() -> Request Failed: " + err);
			}
		}
	});
	
	//-------------
	
	};

	
	//
	// Manage the downloaded Json Data array
	//
	this.manageJsonData = function (jsonData) {
		if (undefined != OldJsonData) {
		    // Here we are AFTER 1st loop (2..3..4..etc)
			$.each(OldJsonData.fields, function (i, Oldfield) {
				$.each(jsonData.fields, function (i, Newfield) {
					if (Newfield.field_name == Oldfield.field_name) {
						if (Newfield.value != Oldfield.value) {
							//value of a field is changed!
							//alert('Value changed! field=' + Newfield.field_name + " from:" + Oldfield.value + " to:" + Newfield.value);
							that.updDataFieldInsideSVG(Newfield.field_name, Newfield.value);
						}
						if (Newfield.color != Oldfield.color) {
						   that.updColorFieldInsideSVG(Newfield.field_name, Newfield.color);
						}
					}
				});
			});
			OldJsonData = jsonData;
		} else {
			// Here we are AT 1st loop, so all the fields are updated by default 
			// with the data comeing from the JSON
			$.each(jsonData.fields, function (i, Newfield) {
				that.updDataFieldInsideSVG(Newfield.field_name, Newfield.value);
				that.updColorFieldInsideSVG(Newfield.field_name, Newfield.color);
			});
			OldJsonData = jsonData;
		}

		/*
		alert("useJsonData=" + jsonData.type);
		$.each(jsonData.fields, function (i, field) {
		alert(field.field_name + "|" + field.value);
		});
		 */
	};

	//
	// Update data field inside the SVG image loaded in the screen
	//
	this.updDataFieldInsideSVG = function (sFieldName, sNewValue) {

		//Update data inside svg text object with name "textdata_[myfieldname]" ie "textdata_FIELD01"
		//var myText = s.select("text#textdata_" + sFieldName);
		//var myText = s.select("#textdata_" + sFieldName);
		var myText = s.select("#" + sFieldName);
    
		// recognize inside the text item the Tspan presence and how many levels (max 3 levels)
		//var myGroup = document.querySelector("#textdata_" + sFieldName);
		var myGroup = document.querySelector("#" + sFieldName);
		var tSpanDeptLevel = 0;

		
		try {
			if (myGroup.lastChild.nodeName == 'tspan'){
			  tSpanDeptLevel = tSpanDeptLevel + 1;
			}
			if (myGroup.lastChild.lastChild.nodeName == 'tspan'){
			  tSpanDeptLevel = tSpanDeptLevel + 1;
			}  
			if (myGroup.lastChild.lastChild.lastChild.nodeName == 'tspan'){
			  tSpanDeptLevel = tSpanDeptLevel + 1;
			}  
			if (myGroup.lastChild.lastChild.lastChild.lastChild.nodeName == 'tspan'){
			  tSpanDeptLevel = tSpanDeptLevel + 1;
			}  
			if (myGroup.lastChild.lastChild.lastChild.lastChild.lastChild.nodeName == 'tspan'){
			  tSpanDeptLevel = tSpanDeptLevel + 1;
			}  		
			if (myGroup.lastChild.lastChild.lastChild.lastChild.lastChild.nodeName.nodeName == 'tspan'){
			  tSpanDeptLevel = tSpanDeptLevel + 1;
			}  	
		}
		catch(err) {
		}

		try {
		// Zero dept level we use the snap.svg  .attr propertyes
			if (tSpanDeptLevel == 0){
				myText.attr({
					text : sNewValue
				});
					/*myText.attr({
						value : sNewValue
					});*/
			} else {
			  if (tSpanDeptLevel == 1){
			    myGroup.lastChild.innerHTML = sNewValue;
			  }
			  if (tSpanDeptLevel == 2){
			    myGroup.lastChild.lastChild.innerHTML = sNewValue;
			  }
			  if (tSpanDeptLevel == 3){
			    myGroup.lastChild.lastChild.lastChild.innerHTML = sNewValue;
			  }
			  if (tSpanDeptLevel == 4){
			    myGroup.lastChild.lastChild.lastChild.lastChild.innerHTML = sNewValue;
			  }
			  if (tSpanDeptLevel == 5){
			    myGroup.lastChild.lastChild.lastChild.lastChild.lastChild.innerHTML = sNewValue;
			  }
			  if (tSpanDeptLevel == 6){
			    myGroup.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.innerHTML = sNewValue;
			  }
			}
			
		}
		catch(err) {
			alert("ErrorField: " + sFieldName )
		}
		

		/*
			alert("nodeName(1):" + myGroup.lastChild.nodeName);
			alert("innerHTML(1):" + myGroup.lastChild.innerHTML);
			alert("nodeName(2):" + myGroup.lastChild.lastChild.nodeName);
			alert("innerHTML(2):" + myGroup.lastChild.lastChild.innerHTML);
			alert("nodeName(3):" + myGroup.lastChild.lastChild.lastChild.nodeName);
			alert("innerHTML(3):" + myGroup.lastChild.lastChild.lastChild.innerHTML);
		*/


		/*
		 // DEEP  ON CHILD NODES
		if (myGroup.childNodes.length) {
			var children = myGroup.childNodes;
			for (var i = 0; i < children.length; i++) {
				var myChild = children[i];
				//2nd level child		
				var twoChildren = myChild.childNodes;
				for (var i = 0; i < twoChildren.length; i++) {			
					var twoMyChild = twoChildren[i];
		//			alert('twoMyChild>id:' + twoMyChild.nodeName + '>nodeName:' + twoMyChild.nodeName + '>innerHTML:' + twoMyChild.innerHTML);
					if (twoMyChild.innerHTML == '00:00'){
					  twoMyChild.innerHTML = '00:80';
					}
					if (twoMyChild.innerHTML == '00'){
					  twoMyChild.innerHTML = '99';
					}			
				}
			}
		}
		*/	

		
        //
		// FADE-IN / FADE-OUT on thanged text object
		//

			/*
			CSS Query Selector logics explanation: Example [id%=mysearchtext]
			^= indicates "starts with".
			$= indicates "ends with"
			 */		
				
		s.selectAll("[id $=" + sFieldName + "]").forEach(function (element) {
			element.animate({
				"fill-opacity" : "0"
			}, 300, function () {
				element.animate({
					"fill-opacity" : "1"
				}, 1000, function () {});
			});
		});		
	};


	//
	// Update data field inside the SVG image loaded in the screen
	//
	this.updColorFieldInsideSVG = function (sFieldName, sNewValue) {
		var myText = s.select("#" + sFieldName);

		myText.attr({
			fill: sNewValue
		});
		
        //
		// FADE-IN / FADE-OUT on thanged text object
		//

			/*
			CSS Query Selector logics explanation: Example [id%=mysearchtext]
			^= indicates "starts with".
			$= indicates "ends with"
			 */		
			
		s.selectAll("[id $=" + sFieldName + "]").forEach(function (element) {
			element.animate({
				"fill-opacity" : "0"
			}, 300, function () {
				element.animate({
					"fill-opacity" : "1"
				}, 1000, function () {});
			});
		});
		
		
	};

	

	//
	//  Refresh data fields inside the SVG template loaded before
	//
	this.refreshData = function (sDataFile, nRefreshTime) {
	
	    // example  sDataFile =  "./DataExample.json";
        //that.getJsonData("./DataExample.json");
		that.getJsonData(sDataFile);
		
		//that.getJsonData("./DataExample_old.json");
		
		var myTimer = $.timer(function () {
				//alert('This message was sent by a timer.');
				//that.getJsonData("./DataExample.json");
				that.getJsonData(sDataFile);
			});

		myTimer.set({
			//time : 1000,
			time : nRefreshTime,
			autostart : true
		});
	};

	
	//
	// Test Function
	//
	this.testFunct = function () {

		//Add code here

		////////////////////////////////////////////// TEST ///////////////////////////////////////
		var myText = s.select("#data_text001");
		myText.attr({
			text : 'my new text'
		});

		//fade loop on texts
		s.selectAll("text").forEach(function (element) {
			element.animate({
				"fill-opacity" : "0"
			}, 2000, function () {
				element.animate({
					"fill-opacity" : "1"
				}, 2000, function () {});
			});
		});

		//fade loop on rect
		s.selectAll("rect").forEach(function (element) {
			element.animate({
				"fill-opacity" : "0"
			}, 2000, function () {
				element.animate({
					"fill-opacity" : "1"
				}, 2000, function () {});
			});
		});
		////////////////////////////////////////////// TEST ///////////////////////////////////////

	};


}
