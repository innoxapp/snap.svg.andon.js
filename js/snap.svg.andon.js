
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
		//alert("#textdata_" + sFieldName);

		//Update data inside svg text object with name "textdata_[myfieldname]" ie "textdata_FIELD01"
		var myText = s.select("#textdata_" + sFieldName);
		myText.attr({
			text : sNewValue
		});

		//fade-in / fade-out on thanged text object
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
	this.refreshData = function () {
        that.getJsonData("./DataExample.json");
		var myTimer = $.timer(function () {
				//alert('This message was sent by a timer.');
				that.getJsonData("./DataExample.json");
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
