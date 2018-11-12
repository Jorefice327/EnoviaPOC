<%--  emxLogin.jsp   - Main login page for MatrixOne applications

   Copyright (c) 1992-2015 Dassault Systemes.
   All Rights Reserved.
   This program contains proprietary and trade secret information of MatrixOne,
   Inc.  Copyright notice is precautionary only
   and does not evidence any actual or intended publication of such program

      static const char RCSID[] = $Id: emxLogin.jsp.rca 1.95.2.1 Wed Dec 17 09:50:22 2008 ds-arsingh Experimental $
--%>


<%@include file = "emxTagLibInclude.inc"%>
<%@include file = "emxContentTypeInclude.inc"%>
<%@include file = "emxRequestWrapperMethods.inc"%>
<%@ page import="matrix.db.*, matrix.util.*, com.matrixone.servlet.*, java.text.* ,java.util.* , java.net.URLEncoder, com.matrixone.apps.domain.util.*, com.matrixone.apps.framework.ui.UINavigatorUtil, com.matrixone.apps.framework.taglib.*"  %>

<emxUtil:localize id="i18nId" bundle="emxFrameworkStringResource" locale='<%= request.getHeader("Accept-Language") %>' />
<!DOCTYPE html>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<%
//JPA+
Map emxNavigatorData = (Map)session.getAttribute("emxNavigatorData");
if( emxNavigatorData == null )
{
    emxNavigatorData = new HashMap();
}
Enumeration enumParam = request.getParameterNames();
// Loop through the request elements and
// stuff into emxCommonDocumentCheckinData
boolean isFirstParam = true;
while (enumParam.hasMoreElements())
{
    String paramName  = (String) enumParam.nextElement();
    String paramValue = emxGetParameter(request, paramName);
    emxNavigatorData.put(paramName, paramValue);
}
session.setAttribute("emxNavigatorData", emxNavigatorData);

boolean ismob = UINavigatorUtil.isMobile(request);
String disableAutoLogin = emxGetParameter(request,"disableAutoLogin");
String SecurityContext = emxGetParameter(request,"SecurityContext");
session.setAttribute("disableAutoLogin",disableAutoLogin);
//boolean bPreferred = (sPreferred!=null);
//JPA-
// Check if external authentication is turned on
String sExternalAuth = FrameworkProperties.getProperty("emxFramework.External.Authentication");
String sLoginImage = FrameworkProperties.getProperty("emxFramework.Application.LoginImage");
sLoginImage="common/"+sLoginImage;

if (sExternalAuth == null || sExternalAuth.length() == 0) {
    sExternalAuth = "false";
}

if ("TRUE".equalsIgnoreCase(sExternalAuth))
{
    // If Authentication JPO not compiled then compile it.
    Boolean bIsAuthenticationJPOCompiled = (Boolean)application.getAttribute("bIsAuthenticationJPOCompiled");
    if (bIsAuthenticationJPOCompiled == null || !bIsAuthenticationJPOCompiled.booleanValue())
    {
        try
        {
            // get Anonymous context as context doesn't exists at this point.
            Context ctx = ContextUtil.getAnonymousContext();

            // get MX_PAM_AUTHENTICATE_CLASS setting
            String sMxPamSetting = PropertyUtil.getEnvironmentProperty(ctx, "MX_PAM_AUTHENTICATE_CLASS");

            // get JPO name
            sMxPamSetting = sMxPamSetting.replace('{', '<');
            sMxPamSetting = sMxPamSetting.replace('}', '>');
            MessageFormat mf = new MessageFormat("$<CLASS:{0}>");
            Object obj[] = mf.parse(sMxPamSetting);
            String sJPOName = (String)obj[0];

            // compile program
            StringList JPOs = new StringList();
            JPOs.addElement(sJPOName);
            ProgramUtil.compile(ctx, JPOs, false);
        }
        catch(Exception ex)
        {
            // do nothing
        }

        application.setAttribute("bIsAuthenticationJPOCompiled", Boolean.valueOf(true));
    }
}


// Added not to show the browser Toolbar. Only if the property is not set for this
//session it is to be set.
if (session.getAttribute("isOpened") == null){
    session.setAttribute("isOpened", "false");
}

if (Framework.isLoggedIn(request))
{



    // In case of external authentication
    if ("TRUE".equalsIgnoreCase(sExternalAuth))
    {
        // Check if session exists.
        Boolean bSessionExists = (Boolean)session.getAttribute("emxSessionExist");
        if (bSessionExists == null || !bSessionExists.booleanValue())
        {
            session.setAttribute("emxSessionExist", Boolean.valueOf(true));
        }
    }

    //get target page defined in emxSystem.properties and forward when servlet is done
    String targetPage = FrameworkProperties.getProperty("emxLogin.FrameworkTarget");
    if (targetPage == null || targetPage.length() == 0)
    {
        targetPage = "common/emxNavigator.jsp";
    }
    //JPA+
    if (disableAutoLogin != null && !"".equals(disableAutoLogin) ) {
        targetPage = targetPage + (String)(targetPage.indexOf("?")>=0?"&":"?") + "disableAutoLogin="+XSSUtil.encodeForURL(disableAutoLogin);
    }
    if (SecurityContext != null && !"".equals(SecurityContext) ) {
        targetPage = targetPage + (String)(targetPage.indexOf("?")>=0?"&":"?") + "SecurityContext="+XSSUtil.encodeForURL(SecurityContext);
    }
    //JPA-

 %>
    <html>
    <head>
    	<meta name="keywords" content="favicon, create, icon, favicon.ico, web, page, generate, bookmark, favorite, make, logo, site, internet, explorer, mozilla, firefox, convert, picture, ico, gif, jpeg, png, bmp, jpg, address, bar, ie" />
    	<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    </head>
    <body>
    <script language="javascript">
        //XSSOK
        document.location.href="<%=targetPage%>";
    </script>
    </body></html>
    <%
} else {

    //display error message if any
    String error = null;

    MatrixServletException servletException = Framework.getError(request);
    if (servletException != null) {
        error = servletException.getMessage();
    }

    if ( error == null ) {
        if (session.getAttribute("error.message") != null)
        {
            error = (String)session.getAttribute("error.message");
            session.removeAttribute("error.message");
        }
    }
    
//START: Added for Named user Licensing
   String errorKey="emxFramework.Login.";
   StringBuffer sbLicenseErrors = new StringBuffer();
  if (error != null) {
      if (error.indexOf("The server cannot obtain the license") != -1) {

          // Licensing error ? parse to find the specific error
          if (error.indexOf("not available on license server") != -1) {
              String languageStr = request.getHeader("Accept-Language");
              String strLicenseExpiryDate = i18nNow.getI18nString("emxFramework.Login.License.AfterExpiryDate","emxFrameworkStringResource",languageStr);
              String strLicensesConsumed = i18nNow.getI18nString("emxFramework.Login.License.AfterTotalLicenseConsumed","emxFrameworkStringResource",languageStr);
              String strLicenseNotInstalled = i18nNow.getI18nString("emxFramework.Login.License.AfterNotInstalledOnServer","emxFrameworkStringResource",languageStr);
              boolean hasExpiry = false;
              boolean hasConsumeExceed = false;
              boolean hasNotExits = true;
              StringBuffer strExpiredLicenses = new StringBuffer();
              StringBuffer strExceededLicenses = new StringBuffer();
              StringBuffer strUnAvailLicenses = new StringBuffer();

        //creating a context to get the licenses on the server
              Context context = ContextUtil.getAnonymousContext();
              try {
                  String strLicenseName = "";

                  //pushing the context to super user to get the license information as we donot know anything about current user
                  ContextUtil.pushContext(context);

                  //get the licenses for the server
                  java.util.List licenselist = LicenseUtil.getLicenseInfo(context, null);
          StringList slLicNames= new StringList();

          //There are one or more licenses not available on the license server
          //parsing the error string to get list of messages
                  matrix.util.StringList slLicenses = FrameworkUtil.splitString(error,"License '");

                  //starting from i=1 instead of i=0 as 0 will not contain any license trigrams
                  for (int i=1; i<slLicenses.size(); i++){

                      hasNotExits = true;

                      int index = ((String)slLicenses.get(i)).indexOf("'");
                      strLicenseName = (((String)slLicenses.get(i)).substring(0, index)).trim();

                      //iterating the server licenses to get information for the errors thrown for trigrams
                      for (int j=0; j<licenselist.size(); j++) {
                          HashMap rowmap = (HashMap)licenselist.get(j);
                          String strLicenseTrigram = (String)rowmap.get(LicenseUtil.INFO_LICENSE_NAME);

                          //if the error thrown matches server license, check for type of error and throw error message accordingly.
                          if (strLicenseName.equals(strLicenseTrigram)){

                            Integer strTotalLicenseCount = (Integer)rowmap.get(LicenseUtil.INFO_TOTAL_COUNT);
                            Integer strTotalLicenseConsumed = (Integer)rowmap.get(LicenseUtil.INFO_IN_USE_COUNT);

                            int iTotalLicenseCount = strTotalLicenseCount.intValue();
                            int iTotalLicenseConsumed = strTotalLicenseConsumed.intValue();

                            Date expiryDate = (Date)rowmap.get(LicenseUtil.INFO_EXPIRE_DATE);
                            Calendar calCurrent = Calendar.getInstance();
                            Date dtCurrentDate = calCurrent.getTime();

                            if (!dtCurrentDate.before(expiryDate)){ //checking for expiry of license
                                strExpiredLicenses.append(strLicenseName);
                                strExpiredLicenses.append(" ");
                  hasExpiry = true;
                  hasNotExits = false;
                            }
                            else if(iTotalLicenseConsumed >= iTotalLicenseCount) { //checking for all licenses consumed
                                strExceededLicenses.append(strLicenseName);
                                strExceededLicenses.append(" ");
                                hasConsumeExceed = true;
                                hasNotExits = false;
                            }
                            break;
                          }
                      }
                      if(hasNotExits)
                      {
                        strUnAvailLicenses.append(strLicenseName);
                      strUnAvailLicenses.append(" ");
                      }

                  }
              }
              catch (Exception ex){
                  //throw new Exception (ex);
              }
              finally {
                  //since used pushcontext reverting to orginal context
                  ContextUtil.popContext(context);
              }
              if(hasExpiry)
              {
                sbLicenseErrors.append(" '");
                sbLicenseErrors.append(strExpiredLicenses.toString());
              sbLicenseErrors.append("' ");
                sbLicenseErrors.append(strLicenseExpiryDate);
              }
              if(hasConsumeExceed)
              {
                sbLicenseErrors.append(" '");
                sbLicenseErrors.append(strExceededLicenses.toString());
                sbLicenseErrors.append("' ");
                sbLicenseErrors.append(strLicensesConsumed);
              }
              if(hasNotExits)
              {
                sbLicenseErrors.append(" '");
                sbLicenseErrors.append(strUnAvailLicenses.toString());
                sbLicenseErrors.append("' ");
                sbLicenseErrors.append(strLicenseNotInstalled);
              }
              errorKey=errorKey+"LicenseNotAvailable";
          }else if(error.indexOf("#1600607") != -1){
        	  errorKey=errorKey+"License.CUL.ExceedCasualHour";
          }else if(error.indexOf("#1600608") != -1){
        	  errorKey=errorKey+"License.CUL.MixedAssignment";
          }else if (error.indexOf("user is not assigned a license") != -1) {
              errorKey=errorKey+"CPFlicenseError";
          }
          else if (error.indexOf("not time synchronized with license server") != -1) {
              // Added for IR-036854V6R2011
              errorKey=errorKey+"TimeSyncError";
          }
          else if (error.indexOf("1a000038") != -1) {
        	  errorKey = errorKey+"InvalidServerLevel";
          }
          else if (error.indexOf("License error") != -1) {
          errorKey=errorKey+"GenericError";
          } else {
              errorKey=errorKey+"GenericError";
          }
      }
      else if (error.indexOf("inactive") != -1) {
      //Non-Licensing error. Push the inactive user error
          errorKey = errorKey+"ErrorIncativePersonState";
      }
      else {
        // Non-Licensing error. push the generic user/password message.
        errorKey=errorKey+"InvalidUserPassword";
      }
  }
  
    //JPA+
    // CLOUD case : when an externally authenticated user has no access to that server
    if ("TRUE".equalsIgnoreCase(sExternalAuth) && Framework.getPropertyBoolean("ematrix.login.reject.internaluser",false))
    {
        // access is not authorized to internal users
        // TODO: the current session should be invalidated ...
        // TODO: unfortunately, this will reply anyway a new Set-Cookie:JSESSIONID header !
        // TODO: MUST find a way to invalidate the session + do not send JSESSIONID
        // session.invalidate();
        if (error != null) {
          String languageStr = request.getHeader("Accept-Language");
          String errorMsg = i18nNow.getI18nString(errorKey,"emxFrameworkStringResource",languageStr) + sbLicenseErrors.toString();
           response.sendError(403, errorMsg);
        } else {
        response.sendError(403);
        }
        return;
    }
    //JPA+

%>
<html>
  <head>
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE"/>
    <meta name="keywords" content="favicon, create, icon, favicon.ico, web, page, generate, bookmark, favorite, make, logo, site, internet, explorer, mozilla, firefox, convert, picture, ico, gif, jpeg, png, bmp, jpg, address, bar, ie" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <title><emxUtil:i18n localize="i18nId">emxFramework.Login.Title</emxUtil:i18n></title>
    <!-- //XSSOK -->
    <script language="javascript" src="<%=Framework.getClientSideURL(response, "common/scripts/emxUIConstants.js")%>"></script>
    <!-- //XSSOK -->
    <script language="javascript" src="<%=Framework.getClientSideURL(response, "common/scripts/emxUICore.js")%>"></script>
    <!-- //XSSOK -->
    <script language="javascript" src="<%=Framework.getClientSideURL(response, "common/scripts/emxUIModal.js")%>"></script>
    <link rel="stylesheet" type="text/css" href="<%=Framework.getClientSideURL(response, "common/styles/emxUIDefault.css")%>"/>

<%
  if(ismob){
%>
    <!-- //XSSOK -->
    <link rel="stylesheet" type="text/css" href="<%=Framework.getClientSideURL(response, "common/mobile/styles/emxUIMobile.css")%>"/>
    <%
  }

    String FrameworkTarget = FrameworkProperties.getProperty("emxLogin.FrameworkTarget");
    String portalMode = (String)session.getAttribute("portal");
    String forwardURL = (String)session.getAttribute("ForwardURL");
    if (forwardURL != null && forwardURL.length() > 0 ){
      if(forwardURL.indexOf("//") == 0){
        forwardURL = forwardURL.substring(1,forwardURL.length());
      }
    }
    if (forwardURL != null && disableAutoLogin != null && !"".equals(disableAutoLogin)) {
      forwardURL = forwardURL + ((forwardURL.indexOf("?"))>=0?"&":"?") + "disableAutoLogin="+disableAutoLogin;
    }
    if (forwardURL != null && SecurityContext != null && !"".equals(SecurityContext) ) {
      forwardURL = forwardURL + ((forwardURL.indexOf("?"))>=0?"&":"?") + "SecurityContext="+SecurityContext;
    }
    if ((FrameworkTarget != null) && (!"".equals(FrameworkTarget)))
    {
        if( FrameworkTarget.contains("emxNavigator.jsp") && forwardURL != null )
        {
            Framework.setTargetPage(session, forwardURL);
        } else {
            FrameworkTarget = Framework.getClientSideURL(response, FrameworkTarget);
            if (disableAutoLogin != null && !"".equals(disableAutoLogin)) {
              FrameworkTarget = FrameworkTarget + ((FrameworkTarget.indexOf("?"))>=0?"&":"?") + "disableAutoLogin="+disableAutoLogin;
            }
            if (SecurityContext != null && !"".equals(SecurityContext) ) {
              FrameworkTarget = FrameworkTarget + ((FrameworkTarget.indexOf("?"))>=0?"&":"?") + "SecurityContext="+SecurityContext;
            }
            Framework.setTargetPage(session, FrameworkTarget);
        }
    } else {
      // Code for - Portal Mode feature
      if (forwardURL != null )
      {
          Framework.setTargetPage(session, forwardURL);
      }
    }

    String userName = emxGetParameter(request, LoginServlet.FORM_LOGIN_NAME);

    //body color
    String sbgColor = FrameworkProperties.getProperty("emxLogin.BodyColor");
    if (sbgColor != null || !"".equals(sbgColor)) {
        sbgColor = sbgColor.substring(sbgColor.indexOf("=")+1);
    }

    //body image
    String sbgImage = FrameworkProperties.getProperty("emxLogin.BodyImage");
    if (sbgImage == null || "".equals(sbgImage)) {
        sbgImage = "utilContentBackground.gif";
    }

    //form action definition
    String formAction = Framework.getClientSideURL(response, FrameworkProperties.getProperty("emxLogin.FormAction"));

    //get error from loading property files
    String propertyLoadingError = (String)session.getAttribute("property.error.message");

    %>

    <script language="javascript">
    // check if EnterKey is pressed
    function submitFunction(e) {
      if (!isIE)
          Key = e.which;
      else
          Key = window.event.keyCode;

      if (Key == 13)
      {
          mxSubmit();
          return false;
      } else {
         return;
    }
    }


    function adjustLoginPanel(){
        var pnlouter = document.getElementById('panelouter');
        
        var hlfht = pnlouter.offsetHeight;
        hlfht = hlfht/2;
        var tp = '-' + hlfht + 'px';
        pnlouter.style.marginTop = tp;

        var hlflft = pnlouter.offsetWidth;
        hlflft = hlflft/2;
        var lft = '-' + hlflft + 'px';
        pnlouter.style.marginLeft = lft;
    }
    
    function handleOnLoad() {
        document.getElementById('panelouter').style.visibility = "visible";
        adjustLoginPanel();        
        <%
        //determine if we need to break out of a frame
        if ( (portalMode != null) && portalMode.equals("true") )
        { %>
        var bBreakOut = false;
        <% } else { %>
        var bBreakOut = true;
        <% } %>

        //if necessary, break out of the frame
        if (bBreakOut){
            breakout_of_frame();
     }

        //get pointer to the form
	     var objForm = document.loginForm;
	     // set default methods for events
	     objForm.<%=LoginServlet.FORM_LOGIN_NAME%>.onkeypress = submitFunction;
	     objForm.<%=LoginServlet.FORM_LOGIN_PASSWORD%>.onkeypress = submitFunction;
	     objForm.<%=LoginServlet.FORM_LOGIN_NAME%>.focus();
     }

     function breakout_of_frame()
     {

      //check if there is an getWindowOpener() obj.
      //if so set it's location to this pages location and then close window
      //this should close all popup windows if opened in a chain
      if ((window.getWindowOpener() != null) && (window.getWindowOpener() != "undefined")){
        try
        {
            var protocol = document.location.protocol;
            var host = document.location.hostname;
            var port = document.location.port;

            var openerProtocol = window.getWindowOpener().document.location.protocol;
            var openerHostName = window.getWindowOpener().document.location.hostname;
            var openerPort = window.getWindowOpener().document.location.port;

            if ((protocol == openerProtocol) && (host == openerHostName) && (port == openerPort)){
                window.getWindowOpener().location = document.location.href;
                window.closeWindow();
            }
        } catch(e){

        }
      }

         if (getTopWindow().location != location) {
           getTopWindow().location.href = document.location.href ;
         }
      }

      function mxSubmit (){
        //get reference to form
        var objForm = document.loginForm;
        //Validate for a Username and Password entry
        if ((objForm.<%=LoginServlet.FORM_LOGIN_NAME%>.value == "")){
          alert("<emxUtil:i18nScript localize="i18nId">emxFramework.Login.NoUserName</emxUtil:i18nScript>");
          objForm.<%=LoginServlet.FORM_LOGIN_NAME%>.focus();
        } else {
          objForm.action = "<%=formAction%>";
          objForm.submit();
        }
      }

    //call function close all windows
    closeAllChildWindows();
    </script>
</head>

<body class="sign-in" onload="handleOnLoad()">

<noscript>
<div id="divError">
    <h1>Error</h1>
    <p><emxUtil:i18n localize="i18nId">emxFramework.Login.NoJavascript</emxUtil:i18n></p>
</div>
</noscript>

<%
  if (propertyLoadingError != null) {
    session.removeAttribute("property.error.message");
  }
%>

<div id="panelouter" class="wrap-outer">
  <div class="wrap-inner">
  <h1><emxUtil:i18n localize="i18nId">emxFramework.Login.LoginToEnovia</emxUtil:i18n></h1>
    <table> <tr> <td class="panel-logo"></td> <td class="panel-input">
            <div class="panel"><!-- cell -->
                <div id="panelcnt" class="panel-content">
          <form name="loginForm" id="loginForm" method="post">
              <div class="panel-head"><emxUtil:i18n localize="i18nId">emxFramework.Login.Head</emxUtil:i18n></div>
              <div class="panel-body">
                <ul>
                     <li>
                         <label><emxUtil:i18n localize="i18nId">emxFramework.Login.Username</emxUtil:i18n></label>
                         <span><input type="text" name="<%=LoginServlet.FORM_LOGIN_NAME%>"/></span>
                     </li>
                     <li>
                         <label><emxUtil:i18n localize="i18nId">emxFramework.Login.Password</emxUtil:i18n></label>
                         <span><input name="<%=LoginServlet.FORM_LOGIN_PASSWORD%>" AUTOCOMPLETE="off" type="password"/></span>
                     </li>
<%
              String Platform = emxGetParameter(request,"Platform");
              if( Platform != null && !"".equals(Platform) )
              {
%>
                 <li>
                 <label><emxUtil:i18n localize="i18nId">emxFramework.Login.Platform</emxUtil:i18n></label>
                 <span class="chooser"><input type="text" name="Platform" id="platform" value="<xss:encodeForHTMLAttribute><%=Platform%></xss:encodeForHTMLAttribute>" disabled="disabled"/><a id="DisplayPlatformList" href="" class="btn edit"></a></span>
                 </li>
<%
              }
%>
                     <li class="buttons">
                     <button onClick="mxSubmit(); return false;" class="btn"><label><emxUtil:i18n localize="i18nId">emxFramework.Login.Login</emxUtil:i18n></label></button>
                     <!-- <a href="#" onClick="mxSubmit()" class="btn"><label><emxUtil:i18n localize="i18nId">emxFramework.Login.Login</emxUtil:i18n></label></a> -->
                     </li>
                     
                 </ul>
                </div><!-- /.panel-body -->
            </form>
          </div><!-- /.panel-content -->
           </div><!-- /.panel -->
		</td> </tr> </table>
<%
	if (propertyLoadingError != null || error != null) {
%>
		<p class="err-msg"><span class="icon"></span>
<%
		if(propertyLoadingError != null ){
%>
		<%=propertyLoadingError != null %>
<%
		} else {
      if (sbLicenseErrors != null && !"".equals(sbLicenseErrors.toString())){
          %>
				<!-- //XSSOK -->
				<emxUtil:i18n localize="i18nId"><%=errorKey%></emxUtil:i18n><%=sbLicenseErrors.toString()%>
          <%
			} else {
          %>
				<!-- //XSSOK -->
				<emxUtil:i18n localize="i18nId"><%=errorKey%></emxUtil:i18n>
          <%
      }
%>		
		</p>
<%		
		}
	}
%>
  </div>
</div>

<%
  //END: Added for Named user Licensing
  String UseLoginInclude = FrameworkProperties.getProperty("emxLogin.UseLoginInclude");
  if ("true".equals(UseLoginInclude)){
  String IncludePage = FrameworkProperties.getProperty("emxLogin.LoginIncludePage");
%>
  <jsp:include page = "<%=IncludePage%>" flush="true" />
<%
  }
%>
</body>
</html>
<%
}
%>
