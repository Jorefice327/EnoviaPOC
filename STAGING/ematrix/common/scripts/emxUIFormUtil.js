//=================================================================
// JavaScript FormUtil
//
// Copyright (c) 1992-2015 Dassault Systemes.
// All Rights Reserved.
// This program contains proprietary and trade secret information of MatrixOne,Inc.
// Copyright notice is precautionary only
// and does not evidence any actual or intended publication of such program
//=================================================================
// FormUtil
//-----------------------------------------------------------------

// Works in Netscape 4.x and IE 5.0+
//=================================================================

//get date to start with
todayDate=new Date();
thismonth=todayDate.getMonth()+1;
thisday=todayDate.getDate();
thisyear=todayDate.getYear();
/*MultiValue Attribute*/
var maxCount = 1;
var maxFlag = true;
/*End MultiValue Attribute*/

/********************************************************************************************************************************/
function Map() {
	// members
	this.keyArray = new Array();
	// Keys
	this.valArray = new Array();
	// Values
	// methods
	this.put = put;
	this.get = get;
	this.size = size;
	this.clear = clear;
	this.keySet = keySet;
	this.valSet = valSet;
	this.showMe = showMe;   // returns a string with all keys and values in map.
	this.findIt = findIt;
	this.remove = remove;
}

function put( key, val ){
	var elementIndex = this.findIt( key );
	if( elementIndex == (-1) ) {
		this.keyArray.push( key );
		this.valArray.push( val );
	}
	else {
		this.valArray[ elementIndex ] = val;
	}
}

function get( key ){
	var result = null;
	var elementIndex = this.findIt( key );
	if( elementIndex != (-1) )
	{
		result = this.valArray[ elementIndex ];
	}
	return result;
}


function remove( key ){
	var result = null;
	var elementIndex = this.findIt( key );
	if( elementIndex != (-1) )    {
		this.keyArray = this.keyArray.removeAt(elementIndex);
		this.valArray = this.valArray.removeAt(elementIndex);
	}
	return;
}

function size(){
	return (this.keyArray.length);
}

function clear(){
	for( var i = 0; i < this.keyArray.length; i++ )    {
		this.keyArray.pop(); this.valArray.pop();
	}
}

function keySet(){
	return (this.keyArray);
}

function valSet(){
	return (this.valArray);
}

function showMe(){
	var result = "";
	for( var i = 0; i < this.keyArray.length; i++ )
	{
		result += "Key: " + this.keyArray[ i ] + "\tValues: " + this.valArray[ i ] + "\n";
	}

	return result;
}

function findIt( key ){
	var result = (-1);
	for( var i = 0; i < this.keyArray.length; i++ )    {
		if( this.keyArray[ i ] == key )        {
			result = i;
			break;
		}
	}
	return result;
}

function removeAt( index ){
	var part1 = this.slice( 0, index);
	var part2 = this.slice( index+1 );
	return( part1.concat( part2 ) );
}


/*******************************************************************************************************************************/
function changeVal(obj){
	if (obj.checked) {
		obj.value= true;
	}
	else{
		obj.value= false;
	}
}

//initialize the fieldObjs array
//var fieldObjs = new Array(0);
var fieldObjs = new Map();
var objMap = new Map();
var myValidationRoutines = new Array();
var myValidationRoutines1 = new Array();
var columnValidateMap = new Object();
var columnLabelMap = new Object();
var originalValue="";
var elementName;
var textboxName;
var textarea;
var objTextarea;
var textareaName;
var Xpos;
var Ypos;
//incorrect year is obtained in netscape (add 1900 if below 500)
if (thisyear < 500){
    thisyear = thisyear + 1900;
}

function setProgramHTMLFields()
{
	var phtml = columnValidateMap.programhtmlcolumns;
	var temparray = new Array();
	if(phtml != null && phtml != 'undefined') {
		temparray = phtml.split(",");
	}

	var numobjs = columnValidateMap.numobjects;
	if(temparray.length > 0 && numobjs > 0)
	{
		for(var k=0;k<temparray.length;k++)
		{
			for(var l = 0;l<numobjs;l++)
			{
				var fieldObj = document.getElementsByName(temparray[k]+l)
			    if(fieldObj != null && fieldObj != "undefined" && fieldObj != "null" && fieldObj != "" && fieldObj.length > 0)
			    {
			    	//fieldObj[0].onchange = saveFieldObj;
			    	fieldObj[0].onchange = function(){
			    								saveFieldObj(this);
			    							}
					if(fieldObj[0].customValidate !=null && fieldObj[0].customValidate !="undefined"){
			    		saveFieldObj(fieldObj[0]);
			        }
			    }
			}
		}
	}
}

function addInputSubmitEvent(form, input) {
	  emxUICore.addEventHandler(input, "keydown", function(e) {
       e = e || window.event;
       if (e.keyCode == 13) {
       	setTimeout("saveChanges()",50);
       	e.preventDefault();
           return false;
       }
 });
}

function toViewMultipleToolbars(iNoOfToolbars){
	if(iNoOfToolbars > 1){
		var dpb1 = document.getElementById("divPageBody");
		dpb1.style.top = dpb1.offsetTop + (28*(iNoOfToolbars-1)) + "px";
	}
}
function loadFramesNew(bodyurl, preProcessJavaScript, loadsearch) {
	var phd = document.getElementById("pageHeadDiv");
	var dpb = document.getElementById("divPageBody");
	toViewMultipleToolbars(numtoolbars);
	turnOffProgress();
	if(bodyurl.indexOf("emxFormEditDisplay.jsp") >= 0){
		doLoad();
		if(loadsearch) {
			getTopWindow().loadSearchFormFields();
		}
		if(preProcessJavaScript && preProcessJavaScript != "" && preProcessJavaScript != "undefined"){
			FormHandler.SetPreProcess(preProcessJavaScript);
		}
		FormHandler.SetFormType("emxForm");
		FormHandler.Init();
		buildNumericFieldValues("edit");

		modifyRedundantFields();
		var forms = document.getElementsByTagName('form');
		for (var frmCnt=0;frmCnt<forms.length;frmCnt++) {
			var inputs = forms[frmCnt].getElementsByTagName('input');
			for (var ipCnt=0;ipCnt<inputs.length ;ipCnt++){
				if(inputs[ipCnt].type == "text")
					addInputSubmitEvent(forms[frmCnt], inputs[ipCnt]);
			}

		}
	}else{
		setwidthsforGroupingcells();
		buildNumericFieldValues('view');
	}
	dpb.style.top = phd.clientHeight + "px";
}

function loadFrames(footerurl, bodyurl, preProcessJavaScript, loadsearch){
	if(footerurl) {
	var newdiv = document.createElement("form");
	newdiv.id = "editFooter";
	newdiv.name = "editFooter";
	newdiv.method = "post";
	document.body.appendChild(newdiv);
	var dpf = document.getElementById("divPageFoot");
	dpf.appendChild(newdiv);
	newdiv.innerHTML = emxUICore.getData(footerurl);
	}
	var phd = document.getElementById("pageHeadDiv");
	var dpb = document.getElementById("divPageBody");
	toViewMultipleToolbars(numtoolbars);
	if(bodyurl){
		$('#divPageBody').load(bodyurl, function(){
			turnOffProgress();
			if(bodyurl.indexOf("emxFormEditDisplay.jsp") >= 0){
			doLoad();
			if(loadsearch) {
				getTopWindow().loadSearchFormFields();
		}

				if(preProcessJavaScript && preProcessJavaScript != "" && preProcessJavaScript != "undefined"){
					FormHandler.SetPreProcess(preProcessJavaScript);
				}
				FormHandler.SetFormType("emxForm");
				FormHandler.Init();
				buildNumericFieldValues("edit");

			modifyRedundantFields();
			var forms = document.getElementsByTagName('form');
		     for (var frmCnt=0;frmCnt<forms.length;frmCnt++) {
		         var inputs = forms[frmCnt].getElementsByTagName('input');
		         for (var ipCnt=0;ipCnt<inputs.length ;ipCnt++){
		         	if(inputs[ipCnt].type == "text")
		         	addInputSubmitEvent(forms[frmCnt], inputs[ipCnt]);
		         }

		     }
		}else{
			setwidthsforGroupingcells();
			buildNumericFieldValues('view');
		}
		});
	}
	dpb.style.top = phd.clientHeight + "px";
}

function adjustFrames() {
	var phd = document.getElementById("pageHeadDiv");
	var dpb = document.getElementById("divPageBody");
	var ht = phd.clientHeight;
	if(ht <= 0){
		ht = phd.offsetHeight;
	}
	dpb.style.top = ht + "px";
}

function reload()
{
    var sUrl = document.location.href;
    var typeIndex= sUrl.indexOf("type=");
    var type="";
    var newtype="";
    var typeArray="";
    var typeName="";
    var typeValue="";

    var objForm = document.forms[0];
    var selectedType =null;
    //ixk: in FF>4 when we have two form fields with same name we get an array instead of object
    if((objForm.TypeActual[0] != null)&& isMinFF4 && (objForm.TypeActual[0].tagName != "OPTION")){
    	selectedType = objForm.TypeActual[0].value;
    }else{
    	selectedType = objForm.TypeActual.value;
    }

    if (typeIndex>0)//type exists in the url
    {
        var typeWithUrl=sUrl.substring(typeIndex,sUrl.length);
        if(typeWithUrl.indexOf("&")>0)
        {
            type=typeWithUrl.substring(0,typeWithUrl.indexOf("&"));
        }
        else
        {
            type=typeWithUrl.substring(0,typeWithUrl.length);
        }
        typeArray=type.split("=");
        typeName=typeArray[0];
        typeValue=typeArray[1];
        if(type.indexOf("_selectedType:")<0)//first time reload
        {
            newtype = typeName+"=_selectedType:"+selectedType+","+typeValue;
        }
        else
        {
            newtype=typeName+"=_selectedType:"+selectedType+","+typeValue.substring(typeValue.indexOf(",")+1,typeValue.length);
        }

        sUrl = sUrl.replace(/(\?|&)\s*type=[^&]*&?/g, "$1");
        sUrl+="&"+newtype;
    }
    else{
    	if (selectedType==null||selectedType=="") {
            objForm.TypeActual.value=originalValue;
            if(objForm.TypeActual[0] != null){
            	objForm.TypeActual[0].value=originalValue;
            }else{
            	objForm.TypeActual.value=originalValue;
            }
        }
    	sUrl += "&type=" + selectedType;
        sUrl += "&noURLTypePassed=true";
    }
    if(objForm && objForm.emxTableRowId && sUrl.indexOf("emxTableRowId") == -1){
    	sUrl += "&emxTableRowId="+objForm.emxTableRowId.value;
    }
    //objForm.action = sUrl;
    //objForm.target = "_self";
    //objForm.submit();
    document.location.href=sUrl;
}

function updateHiddenValue(fld)
{
	/*
	 * Fields which desire to use this API to update its hidden field
	 * should follow below naming convention :
	 * field name should be in format "<FIELD NAME>Display" and corresponding hidden
	 * field's name should be "<FIELD NAME>
	 * e.g.  VaultDisplay & Vault
	 */
	var fieldName = fld.name;
	var hiddenFieldName = fieldName.substring(0,fieldName.length-7);
	var hiddenField = document.getElementsByName(hiddenFieldName)[0];
	if(hiddenField != null && hiddenField != "" && hiddenField != "undefined" && hiddenField != "null")
	{
		hiddenField.value = fld.value;
	}
}

function storePreviousValue(fld)
{
	originalValue=fld.value;
}

function changeDate(m,d,y,formName,dateField)
{
    // DATE FORMAT MM/DD/YYYY
    formattedDate = m + "/" + d + "/" + y;

    // Get the Form and Field objects and assing the date value.
    var formObject = document.forms[0];
    var fieldObject = formObject.elements[dateField];
    var fieldDisplayObject = formObject.elements[dateField + "Display"];
    fieldObject.value=formattedDate;
    fieldDisplayObject.value=formattedDate;


}

    function openWindow(strURL)
    {
        window.open(strURL);
    }

/*
	     * emxFormLinkClick method modified for PowerView Enhancement Feature.
         * The emxFormLinkClick method dynamically assigns the 'src' of iframe with the required 'href'
         * and displays the 'href' content in the target tab.
		 * 16 Aug 2007
		 */

//modified for bug 346636

function emxFormLinkClick(url, target,modality,winWidth,winHeight,colValue,strPopupSize, slideinWidth)
{
  	 var objPowerView;
         var showTabHeader= 'false';
         var targetBln = false;
         var targetType = '';

         if(url.indexOf("showTabHeader=") != -1)
         {
	         var index = url.indexOf("showTabHeader=");
	         var boolVal = url.substring(index+14,index+15);
	         if(boolVal == 't' || boolVal == 'T')
	         {
	         	showTabHeader =  true;
	         }
	         else
	         {
	         	showTabHeader =  false;
	         }
         }
         try{
		 if(getTopWindow().getWindowOpener())
         {
             if(parent.parent.objPortal)
             {
				objPowerView = parent.parent.objPortal;
             }else if(parent.objPortal)
             {
				objPowerView = parent.objPortal;
             }else
             {
      		objPowerView = getTopWindow().getWindowOpener().parent.parent.objPortal;
			 }
         }
      	 else
      	 {
      		objPowerView  = parent.parent.objPortal;
      	 }
         }catch(e){

         }

		 if(objPowerView)
		 {
		      for(var i =0 ; i < objPowerView.rows.length ; i++)
		      {
		    	for (var j =0 ; j < objPowerView.rows[i].containers.length ; j++ )
		    	{
		    		for(var k = 0 ; k < objPowerView.rows[i].containers[j].channels.length;k++ )
		    		{
		    			var mItems = objPowerView.rows[i].containers[j].tabset.menu;
		    		  	for(var r=0;r<mItems.items.length;r++)
					    {
			    			if(objPowerView.rows[i].containers[j].channels[k].tabName == target || mItems.items[r].text == target)
			    			{
			    			    targetBln = true;
			    			    targetType = "tab";
			    			}
		    			}
		    			if(mItems.items.length == 0)
		    			{
		    			if(objPowerView.rows[i].containers[j].channels[k].tabName == target)
		    			{
		    			    targetBln = true;
		    			    targetType = "tab";
		    			}
		    		}
		    	}
		      }
		      }
		      var matchFound = false;
		      for(var i =0 ; i < objPowerView.rows.length ; i++)
		      {
		    	for (var j =0 ; j < objPowerView.rows[i].containers.length ; j++ )
		    	{
		    		if(url.indexOf("emxRefreshChannel.jsp") != -1){
		    				var channelName = objPowerView.rows[i].containers[j].channelName;
		    				if(channelName != null && url.indexOf("channel="+channelName) > -1){
		    					targetBln = true;
			    				targetType = "channel";
			    				matchFound = true;
			    				break;
		    				}else{
		    					targetBln = false;
		    					targetType = "channel";
		    				}
		    			}
		    	}
		    	if(matchFound){
		    		break;
		    	}
		      }

				   if(targetBln == true && targetType == "tab")
				   {
				    for(var i =0 ; i < objPowerView.rows.length ; i++)
				    {
				    	for (var j =0 ; j < objPowerView.rows[i].containers.length ; j++ )
				    	{
				    		for(var k = 0 ; k < objPowerView.rows[i].containers[j].channels.length;k++ )
				    		{
				    			if(objPowerView.rows[i].containers[j].channels[k].tabName == target)
				    			{
								    objPowerView.rows[i].containers[j].channels[k].url = url;
				    				objPowerView.rows[i].containers[j].channels[k].data.src =url;
									if(getTopWindow().getWindowOpener() && !parent.parent.objPortal && !parent.objPortal)
									{
										window.blur();
									}
				    				if(showTabHeader == true){
				    				objPowerView.rows[i].containers[j].channels[k].tabdiv.innerHTML = colValue;
				    				objPowerView.rows[i].containers[j].channels[k].tabdiv.style.display = 'block';
				    				}else
				    				{
				    				objPowerView.rows[i].containers[j].channels[k].tabdiv.style.display = 'none';
				    				}
				    				var objSet = objPowerView.rows[i].containers[j].tabset;
				                    var tabID = objPowerView.rows[i].containers[j].channels[k].index;
				                    var menuItems = objPowerView.rows[i].containers[j].tabset.menu;

					        		var bVal = false;
					        		for(var l=0;l<objSet.tabs.length;l++)
					    			{
					    				if(objSet.tabs[l].channel.tabName == target)
					    				{
					    				 bVal = true;
					    				}

						        	}

					        		if(menuItems.items.length > 0 && bVal == false)
					        		{
						        		for(var m=0;m<menuItems.items.length;m++)
					    				{
							                   objSet.tabs[objSet.selectedID].sendToBack();

							                   	//If the selected tabs "URL" is not equal to the target "url" only then swap happens.
							                   	//If this check is not done,then there will be a swap of channels everytime the user clicks on the target url.
							                   if(objSet.tabs[objSet.selectedID].channel.url != url)
							                   {
							                   	    if(menuItems.items[m].channel.tabName == target)
							                		{
									                   var objChannel = menuItems.items[m].channel;
									                   menuItems.items[m].channel = objSet.tabs[objSet.selectedID].channel;
									                   objSet.tabs[objSet.selectedID].channel= objChannel;
									                }
							               	   }

							                   // For Menu
							                   objSet.menu.items[m].rowElement.firstChild.lastChild.innerHTML = menuItems.items[m].channel.text;
							                   objSet.menu.items[m].rowElement.firstChild.lastChild.title = menuItems.items[m].channel.fulltext;
	                                           // For Tab Items
							                   objSet.tabs[objSet.selectedID].element.title = objSet.tabs[objSet.selectedID].channel.fulltext;
	    									   objSet.tabs[objSet.selectedID].element.innerHTML = "<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tr><td class=\"text\" nowrap=\"nowrap\">" + objSet.tabs[objSet.selectedID].channel.fulltext + "</td><td class=\"corner\"><img src=\"" + IMG_SPACER + "\" width=\"16\" height=\"1\" /></td></tr></table>";

							                   objSet.tabs[objSet.selectedID].bringToFront();

								        }
							        }else
							        {
				    				for(var l=0;l<objSet.tabs.length;l++)
				    				{
						    				if (objSet.tabs[l].channel.tabName== target)
							                {
							                        objSet.tabs[l].bringToFront();
									             objSet.selectedID = l;
							                }
							                else
							                {
							                        objSet.tabs[l].sendToBack();
							                }
					        		}
				    			}
				    		}
				    	}
				     }
				     }
				    }else if(targetBln == true && targetType == "channel")
				    {
				    	var strHref = "";
				    	var jsData = null;
				    	createRequestObject();
				    	var portalName = "";
				    	var portalDisplayFrame = null;
				    	var formViewDisplayFrame = null;
				    	if (getTopWindow().getWindowOpener()) {
				    		portalDisplayFrame = getTopWindow().getWindowOpener().findFrame(getTopWindow().getWindowOpener().getTopWindow(),"portalDisplay");
				    	} else {
				    		portalDisplayFrame = findFrame(getTopWindow(),"portalDisplay");
				    	}
				    	var qb = buildRequestParam(portalDisplayFrame.location.href);
				    	portalName = qb["portal"];
				    	var objectId = FORM_DATA["objectId"];
				    	var strUrl = "";
				    	if(url.indexOf("?") > -1){
				    		strUrl = url + "&portal="+portalName+"&objectId="+objectId+"&refresh=true&isIndentedTable=false"
				    	}else{
				    		strUrl = url + "?portal="+portalName+"&objectId="+objectId+"&refresh=true&isIndentedTable=false"
				    	}
				    	var portalHiddenForm = null;
				    	if(portalDisplayFrame.document.getElementById("portalHiddenForm") == null){
				    		portalHiddenForm = portalDisplayFrame.document.createElement("FORM");
					    	portalHiddenForm.id = "portalHiddenForm";
					    	portalHiddenForm.name = "portalHiddenForm";
					    	portalDisplayFrame.document.body.appendChild(portalHiddenForm);
				    		portalHiddenForm.action = strUrl;
					    	portalHiddenForm.method = "post";
					    	portalHiddenForm.target = "listHidden";
					    	portalHiddenForm.submit();
				    	}else{
				    		portalHiddenForm = portalDisplayFrame.document.getElementById("portalHiddenForm");
				    		portalHiddenForm.action = strUrl;
					    	portalHiddenForm.method = "post";
					    	portalHiddenForm.target = "listHidden";
					    	portalHiddenForm.submit();
				    	}
				    }
				    else if(targetType == "channel" && targetBln == false){
				    	alert(emxUIConstants.STR_JS_InvalidChannelName);
				    } else if(target == "slidein"){
			              getTopWindow().showSlideInDialog(url + '&windowMode=slidein', modality, window.name, '', slideinWidth);
			              return;
				    }
				    	else
				    {
				     	openFormAsPopup(url,target,modality,winWidth,winHeight,strPopupSize);
				     	return;
				    }
		  } else if(target == "slidein"){
              getTopWindow().showSlideInDialog(url + '&windowMode=slidein', modality, window.name, '', slideinWidth);
              return;
		  }else
		  {
		     openFormAsPopup(url,target,modality,winWidth,winHeight,strPopupSize)
		     return;
		  }

}
function buildRequestParam(qStr) {
	if (!qStr) { qStr = ""; }
	var baseUrl = qStr.replace(/[?].*/, "");
	var items = new Object();
	var search = qStr.substr(baseUrl.length+1);
	if (search == qStr) { search = ""; }
	var params = search.split("&");
	for (var i = 0; i<params.length; i++) {
		var param = params[i];
		if (param == '') continue;
		var name = decodeURIComponent(param.replace(/=.*/, ""));
		var value = decodeURIComponent(param.substr(name.length + 1));
		items[name]=value;
	}
	return items;
}
/*
	 * openFormAsPopup method added for PowerView Enhancement Feature.
     * The openFormAsPopup method opens the 'url' content in a popup if the target tab is not found
     * and also in case it is outside PowerView Context.
	 * 16 Aug 2007
	 */
function openFormAsPopup(url,target,modality,winWidth,winHeight,strPopupSize)
{
    if(winWidth == null || winWidth=="" )
     winWidth="600";
    if(winHeight == null || winHeight=="" )
     winHeight="500";

     var isModal=false;

        if (modality != null && modality !="" && modality=="true")
          isModal=true;

    if (target && target == 'popup')
    {
        if(isModal)
          showModalDialog(url, winWidth, winHeight, true);
        else
           showNonModalDialog(url, winWidth, winHeight,true);

    } else {
        var targetFrame = getTopWindow().findFrame(getTopWindow(), target);

        if (targetFrame)
        {
            targetFrame.location.href = url;
        } else {
              if(isModal)
                 showModalDialog(url, winWidth, winHeight, true,strPopupSize);
              else
                 showNonModalDialog(url, winWidth, winHeight,true,true,strPopupSize);
        }
    }
}

// Method to keep the focus on the first editable element
function doLoad() {
	emxUICore.addEventHandler(window, isIE ? "unload" : "beforeunload", function() {purgeEditFormData(document.getElementById("timeStamp").value);} );
    if (document.forms[0].elements.length > 0)
    {
        //Added for BUG:344507
		for ( var ii=0; ii<document.forms[0].elements.length; ii++ ){
			var objElement = document.forms[0].elements[ii];
			if (objElement != null){
				// Check if node type is appropriate
				if (objElement.type == "text" ||objElement.type == "textarea" || objElement.type == "select-one"){
					// Check if node can be written to by user
					if( typeof objElement.readOnly == 'undefined')
						objElement.readOnly = false ;
					if (objElement.focus && objElement.readOnly == false && objElement.disabled == false){
						try{
						objElement.focus();
						}catch(e){
							//Do Nothing
						}
						break;
					}
				}
			}
		}
        //if (objElement.select)
        //objElement.select();
    }
}

function assignValidateMethod(fieldName, methodName)
{
    var bValid = true;

    if (isIE) {
        eval("try \
            { \
                var test =" + methodName + ".toString(); \
                handleMethodAssign(true, fieldName, methodName); \
            } catch(e) { \
                handleMethodAssign(false, fieldName, methodName); \
            }");
    } else {
        window.onerror = function() {
                        handleMethodAssign(false, fieldName, methodName);
                        window.onerror = null;
                        return false;
                     };
        handleMethodAssign(true, fieldName, methodName);
    }
}


function handleMethodAssign(bValid, fieldName, methodName) {
    if (bValid){
        eval ("document.forms[0]['" + fieldName + "'].customValidate=" + methodName);
    }
    else{
        alert (VALIDATION_METHOD_UNDEFINED + " "+methodName);
	}
}


function validateForBadCharacters(fieldName) {
        eval ("document.forms[0]['" + fieldName + "'].badcharValidate=" + "isBadChars");
}

function validateForBadNameCharacters(fieldName) {
        eval ("document.forms[0]['" + fieldName + "'].badnamecharValidate=" + "isBadNameChars");
}

function validateForRestrictedBadCharacters(fieldName) {
        eval ("document.forms[0]['" + fieldName + "'].badrestrictedValidate=" + "isBadRestrictedChars");
}



function validateNumericField(fieldName) {
        eval ("document.forms[0]['" + fieldName + "'].numericValidate=" + "isNumeric");
}

function validateIntegerField(fieldName) {
        eval ("document.forms[0]['" + fieldName + "'].integerValidate=" + "isValidInteger");
}

function validateRequiredField(fieldName) {
    if (document.forms[0][fieldName + "Display"] && document.forms[0][fieldName + "OID"]){
        eval("document.forms[0]['" + fieldName + "Display'].requiredValidate=" + "isZeroLength");
    }
    else {
            if(document.forms[0][fieldName].length && document.forms[0][fieldName].type != 'select-one'){
            document.forms[0][fieldName][0].setAttribute("required", "true");
        }
        eval ("document.forms[0]['" + fieldName + "'].requiredValidate=" + "isZeroLength");
    }
}

function validateDateField(fieldName) {
        eval ("document.forms[0]['" + fieldName + "'].dateValidate=" + "isValidDate");
}

function basicClear(fieldName) {
var formElement= eval ("document.forms[0]['"+ fieldName + "']");

if (formElement){
  if(formElement.length>1){
    for(var i=0; i < formElement.length-1; i++)
      {
	    	if(formElement[i].className == "rte"){
	    		formElement[i].updateRTE("");
	    	  }else{
         formElement[i].value="";
      }
	      }
	    }else{
	    	if(formElement.className == "rte"){
	    		formElement.updateRTE("");
    }else{
       formElement.value="";
   }
 }
	 }

formElement=eval ("document.forms[0]['"+ fieldName + "Display']");

if (formElement){
  if(formElement.length>1){
    for(var i=0; i < formElement.length-1; i++)
      {
         formElement[i].value="";
      }
    }else{
       formElement.value="";
   }
 }

formElement=eval ("document.forms[0]['"+ fieldName + "OID']");

if (formElement){
  if(formElement.length>1){
    for(var i=0; i < formElement.length-1; i++)
      {
         formElement[i].value="";
      }
    }else{
       formElement.value="";
   }
 }
 FormHandler.NotifyFieldChange(fieldName);

}



function isBadChars(fieldObj) {
    if(fieldObj == null || fieldObj == "undefined" || fieldObj == "null" || fieldObj == "")
    {
    	fieldObj = this;
    }
  var isBadChar=checkForBadChars(fieldObj);
       if( isBadChar.length > 0 )
       {
         alert(BAD_CHARS + isBadChar);
         return false;
       }
        return true;
}

function isBadNameChars(fieldObj) {
    if(fieldObj == null || fieldObj == "undefined" || fieldObj == "null" || fieldObj == "")
    {
    	fieldObj = this;
    }

        var isBadNameChar=checkForUnifiedNameBadChars(fieldObj, true);
        var nameAllBadCharName=checkForNameBadCharsList(fieldObj);
        var name = fieldObj.name;
       if( isBadNameChar.length > 0 )
       {
    	 alert(INVALID_INPUT_MSG + isBadNameChar + ALERT_INVALID_INPUT + nameAllBadCharName + REMOVE_INVALID_CHARS + " " + name + " " + FIELD);
         return false;
       }
        return true;
}

function isBadRestrictedChars(fieldObj) {
    if(fieldObj == null || fieldObj == "undefined" || fieldObj == "null" || fieldObj == "")
    {
    	fieldObj = this;
    }

        var isBadResChar=checkForRestrictedBadChars(fieldObj);
       if( isBadResChar.length > 0 )
       {
         alert(RESTRICTED_BAD_CHARS + isBadResChar);
         return false;
       }
        return true;
}


// following javascript if there are any integer or real fields
function isNumeric(fieldObj){
    if(fieldObj == null || fieldObj == "undefined" || fieldObj == "null" || fieldObj == "")
    {
    	fieldObj = this;
    }

    var varValue = fieldObj.value;
    //Added for BUG:320716 and 367075

  	var decSymb 	= emxUIConstants.STR_DEC_SYM;
  	var isDot 		= varValue.indexOf(".") != -1;
  	var isComma 	= varValue.indexOf(",") != -1;
  	var result		= false;

  	if(decSymb == "," && isComma && !isDot)
  		{
  			result= !isNaN( varValue.replace(/,/, '.') );
		}

  	if(decSymb == "." && isDot && !isComma)
  		{
  			result= !isNaN( varValue );
		}

  	if (decSymb == "." && !isComma && !isDot)
  		{
  			result= !isNaN( varValue );
  		}

  	if (decSymb == "," && !isComma && !isDot)
  		{
  			result= !isNaN( varValue );
  		}

  	if (!result){
  		if(	typeof fieldObj.title != "undefined" )
  		{
  		alert(MUST_ENTER_VALID_NUMERIC_VALUE + " " + fieldObj.title + " : " + DECIMAL_SYMBOL_IS + " " + " ' "+ decSymb + " ' ");
    	}
  		else if(	typeof getFieldLabelString(fieldObj) == "undefined" && typeof fieldObj.fieldLabel == "undefined" )
  		{
  		alert(MUST_ENTER_VALID_NUMERIC_VALUE + " " + fieldObj.id + " : " + DECIMAL_SYMBOL_IS + " " + " ' "+ decSymb + " ' ");
    	}
    	else if(typeof getFieldLabelString(fieldObj) == "undefined")
    	{
    	alert(MUST_ENTER_VALID_NUMERIC_VALUE + " " + fieldObj.fieldLabel + " : " + DECIMAL_SYMBOL_IS + " " + " ' "+ decSymb + " ' ");
    	} else
    	{
    	alert(MUST_ENTER_VALID_NUMERIC_VALUE + " " + getFieldLabelString(fieldObj) + " : " + DECIMAL_SYMBOL_IS + " " + " ' "+ decSymb + " ' ");
    	}
    	fieldObj.focus();
    	}
    return result;
}

function isValidInteger(fieldObj){
    if(fieldObj == null || fieldObj == "undefined" || fieldObj == "null" || fieldObj == "")
    {
    	fieldObj = this;
    }
   var index;
   var iValue=fieldObj.value;
    if (iValue!= null && iValue != "") {
	   var valid = parseInt(iValue, 10) == iValue;
	   var decPoint= iValue.indexOf(".")<= 0 ? false : true;
	   if(!valid || decPoint ){
		   if(typeof fieldObj.title != "undefined" ){
   	        alert(MUST_ENTER_VALID_INTERGER_VALUE + " " + fieldObj.title);
		   	}else if(typeof getFieldLabelString(fieldObj) == "undefined" && typeof fieldObj.fieldLabel == "undefined" ){
  		        alert(MUST_ENTER_VALID_INTERGER_VALUE + " " + fieldObj.id);
    	    } else if(typeof getFieldLabelString(fieldObj) == "undefined"){
    	        alert(MUST_ENTER_VALID_INTERGER_VALUE + " " + fieldObj.fieldLabel);
    	    } else{
    	        alert(MUST_ENTER_VALID_INTERGER_VALUE + " " + getFieldLabelString(fieldObj));
    	    }
          return false;
        }
    }
    return true;
}

//Handles both whitespaces around the text entered and 'Enter Key'(CRLF)
function trimString(strString) {
    strString = strString.replace(/^\s*/g, "");
    return strString.replace(/\s+$/g, "");
  }

// following javascript if there are any valid entry in fields
function onAutoNameClick(checkboxfield) {
    if(checkboxfield.checked)
    {
        document.forms[0]['Name'].requiredValidate="";
        document.forms[0]['Name'].disabled = true;
        document.forms[0]['Name'].value = "";
    }
    else
    {
        document.forms[0]['Name'].requiredValidate=isZeroLength;
        document.forms[0]['Name'].disabled = false;
    }
}

// following javascript if there are any valid entry in fields
function isZeroLength(objName, fieldObj) {
    var flag = false;
    var str = "";
    var curhref = document.location.href;
    if (curhref.indexOf("emxform.jsp" >= 0)) {
      str = "";
    }
    else if (parent.searchPane) {
      str = "parent.searchPane.";
    }
    else if(parent.searchContent) {
        str = "parent.searchContent.";
    }

    if(eval(str+"document.forms[0][objName]") && eval(str+"document.forms[0][objName].length")) {

        var itr = eval(str+"document.forms[0][objName].length");

        for (var itr1=0; itr1 < itr; itr1++) {
        //Modified for Bug : 347191
            if(eval(str+"document.forms[0][objName][itr1].checked") || eval(str+"document.forms[0][objName][itr1].selected")) {
                flag = true;
                break;
            }
        }
        if (!flag)
        {
	        //Added for BUG: 344762 , 344756
	        var ilastIndex = objName.lastIndexOf("Display");
	    	var iLength = objName.length;
		    if(ilastIndex !=-1 && (iLength - ilastIndex == 7)){
			    var strSubString = objName.substring(0,ilastIndex);
			    if(strSubString && strSubString != ""){
			    	objName = strSubString;
			    }
		    }
		    var aDocument = eval(str+"document");
		    var aClassNames = convertHTMLCollectiontoArray(aDocument.getElementsByClassName("labelRequired"));


		    var aClassNames2 = convertHTMLCollectiontoArray(aDocument.getElementsByClassName("createLabelRequired"));
		   	aClassNames = aClassNames.concat(aClassNames2);

		    for(var p=0;p<aClassNames.length;p++){
			var aDocXML = aClassNames[p].firstChild;
		   	if(aDocXML.htmlFor==objName){
				var cNode = aDocXML.firstChild;
			        if(cNode) {
			           objName = cNode.nodeValue;
			        }
			    }
		    }
			//End for BUG: 344762 , 344756
            alert(MUST_ENTER_VALID_VALUE +" "+ objName);
            return false;
        }
        return true;
    }

    if(fieldObj == null || fieldObj == "undefined" || fieldObj == "null" || fieldObj == "")
    {
    	fieldObj = this;
    }

    var sField = getFieldLabelString(fieldObj);
    var sFieldValue = "";
    if(sField == null || sField == "" || sField == "null")
    {
    	if(fieldObj.title != "undefined" && fieldObj.title!= "null" && fieldObj.title!= "")
    	{
    		sField=fieldObj.title;
    	}else{
        sField=fieldObj.name;
    }
    }
    if (fieldObj.type == "select-one")
    {
        sFieldValue = fieldObj.options[fieldObj.selectedIndex].value;
    }
    else if (fieldObj.type == "select-multiple") {
    	sFieldValue = fieldObj.value;
    }
    else {
        fieldObj.value = trimString(fieldObj.value);
        sFieldValue = fieldObj.value;
    }
    if (sFieldValue.length > 0)
    {
        return true;
    } else {
	    	//Added for BUG: 344762 , 344756
		    var ilastIndex = sField.lastIndexOf("Display");
	    	var iLength = sField.length;
		    if(ilastIndex !=-1 && (iLength - ilastIndex == 7)){
			    var strSubString = sField.substring(0,ilastIndex);
			    if(strSubString && strSubString != ""){
			    	sField = strSubString;
			    }
		    }
		    var aDocument = eval(str+"document");
		    var aClassNames = convertHTMLCollectiontoArray(aDocument.getElementsByClassName("labelRequired"));

		    var aClassNames2 = convertHTMLCollectiontoArray(aDocument.getElementsByClassName("createLabelRequired"));
		   	aClassNames = aClassNames.concat(aClassNames2);

		    for(var p=0;p<aClassNames.length;p++){
			var aDocXML = aClassNames[p].firstChild;
		   	if(aDocXML.htmlFor==sField){
				var cNode = aDocXML.firstChild;
			        if(cNode) {
			           sField = cNode.nodeValue;
			        }
			    }
		    }
			//End for BUG: 344762 , 344756
        alert(MUST_ENTER_VALID_VALUE +" "+ sField);
        if (fieldObj.focus)
        {
           if(fieldObj.type =="text" || fieldObj.type == "textarea" || fieldObj.type=="select-one")
            fieldObj.focus();
        }
        return false;
    }
}

function convertHTMLCollectiontoArray(htmlcol) {
    var result = [];
    var l = result.length;
    for (var i = 0; i < htmlcol.length ; i++) {
        result[l++] = htmlcol[i];
    }
    return result;
}

// Method to remove the objectId param fromURL
function removeObjectIDParam(strURL) {
    if (strURL) {
            var arrURLParts = strURL.split("?");
            var strQueryString = arrURLParts[1];
            strQueryString = strQueryString.replace(new RegExp("(objectId=\[\\d\\.]*\\&?)"), "");
            //strQueryString = strQueryString.replace(new RegExp("(relId=\[\\d\\.]*\\&?)"), "");
            if (strQueryString.lastIndexOf("&") == strQueryString.length-1) {
                    strQueryString = strQueryString.substring(0, strQueryString.length-1);
            }
            arrURLParts[1] = strQueryString;
            return arrURLParts.join("?");
    } else {
            return "";
    }
}

function removeParam(strURL, strparam) {
    if (strURL) {
            var arrURLParts = strURL.split("?");
            var strQueryString = arrURLParts[1];
            var regexp = "(" + strparam + "=\[\\d\\.]*\\&?)";
            strQueryString = strQueryString.replace(new RegExp(regexp), "");
            //strQueryString = strQueryString.replace(new RegExp("(relId=\[\\d\\.]*\\&?)"), "");
            if (strQueryString.lastIndexOf("&") == strQueryString.length-1) {
                    strQueryString = strQueryString.substring(0, strQueryString.length-1);
            }
            arrURLParts[1] = strQueryString;
            return arrURLParts.join("?");
    } else {
            return "";
    }
}

function getFieldLabelString(fieldObj)
{
	return eval("columnLabelMap['" + getFieldName(fieldObj) + "']");
}

function getValidationsString(fieldObj)
{
	return eval("columnValidateMap['" + getFieldName(fieldObj) + "']");
}

function getFieldName(fieldObj)
{
    if(fieldObj.dbfldName)
    {
    	return fieldObj.dbfldName;
    } else  {
	var fieldName = fieldObj.name;
	    for (var fldName in columnValidateMap) {
	    	var ind = fieldName.indexOf(fldName);
	    	if(ind == 0)
	    	{
	    		var ctr = fieldName.substring(fldName.length);
	    		if(!isNaN(ctr))
	    		{
	    			fieldObj.dbfldName = fldName;
	    			fieldObj.dbfldCtr = ctr;
	    			return fldName;
	    		}
                break;
	    	}
	    }
    }
}

function isValidDate()
{
    //var thisDate=new Date(this.value);
    //if (thisDate.valueOf() > 0)
    //{
    //    return true;
    //}else {
    //    return false;
    //}
}

//add a field object to the array to be validated later
function saveFieldObj(fieldObj)
{
    if(fieldObj == null || fieldObj == "undefined" || fieldObj == "null" || fieldObj == "")
    {
	    fieldObj = this;
    }
    var fldName = '';
    var fldCtr = '';

    if(fieldObj.dbfldName)
    {
    	fldName = fieldObj.dbfldName;
    	fldCtr = fieldObj.dbfldCtr;
    } else  {
		var fieldName = fieldObj.name;
	    for (var key in columnValidateMap) {
	    	var ind = fieldName.indexOf(key);
	    	if(ind == 0)
	    	{
	    		var ctr = fieldName.substring(key.length);
	    		if(!isNaN(ctr))
	    		{
	    			fieldObj.dbfldName = key;
	    			fieldObj.dbfldCtr = ctr;
					fldName = key;
					fldCtr = ctr;
					break;
	    		}
	    	}
	    }
    }
   fieldObjs.put(fieldObj.name, fieldObj);
   var tempobj = objMap.get(fldCtr);
   if(tempobj == null || tempobj == "undefined" || tempobj == "null" || tempobj == "")
   {
   	tempobj = new Map();
   }
   	tempobj.put(fldName, '');
   	objMap.put(fldCtr, tempobj);
}

function saveFieldObjByName(fieldName)
{
   saveFieldObj(document.getElementById(fieldName));
}

var validated = new Array()

//validate the field
function validateField(fieldObject)
{

    if(fieldObject)
    {
        if (fieldObject.name=="autoNameCheck")
        {

                if (document.forms[0].autoNameCheck.checked && document.forms[0].AutoNameSeries!=null && document.forms[0].AutoNameSeries.selectedIndex==0 && document.forms[0].AutoNameSeries.length!=1)
                    {
                            alert(emxUIConstants.STR_PICKAUTONAME);
                            return false;
                    }
        }
        if (fieldObject.name=="Name" && fieldObject.type.indexOf("select")!=-1 && fieldObject.selectedIndex==0 && fieldObject.length!=1)
        {
            alert(emxUIConstants.STR_PICKAUTONAME);
                            return false;
        }
      //Validate for length of name field
        if(fieldObject.name=="Name")
        	{
        	  var lengthCheck=checkValidLength(fieldObject.value);
        	  if(!(lengthCheck))
        		  {
        		  alert(emxUIConstants.STR_NAMECOLUMN);
        		  fieldObject.focus();
        		    return false;
        		  }
        	}
       // Validate using validateForBadCharacters methods if defined
       if (fieldObject.badcharValidate)
       {
           if (!(fieldObject.badcharValidate()))
           {
               return false;
           }
       }

       // Validate using validateForBadNameCharacters methods if defined
       if (fieldObject.badnamecharValidate)
       {
           if (!(fieldObject.badnamecharValidate()))
           {
               return false;
           }
       }

       // Validate using custom validation methods if defined
       if (fieldObject.customValidate)
       {
           if (!(fieldObject.customValidate()))
           {
               return false;
           }
       }

       // Validate using validateForRestrictedBadCharacters  methods if defined
       if (fieldObject.badrestrictedValidate)
       {
           if (!(fieldObject.badrestrictedValidate()))
           {
               return false;
           }
       }

       // Validate numeric fields
       if (fieldObject.numericValidate)
       {
           if (!(fieldObject.numericValidate()))
           {
               return false;
           }
       }

       // Validate Integer fields
       if (fieldObject.integerValidate)
       {
           if (!(fieldObject.integerValidate()))
           {
               return false;
           }
       }

        //Validate for required checkboxes and radio buttons
        //start
        var formReference = "";

        var curhref = document.location.href;
        if (curhref.indexOf("emxform.jsp" >= 0)) {
          formReference = "this.";
        }
        else if (parent.searchPane) {
          formReference = "parent.searchPane.";
        }
        else if(parent.searchContent) {
            formReference = "parent.searchContent.";
        }

          if (eval(formReference+"document.forms[0]") && eval(formReference+"document.forms[0][fieldObject.name]") && eval(formReference+"document.forms[0][fieldObject.name].length") && eval(formReference+"document.forms[0][fieldObject.name][0].getAttribute(\"required\")") == "true") {
                var found = false;
                for (var itr = 0; itr < validated.length; itr++)
                {
                    if (validated[itr] == fieldObject.name)
                    {
                        found = true;
                        break;
                    }
                }
                if (!found)
                {
                    validated.push(fieldObject.name);
                    return isZeroLength(fieldObject.name);
                }

            }
        //end
       // Validate required fields
       if (fieldObject.requiredValidate)
       {
           if (!(fieldObject.requiredValidate()))
           {
               return false;
           }
       }

       // Validate date fields
       if (fieldObject.dateValidate)
       {
           if (!(fieldObject.dateValidate()))
           {
               return false;
           }
       }
    }

    return true;
}

// This is used especially for tables not for forms or create
function validateTableFields(fieldObject)
{
    if(fieldObject)
    {
        if (fieldObject.name=="autoNameCheck")
        {

                if (document.forms[0].autoNameCheck.checked && document.forms[0].AutoNameSeries!=null && document.forms[0].AutoNameSeries.selectedIndex==0)
                    {
                            alert(emxUIConstants.STR_PICKAUTONAME);
                            return false;
                    }
        }
        if (fieldObject.name=="Name" && fieldObject.type.indexOf("select")!=-1 && fieldObject.selectedIndex==0)
        {
            alert(emxUIConstants.STR_PICKAUTONAME);
                            return false;
        }

	   var tempstr = getValidationsString(fieldObject);
       // Validate using validateForBadCharacters methods if defined
   	   if(tempstr != "null" && tempstr != "undefined" && tempstr != null && tempstr != "")	{
	       if(tempstr.indexOf("validateForBadCharacters") > -1)
	       {
		       if(!isBadChars(fieldObject))
		       {
		       	return false;
		       }
	       }

	       // Validate using validateForBadNameCharacters methods if defined
	       if(tempstr.indexOf("validateForBadNameCharacters") > -1)
	       {
		       if(!isBadNameChars(fieldObject))
		       {
		       	return false;
		       }
	       }

	       // Validate using custom validation methods if defined
	       if(tempstr.indexOf("customValidate") > -1)
	       {
	           var start = tempstr.indexOf("customValidate") + 15;
	           var end = tempstr.indexOf(",", start);
	           var methodName = "";
	           if(end > 1) {
				   methodName = tempstr.substring(start, end);
	           } else {
		           methodName = tempstr.substring(start);
	           }

	           assignValidateMethod(fieldObject.name, methodName)
	           if (!(fieldObject.customValidate()))
	           {
	               return false;
	           }
	       }

	       // Validate using validateForRestrictedBadCharacters  methods if defined
	       if(tempstr.indexOf("validateForRestrictedBadCharacters") > -1)
	       {
		       if(!isBadRestrictedChars(fieldObject))
		       {
		       	return false;
		       }
	       }

	       // Validate numeric fields
	       if(tempstr.indexOf("validateNumericField") > -1)
	       {
		       if(!isNumeric(fieldObject))
		       {
		       	return false;
		       }
	       }

	       // Validate Integer fields
	       if(tempstr.indexOf("validateIntegerField") > -1)
	       {
		       if(!isValidInteger(fieldObject))
		       {
		       	return false;
		       }
	       }
   	   }

       // Validate required fields
   	   if(tempstr != "null" && tempstr != "undefined" && tempstr != null && tempstr != "")	{
	       if(tempstr.indexOf("validateRequiredField") > -1)
	       {
		       if(!isZeroLength(fieldObject.name, fieldObject))
		       {
		       	return false;
		       }
	       }

           // Validate date fields
	       if(tempstr.indexOf("validateDateField") > -1)
	       {
		       if(!isValidDate())
		       {
		       	return false;
		       }
	       }
	   }
    }

    return true;
}

function validateForm(fromEditableTable)
{
    //The "editDatForm" will be inside the frame "searchPane", if "emxFormEditDisplay.jsp" is used in the context of "emxCommonSearch.jsp".
    //The "editDatForm" will be inside the frame "formEditDisplay", if "emxFormEditDisplay.jsp" is used in the context of "emxForm.jsp".
    var targetDoc = null;
    var curhref = parent.document.location.href;
    if (parent.document.location.href.indexOf("emxform.jsp" >= 0)) {
      targetDoc = document;
    }else if (document.location.href.indexOf("emxform.jsp" >= 0)) {
      targetDoc = document;
    }
    else if (parent.searchPane) {
      targetDoc = parent.searchPane.document;
    }
    else if(parent.searchContent)
    {
        targetDoc = parent.searchContent.document;
    }
    else {
      return true;
    }

    //Only validate on modified fields on the Editable Table
    if(fromEditableTable)
    {
        //for(n=0; n < fieldObjs.length; n++)
        var temparray = fieldObjs.keySet();
        for(var n=0; n < temparray.length; n++)
        {
           var tempobj = fieldObjs.get(temparray[n]);
           //if(fieldObjs[n] == null || fieldObjs[n] == "undefined" || fieldObjs[n] == "null" || fieldObjs[n] == "")
           if(tempobj == null || tempobj == "undefined" || tempobj == "null" || tempobj == "")
           {
               break;
           }
           else
           {
              if(!validateTableFields(tempobj))
              {
                  return false;
              };
           }
        }
    }
    else
    {
        for (var i = 0; i < targetDoc.forms[0].elements.length; i++ )
        {
            if(!validateField(targetDoc.forms[0].elements[i]))
            {
                validated = new Array();
                return false;
            };
        }

        //Code added to support TypeAhead on webforms configured for Search
        if(parent.searchContent)
        {
            var bodyFrame = findFrame(getTopWindow(),"searchContent");
            if (bodyFrame && bodyFrame.document.getElementById("formId"))
            {
                    var theForm = bodyFrame.document.forms[0];
                    var queryString = "?form=" +bodyFrame.document.getElementById("formId").value;
                    if (bodyFrame.document.getElementById("timeStamp"))
                    {
                        queryString = queryString + "&timeStamp=" + bodyFrame.document.getElementById("timeStamp").value;
                    }
                    if (theForm)
                    {
                         for (var i = 0; i < theForm.elements.length; i++ )
                        {
                            queryString =queryString +"&"+ theForm.elements[i].name+"="+ theForm.elements[i].value;
                        }
                        var searchURL="emxFormConfigurableSearch.jsp";
                        var sResponse = emxUICore.getDataPost(searchURL , queryString);
                    }
            }
        }
    }
    validated = new Array();
    return true;

}

var canSubmit = true;
function setFormSubmitAction(submitaction)
{
        canSubmit = submitaction;
}


function saveChanges(targetLocation)
{

	var doc;

    if(canSubmit)
    {
        if (parent.searchPane)
        {
            // The "editDataForm" will be inside the frame "searchPane",
            // if "emxFormEditDisplay.jsp" is used in the context of "emxCommonSearch.jsp".
            if(getTopWindow().doSearch)
            {
                getTopWindow().doSearch();
            }
        }
        else if (parent.searchContent)
        {
            if(parent.doFind)
            {
            	parent.doFind();
            }
        }
        else
        {
            if (validateForm()) {
             	doc=document;
                try{
                if(getTopWindow().getWindowOpener() != null){
                    if(getTopWindow().getWindowOpener().document.location.href.indexOf("emxFormViewHeader.jsp")>-1) {
                    	doc.getElementById("sessionRemove").value = "false";
                    	}
               		}
                } catch (e) {
                // do nothing
                }
                if(getTopWindow().location.href.indexOf("emxForm.jsp") > -1){
                	doc.body.onunload = function(){};
                	doc.body.onbeforeunload = function(){};
                }
                var target = "formEditHidden";

                var formName=doc.forms["editDataForm"];

                formName.target = target;
                var timeStamp=doc.getElementById("timeStamp").value;
                var mode=doc.getElementById("mode").value;
                var uiType=doc.getElementById("uiType").value;

                if (validatemxLinks(formName, mode, uiType, timeStamp))
                {
                    setFormSubmitAction(false);
                    turnOnProgress();
                		if(!doc.forms["editDataForm"].submitMultipleTimes) {
                    document.body.style.cursor = "wait";
                    doc.body.style.cursor = "wait";
                		}

                    var url = "emxFormEditProcess.jsp";
                    doc.forms["editDataForm"].action = url;
                    addSecureToken(doc.forms["editDataForm"]);
                    doc.forms["editDataForm"].submit();
                    removeSecureToken(doc.forms["editDataForm"]);
            }
           }else
            {
                    setFormSubmitAction(true);
            }
        }
    }
    else
    {
        return;
    }
}


function validatemxLinks(objForm, sMode, sUiType, sTimeStamp, objCount)
{
    var result = new Boolean(false);
    if (sTimeStamp == null || sTimeStamp == "undefined")
    {
        sTimeStamp = objForm.timeStamp.value;
    }

    var queryString = "timeStamp=" + sTimeStamp + "&mode=" + sMode + "&uiType=" + sUiType + "&objCount=" + objCount;
    var formSize = objForm.elements.length;
    var mxLinkFound = "false";
    var mxLinkPattern = new RegExp("mxlink"+"\\s*:");

	if(sUiType == "table")
	{
        var temparray = fieldObjs.keySet();
        for(var n=0; n < temparray.length; n++)
        {
           var tempobj = fieldObjs.get(temparray[n]);
           if(tempobj == null || tempobj == "undefined" || tempobj == "null" || tempobj == "")
           {
               break;
           }
           else
           {
		        if((tempobj.type=="text")||(tempobj.type=="textarea"))
		        {
				    var formFieldValue = new String(tempobj.value);
				    var formFieldName = new String(tempobj.name);
				    if(formFieldName == emxUIConstants.STR_NAME)
				    {
					    if(tempobj.disable)
	        {
			var tFlag = isMaxiumLength(formFieldValue);
			if(tFlag == false)
				return false;
            	}
	    }
      mxLinkPattern.compile("mxlink"+"\\s*:","gi");
            if(formFieldValue && (mxLinkPattern.test(formFieldValue)))
            {
                mxLinkFound = "true";
                queryString = queryString + "&" + formFieldName + "=" + formFieldValue;
            }
        }
    }
        }
    } else {
	    for(var i=0; i<formSize; i++)
	    {
		if((objForm.elements[i].type=="text")||(objForm.elements[i].type=="textarea"))
		{
		    var formFieldValue = new String(objForm.elements[i].value);
		    var formFieldName = new String(objForm.elements[i].name);

            mxLinkPattern.compile("mxlink"+"\\s*:","gi");
		    if(formFieldValue && (mxLinkPattern.test(formFieldValue)))
		    {
			mxLinkFound = "true";
			queryString = queryString + "&" + formFieldName + "=" + formFieldValue;
		    }
		}
	    }
    }

    if(mxLinkFound == "true") {
    var mxValidateURL = "emxMxLinkValidation.jsp" ;
    var sResponse = emxUICore.getXMLDataPost(mxValidateURL , queryString);

    try{
        var root = sResponse.documentElement;
        var xPath = "/mxLinkRoot";

        var mxLinkNodes = emxUICore.selectSingleNode(root,xPath);

        var errorMsgNodeValue;
        if(isIE) {
            errorMsgNodeValue = mxLinkNodes.childNodes[0].firstChild.nodeValue;
        }else {
            errorMsgNodeValue = mxLinkNodes.childNodes[1].childNodes[1].nodeValue;
        }

        if(errorMsgNodeValue != null && errorMsgNodeValue) {
            errorMsgNodeValue = trimString(errorMsgNodeValue);
        }

        var result;
        if(errorMsgNodeValue != "" && errorMsgNodeValue != null && errorMsgNodeValue) {
            result = confirm(errorMsgNodeValue);
        }

        if(result) {
            var formFieldName = "";
            var formFieldValue = "";

            for(var k=1; k<mxLinkNodes.childNodes.length; k++) {
                if (mxLinkNodes.childNodes[k].nodeName=== "mxField") {
                    formFieldName = mxLinkNodes.childNodes[k].getAttribute("name");
                    if(!isIE) {
                        formFieldValue = mxLinkNodes.childNodes[k].childNodes[1].nodeValue;
                    }else {
                        formFieldValue = mxLinkNodes.childNodes[k].firstChild.nodeValue;
                    }
                    objForm.elements[formFieldName].value=formFieldValue;
                }
            }
        }
    }catch(e){
      if(-2146828218 != e.number && -2147418094 != e.number)
      {
		if(e.description == ""){
			alert(emxUIConstants.STR_JS_AnExceptionOccurred + " " + emxUIConstants.STR_JS_ErrorName + " " + e.name
    				+ emxUIConstants.STR_JS_ErrorDescription + " " + e.description
    				+ emxUIConstants.STR_JS_ErrorNumber + " " + e.number
    				+ emxUIConstants.STR_JS_ErrorMessage + " " + e.message);
			} else {
        alert(e.description);
        }
      }
    }
    }
    return result;
}
function closeSlideinWindow(){
	getTopWindow().closeSlideInDialog();
}

function doReset()
{
     if(getTopWindow().window.info && getTopWindow().window.info["CompareCriteriaJSON"]){
	    getTopWindow().window.info["CompareCriteriaJSON"] = "";
	  }
	var formObj = document;//findFrame(getTopWindow(), "formEditDisplay");
	formObj.location.href = formObj.location.href;
}
function doCancel(targetLocation, isSelfTargeted, portalMode)
{
	if(targetLocation != 'popup' || getTopWindow().location.href.indexOf("emxNavigatorDialog.jsp") > -1){
		var formEditDisplay = findFrame(getTopWindow(), "formEditDisplay");
		var timeStamp = formEditDisplay ? $("input[name='timeStamp']", formEditDisplay.document.editDataForm).val() : "";
		purgeEditFormData(timeStamp);
		goBackToViewMode(targetLocation, portalMode);
		if(isSelfTargeted == 'true') {

		}else {
			if(targetLocation == 'slidein'){
				getTopWindow().closeSlideInDialog();
			} else {
				if(getTopWindow().getWindowOpener()){
					getTopWindow().closeWindow();
				}
			}
		}
	}else{
		var formEditDisplay;
		if(getTopWindow().isMobile){
			formEditDisplay = document;
		}else{
			formEditDisplay = findFrame(getTopWindow(), "formEditDisplay");
			formEditDisplay = formEditDisplay ? formEditDisplay.document : "";
		}
		var timeStamp = formEditDisplay ? $("input[name='timeStamp']", formEditDisplay.editDataForm).val() : "";
	//clear unload methods
		frmobj.body.onunload = function(){};
		frmobj.body.onbeforeunload = function(){};
	//perform cleanup
	purgeEditFormData(timeStamp);
	//close dialog
		getTopWindow().closeWindow();
	}
}

function goBackToViewMode(targetLocation, portalMode){
	if(portalMode == 'true') {
		location.href = changeURLToViewMode(location.href);
	} else {
		var contentFrame = getFormContentFrame(targetLocation);
		if(contentFrame){
			contentFrame.location.href = changeURLToViewMode(contentFrame.location.href);
		}
	}
}

function changeURLToViewMode(strURL){
	if(strURL){
		strURL = removeParam(strURL, "mode");
		strURL = removeParam(strURL, "formHeader");
	strURL = strURL.replace(/\&viewtoolbar=/g, "\&toolbar=");
	strURL = strURL.replace(/\?viewtoolbar=/g, "\?toolbar=");
	strURL = strURL.replace(/\&viewformHeader=/g, "\&formHeader=");
	strURL = strURL.replace(/\?viewformHeader=/g, "\?formHeader=");
		strURL += "&mode=view";
		if (strURL.indexOf("viewform") >= 0) {
			strURL = removeParam(strURL, "form");
			strURL = strURL.replace(/\&viewform=/g, "\&form=");
			strURL = strURL.replace(/\?viewform=/g, "\?form=");
		}
	}
	return strURL;
}

function getFormContentFrame(targetLocation){
	var contentFrame = null;
	if(!contentFrame && targetLocation == 'slidein'){
		contentFrame = findFrame(getTopWindow(),"slideInFrame");
	}
	if(!contentFrame){
		contentFrame = findFrame(getTopWindow(),"detailsDisplay");
	}
	if(!contentFrame){
		contentFrame = findFrame(getTopWindow(),"content");
	}
	return contentFrame;
}
function toggleMode(editLinkURL){

	//var contentFrame = getFormContentFrame(targetLocation);
	editLinkURL += "&isSelfTargeted=true";
	this.document.location.href = editLinkURL;
	//UIFormEdit.editMode();
}

function fastTrim(strMsg) {
  return strMsg.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
}

// Function clean up the form data
function purgeEditFormData(timeStamp, action){

	action = action || "cancel";
    //querystring
	var qString = (location && location.search && location.search.indexOf("?") > -1 )
				? location.search + "&action=" + action
				: location.search + "?action=" + action ;
    if(timeStamp){
    	qString += "&timeStamp=" + timeStamp;
    }
    var msg = trimString(emxUICore.getData('emxFormEditCancelProcess.jsp'+ qString));
	msg = fastTrim(msg);
    if(msg.length > 0){
        //<script??
        if(msg.indexOf("<script")>-1){
            var myFrame = findFrame(getTopWindow(),"formEditHidden");
            if(myFrame){
                myFrame.document.open();
                myFrame.document.write(msg);
                myFrame.document.close();
            }
        }else{
            alert(msg);
        }
    }
}

// Function clean up the form data
function purgeViewFormData(timeStamp)
{
  var objHiddenFrame = getTopWindow().openerFindFrame(getTopWindow(), "hiddenFrame");
  if (!objHiddenFrame)
  {
      objHiddenFrame = getTopWindow().openerFindFrame(getTopWindow(), "hiddenTreeFrame");
      if (!objHiddenFrame)
      {
          objHiddenFrame = getTopWindow().openerFindFrame(getTopWindow(), "formViewHidden");
      }
  }

  objHiddenFrame.document.location.href = "../common/emxFormViewCloseProcess.jsp?timeStamp=" + timeStamp;
}


// Function to cleanup form
function cleanUpFormData2(timeStamp)
{
    if (isNS4)
      window.stop();

  document.location.href = 'emxFormCleanupData.jsp?timeStamp=' + timeStamp;
}



    // Printer Friendly window variable.
    var printDialog = null;

    function openPrinterFriendlyPage()
    {
        var strURL = "";
        currentURL = document.location.href;
        currentURL = currentURL.replace("emxForm.jsp", "emxFormViewDisplay.jsp");
        if (currentURL.indexOf("?") == -1){
            strURL = currentURL + "?PFmode=true";
        }else{
            strURL = currentURL + "&PFmode=true";
        }
        //make sure that there isn't a window already open
    if (!printDialog || printDialog.closed) {

      		var strFeatures = "scrollbars=yes,toolbar=yes,location=no,resizable=yes";
            printDialog =window.open("emxBlank.jsp", "PF" + (new Date()).getTime(), strFeatures);
            var formCustomFilterFieldValues = returnCustomFilterValues();
            submitPost(strURL,printDialog.name,formCustomFilterFieldValues,true);

      //set focus to the dialog
      printDialog.focus();

    } else {
          //if there is already a window open, just bring it to the forefront (NCZ, 6/4/01)
      if (printDialog) printDialog.focus();
    }
}

//returns custom fillter commands along with appropriate values
function returnCustomFilterValues(){
	var formCount=0;
    var formFieldValues="";
    var fieldValue="";
    var checkBoxValues = {};
    var checkBoxName = "";
    for(var i=0;i<document.forms[formCount].elements.length;i++){
        if(document.forms[formCount].elements[i].type=="text"){
                fieldValue=document.forms[formCount].elements[i].value;
                formFieldValues+="&"+document.forms[formCount].elements[i].name+"="+fieldValue;
                //formFieldValues+="&"+document.forms[formCount].elements[i].name+"="+fieldValue;
        }
        else if(document.forms[formCount].elements[i].type=="select-one"){
                //Modified to pass the selected option value instead of display value.
                //this will fail in internationalization if value is not passed
                fieldValue = document.forms[formCount].elements[i].options[document.forms[formCount].elements[i].selectedIndex].value;
                formFieldValues+="&"+document.forms[formCount].elements[i].name+"="+fieldValue;
        }
        // Added for Toolbar HTML Widgets to pass the hidden msValue for Date
        else if(document.forms[formCount].elements[i].type=="hidden")
        {
        	fieldValue = document.forms[formCount].elements[i].value;
			formFieldValues+="&"+document.forms[formCount].elements[i].name+"="+fieldValue;
        }
        //added for bug : 345219
        else if(document.forms[formCount].elements[i].type=="checkbox")
        {
        	if(document.forms[formCount].elements[i].checked){
                fieldValue = document.forms[formCount].elements[i].value;
                checkBoxName  = document.forms[formCount].elements[i].name;

               if(checkBoxValues[checkBoxName]) {
                    fieldValue = checkBoxValues[checkBoxName].value + "," + fieldValue;
               }
               checkBoxValues[checkBoxName]= {name:checkBoxName,value:fieldValue};
             }
        }
    }
    for(property in checkBoxValues){
   		formFieldValues +="&"+checkBoxValues[property].name+"="+checkBoxValues[property].value;
    }
    return formFieldValues;
}




function openRenderPDFPage(timeStamp, useAdlibSetup) {

	var strURL = "";
	useAdlibSetup = useAdlibSetup.toString();

	if (useAdlibSetup == "true") {

		var frmWindow = findFrame(parent, "formViewDisplay");
		if (frmWindow == null) {
			frmWindow = findFrame(parent, "formEditDisplay");

		}

		currentURL = document.location.href;

		if (currentURL.indexOf("?") == -1) {
			strURL = "emxRenderPDFDisplay.jsp";
		} else {
			strURL = "emxRenderPDFDisplay.jsp"
					+ currentURL.substring(currentURL.indexOf("?"));
		}

		if (strURL.indexOf("?") > 0) {
			strURL += "&uiType=form&useAdlibSetup=" + useAdlibSetup;
		} else {
			strURL += "?uiType=form&useAdlibSetup=" + useAdlibSetup;
		}
		var intWidth = "800";
		var intHeight = "800";

		//window.location=strURL;

		showNonModalDialog(strURL, intWidth, intHeight, true);

	} else {
		currentURL = document.location.href;
		if (currentURL.indexOf("?") == -1) {
			strURL = "emxRenderPDF.jsp";
		} else {
			strURL = "emxRenderPDF.jsp"
					+ currentURL.substring(currentURL.indexOf("?"));
		}

		if (strURL.indexOf("?") > 0) {
			strURL += "&uiType=form&useAdlibSetup=" + useAdlibSetup;
		} else {
			strURL += "?uiType=form&useAdlibSetup=" + useAdlibSetup;
		}

		var intWidth = "800";
		var intHeight = "800";
		window.location = strURL;

	}

}



    function openTipPageWindow(strURL)
    {
        window.open(strURL);
    }


	function getUpdatedString()
	{
		var result = "";
		var keys = objMap.keySet();
		for( var i=0; i < keys.length; i++ )
		{
			if(i!=0) {
				result += ",";
			}
			result += keys[i] + ":";
			var valMap = objMap.get(keys[i]);
			var vals = valMap.keySet();
			for( var j=0; j < vals.length; j++ )
			{
				if(j!=0) {
					result += "|";
				}
				result += vals[j];
			}
		}
		return result;
	}



    var canTableFormSubmit = true;
    function setTableFormSubmitAction(submitaction)
    {
            canTableFormSubmit = submitaction;
    }

    function tableEditsaveChanges(isApplyClicked)
    {
        if(canTableFormSubmit)
        {
            var bodyFrame = findFrame(parent, "formEditDisplay");
            if(bodyFrame)
            {
                bodyFrame.parent.turnOnProgress();
            }
            else {
                turnOnProgress();
            }

            if (validateForm(true))
            {
                var target = "formEditHidden";
                var theForm = parent.formEditDisplay.document.forms["editDataForm"];
                theForm.target = target;

                var timeStamp=theForm.timeStamp.value;
                var objCount = 0;
                if(theForm.objCount){
                	objCount = theForm.objCount.value;
                }
                if (validatemxLinks(theForm, "edit", "table", timeStamp, objCount)) {
                    if("true"==isApplyClicked)
                    {
					setTableFormSubmitAction(true);
					}
                parent.document.forms["massUpdateForm"].clearEditObjList.value = "false";
                if("true"==isApplyClicked)
					{
					theForm.action = "emxTableEditProcess.jsp?isApply=true";
					parent.document.forms["massUpdateForm"].clearEditObjList.value = "true";
					}
				else
					{
					theForm.action = "emxTableEditProcess.jsp?";
					}
                var ss = getUpdatedString();
                if(theForm.updatedfieldmap){
                    theForm.updatedfieldmap.value = ss;
                }
                addSecureToken(theForm);
                theForm.submit();
                removeSecureToken(theForm);
                }
            } else {
                    setTableFormSubmitAction(true);
                    turnOffProgress();
            }
        } else {
            return;
        }
    }

    function openFormExportPage(pageHeader)
    {
         var url = "emxFormExport.jsp";
         document.frmFormView.target= "formViewHidden";
		 document.frmFormView.method = "post";
         document.frmFormView.action = url;
         document.frmFormView.submit();
    }

    function exportData(timeStamp)
    {
       openFormExportPage("");
    }




    function exportToExcelHTML(tStamp,objectId,relId,form,pageHeader)
    {
        var strURL = "emxFormViewDisplay.jsp?timeStamp" + tStamp + "&relId=" + relId + "&objectId=" + objectId + "&form=" + form + "&parsedHeader=" + escape(pageHeader) + "&reportFormat=ExcelHTML";
        var strFeatures = "location=no,menubar=yes,titlebar=yes,width=700,height=500,resizable=yes,scrollbars=auto";
        window.open(strURL, "ExportForm", strFeatures);
    }


    function shiftFocus(strForm, objInput) {

      var objForm = document.forms[strForm];

      for (var i=0; i < objForm.elements.length; i++) {
        if (objInput == objForm.elements[i]) {
          if (objForm.elements[i+1]) {
            objForm.elements[i+1].focus();
            return;
          } //End: if (objForm.elements[i+1])
        } //End: if (objInput == objForm.elements[i])
      } //End: for (var i=0; i < objForm.elements.length; i++)

    } //End: function shiftFocus(strForm, objInput)


    function saveCreateChanges(isApply,targetLocation)
    {

        if(!isApply){
        	isApply = false;
        }
        if(canSubmit)
        {
            //setFormSubmitAction(false);
            if (validateCreateForm())
            {
                turnOnProgress();
                var objform = document.forms['emxCreateForm'];
                var timeStamp=document.getElementById("timeStamp").value;
                var mode=document.getElementById("mode").value;
                var uiType=document.getElementById("uiType").value;
                    if (validatemxLinks(objform, mode, uiType, timeStamp)) {
                        setFormSubmitAction(false);
                    objform.target = "formCreateHidden";
                        objform.action = "emxCreateProcess.jsp?isApply=" + isApply;
                        addSecureToken(objform);
                    objform.submit();
                    removeSecureToken(objform);
            }
            }
            else
            {
                setFormSubmitAction(true);
            }
        }
        else
        {
            return;
        }
    }


    function cancelCreate()
    {
        var timeStamp = document.emxCreateForm.timeStamp.value;
        purgeCreateFormData(timeStamp);
//      getTopWindow().close()
    }

    // Function clean up the form data
    function purgeCreateFormData(timeStamp)
    {
        emxUICore.getData('emxCreateCancelProcess.jsp?timeStamp=' + timeStamp);
        var myFrame = findFrame(getTopWindow(),"formCreateHidden");
        if(myFrame){
            myFrame.document.close();
        }
    }

    // Function clean up the form data
    /*function purgeCreateFormData(timeStamp)
    {
        var objHiddenFrame = getTopWindow().openerFindFrame(getTopWindow(), "hiddenFrame");

        if (!objHiddenFrame)
        {
            objHiddenFrame = getTopWindow().openerFindFrame(getTopWindow(), "hiddenTreeFrame");

            if (!objHiddenFrame)
            objHiddenFrame = getTopWindow().openerFindFrame(getTopWindow(), "formCreateHidden");
        }

        objHiddenFrame.document.location.href = 'emxCreateCancelProcess.jsp?timeStamp=' + timeStamp;
    }*/

    function validateCreateForm()
    {
        for (var i = 0; i < document.forms['emxCreateForm'].elements.length; i++ )
        {
            if(!validateField(document.forms['emxCreateForm'].elements[i]))
            {
                validated = new Array();
            return false;
            };
        }
        validated = new Array();
        return true;
    }

    function runValidate()
    {
        var x =0;
        for(x=0; x < myValidationRoutines.length;  x++)
        {
            var tempArray = myValidationRoutines[x];
            try
            {
            	eval (tempArray[0] + "('" + tempArray[1] + "');");
            } catch(e){}
        }

        for(x=0; x < myValidationRoutines1.length;  x++)
        {
            var tempArray = myValidationRoutines1[x];
            try
            {
            	eval (tempArray[0] + "('" + tempArray[1] + "','" + tempArray[2] + "');");
            } catch(e){}
        }
        var dateChooserArray = document.getElementsByTagName("A");
        for(var i=0; i<dateChooserArray.length; i++) {
        	if(dateChooserArray[i].id == 'formDateChooser'){
        		attachEventHandler(dateChooserArray[i], "click", setPositionForCalendar);
        	}
        }
        FormHandler.Init();
        buildNumericFieldValues("create");
    }

    // Following methods are added as part of Dynamic Attributes feature.

    // Periodically check whether elements to propagate have changed
    // their value since the last check
    function checkAndPropagate()
    {
        for (var itr = 0; itr < document.propagateElems.length; itr++)
        {
            var elem = document.propagateElems[itr];
            if (hasChanged(elem))
            {
                elem.onchange();
            }
        }
        setTimeout("checkAndPropagate()", 200);
    }

    // Compares current state with stored previous state
    function hasChanged(elem)
    {
        return elem.value != elem.prevValue;
    }

    // Test whether the element is a dynamic attribute,
    // If so, return its base name, stripping out the prefix.
    // Else return null.
    function getBaseName(elem)
    {
        //var match = elem.name.match(/^#[0-9]+,(.*)/);
        var match = elem.name.match(/^DA[0-9]+_(.*)/);
        return (match == null ? elem.name : match[1]);
    }

    // Loop over our elements of interest; for those that
    // are replicates of this, update their state to match
    // this.
    function propagate()
    {
        var baseName = getBaseName(this);
        var elems = document.propagateElems;

        for (var elemNum = 0; elemNum < elems.length; elemNum++)
        {
            var elem = elems[elemNum];
            if (getBaseName(elem) == baseName)
            {
                elem.value = this.value;
                elem.prevValue = elem.value;
            }
        }
    }

    // Find all form elements that represent the replicated attribute,
    // and perform some surgery on them.  Add an onchange handler
    // (of sorts) to propagate value changes as needed, and also
    // add some explanatory hint text below the field.
    function modifyRedundantFields()
    {
        // Keep track of the elements that we mess with
        document.propagateElems = new Array();
        var form = document.forms[0];
        var n = 0;

        for (var elemNum=0; elemNum < form.length; elemNum++)
        {
            var elem = form[elemNum];
            var baseName = getBaseName(elem);

            if (baseName != null)
            {
                // if there are any dupes, one of them is definitely #2
                var firstDup = 'DA2_' + baseName;

                if (firstDup in form && elem.type != 'hidden')
                {
                    document.propagateElems[n++] = elem;

                    elem.prevValue = elem.value;

                    // Set the onchange, sort of.
                    // The JS onchange does not respond to programmatic value changes,
                    // such as by calendar widget, so roll our own onchange.
                    elem.onchange = propagate;

                    // Add the hint text by inserting it into the DOM
                    var container = elem.parentNode;  // the TD, I hope...

                    var br = document.createElement('br');
                    var span = document.createElement('span');
                    span.setAttribute('class', 'hint');

                    // There's probably a more 'correct' way to do i18n in js...
                    var text = document.createTextNode(document.emxRedundantAttrsHintStr);
                    span.appendChild(text);
                }
            }
        }

        // Our mcmonchange monitors value changes via this timeout
        setTimeout("checkAndPropagate()", 200);
    }

// added New OOTB Method for the search webform configaration
 function doSearch()
    {
        var theForm = document.forms[0];
        theForm.target = "searchView";
        var formId = document.getElementById("formId").value;
        var timestamp=document.getElementById("timeStamp").value;
        var queryString="?form=" + formId + "&timeStamp=" + timestamp;

        for (var i = 0; i < document.forms[0].elements.length; i++ ) {
            queryString =queryString +"&"+ theForm.elements[i].name+"="+theForm.elements[i].value;
        }

        var searchURL="emxFormConfigurableSearch.jsp";
        var sResponse = emxUICore.getDataPost(searchURL , queryString);
             var strToolbarName = "";
             currentURL = document.location.href;
             if(currentURL.indexOf("emxform.jsp") <= -1){
            	 currentURL = parent.document.location.href;
             }

             if(currentURL.indexOf("emxform.jsp") <= -1){
              	frmWindow = findFrame(this, "searchContent");
             if(frmWindow == null) {
	        frmWindow = findFrame(parent, "searchContent");
             }

            currentURL = frmWindow.document.location.href;
             }

	        var strToolbar = currentURL.indexOf("&resultsToolbar=");
	        if (currentURL.indexOf("&resultsToolbar=") != -1) {
	            strToolbarName = currentURL.substring(strToolbar+16,currentURL.indexOf("&",strToolbar+1));
	        }
	        theForm.action = "../common/emxTable.jsp?toolbar="+strToolbarName+"&pagination="+document.getElementById("paginationId").value;
	        if(validateForm()){
                 theForm.submit();
            }
    }


 // added New OOTB Method for the webform setting input Type=dynamictextarea
//creating and displaying textarea inside div element
    function displayDynamicTextarea(element, isFullTextSearch)
    {
        var textboxValueArray = new Array();
        var textboxArrayValueList;
        var textAreaelementsize;
        elementName = element.getAttribute("name");
        var isReadOnly = element.getAttribute("isReadOnly") == "true";
        var strUserAgent = navigator.userAgent.toLowerCase();
        var reIE = new RegExp("msie (\\S*);");
        reIE.test(strUserAgent);
        var fVer = parseFloat(RegExp["$1"]);
        if ((document.forms[0].elements["dynamicTextarea"]!= null||document.forms[0].elements["dynamicTextarea"]!= "undefined") && !isReadOnly)
        {
         	if ((isIE)&&(fVer<7))
         	{
    		    document.forms[0].elements[elementName].className = "flipperIEEdit";
            }
            else
            {
    		    document.forms[0].elements[elementName].className = "flipperMozEdit";
            }
        }
        try {
        var divElementName = element.parentNode.lastChild.getAttribute("name");
        } catch (ex) {}
        var Delimiter = element.getAttribute("Delimiter");
        if(Delimiter=="\\"){
        Delimiter="";
        }else{
        // Modified for Bug 347087
        //var index = STR_DELIMITER_BAD_CHARS.search(Delimiter);
        var index = STR_DELIMITER_BAD_CHARS.indexOf(Delimiter);
        if(index >= 0){
        Delimiter="";
        }
        }

        var elementSize = element.getAttribute("size");
		//checking the browser whether it is IE or Mozilla
        textAreaelementsize = elementSize;
        var rowSize="";
        if(isIE)
        	rowSize="4";
        else
			rowSize="3";

        if(divElementName != "divname")
        {

            objTextarea = document.createElement("div");
            objTextarea.setAttribute("name","divname");
            objTextarea.setAttribute("id","divid");
            var textBoxValue = element.value;
            objTextarea.style.margin = '-3px 0px';
            if (Delimiter == "")
            {
                textboxValueArray = textBoxValue.split(",");
            }
            else
            {
                textboxValueArray = textBoxValue.split(Delimiter);
            }
            textboxArrayValueList = textboxValueArray.join("\n");
            element.value = "";

    		var onblurFunc = "'javascript:hideDynamicSetText(this,\""+Delimiter+"\")'";
    		if(isFullTextSearch) {
    			onblurFunc = "'javascript:FullSearch.hideDynamicSetText(this,\"" + Delimiter + "\"," + elementName + ")'";
    			element.parentNode.parentNode.className = "active";
    			objTextarea.setAttribute("class","popup form");
    		}

            //added for BUG:353061 ,To display dynamic TextArea Properly in IE
            //if(isIE && isFullSearch ){
            if(isIE){
				Xpos = emxUICore.getActualLeft(element);
				//Ypos = emxUICore.getActualTop(element);
				Ypos = emxUICore.getScrollTop(element);
				Ypos += 23;
				var objFrame = document.createElement("IFRAME");
				objFrame.setAttribute("name","framedataFullSearch");
				objFrame.setAttribute("id","framedataFullSearch");
				objFrame.frameBorder = 0;
            textarea = "<textarea name=\"dynamicTextarea\" cols=\""+textAreaelementsize+"\" rows=\""+rowSize+"\" isReadOnly=\""+isReadOnly+"\" onBlur=" + onblurFunc + ">"+textboxArrayValueList+"</textarea>";
				objTextarea.setAttribute("target","framedataFullSearch");
				//this code is commented to avoid extra text area getting created on click of any fieldchooser in searchpage
				//document.forms[0].appendChild(objFrame);
				document.forms[0].appendChild(objTextarea);
				objTextarea.innerHTML = textarea;
				//objFrame.style.position = "absolute";
				//objFrame.style.height = "68px";
				//objFrame.style.width = (textAreaelementsize * 8.77)+"px";
				objTextarea.style.position = "absolute";
				//emxUICore.moveTo(objFrame,Xpos,Ypos);
				if(isFullTextSearch) {
					Xpos= Xpos + element.offsetWidth+5;
					Ypos= Ypos - (objTextarea.offsetHeight - element.offsetHeight)/2 - 15;
				}
				emxUICore.moveTo(objTextarea,Xpos,Ypos);
            }else{
	            textarea = "<textarea name=\"dynamicTextarea\" cols=\""+textAreaelementsize+"\" rows=\""+rowSize+"\" isReadOnly=\""+isReadOnly+"\" onBlur=" + onblurFunc + ">"+textboxArrayValueList+"</textarea>";
            objTextarea.innerHTML = textarea;

            objTextarea.style.position = "absolute";
            document.forms[0].appendChild(objTextarea);
            Xpos = emxUICore.getActualLeft(element);
            //Ypos = emxUICore.getActualTop(element);
			Ypos = emxUICore.getScrollTop(element);
			if(isFullTextSearch) {
				Xpos= Xpos + element.offsetWidth+5;
				Ypos= Ypos - (objTextarea.offsetHeight - element.offsetHeight)/2;
			}
            emxUICore.moveTo(objTextarea,Xpos,Ypos);
            }
            if(getTopWindow().isMobile){
            	window.focus();
            }
            document.forms[0].elements["dynamicTextarea"].focus();
        }
    }//end function

//To hide the dynamic textarea and populate the values in textbox
    function hideDynamicSetText(textareaElement,Delimiter)
    {
		var value = textareaElement.value;
		var isReadOnly = textareaElement.getAttribute("isReadOnly") == "true";
        if(!document.forms[0].name=="editDataForm"){
			FullSearch.removeSearchTimestamp(document.forms[0].elements[elementName],value);
		}
		document.forms[0].elements[elementName].value = formatForDisplay(value,Delimiter);
		var divElement = document.getElementById("divid");
		divElement.innerHTML = "";
		document.forms[0].removeChild(divElement);
        //To save the edited text in the edit mode of the form
        saveFieldObj(this);
        //added for BUG:353061 ,To remove dynamic TextArea IFRAME in IE
      	if(isIE){
        	var divElement = document.getElementById("framedataFullSearch");
			if(divElement)
			document.forms[0].removeChild(divElement);
        }
        //end BUG:353061
        if((document.forms[0].elements["dynamicTextarea"] == null||document.forms[0].elements["dynamicTextarea"] == "undefined") && !isReadOnly)
        {
             if ((isIE)&&(fVer<7))
            {
                document.forms[0].elements[elementName].className = "flipperIEView";
            }
            else
            {
                document.forms[0].elements[elementName].className =  "flipperMozView";
              }
       }
	}//end function


//method to set the format to display in the textbox
    function formatForDisplay(value,delimiter)
    {
		var valueArray = new Array();
		var stringValue = "";
		var textBoxValue;
		valueArray = value.split('\n');
        if(delimiter == "")
        {
			textBoxValue = valueArray;
        }
        else
			textBoxValue = valueArray.join(delimiter);
		return textBoxValue;
	}//end function


//method to set the position of the textbox on window Resize event
    function calculateXYCoordinates()
    {
		if(typeof elementName!="undefined"){
        var textboxElement=document.forms[0].elements[elementName];
		Xpos = emxUICore.getActualLeft(textboxElement);
		Ypos = emxUICore.getActualTop(textboxElement);
		Ypos += 24;
		objTextarea.style.position = "absolute";
		emxUICore.moveTo(objTextarea,Xpos,Ypos);
		}
 }// end function

//method to apply the Css on the on load event if the application is opened in the IE

	function applyCss()
	{
		if(isIE){
			var tagNameArr= document.getElementsByTagName('input');
			for (i=0;i<tagNameArr.length;i++){
				if (tagNameArr[i].className=="flipperMozView"){
					tagNameArr[i].className="flipperIEView";
				}
			}
		}
	}


  var DISPLAY_HREF = "";

//method to filter form page
//modified for bug : 345219
 function applyFormFilter(headerDoc,displayHref)
 {
 	var doc = null;
 	if(headerDoc != "null" && headerDoc != "undefined" && headerDoc != null && headerDoc != "")	{
   		doc = headerDoc;
   	} else 	{
   		doc = document;
   	}

 	var formCount=0;
    var formFieldValues = [];
    var length = 0;
    var fieldValue ="";
    var fieldName = "";
    var inputElements = jQuery('div#divToolbarContainer :input',$('div#pageHeadDiv'));
    for(var i=0;i<inputElements.size() ;i++){
        if(inputElements.get(i).type=="text"){
                fieldValue = inputElements.get(i).value;
                fieldName  = inputElements.get(i).name;
                formFieldValues.push({name:fieldName,value:fieldValue});
        }
        else if(inputElements.get(i).type=="select-one"){
                fieldValue = inputElements.get(i).options[inputElements.get(i).selectedIndex].value;
                fieldName  = inputElements.get(i).name;
                formFieldValues.push({name:fieldName,value:fieldValue});
        }
        else if(inputElements.get(i).type=="hidden"){
                fieldValue = inputElements.get(i).value;
                fieldName  = inputElements.get(i).name;
                formFieldValues.push({name:fieldName,value:fieldValue});
        }
        else if(inputElements.get(i).type=="checkbox"){

		// Modified for bug 347655
        	if(inputElements.get(i).t.checked){
                fieldValue = inputElements.get(i).value;
                fieldName  = inputElements.get(i).name;
                formFieldValues.push({name:fieldName,value:fieldValue});
             }
             else {
             	fieldName = inputElements.get(i).name;
                formFieldValues.push({name:fieldName,value:fieldValue});
             	}
        }
    }

   var objViewDisplayWindow = this;//findFrame(parent, "formViewDisplay");

   if(objViewDisplayWindow) {
   		if(displayHref != "null" && displayHref != "undefined" && displayHref != null && displayHref != ""){
   			DISPLAY_HREF = displayHref;
   		} else if(DISPLAY_HREF == null  || DISPLAY_HREF == "" || DISPLAY_HREF == "null"){
   			DISPLAY_HREF = objViewDisplayWindow.location.href;
   		}
   }

   var objViewHiddenWindow = findFrame(parent, "formViewHidden");
   var docfrag = objViewHiddenWindow.document.createDocumentFragment();
   var form    = objViewHiddenWindow.document.createElement('form');
   form.name   = "emxHiddenForm";

   for(var i=0; i<formFieldValues.length; i++)
   {
	  var input   = objViewHiddenWindow.document.createElement('input');
	  input.type  = "hidden";
	  input.name  = formFieldValues[i].name;
	  input.value = formFieldValues[i].value;
	  form.appendChild(input);
	}

   // Added : All values passed as post to emxForm is not carry fwded to emxFormEditDisplay and emxFormViewDisplay
   	DISPLAY_HREF  += "&appendURL=true";

	docfrag.appendChild(form);
	objViewHiddenWindow.document.body.appendChild(docfrag);
	setTimeout("submitAsPost(DISPLAY_HREF)",10);
 }

 //added for bug : 345219
 //method submit the hidden form to the target as post
 function submitAsPost(url)
 {
    var objHiddenWindow = findFrame(parent, "formViewHidden");
    //var objListWindow   = findFrame(parent, "formViewDisplay");
    var form = objHiddenWindow.document.forms[0];
    form.action = url;
    form.method = "post";
    form.target = this.name;
    form.submit();
    objHiddenWindow.location.href = "emxBlank.jsp";
 }

 /* Method to check the entered Field value is not having more than 127 characters
  * Need the argument as FieldValue
  * */
 function isMaxiumLength(formFieldValue)
 {
	var isMaxiumLength =  formFieldValue.length;
	if( isMaxiumLength > 127 ){
		alert(NAME_MORETHAN_127_CHARACTERS);
		return false;
	}
	if( isMaxiumLength == 0 ){
		alert(NAME_FIELD_EMPTY);
		return false;
	}
	return true;
}


//calculations

/**
 * buildNumericFieldValues
 * @param {}
 */
 function buildNumericFieldValues(modeFlag) {
	var objForm = document.forms[0];
 	var arithExprFields = new Array();
 	if(modeFlag == "view"){
 		var inputFields = emxUICore.getElementsByTagName(objForm,"input");
 		if (isIE) {
 			for(var j=0; j<inputFields.length; j++) {
 				if(inputFields[j].getAttribute("expression") != null){
 					arithExprFields.push(inputFields[j]);
 				}
 			}
 		}else{
 			arithExprFields = emxUICore.selectNodes(objForm,"//input[@expression]");
 		}
 	}else{
 		var tempFields = FormHandler.Fields.ToArray();
 		for(var i=0; i<tempFields.length; i++) {
 			var tempField = tempFields[i];
 			var dataType = tempField.GetSettingValue("Data Type");
 			var strArithExpr = tempField.GetSettingValue("Arithmetic Expression");
 			if(strArithExpr != null && strArithExpr != ""){
 				arithExprFields.push(tempField);
 			}
 			if(dataType != null && dataType == "numeric"){
 				if(modeFlag == "edit"){
 					if(tempField.ChangeHandlers == null){
 						tempField.ChangeHandlers = [];
 					}
 					var fnChangeMethod = eval("updateEditNumericFieldValues");
 					tempField.ChangeHandlers.push(fnChangeMethod);
 					tempField.EventHandlers(tempField);
 				}else if(modeFlag == "create"){
 					if(tempField.ChangeHandlers == null){
 						tempField.ChangeHandlers = [];
 					}
 					var fnChangeMethod = eval("updateCreateNumericFieldValues");
 					tempField.ChangeHandlers.push(fnChangeMethod);
 					tempField.EventHandlers(tempField);
 				}else if(modeFlag == "changeEdit" || modeFlag == "changeCreate"){
 					var jsFieldName = tempField.GetSettingValue("jsFieldName");
 					var newValue = tempField.GetActualValue();
 					if(newValue == null || newValue == ""){
 						newValue = "0";
 					}
 					try{eval(jsFieldName + " = " + newValue + ";");}catch(e){}
 				}
 			}
 		}
 	}

 	var result = "";
 	for(var ix=0; ix<arithExprFields.length; ix++) {
 		var numericField = arithExprFields[ix];
 		var aExpr;
 		var fieldName;
 		var decPrec;
 		if(modeFlag == "view"){
	 		aExpr = numericField.getAttribute("expression");
	 		decPrec = parseInt(numericField.getAttribute("decprec"));
	 		fieldName = numericField.getAttribute("name");
	 	}else{
	 		aExpr = numericField.GetSettingValue("Arithmetic Expression");
	 		decPrec = parseInt(numericField.GetSettingValue("Decimal Precision"));
	 		fieldName = numericField.Name;
	 	}

 		if(aExpr != null && aExpr != ""){
 			try{
 				if(decPrec != null && decPrec != "" && !isNaN(decPrec)){
 					result = parseFloat(eval(aExpr));
 					if(!isNaN(result)){
 						result = Math.round(result*Math.pow(10, decPrec))/Math.pow(10, decPrec);
 					}
	 			}else{
	 				result = parseFloat(eval(aExpr));
	 			}
 				var isNFEnabled = numericField.getAttribute("nfenabled");
 				if(modeFlag == "view" && isNFEnabled == "true"){
 					result = getFormattedNumber(result+"");
 				}
 			}catch(e){}
 		}else{
 			continue;
 		}
 		var arrTR;
	 	if (isIE) {
			arrTR = emxUICore.getElementsByTagName(objForm,"tr");
		}else{
			arrTR = emxUICore.selectNodes(objForm,"//tr[@id]");
		}
 		for(var idx=0; idx<arrTR.length; idx++) {
 			var objTR = arrTR[idx];
 			var id = objTR.getAttribute("id");
 			if("calc_"+fieldName == id){
 				var cell;
 				if (isIE) {
 					var arrTDs = emxUICore.getElementsByTagName(objTR,"td");
 					for(var k=0; k<arrTDs.length; k++) {
 						var objTD = arrTDs[k];
 						var className = arrTDs[k].getAttribute("class");
		 				if(modeFlag == "view" && className == 'field'){
		 					cell = objTD;
		 				}else if((modeFlag == "edit" || modeFlag == "changeEdit")  && className == 'inputField'){
		 					cell = objTD;
		 				}else if((modeFlag == "create" || modeFlag == "changeCreate")  && className == 'createInputField'){
		 					cell = objTD;
		 				}
		 			}
				}else{
					if(modeFlag == "view"){
	 					cell = emxUICore.selectSingleNode(objTR,".//td[@class = 'field']");
	 				}else if(modeFlag == "edit" || modeFlag == "changeEdit"){
	 					cell = emxUICore.selectSingleNode(objTR,".//td[@class = 'inputField']");
	 				}else if(modeFlag == "create" || modeFlag == "changeCreate"){
	 					cell = emxUICore.selectSingleNode(objTR,".//td[@class = 'createInputField']");
	 				}
				}

 				if(cell != null){
					cell.innerHTML = result;
				}
 			}
 		}
 	}
 }

 function updateEditNumericFieldValues(){
 	buildNumericFieldValues("changeEdit");
 }

  function updateCreateNumericFieldValues(){
 	buildNumericFieldValues("changeCreate");
  }

  function showFullSearchChooserInForm(url, curFieldName) {
	  url = getDynamicSearchRefinements(url, curFieldName);
	  var currentField = document.forms[0][curFieldName];
	  var isDefaultDefined = false;
	  var macros;
	  var macrosArray = new Array();
	  var defaultValueURL = "";
	  var additionaldefaultParameters = "";
	  var start = url.indexOf("default=");
	  var filtersArray = new Array();
	  if(start >-1){
		  isDefaultDefined = true;
	  }
	  if(isDefaultDefined){
		  var subString1 = url.substring(start);
		  var end = subString1.indexOf("&");
		  macros = subString1.substring(subString1.indexOf("=")+1,end);
		  var macroList = macros.split(":");
		  for(var i=0; i<macroList.length; i++) {
			  var input = macroList[i].split('=');
			  var fieldName;
			  var fieldValue;
			  if(input.length > 1){
				  fieldName  = input[0];
				  fieldValue = input[1];
				  var macroValue = [];
				  var isMacro = (fieldValue.indexOf("$") >= 0)?true:false;
				  if(isMacro){
					  var lookForField = "";
					  if(fieldValue.length >2){
						  lookForField = fieldValue.substring(2, fieldValue.length-1);
					  }
					  if(typeof document.forms[0][lookForField].value != 'undefined' ){
						  macroValue[0] = "Equals|"+document.forms[0][lookForField].value;
					  }else{
						  macroValue[0] = "";
					  }
				  }else{
					  macroValue = resolveDefaultValue(fieldValue);
				  }
				  macrosArray[macrosArray.length]= {name:fieldName,value:macroValue};
				  filtersArray[filtersArray.length]= {name:fieldName,value:fieldValue};
			  }else{
				  //either > or <
				  //multiple values are not allowed
				  // field>${field} is not allowed
				  additionaldefaultParameters += ":"+macroList[i];
				  var field = macroList[i];
				  var op = "=";
				  var opStr = "Equals";
				  var macroFieldName = "";
				  var macroFieldValue = "";
				  if(field.indexOf(">") > -1){
					  op = ">";
					  opStr = "Greater";
				  }else if(field.indexOf("<") > -1){
					  op = "<";
					  opStr = "Less";
				  }
				  macroFieldName = field.split(op)[0];
				  macroFieldValue = field.split(op)[1];
				  if(isValidDate(macroFieldValue)){
					  macroFieldValue = macroFieldValue.replace(",",", ");
				  }
				  appendToAdditionalFilters(macroFieldName,macroFieldValue,opStr);
			  }
		  }
	  }
	  if(macrosArray.length > 0){
		  defaultValueURL = createDefaultValueURL(macrosArray);
	  }
	  defaultValueURL += additionaldefaultParameters;
	  if(isDefaultDefined){
		  url = url.replace(macros,defaultValueURL);
	  }
	  checkResultCount(url, currentField, filtersArray, curFieldName);
}

function createDefaultValueURL(macrosArray){
	var defaultURL ="";
	for(var i=0; i<macrosArray.length; i++) {
		var fieldName = macrosArray[i].name;
		var value = macrosArray[i].value;
			if(typeof value != 'undefined' && value != ""){
			if(i==0){
				defaultURL += fieldName;
			}else{
				defaultURL += ":"+fieldName;
			}
			for(var j=0; j<value.length; j++) {
				var fieldValues = value[j].split("|");
				var operator = fieldValues[0];
				var fieldValue = fieldValues[1];
				//bug fix - 369347
				if(isValidDate(fieldValue)){
					fieldValue = fieldValue.replace(",",", ");
				}
				switch (operator) {
					case "Equals":
							if(j==0){
								defaultURL += "="+fieldValue;
							}else{
								defaultURL += ","+fieldValue;
							}
						break;
					case "Greater":
							if(j==0){
								defaultURL += ">"+fieldValue;
							}else{
								//case Between
								defaultURL += ":"+fieldName;
								defaultURL += ">"+fieldValue;
							}
						break;
					case "Less":
							if(j==0){
								defaultURL += "<"+fieldValue;
							}else{
								//case Between
								defaultURL += ":"+fieldName;
								defaultURL += "<"+fieldValue;
							}
						break;
					default:
						break;
				}
			}
		}
	}
	return defaultURL;

}
var additionalFilters = {};

function appendToAdditionalFilters(macroFieldName,macroFieldValue,opStr){

	additionalFilters[macroFieldName] = new Array();
	if (additionalFilters[macroFieldName].find(opStr + "|" + macroFieldValue) == -1) {
		additionalFilters[macroFieldName].push(opStr + "|" + macroFieldValue);
	}
}

function getRedefinedFilters(filtersArray){
	var dupFiltersArray = new Object();
	for(var i=0; i<filtersArray.length; i++) {
		var isMacro = (filtersArray[i].value.indexOf("$") >= 0)?true:false;
		if(isMacro){
			var lookForField = "";
			if(filtersArray[i].value.length >2){
				lookForField = filtersArray[i].value.substring(2, filtersArray[i].value.length-1);
			}
			if(document.forms[0][lookForField].value){
				dupFiltersArray[filtersArray[i].name] = new Array();
				dupFiltersArray[filtersArray[i].name].push("Equals|"+document.forms[0][lookForField].value);
			}
		}else{
			dupFiltersArray[filtersArray[i].name] = resolveDefaultValue(filtersArray[i].value);
		}
	}
	//append additionalFilters to dupFiltersArray
	for(var fieldName in additionalFilters) {
		if(typeof additionalFilters[fieldName] != "function"){
			dupFiltersArray[fieldName] = new Array();
			if(dupFiltersArray[fieldName].find(additionalFilters[fieldName][0]) != null){
				dupFiltersArray[fieldName].push(additionalFilters[fieldName][0]);
			}
		}
	}
	return dupFiltersArray;
}

function resolveDefaultValue(values){
	//!= is not supported
	var operator = "Equals";
	var valueArray = new Array();
	if(isValidDate(values)){
		values = values.replace(",",", ");
		if(valueArray.find(operator + "|" + values) == -1){
			valueArray.push(operator + "|" + values);
		}
	}else{
		var valueList = values.split(",");
		for(var i=0; i<valueList.length; i++) {
			if(valueArray.find(operator + "|" + valueList[i]) == -1){
				valueArray.push(operator + "|" + valueList[i]);
			}
		}
	}
	return valueArray;
}

function checkEnterKeyPressed(event, url, curFieldName){
	var pK = document.all?window.event.keyCode:event.which;
    if(pK==13)
    {
		if (event.preventDefault) {
	      event.preventDefault();
	      event.stopPropagation();
	    } else {
	      event.returnValue = false;
	    }
    	showFullSearchChooserInForm(url,curFieldName);
    }
}

function checkResultCount(url,currentField,filtersArray, curFieldName){
	var responseXML = null;
	url = url.replace("emxFullSearch.jsp?","emxAEFCheckUniqueResult.jsp?");
	url = url.replace("javascript:showFullSearchChooserInForm(\'","");
	url += "&showWarning=false&";
	if(url.indexOf("\',\'") > 0){
		url = url.substring(0,url.indexOf("\',\'"));
	}
	if((curFieldName.indexOf("Display")>0) && (curFieldName.indexOf("Display")+7) == curFieldName.length){
		curFieldName = curFieldName.substring(0,curFieldName.indexOf("Display"));
	}
	var actualFieldname = curFieldName;
	var displayFieldName = curFieldName+"Display";
	var OIDFieldName = curFieldName+"OID";
	var duplicateFilters = getRedefinedFilters(filtersArray);
	responseXML = emxUICore.getXMLDataPost(url+"&filters="+emxUICore.toJSONString(duplicateFilters));
	try {
		var root = responseXML.documentElement;
		var objectCount = emxUICore.getText(emxUICore.selectSingleNode(root,"objectCount"));
		if(objectCount == 1) {
			var dispName = emxUICore.getText(emxUICore.selectSingleNode(root,"displayName"));
			var actualValue = emxUICore.getText(emxUICore.selectSingleNode(root,"actualName"));
			var OID = emxUICore.getText(emxUICore.selectSingleNode(root,"OID"));
			var submitURL= getURLParam(url, "submitURL");
			if(submitURL != null && submitURL.length > 0) {
				var uiType = getURLParam("uiType");
				var hiddenFrame = getHiddenFrame(uiType);
				var qb = new Query(url.replace(/\&amp;/g,"&"));
				qb.remove("submitURL");
				qb.remove("table");
				qb.remove("form");
				qb.remove("type");
				qb.remove("field");
				qb.remove("fieldNameOID");
				qb.remove("suiteKey");
				qb.set("typeAhead","true");
				qb.set("fieldNameActual",actualFieldname);
				qb.set("fieldNameDisplay",displayFieldName);
				qb.set("emxTableRowId",OID);
				qb.set("frameName",getFrameName());
				submitURL += "?" + qb.getSearch();
				var targetWindow = hiddenFrame.contentWindow != null ? hiddenFrame.contentWindow : hiddenFrame.window;
				targetWindow.document.location = submitURL;
			} else{
				document.forms[0][displayFieldName].value = dispName;
				document.forms[0][actualFieldname].value = actualValue;
				document.forms[0][OIDFieldName].value = OID;
			}
			//reseting filter values
			//updateFilters(fieldname,dispName, false);
		} else{
			//append fullTextSearchTimestamp and checkStoredResult = true
			var searchTimeStamp = emxUICore.getText(emxUICore.selectSingleNode(root,"searchTimeStamp"));
			url = url.replace("emxAEFCheckUniqueResult.jsp?","emxFullSearch.jsp?");
			url = url.replace("&showWarning=false&", "&showWarning=true&")
			url += "&fullTextSearchTimestamp="+searchTimeStamp;
			// Not required to pick the results from cache only when it is from a formEdit chooser button
			//url += "&checkStoredResult="+"true";
			if(url.indexOf("submitURL") == -1) {
				url += "&submitURL=AEFSearchUtil.jsp";
			}
			showModalDialog(url, 700, 500, true);
		}
	} catch (e) {
		// TODO: handle exception
		alert(e.message);
	}

}
function getURLParam(url,param) {
	  var qb = new Query(url.replace(/\&amp;/g,"&"));
	  var paramValue = qb.getValue(param);
	  return paramValue;
}

function getHiddenFrame(uiType) {
	  var objHiddenFrame = findFrame(parent, "formCreateHidden");
	  if (!objHiddenFrame)
	  {
		  objHiddenFrame = findFrame(parent, "formEditHidden");
	  }
	return objHiddenFrame;
}

function getFrameName() {
	  var name = "";
	  var mode = "";
	  var uiType = "";
	  if(document.getElementById("uiType") && document.getElementById("mode")) {
		  uiType = document.getElementById("uiType").value;
		  mode = document.getElementById("mode").value;
		  if(uiType === "form" && mode === "edit") {
			  name = "";
		  }
	  }
	  return name;
}

function setwidthsforGroupingcells(){

    var dpb = document.getElementById("divPageBody");
    var frmtbl = dpb ? dpb.getElementsByTagName("table")[0].rows : document.getElementsByTagName("table")[0].rows;
    var sw = dpb.scrollWidth;
    if(frmtbl){
        var len = frmtbl.length;
        for(var i=0;i<len;i++){
          if(frmtbl[i].cells.length > 2) {
            var numlables = frmtbl[i].cells.length/2;
            var remwidth = sw - (150 * numlables);
            remwidth = remwidth/numlables;
            for(var j=1;j<frmtbl[i].cells.length;j=j+2){
              frmtbl[i].cells[j].width = remwidth;
            }
          }
        }
    }
}

 function submitFunction(e)
 {
 	if (!isIE)
		Key = e.which;
	else
		Key = window.event.keyCode;

	if (Key == 13){

		saveCreateChanges();
		}
	else
		return;
 }

 function insertAfter(newElement,targetElement) {
 	//target is what you want it to go after. Look for this elements parent.
 	var parent = targetElement.parentNode;
 	//if the parents lastchild is the targetElement...
 	if(parent.lastchild == targetElement) {
 	//add the newElement after the target element.
 	parent.appendChild(newElement);
 	} else {
 	// else the target has siblings, insert the new element between the target and it's next sibling.
 	parent.insertBefore(newElement, targetElement.nextSibling);
 	}
 }

 /* Function to add validation methods to new input controls , needs ID of original control and new control name*/
 function addValidations(id, newId)
 {
 		if(myValidationRoutines)
 		{
 	    for(var x=0; x < myValidationRoutines.length;  x++)
 	    {
 	        var tempArray = myValidationRoutines[x];
 	        try
 	        {
 	        	if(tempArray[1]==id)
 				{
 	        		eval (tempArray[0] + "('" + newId + "');");
 				}
 	        } catch(e){}
 	    }
 	}
 		if(myValidationRoutines1)
 		{
 	    for(var x=0; x < myValidationRoutines1.length;  x++)
 	    {
 	        var tempArray = myValidationRoutines1[x];
 	        try
 	        {
 	        	if(tempArray[1]==id)
 				{
 	        		assignValidateMethod(newId, tempArray[2]);
 	        		//eval (tempArray[0] + "('" + newId + "','" + tempArray[2] + "');");
 				}
 	        } catch(e){}
 	    }
 	}
 }

 /*Function to add the New Input Control in create form*/
function addValueInCreateForm(id, showClear, showClearText, showAdd)
{
	var node = document.getElementById(id);
	if(!node){ //check for ListBox, TextArea
		node =  document.getElementById(id+"Id");
	}
	var nextNode;
	var nodeArray = new Array();nodeArray[0]=node; //to store all the nodes
	var i=1,j=0;
	var tdNode = node.parentNode;
	if(maxFlag==true){
		maxCount = tdNode.parentNode.parentNode.children.length;
		maxFlag=false;
	}
	var useNode = node;
	maxCount++;
	var newId;
	var celCount = 0;
	if(showAdd){
		newId = id.substring(0, id.length-1)+(maxCount);
	}else{
		if(node.type=="text"){
			newId = node.id+"_mva_"+(maxCount);
		}else{
			newId = node.name+"_mva_"+(maxCount);
		}
	}
	var trNode= useNode.parentNode.parentNode;
	var table = trNode.offsetParent;
	var row = table.insertRow(trNode.rowIndex+1);
	var newCell = row.insertCell(celCount);
	celCount++;
	/*Show Clear Button Logic*/
	if(trNode.textContent){
	var showClearText = trNode.textContent;
	}
	if(showClear=="true"){
		var showClearHTML = "<a href='javascript:basicClear(\""+newId+"\")'>"+showClearText+"</a>";
		}

	/*Add Icon for new Input Controls*/
	var showAddIconHTML = "<a id=\""+newId+"_a\" onclick='addValueInCreateForm(\""+newId+"\",null,null,true)' href='javascript:void(0);'><img src=\"../common/images/iconActionListAdd.gif\" alt=\"Add Value\" border=\"0\" /></a>"

	if(node.type=="text"){
				//newCell.setAttribute("class", "createInputField");
				var className = node.getAttribute("class");
				var textHTML = "<input id=\""+newId+"\"type=text name=\""+newId+"\" class=\""+className+"\"  title=\""+node.title+"\"></input>";
				var anchorHTML = "<a id=\""+newId+"_a\" onclick='javascript: deleteValue(\""+newId+"\")' href='javascript:void(0);'><img src=\"../common/images/iconActionListRemove.gif\" alt=\"Add Value\" border=\"0\" /></a>"
				newCell.innerHTML = textHTML;
				var newCell2 = row.insertCell(celCount);
				newCell2.innerHTML= showAddIconHTML;
				celCount++;
				var newCell3 = row.insertCell(celCount);
				newCell3.innerHTML= anchorHTML;
				celCount++;
				if(showClear=="true"){
					var newCell4 = row.insertCell(celCount);
					newCell4.innerHTML = showClearHTML;
				}
	}else if(node.type.match("select*")) //for <select>
			{
				var selHTML = "<select id=\""+newId+"Id"+"\" name=\""+newId+"\" title=\""+node.title+"\">";
				  for (var i=0; i<node.options.length; i++) {
					  var optionText;
					  if(isIE || isKHTML){
						  optionText = node.options[i].innerText;
					 	}else{
					 		optionText = node.options[i].label;
					 	}
					  selHTML += "<option value=\""+node.options[i].value+"\">"+optionText+"</option>";
				  }
				selHTML += "</select>"
			    var anchorHTML = "<a id=\""+newId+"_a\" onclick='javascript: deleteValue(\""+newId+"Id\")' href='javascript:void(0);'><img src=\"../common/images/iconActionListRemove.gif\" alt=\"Add Value\" border=\"0\" /></a>"
				newCell.innerHTML = selHTML;
				var newCell2 = row.insertCell(celCount);
				newCell2.innerHTML= showAddIconHTML;
				celCount++;
				var newCell3 = row.insertCell(celCount);
				newCell3.innerHTML= anchorHTML;
				celCount++;
			}
	else if(node.type.match("textarea"))
		{
			if(getTopWindow().location.href.match("Mode=create")){
				newCell.setAttribute("class", "createInputField");
			}
			var textHTML = "<textarea id=\""+newId+"Id"+"\" name=\""+newId+"\" rows='5' title=\""+node.title+"\"></textarea>";
			var anchorHTML = "<a id=\""+newId+"_a\" onclick='javascript: deleteValue(\""+newId+"Id\")' href='javascript:void(0);'><img src=\"../common/images/iconActionListRemove.gif\" alt=\"Add Value\" border=\"0\" /></a>";
			newCell.innerHTML = textHTML;
			var newCell2 = row.insertCell(celCount);
			newCell2.innerHTML= showAddIconHTML;
			celCount++;
			var newCell3 = row.insertCell(celCount);
			newCell3.innerHTML= anchorHTML;
			celCount++;
			if(showClear=="true"){
				var newCell4 = row.insertCell(2);
				newCell4.innerHTML = showClearHTML;
				celCount++;
			}
			if(typeof startSpellCheck != "undefined"){
				addSpellCheckElem(newId);
			}
		}
	else if(node.type.match("checkbox"))
		{
			var textHTML = "<input type=\"checkbox\" id=\""+newId+"\" name=\""+newId+"\" onClick=changeVal(this)></input>";
			var anchorHTML = "<a id=\""+newId+"_a\" onclick='javascript: deleteValue(\""+newId+"\")' href='javascript:void(0);'><img src=\"../common/images/iconActionListRemove.gif\" alt=\"Add Value\" border=\"0\" /></a>"
			newCell.innerHTML = textHTML;
			var newCell2 = row.insertCell(1);
			newCell2.innerHTML= anchorHTML;
		}

	 if(id.match("mva")){
		 id = id.substring(0, id.indexOf("_mva"));
	 }
	 addValidations(id, newId);

	 var element = document.getElementsByName(newId)[0];
	 $(element).focus();

	 /*Store the Order*/
	 var order;
		 var inputName = id+"_order";
		 order = document.getElementById(inputName);
		 if(order){
		 order.value = "";
		 var tableNode = tdNode.parentNode.parentNode;
		 var childLength = tableNode.children.length;
		 for(i=0; i<childLength;i++){
			 var child = tableNode.childNodes[i];
			 var cName = child.childNodes[0].childNodes[0].name;
			 if(!cName){
				 order.value += child.childNodes[0].childNodes[1].name;
			 }else{
				 order.value += child.childNodes[0].childNodes[0].name;
			 }
			 order.value += ":";
	 	}
	}
}

 /*Function to add the New Input Control in edit form*/
function addValueInEditForm(id, showClear, showClearText, showAdd)
{
	var node = document.getElementById(id);
	if(!node){
		node =  document.getElementById(id+"Id");
	}
	var tdNode = node.parentNode;
	var tableNode = tdNode.parentNode.parentNode;
	if(tableNode.textContent){
	var showClearText = tableNode.textContent;
	}
	var nextNode, useNode;
	var nodeArray = new Array();nodeArray[0]=node; //to store all the nodes
	var i=1, j=0;
	if(maxFlag==true){
		maxCount = tdNode.parentNode.parentNode.children.length;
		maxFlag=false;
	}
	var useNode = node;
	maxCount++;
	var newId;
	if(showAdd){
		newId = id.substring(0, id.length-1)+(maxCount);
	}else{
		newId = id+"_mva_"+(maxCount);
	}
	var newTr = document.createElement("tr");
	var newTd = document.createElement("td");
	newTr.id = newId+"_tr";
	var tdDelIcon = document.createElement("td");
	var delIconNode = document.createElement("a"); //anchor tag
	delIconNode.setAttribute("onclick", "deleteValueInEditForm(\""+newId+"\")");
	delIconNode.setAttribute("href", "javascript:void(0);");
	delIconNode.id = newId+"_a";
	var imgNode = document.createElement("img");
	imgNode.src = "../common/images/iconActionListRemove.gif";
	delIconNode.appendChild(imgNode);
	tdDelIcon.appendChild(delIconNode);

	/*Show Clear Button Logic*/
	if(showClear=="true"){
	var newTdForClear = document.createElement("td");
	var showClearButton = document.createElement("a");
	showClearButton.setAttribute("onclick",  "basicClear(\""+newId+"\")");
	var text = document.createTextNode(showClearText);
	showClearButton.appendChild(text);
	newTdForClear.appendChild(showClearButton);
	}

	/*Add Icon for new Input Controls*/
	var addTd = document.createElement("td");
	addTd.id = newId+"_td";
	var addIconAnchor = document.createElement("a");
	addIconAnchor.setAttribute("onclick", "addValueInEditForm(\""+newId+"\",'','','true')");
	addIconAnchor.setAttribute("href", "javascript:void(0);");
	var imgNodeAdd = document.createElement("img");
	imgNodeAdd.src = "../common/images/iconActionListAdd.gif";
	addIconAnchor.appendChild(imgNodeAdd);
	addTd.appendChild(addIconAnchor);

	if(node.type=="text"){
			var textNode = document.createElement("input");
			var className = node.getAttribute("class");
			textNode.type="text";textNode.id = newId;textNode.size = "20";textNode.name=newId;textNode.title=node.title;
			//textNode.setAttribute("class",className);
			newTd.appendChild(textNode);
			newTr.appendChild(newTd);
			newTr.appendChild(addTd);
			newTr.appendChild(tdDelIcon);
			if(showClear=="true"){
				newTr.appendChild(newTdForClear);
			}
			insertAfter(newTr,tdNode.parentNode);

	}else if(node.type.match("textarea")){
			var textAreaNode = document.createElement("textarea");
			textAreaNode.id = newId;textAreaNode.rows = "5";textAreaNode.name=newId;textAreaNode.title=node.title;
			newTd.appendChild(textAreaNode);
			newTr.appendChild(newTd);
			newTr.appendChild(addTd);
			newTr.appendChild(tdDelIcon);
			if(showClear=="true"){
				newTr.appendChild(newTdForClear);
			}
			insertAfter(newTr,tdNode.parentNode);
			if(typeof startSpellCheck != "undefined"){
				addSpellCheckElem(newId);
			}
	}else if(node.type.match("select")){
			var selectNode = document.createElement("select");
			var selHTML="";
			selectNode.id = newId;selectNode.name=newId;selectNode.title=node.title;
			 for (var i=0; i<node.options.length; i++) {
					 	var optionItem  = document.createElement("option");
					 	 if(isIE || isKHTML){
					 		optionItem.text = node.options[i].innerText;
					 	}else{
					 	optionItem.text = node.options[i].label;
					 	}
					 	if(isMaxIE8){
					 		optionItem.innerHTML = "<option value=\""+optionItem.value+"\">"+optionItem.text+"</option>";
					 	}else{
					 	optionItem.value = node.options[i].value;
					 	}
					 	selectNode.appendChild(optionItem);
			  }
			newTd.appendChild(selectNode);
			newTr.appendChild(newTd);
			newTr.appendChild(addTd);
			newTr.appendChild(tdDelIcon);
			insertAfter(newTr,tdNode.parentNode);
		}

	 if(id.match("mva")){
		 id = id.substring(0, id.indexOf("_mva"));
	 }
	 addValidations(id, newId);

	 var element = document.getElementsByName(newId)[0];
	 $(element).focus();

	 /*Store the Order*/
	 var createForm =  document.forms['emxCreateForm'];
	 var order;
	 if(createForm){
		 var inputName = id+"_order";
		 order = document.getElementById(inputName);
		 order.value = "";
	 }
	 var childLength = tableNode.children.length;
	 if(order){
	 for(i=0; i<childLength;i++){
		 var child = tableNode.childNodes[i];
		 order.value += child.childNodes[0].childNodes[0].name;
		 order.value += ":";
	 }
   }
}

 /*Function to delete the New Input Control in create form*/
function deleteValue(id)
{
	var node = document.getElementById(id);
	var trNode= node.parentNode.parentNode; //<tr> node
	var table = trNode.parentNode.parentNode
	table.deleteRow(trNode.rowIndex);

	//Store Order
	 var order;
	 if(id.match("mva")){
		 id = id.substring(0, id.indexOf("_mva"));
	 }
	 var inputName = id+"_order";
	 order = document.getElementById(inputName);
	 if(order){
	 order.value = "";
	 var tbody = table.childNodes[0];
	 for(i=0; i<tbody.childElementCount;i++){
		 var child = tbody.childNodes[i];
		 var cName = child.childNodes[0].childNodes[0].name;
		 if(!cName){
			 order.value += child.childNodes[0].childNodes[1].name;
		 }else{
			 order.value += child.childNodes[0].childNodes[0].name;
		 }
		 order.value += ":";
	 	}
	 }
}

function getDynamicSearchRefinements(url, curFieldName, fieldValues, isFromChooser) {
	var qurl   = new Query(url);
	var qfield = qurl.getValue("field");
	var qfieldProgram = qurl.getValue("fieldProgram");
	if(qfieldProgram != null && qfieldProgram != ""){
		var uiType	    = document.getElementById("uiType").value;
		var dynamicQuery = qfieldProgram.split(":");
		var qjson = {};
		if(uiType == "structureBrowser" && isFromChooser ){
			qjson.fieldValues = fieldValues;
		}else{
			qjson.fieldValues = FormHandler.GetFieldValues();
		}
		var timeStamp     = document.getElementById("timeStamp").value;
		var mode			= document.getElementById("mode").value;
		var jurl          = new Query("../emxTypeAheadFullSearch.jsp");
		jurl.set("timeStamp", timeStamp);
		jurl.set("uiType", 	uiType);
		jurl.set("mode", 		mode);
		jurl.set("field", 	curFieldName);
		jurl.set("program", 	"emxTypeAheadFullSearch");
		jurl.set("function",  "getQueryField");
		jurl.set("fieldProgram",  qfieldProgram);
		if(isFromChooser){
			jurl.set("isFromChooser",  "true");
		}
		var fieldValue = emxUICore.GetJsonRemote(jurl.toString(),qjson).field;
		if(qfield != null && qfield != "") {
			fieldValue = qfield + ":" + fieldValue;
		}
		qurl.replace("field", fieldValue, true);
		url = qurl.toString();
	}
	return url;
}
 /*Function to delete the New Input Control in edit form*/
function deleteValueInEditForm(id)
{
	var node = document.getElementById(id);
	var tdNode = node.parentNode.parentNode.parentNode;
	var count = tdNode.childElementCount;
	tdNode.removeChild(document.getElementById(id+"_tr"));
}
function reloadOrganizationAndProject(){
	emxFormReloadField('Organization');
	emxFormReloadField('Project');
}

function reloadProjects(){
	emxFormReloadField('Project');
}
function reloadOrganizations(){
	emxFormReloadField('Organization');
}

//Function to retain input control values based on the store JSON object
function reloadCompareCriteria(editForm) {
	var alreadyCoveredCheckBoxes = new Array();
	var alreadyCovered = false;
	var JSONObj = getTopWindow().window.info["CompareCriteriaJSON"];
	for(var i=0; i < editForm.length; i++) {
		temp = editForm.elements[i];
		fieldName=temp.name;
		if(fieldName.length == 0) {
			continue;
		}
        if(temp.type=="text" || temp.type=="select-one" || temp.type=="hidden") {
            temp.value = eval("JSONObj." + fieldName);
    	} else if(temp.type=="radio") {
            var value = eval("JSONObj." + fieldName);
            temp.checked = (value == temp.value);
    	} else if(temp.type=="checkbox") {
    		//this logic is for multi check box; many elements exists with same name
    		alreadyCovered = false;
			for(var k= 0; k < alreadyCoveredCheckBoxes.length; k++){
				if(alreadyCoveredCheckBoxes[k] == fieldName) {
					alreadyCovered = true;
				}
			}
			if(alreadyCovered)
				continue;

			alreadyCoveredCheckBoxes.push(fieldName);
			var obj = eval("editForm."+fieldName);
			var value = eval("JSONObj." + fieldName);

			//If value exists
			if(value) {
				//If its multi check box
				if(obj.length) {
					//selecting the checkboxes
		            var checkBoxVals = value.split(",");
		            for(var j=0; j < checkBoxVals.length; j++) {
		            	for(var x=0; x < obj.length; x++) {
		            		if(checkBoxVals[j] == obj[x].value)
		            			obj[x].checked = true;
					  	}
		            }
				} else {
					//single check box
					obj.checked = (value == obj.value);
				}
			} else {
				//This is required to uncheck if any preprocess checks or from program HTML outputs
				obj.checked = false;
			}
    	} else {
    		temp.value = eval("JSONObj." + fieldName);
    	}
	}
}

function launchImageManager(id){
	var win = getTopWindow();
	if(win.location.href.indexOf("emxNavigator.jsp") == -1) {
		win = window;
	}
	win.require(["../components/emxUIImageManagerInPlace"], function(ImageMananger){
		new ImageMananger( id );
	});
}
//Added for 2016x upgrade - start
function moveRightBaseModel(fieldName) {
	
    var newModelStatus = document.forms[0].newModelStatus;
    var newModelStatusValue = "";
    if (newModelStatus) {
	    newModelStatusValue = newModelStatus.value;
    } else {
	    var newPartPolicy = document.forms[0].ReleaseProcess;
        var newPartPolicyValue = newPartPolicy.options[newPartPolicy.selectedIndex].value;
        if (newPartPolicyValue == "Production") {
        	newModelStatusValue = "Quotable"
        } else {
        	newModelStatusValue = "Consult ETO"
        }
    }
	var currentValues = eval("document.forms[0]."+fieldName+"_CurrentValues");
	if(currentValues) {
		var len = currentValues.options.length;
		for(var i=0;i<len;i++) {
			currentValues.options[i].selected = true;
		}
	}
	
	var selectedAry = new Array();
	// Check at least one value selected to move
	var availableValues = eval("document.forms[0]."+fieldName+"_AvailableValues");
	if(availableValues.options.selectedIndex < 0) {
		alert("Please select a value to move");
	} else {
		for(var i=0;i<availableValues.options.length;i++) {
			if(availableValues.options[i].selected) {
				var value = availableValues.options[i].value;
				value = value+"("+newModelStatusValue+")";
				selectedAry[i] = value;
				var text = availableValues.options[i].text;
				text = text+"("+newModelStatusValue+")";
				var myOption = document.createElement("Option");
				myOption.text = text;
				myOption.value = value;
				try {
					currentValues.add(myOption);		// IE
				} catch(e) {
					var len = currentValues.options.length;
					var oldOption = currentValues.options[len];	// Mozilla,Netscape
					currentValues.add(myOption,oldOption);
				}
				availableValues.remove(i);	
				i--;
				len = currentValues.options.length;
				currentValues.options[len-1].selected=true;
			}
		} 
		sortSelect(currentValues,selectedAry);
		selectEveryOptions(document.forms[0].FSGBaseModel_CurrentValues);
	}
}
//Added for 2016x upgrade - end
function moveLeftBaseModel() {
	
	var availableValues = document.forms[0].FSGBaseModel_AvailableValues;
	if(availableValues) {
		var len = availableValues.options.length;
		for(var i=0;i<len;i++) {
			availableValues.options[i].selected = false;
		}
	}
	
	var selectedAry = new Array();
	// Check at least one value selected to move
	if(document.forms[0].FSGBaseModel_CurrentValues.options.selectedIndex < 0) {
		alert("Please select a value to move");
	} else {
        var configurableModelNoSpacesValue = "";
        var configurableModelNoSpaces = document.forms[0].configurableModelNoSpaces;
        if (configurableModelNoSpaces) {
        	configurableModelNoSpacesValue = configurableModelNoSpaces.value;
        }
		var configurableModelArray = configurableModelNoSpacesValue.split(",");
        var fixedModelStringNoSpacesValue = "";
        var fixedModelStringNoSpaces = document.forms[0].fixedModelStringNoSpaces;
        if (fixedModelStringNoSpaces) {
        	fixedModelStringNoSpacesValue = fixedModelStringNoSpaces.value;
        }
		var fixedModelStringArray = fixedModelStringNoSpacesValue.split(",");
		var len;
		for(var i=0;i<document.forms[0].FSGBaseModel_CurrentValues.options.length;i++) {
			if(document.forms[0].FSGBaseModel_CurrentValues.options[i].selected) {
				var value = document.forms[0].FSGBaseModel_CurrentValues.options[i].value;
			    var isObsolete = value.match(new RegExp("Obsolete\\)$"));
			    if (isObsolete != null) {
			    	alert("Removal of Base Model values with \"Bookable\" or \"Obsolete\" status not allowed.");
				    return;
			    }
				value = value.substring(0,value.indexOf("("));
				selectedAry[i] = value;
	            var matchesConfigurableModel = "false";
	            var matchesFixedModel = "false";
			    for (var j=0; j<configurableModelArray.length; j++) {
			        if (configurableModelArray[j] == value) {
			        	matchesConfigurableModel = "true";
					}
			    }
			    if (matchesConfigurableModel == "true") {
			    	alert("Removal of \""+value+"\" from Base Model is not allowed.  This ETO Package is used on BOM of \"ETOPKG-"+value+"\".");
			    	return;
			    } else {
				    for (var j=0; j<fixedModelStringArray.length; j++) {
				        if (fixedModelStringArray[j].indexOf(value) == 0) {
				            matchesFixedModel = "true";
						}
				    }
				    if (matchesFixedModel == "true") {
				    	alert("Removal of \""+value+"\" from Base Model is not allowed.  Released \"Product Non-ATO Model\" for this ETO Package exists.  See \"Fixed Model String\" attribute on this ETO Package.");
				    	return;
				    } else {
						var text = document.forms[0].FSGBaseModel_CurrentValues.options[i].text;
						text = text.substring(0,text.indexOf("("));
						var myOption = document.createElement("Option");
						myOption.text = text;
						myOption.value = value;
						try {
							document.forms[0].FSGBaseModel_AvailableValues.add(myOption); // IE
						} catch(e) {
							len = document.forms[0].FSGBaseModel_AvailableValues.options.length;
							var oldOption = document.forms[0].FSGBaseModel_AvailableValues.options[len];   // Mozilla,Netscape
							document.forms[0].FSGBaseModel_AvailableValues.add(myOption,oldOption);
						}
						len = document.forms[0].FSGBaseModel_AvailableValues.options.length;
						document.forms[0].FSGBaseModel_AvailableValues.options[len-1].selected=true;
						document.forms[0].FSGBaseModel_CurrentValues.remove(i);
						i--;
				    }
			    }
			}
		} 
		sortSelect(document.forms[0].FSGBaseModel_AvailableValues,selectedAry);
		selectEveryOptions(document.forms[0].FSGBaseModel_CurrentValues);
	}
 }
 
 function sortSelect(selElem,selectedAry) {
    var tmpAry = new Array();
    for (var i=0;i<selElem.options.length;i++) {
        tmpAry[i] = new Array();
        tmpAry[i][0] = selElem.options[i].text;
        tmpAry[i][1] = selElem.options[i].value;
    }
    tmpAry.sort();
    while (selElem.options.length > 0) {
        selElem.options[0] = null;
    }
    for (var i=0;i<tmpAry.length;i++) {
        var op = new Option(tmpAry[i][0], tmpAry[i][1]);
        selElem.options[i] = op;
        if (selectedAry.contains(selElem.options[i].value)) {
	        selElem.options[i].selected=true;
        }
    }
    return;
}

function selectEveryOptions(selElem) {
   
    for (var i=0;i<selElem.options.length;i++) {
       selElem.options[i].selected = true;
    }    
    return;
}
//Added for 2016x upgrade - end

