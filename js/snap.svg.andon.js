
function AndonScreen(sAndonId, sSvgPlaceHolderTag, sSvgSrcFile) {

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
	// Download Json Data from server
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
	// Manage the downloaded Json Data array
	//
	this.manageJsonData = function (jsonData) {
		if (undefined != OldJsonData) {
			//after the first run the OldJsonData is filled with previous run data
			$.each(OldJsonData.fields, function (i, Oldfield) {
				$.each(jsonData.fields, function (i, Newfield) {
					if (Newfield.field_name == Oldfield.field_name) {
						if (Newfield.value != Oldfield.value) {
							//value of a field is changed!
							//alert('Value changed! field=' + Newfield.field_name + " from:" + Oldfield.value + " to:" + Newfield.value);
							that.updDataFieldInsideSVG(Newfield.field_name, Newfield.value);
						}
					}
				});
			});
			OldJsonData = jsonData;
		} else {
			//first run the OldJsonData is empty
			
			
				$.each(jsonData.fields, function (i, Newfield) {

							that.updDataFieldInsideSVG(Newfield.field_name, Newfield.value);

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
		var myText = s.select("#textdata_" + sFieldName);
    
		// recognize inside the text item the Tspan presence and how many levels (max 3 levels)
		var myGroup = document.querySelector("#textdata_" + sFieldName);
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
		}
		catch(err) {
		}

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
	//  Refresh data fields inside the SVG template loaded before
	//
	this.refreshData = function (sDataFile) {
	
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
			time : 1000,
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
