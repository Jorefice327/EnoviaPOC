/**
 *   MERPAssignMBOMPartToERPOrgJPO
 *
 *   Adapted from MERPAssignMBOMPartToJDIOrgJPO by MMI.
 *
 */

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.lang.reflect.Array;
import java.net.Socket;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

import com.dassault_systemes.WebServiceHandler.Domain;
import com.matrixone.apps.domain.DomainConstants;
import com.matrixone.apps.domain.DomainObject;
import com.matrixone.apps.domain.util.FrameworkException;
import com.matrixone.apps.domain.util.MapList;
import com.matrixone.apps.domain.util.MessageUtil;
import com.matrixone.apps.domain.util.MqlUtil;
import com.matrixone.apps.mbom.MBOMConstants;
import com.transcendata.integrationclient.*;
/*import com.transcendata.integrationclient.ERPCommon;
import com.transcendata.integrationclient.ERPDebugWriter;
import com.transcendata.integrationclient.ERPStatusObj;
import com.transcendata.integrationclient.ERPXMLCreator;
import com.transcendata.integrationclient.MERPMessage;
import com.transcendata.integrationclient.MERPPost;
import com.transcendata.integrationclient.ERPDebugWriter;*/

import matrix.db.Context;
import matrix.db.JPO;
import matrix.db.MQLCommand;
import matrix.util.MatrixException;
import matrix.util.SelectList;
import matrix.util.StringList;

/**
 * The <code>MERPAssignMBOMPartToJDIOrgJPO</code> class contains methods for gathering and preparing Part
 * data for export to ERP
 * Copyright (c) 2006 2007 TranscenData
 */

public class MERPAssignMBOMPartToERPOrgJPO_mxJPO
{
	//
	//global definitions
	//
	String iniObjectName = "MERP_INI";     //defines the name of the INI object from which data will be read
	String namesObjectName = "MERP_NAMES";      //defines the name of the MERP_NAMES object from which naming data will be read
	String version = "20101109MMI"; //current version of the putItem code
	Vector statusObjects = null; // vector that holds all the status objects created during processing
	String MCOPlantName = "";
	boolean OracleTemplatesDiffer = false;
	String partRevOracleTemplate = "";
	String prevPartRevOracleTemplate = "";
	String MCOName = "";
	String prevPartID = "";
	String sSequence = "";
	String sERPStatus = "";
	String sMakeBuy = "";
	String partID = "";
	String partPartMasterRelID = "";
	String prevPartPartMasterRelID = "";
	String mfgRespID = "";
	Map erp_objectNamesMap = null;
	Map baseERPiniMap = null;

	// Added by LRH for MicroMotion 10/12/10
	String emptyString = "";
	String destinationOrgs = "";
	//boolean ObjLifeCyclePromoted = false;

	// Added by LTP 8/25/17
	Map mcoHeaderMap = new HashMap();
	String sECODefName = "MOCKECNAME";
	String sECODefType = "CBREFONLY";
	String XMLSuccessMessages = "";
	String returnMessage = "";
	String userMessage = "";
	MapList outputMapList = new MapList();
	String putECOResult = "";

	String DATE_FORMAT = "MM/dd/yyyy";
	Calendar cal = Calendar.getInstance();
	SimpleDateFormat nFormat = new SimpleDateFormat(DATE_FORMAT);
	String dateTime = nFormat.format(cal.getTime());

	public MERPAssignMBOMPartToERPOrgJPO_mxJPO ()
	{
		statusObjects = null;

	}

	public MERPAssignMBOMPartToERPOrgJPO_mxJPO (Context context, String[] args) throws FrameworkException
	{
		statusObjects = null;
	}

	@SuppressWarnings({ "unchecked", "deprecation", "rawtypes" })

//-------------------
	/*
	 *	getListOfItemsAndOrgsToAssign
	 *
	 *	Entry Point for dummy EC Export.
	 */
	public HashMap<String, Object> getListOfItemsAndOrgsToAssign (Context context, String[] args) throws Exception
	{

		int returnInt = 0;
		String mn = "MERPAssignMBOMPartToERPOrgJPO.mxMain: ";
		HashMap<String, Object> paramMap = new HashMap<>();
		try
		{
			ERPDebugWriter.setDebug(ERPDebugWriter.CONSOLE, ERPDebugWriter.TIMESTAMP_ON, "", false);
		}
		catch(Exception e)
		{
			System.out.println("Error setting up logging, continuing w/o log");
		}

		//Get Global configuration data
		try
		{
			baseERPiniMap = ERPCommon.getBaseINIData(context, "Standard");
		}
		catch(Exception e)
		{
			ERPDebugWriter.debugOut(mn, "Error getting MERP_INI " + e );
			ERPDebugWriter.debugOut(mn, "NOTICE(A)" );
			MERPMessage.MERPSendNotice(context, MERPMessage.MERPGetMessage("MERP_MERP_INI_Problem", e.getMessage()), baseERPiniMap);
//			return outputMapList;
			return paramMap;
		}

		// Try to get the ERP names values, if we get an error abort
		try
		{
			erp_objectNamesMap = ERPCommon.getMERPNames(context, namesObjectName, baseERPiniMap);
		}
		catch(Exception e)
		{
			ERPDebugWriter.debugOut(mn, "Error getting MERP_NAMES " + e );
			ERPDebugWriter.debugOut(mn, "NOTICE(B)" );
//			MERPMessage.MERPSendNotice(context, MERPMessage.MERPGetMessage("MERP_MERP_NAMES_Problem", e.getMessage()), baseERPiniMap);
//			return outputMapList;
			return paramMap;
		}

		// Process ECO
		try
		{
//			outputMapList = getListOfItemsAndOrgsToAssignMain(context, args, baseERPiniMap, erp_objectNamesMap);
			paramMap = getListOfItemsAndOrgsToAssignMain(context, args, baseERPiniMap, erp_objectNamesMap);
		}
		catch(Exception e)
		{
			ERPDebugWriter.debugOut(mn, "Error processing MERPAssignMBOMPartToERPOrgJPO:" +"\n\n" + "e.getMessage: " + e.getMessage());
			String returnMsg = MERPMessage.formatError(e.getMessage());
			ERPDebugWriter.debugOut(mn, "NOTICE(C)" );
//	    MERPMessage.MERPSendNotice(context, "Error processing MERPAssignMBOMPartToERPOrgJPO:"+"\n\n"+returnMsg, baseERPiniMap);
			ERPDebugWriter.closeStream();
			System.out.println("Closed stream A");
//			return outputMapList;
			return paramMap;
		}

		// Display message
		ERPDebugWriter.debugOut(mn, "NOTICE(D)" );
//		MERPMessage.MERPSendNotice(context, putECOResult, baseERPiniMap);

		ERPDebugWriter.debugOut(mn, "END of MERPAssignMBOMPartToERPOrgJPO.mxMain()");
		ERPDebugWriter.debugOut(mn, "RETURNING returnInt value of: " + returnInt);

		// Close the debug stream
		ERPDebugWriter.closeStream();
		System.out.println("Closed stream B");

//		return outputMapList;
		return paramMap;
	}
	// end getListOfItemsAndOrgsToAssign()

	public HashMap<String, Object> getListOfItemsAndOrgsToAssignMain(Context context, String[] args, Map baseERPiniMap, Map erp_objectNamesMap) throws FrameworkException
	{
		/*
		 * Query all the plants
		 */
		String mn = "MERPAssignMBOMPartToERPOrgJPO.getListOfItemsAndOrgsToAssign: ";
		ArrayList validOrgsToAssign = new ArrayList();
		long start = System.currentTimeMillis();
		HashMap<String, Object> paramMap = new HashMap<>();
		Socket s = new Socket();

		try
		{
			HashMap inpuMap = (HashMap) JPO.unpackArgs(args);
			HashMap outputMap = null;
			Date currentDate = new Date();
			currentDate = nFormat.parse(dateTime);

			String itemsTobeAssigned = (String) inpuMap.get("itemsTobeAssigned");
			String sourceOrg = (String) inpuMap.get("sourceOrg");
			paramMap.put("sourceOrg", sourceOrg);
			destinationOrgs = (String) inpuMap.get("destinationOrgs");

			HashMap validPlantsMap = new HashMap();
			validateInput(context,itemsTobeAssigned,sourceOrg,destinationOrgs);

			String[] partsToAssign = itemsTobeAssigned.split(",");
			String[] destOrgsArr = destinationOrgs.split(",");

			for (int i=0; i< destOrgsArr.length; i++)
			{
				validOrgsToAssign.add(destOrgsArr[i]);
			}

			validPlantsMap.put("Parent Parts to Assign: ", itemsTobeAssigned);
			validPlantsMap.put("Source Org: ", sourceOrg);
			validPlantsMap.put("Destination Orgs: ", validOrgsToAssign);
			outputMapList.add(validPlantsMap);
			ERPDebugWriter.debugOut(mn, "outputMapList(1): "+outputMapList);

			SelectList select = new SelectList();
			select.addElement(DomainConstants.SELECT_TYPE);
			select.addElement(DomainConstants.SELECT_NAME);
			select.addElement(DomainConstants.SELECT_REVISION);
			select.addElement(DomainConstants.SELECT_ID);
			select.addElement(DomainConstants.SELECT_VAULT);

			StringList selectStmts = new StringList(1);
			selectStmts.addElement(DomainConstants.SELECT_ID);
			selectStmts.addElement(DomainConstants.SELECT_TYPE);
			selectStmts.addElement(DomainConstants.SELECT_NAME);
			selectStmts.addElement(DomainConstants.SELECT_REVISION);
			selectStmts.addElement(DomainConstants.SELECT_DESCRIPTION);

			StringList selectRelStmts = new StringList(6);
			selectRelStmts.addElement(DomainConstants.SELECT_RELATIONSHIP_ID);
			selectRelStmts.addElement("attribute[MMI Optional]");
			selectRelStmts.addElement(MBOMConstants.SELECT_SEQUENCE);
			selectRelStmts.addElement(MBOMConstants.SELECT_ERP_STATUS);
			selectRelStmts.addElement("attribute[MBOM Start Date]");
			selectRelStmts.addElement("attribute[MBOM End Date]");

			List assignItemsList = null;
			List commonItemsList = null;
//			List<String> assignItemsList = null;
//			List<String> commonItemsList = null;
			ERPDebugWriter.debugOut(mn, "GOT HERE 1");
			// Verify provided part names are valid'
			String configWhere = getConfigurableWhere(context);
			for (int inx = 0; inx < partsToAssign.length; inx++)
			{
				String sPartName = partsToAssign[inx].trim();
				ERPDebugWriter.debugOut(mn, "sPartName: "+sPartName);
				MapList mlResult = DomainObject.findObjects(
						context,
						"Part",//txtType,
						sPartName,//txtName,
						"*",//txtRev,
						"*",//txtOwner,
						"eService Production",//txtVault,
						"current == Release",//sWhereExp,
						null, true, select,
						Short.parseShort(Integer.toString(0)));
				ERPDebugWriter.debugOut(mn, "mlResult: "+mlResult);
				ERPDebugWriter.debugOut(mn, "GOT HERE 2");
				if (mlResult.size() == 0)
				{
					String[] messageValues = new String[] { partsToAssign[inx].trim() };
					String sMessage = MessageUtil.getMessage( context,
							null,
							"fsgEngineeringCentral.AssignItems.InvalidParts.Error",
							messageValues,
							null,
							context.getLocale(),
							"emxEngineeringCentralStringResource" );

					throw new Exception(sMessage);
				}
				ERPDebugWriter.debugOut(mn, "GOT HERE 3");
				assignItemsList = new ArrayList();
				commonItemsList = new ArrayList();
				outputMap = new HashMap();
				mlResult.sort(DomainConstants.SELECT_REVISION, "descending", "String");
				Map map = (Map) mlResult.get(0);
				String sPartId = (String) map.get(DomainConstants.SELECT_ID);
				ERPDebugWriter.debugOut(mn, "GOT HERE 4");
				DomainObject doPart = new DomainObject(sPartId);
				MapList mlMRs = doPart.getRelatedObjects(context,
						MBOMConstants.RELATIONSHIP_MANUFACTURING_RESPONSIBILITY, // relationship pattern
						MBOMConstants.TYPE_PLANT, // object pattern
						selectStmts, // object selects
						selectRelStmts, // relationship selects
						true, // to direction
						false, // from direction
						(short) 1, // recursion level
						"name=='"+sourceOrg.trim()+"'", // object where clause
						MBOMConstants.SELECT_STATUS+" == const Current",
						0);
				ERPDebugWriter.debugOut(mn, "mlMRs: "+mlMRs);
				ERPDebugWriter.debugOut(mn, "GOT HERE 5");
				if (mlMRs.size() == 0)
				{
					String[] messageValues = new String[] { sPartName, sourceOrg };
					String sMessage = MessageUtil.getMessage( context,
							null,
							"fsgEngineeringCentral.AssignItems.NoMRAssignment.Error",
							messageValues,
							null,
							context.getLocale(),
							"emxEngineeringCentralStringResource" );
					throw new Exception (sMessage);
				}
				ERPDebugWriter.debugOut(mn, "GOT HERE 6");
				mlMRs.sort(MBOMConstants.SELECT_SEQUENCE, "descending", "integer");
				Map mMR = (Map) mlMRs.get(0);
				String sERPStatus = (String) mMR.get(MBOMConstants.SELECT_ERP_STATUS);
				ERPDebugWriter.debugOut(mn, "sERPStatus: "+sERPStatus);
				ERPDebugWriter.debugOut(mn, "GOT HERE 7");
				if (!"Active".equals(sERPStatus))
				{
					String[] messageValues = new String[] { sPartName, sourceOrg };
					String sMessage = MessageUtil.getMessage( context,
							null,
							"fsgEngineeringCentral.AssignItems.NoMRAssignment.Error",
							messageValues,
							null,
							context.getLocale(),
							"emxEngineeringCentralStringResource" );
					throw new Exception (sMessage);
				}
				ERPDebugWriter.debugOut(mn, "GOT HERE 8");
				if (!assignItemsList.contains(sPartName))
				{
					assignItemsList.add(sPartName);
				}
				ERPDebugWriter.debugOut(mn, "GOT HERE 9");
				long checkStart = System.currentTimeMillis();
//				checkForOptionalAndAddChildren(context, sPartId, sourceOrg, (ArrayList) commonItemsList, (ArrayList) assignItemsList, currentDate);
				HashMap<Integer, String> testMap = new HashMap<>();
				checkForConfigurable(context, sPartId, sourceOrg, (ArrayList<String>) commonItemsList, (ArrayList<String>) assignItemsList, testMap, configWhere, 0);
				Set<Integer> keySet = testMap.keySet();
				for(Integer key : keySet)
				{
					System.out.println("Depth " + key + ": " + testMap.get(key));
				}
				long checkTime = (System.currentTimeMillis() - checkStart) / 1000;
				System.out.println("Time to check for optional and children (recursively): " + checkTime);
				ERPDebugWriter.debugOut(mn, "GOT HERE 10");
				outputMap.put("AssignItemsList: "+partsToAssign[inx], assignItemsList);
				ERPDebugWriter.debugOut(mn, "assignItemsList: "+assignItemsList);
				outputMap.put("CommonItemsList: "+partsToAssign[inx], commonItemsList);
				ERPDebugWriter.debugOut(mn, "commonItemsList: "+commonItemsList);
				outputMapList.add(outputMap);
				ERPDebugWriter.debugOut(mn, "outputMapList(2): "+outputMapList);
			}

//			Set keyss = outputMap.keySet();
//			Iterator iter = keyss.iterator();
//			ArrayList<ArrayList<String>> assigned = new ArrayList<ArrayList<String>>();
//			ArrayList<ArrayList<String>> common = new ArrayList<ArrayList<String>>();
//			while(iter.hasNext())
//			{
//				String key = (String) iter.next();
//				if(key.toLowerCase().contains("assignitemslist"))
//				{
//					assigned.add((ArrayList<String>) outputMap.get(key));
//				}
//				else
//				{
//					common.add((ArrayList<String>) outputMap.get(key));
//				}
//			}
//			System.out.println("assigned.toString() = " + assigned.toString());
//			System.out.println("common.toString() = " + common.toString());
////			getConfigurableWhere(context);
//
//			ERPDebugWriter.debugOut(mn, "GOT HERE 11");
////			String ECOName  = "ECONAME";
////			String ECONameValue = sECODefName;
////			mcoHeaderMap.put("ECO Name", new String[]{ECOName, ECONameValue});
//
////			String SourceOrgName  = "SITELEVEL";
////			String SourceOrgValue = validPlantsMap.get("Source Org: ");
////			mcoHeaderMap.put("Source Org", new String[]{SourceOrgName, SourceOrgValue});
//			BufferedWriter out = new BufferedWriter(new FileWriter("C:\\Users\\Jorefice\\Desktop\\logs\\mylog1.txt"));
//
//			ECOObject ECOObj = new ECOObject();
//			ECOObj.setName(sECODefName);
//
//			ERPDebugWriter.debugOut(mn, "Updating ECO TYPE mapping with default value");
//			String ECOTypeName  = "ECOTYPE";
//			String ECOTypeValue = sECODefType;
//			out.write("ECOTypeValue = " + ECOTypeValue + "\n");
//			ERPDebugWriter.debugOut(mn, " --- ECO Type mapping: Name = " + ECOTypeName + "; Value = " + ECOTypeValue);
//			mcoHeaderMap.put("ECO Type", new String[]{ECOTypeName, ECOTypeValue});
//			out.write("mcoHeaderMap = " + mcoHeaderMap + "\n");
//			ERPDebugWriter.debugOut(mn, "GOT HERE 12");
//
//			ECOObj.setECOAttributesMap(mcoHeaderMap);
//			out.write("ECOObj = " + ECOObj + "\n");
//
////-----------------------
///*
//<SYNC_ENGCHGORDR_003>
//	<CNTROLAREA>
//		¿
//	</CNTROLAREA>
//	<DATAAREA>
//		<SYNC_ENGCHGORDR>
//			<ENGCHGORDR>
//				<ECONAME>DUMMYECONAME</ECONAME>
//				<SITELEVEL>MVO</SITELEVEL>
//				<ECOTYPE>CBREFONLY</ECOTYPE>
//				<ENGREVBOM>
//					<BOMID>SAMPLEPART1</BOMID>
//					<CBREFORGLIST>ATLANTA|LOS ANGELES|CHICAGO</CBREFORGLIST>
//					<CBITEMSONLY>N</CBITEMSONLY>
//				</ENGREVBOM>
//				<ENGREVBOM>
//					<BOMID>SAMPLEPART2</BOMID>
//					<CBREFORGLIST>ATLANTA|LOS ANGELES|CHICAGO</CBREFORGLIST>
//					<CBITEMSONLY>Y</CBITEMSONLY>
//				</ENGREVBOM>
//			</ENGCHGORDR>
//		</SYNC_ENGCHGORDR>
//	</DATAAREA>
//</SYNC_ENGCHGORDR_003>
//
//*/
//			ERPDebugWriter.debugOut(mn, "GOT HERE 13");
//			String refOrgList = "";
//			ERPDebugWriter.debugOut(mn, "validOrgsToAssign.size: " + validOrgsToAssign.size());
//			for (int inx=0; inx < validOrgsToAssign.size(); inx++)
//			{
//				ERPDebugWriter.debugOut(mn, "validOrgsToAssign: " + (String)validOrgsToAssign.get(inx));
//				if (validOrgsToAssign.size() != inx+1)
//					refOrgList = refOrgList + (String)validOrgsToAssign.get(inx) + "|";
//				else
//					refOrgList = refOrgList + (String)validOrgsToAssign.get(inx);
//			}
//			out.write("refOrgList = " + refOrgList + "\n");
//			ERPDebugWriter.debugOut(mn, "refOrgList: " + refOrgList);
//
//			for (Object assignMap : outputMapList)
//			{
//				Set<String> keys = ((HashMap)assignMap).keySet();
//				Iterator<String> keyItr = keys.iterator();
//				while (keyItr.hasNext())
//				{
//					String keyStr = (String)keyItr.next();
//
//					if (keyStr.startsWith("AssignItemsList"))
//					{
//						System.out.println("In Assign loop");
//						ArrayList alAssignItems = (ArrayList)((HashMap)assignMap).get(keyStr);
//						out.write("assignItemsList = " + alAssignItems + "\n");
//						for (int i=0; i< alAssignItems.size(); i++)
//						{
//							Map BOMFilledHeaderMap = new HashMap();
//							ERPDebugWriter.debugOut(mn, "(Assign) Creating BOM Header Map for: " + (String)alAssignItems.get(i));
//							BOMFilledHeaderMap.put("Name", new String[]{"BOMID", (String)alAssignItems.get(i)});
//							BOMFilledHeaderMap.put("CommonBOM Ref Orglist", new String[]{"CBREFORGLIST", refOrgList});
//							BOMFilledHeaderMap.put("CommonBOM Items Only Flag", new String[]{"CBITEMSONLY", "Y"});
//							BOMFilledHeaderMap.put("CommonBOM Check and Create Items", new String[]{"CBCHKCREATEITEMS", "ParentOnly"});
//
//							BOMObject newBOM = new BOMObject();
//							newBOM.setName((String)alAssignItems.get(i));
//							newBOM.setBOMAttributesMap(BOMFilledHeaderMap);
//
//							// Add the new bom to the ECO
//							ECOObj.addNewBOM(newBOM);
//						}
//					}
//
//					if (keyStr.startsWith("CommonItemsList"))
//					{
//						System.out.println("In Common loop");
//						ArrayList alCommonItems = (ArrayList)((HashMap)assignMap).get(keyStr);
//						out.write("commonItemsList = " + alCommonItems + "\n");
//						for (int i=0; i< alCommonItems.size(); i++)
//						{
//							Map BOMFilledHeaderMap = new HashMap();
//							ERPDebugWriter.debugOut(mn, "(Common) Creating BOM Header Map for: " + (String)alCommonItems.get(i));
//							BOMFilledHeaderMap.put("Name", new String[]{"BOMID", (String)alCommonItems.get(i)});
//							BOMFilledHeaderMap.put("CommonBOM Ref Orglist", new String[]{"CBREFORGLIST", refOrgList});
//							BOMFilledHeaderMap.put("CommonBOM Items Only Flag", new String[]{"CBITEMSONLY", "N"});
//
//							BOMObject newBOM = new BOMObject();
//							newBOM.setName((String)alCommonItems.get(i));
//							newBOM.setBOMAttributesMap(BOMFilledHeaderMap);
//
//							// Add the new bom to the ECO
//							ECOObj.addNewBOM(newBOM);
//						}
//					}
//				}
//			}
//			ERPDebugWriter.debugOut(mn, "-------- ECO CONTENTS BEFORE XML GENERATION --------");
//			ECOObj.printECO();
//			ERPDebugWriter.debugOut(mn, "-------- END ECO CONTENTS BEFORE XML GENERATION --------");
//
//			String currSubTransactionID =  ERPCommon.generateTransactionID(sECODefName) + "_" + sourceOrg.replace(' ', '_') ;
//			ERPDebugWriter.debugOut(mn, "currSubTransactionID: " + currSubTransactionID);
//
//			// Produce XML based on the maps; return an XML Object
//			ERPDebugWriter.debugOut(mn, "Sending ECOObj to XML creator");
//			ERPXMLCreator XMLWriter = new ERPXMLCreator();
//			ERPDebugWriter.debugOut(mn, "New XML creator created");
//			out.write("ECOObj = " + ECOObj.toString() + "\n");
//			out.write("sourceOrg = " + sourceOrg + "\n");
//			out.write(("currSubTransactionID = " + currSubTransactionID + "\n"));
//			String XML = XMLWriter.createECOOutput(context, ECOObj, sourceOrg, currSubTransactionID);
//			out.write("XML = " + XML + "\n");
//			ERPDebugWriter.debugOut(mn, "Returned XML is:\n"+ XML );
//
//			// Get org connection data
//			Map currOrgConnectMap = ERPCommon.getOrgConnectData(context, sourceOrg, erp_objectNamesMap, baseERPiniMap);
//			out.write("currOrgConnectMap = " + currOrgConnectMap + "\n");
//			String connectObjectID = (String)currOrgConnectMap.get("connectObjectID");
//
//			// Post the XML - send the XML to the listener URL defined in the connect map
//			String toSend[] = new String[3];
//			toSend[0] = XML;
//			toSend[1] = (String)currOrgConnectMap.get("URL");
//			toSend[2] = currSubTransactionID;
//			out.write("toSend = " + Arrays.toString(toSend) + "\n");
//			ERPDebugWriter.debugOut(mn, "Sending XML to MERPPost");
//			String postResult = MERPPost.MERPPostXML(context, toSend);
////			out.write("postResult = " + postResult + "\n");
//			ERPDebugWriter.debugOut(mn, "Return string from MERPPost is:\n"+ postResult );
//
//			// Get the status of transaction from the returned XML
//			String returnStatusValue = MERPMessage.getXMLTagContents(postResult, "STATUS");
//			out.write("returnStatusValue = " + returnStatusValue + "\n");
//			ERPDebugWriter.debugOut(mn, "returnStatusValue: " + returnStatusValue);
//			out.write("returnStatusValue = " + returnStatusValue + "\n");
//
//			// Change status of status object to success if successful; otherwise place error and abort,
//			// Post result string
//			if (returnStatusValue.toLowerCase().equals("error"))
//			{
//				// Get the message from the Listener
//				String returnMessageValue = MERPMessage.getXMLTagContents(postResult, "TEXT");
//				ERPDebugWriter.debugOut(mn + "Error Received from Listener after sending XML: " + returnMessageValue + " , transaction aborted\n");
//
//				// Cleanup error messages displayed to user.
//				String[] errorMessages = returnMessageValue.split("\\n");
//				userMessage = "Errors encountered while sending ECO with Transaction ID "+currSubTransactionID+":\n";
//
////				Pattern errorPattern = Pattern.compile("^(Error: \\\w+ )(.*)");
//				Pattern errorPattern = Pattern.compile("^(Error: \\w+ )(.*)");
//				for (int msgidx = 0; msgidx < errorMessages.length; msgidx++) {
//					if (!errorMessages[msgidx].startsWith("Success")
//							&& !errorMessages[msgidx].startsWith("Error: BO ")
//							&& !errorMessages[msgidx].equals("XmlServer/Listener Error:")
//							&& !errorMessages[msgidx].equals("1")
//							&& !errorMessages[msgidx].equals("Exceptions while execute: An error was found in performing the ECO action:"))
//					{
//						if (errorMessages[msgidx].startsWith(" Error:")) {
//							errorMessages[msgidx] = errorMessages[msgidx].substring(1);
//						}
//						Matcher errorMatcher = errorPattern.matcher(errorMessages[msgidx]);
//						if (errorMatcher.matches()) {
//							errorMessages[msgidx] = errorMatcher.group(2);
//						}
//						userMessage += errorMessages[msgidx]+"\n";
//					}
//				}
//				ERPDebugWriter.debugOut(mn + "userMessage: " + userMessage + "\n");
//				throw new Exception(MERPMessage.MERPGetMessage(context, "Merp_XML_Error", returnMessageValue, baseERPiniMap));
//			}
//
//			if (returnStatusValue.toLowerCase().equals("fault"))
//			{
//				ERPDebugWriter.debugOut(mn, "Error Received from Listener after sending XML, transaction aborted");
//				throw new Exception(MERPMessage.MERPGetMessage(context, "Merp_XML_Error", "", baseERPiniMap));
//			}
//			else
//			{
//				// Get message from the Listener and add to success string
//				String returnMessageValue = MERPMessage.getXMLTagContents(postResult, "TEXT");
//				XMLSuccessMessages += "\n" + returnMessageValue;
//			}
//
//			returnMessage = MERPMessage.MERPGetMessage(context, "MERP_BOM_complete", "", baseERPiniMap) + "\n" + XMLSuccessMessages;
//			// Cleanup message displayed to user
//			userMessage = "MCO successfully exported.";
//			out.close();
		}
		catch (Exception e)
		{
			ERPDebugWriter.debugOut(mn, "NOTICE(E)" );
			ERPDebugWriter.debugOut(mn, "Error processing MERPAssignMBOMPartToERPOrgJPO:" +"\n\n" + "e.getMessage: " + e.getMessage());
			MqlUtil.mqlCommand(context, "notice '" + e.getMessage() + "Error processing MERPAssignMBOMPartToERPOrgJPO."+"'");
//			throw new Exception(e.getMessage());
//			return outputMapList;
			paramMap.put("outputMapList", outputMapList);
			return paramMap;
		}
//		putECOResult = MERPMessage.MERPGetMessage(context, "MERP_Export_Summary", userMessage + "\n\n" + returnMessage, baseERPiniMap);
//		putECOResult = "MERP Export Summary: " + userMessage + "\n\n" + returnMessage;
		long end = (System.currentTimeMillis() - start) / 1000;
		System.out.println("Total run time (s) = " + end);

		paramMap.put("outputMapList", outputMapList);
		return paramMap;
	} // getListOfItemsAndOrgsToAssignMain()


	//	public MapList commonParts(Context context, String[] args) throws Exception
	public HashMap<String, String> commonParts(Context context, String[] args) throws Exception
	{
		BufferedWriter out = new BufferedWriter(new FileWriter("C:\\Users\\Jorefice\\Desktop\\logs\\mylog2.txt"));
		ERPDebugWriter.setDebug(ERPDebugWriter.CONSOLE, ERPDebugWriter.TIMESTAMP_ON, "", false);
		System.out.println("MERPAssignMBOMPartToERPOrgJPO_mxJPO.commonParts");
		HashMap<String, String> paramMap = JPO.unpackArgs(args);
//		out.write("paramMap = " + paramMap + "\n");

		ArrayList<String> commonItemsList = getListFromString("commonItemsList", paramMap);
		System.out.println("commonItemsList = " + commonItemsList);
		ArrayList<String> assignItemsList = getListFromString("assignItemsList", paramMap);
		System.out.println("assignItemsList = " + assignItemsList);
		ArrayList<String> validOrgsToAssign = getListFromString("destinationOrgs", paramMap);
		System.out.println("validOrgsToAssign = " + validOrgsToAssign);

//		HashMap<String, Object> paramMap = new HashMap<>();
//		ERPDebugWriter.debugOut(mn, "GOT HERE 11");
//			String ECOName  = "ECONAME";
//			String ECONameValue = sECODefName;
//			mcoHeaderMap.put("ECO Name", new String[]{ECOName, ECONameValue});

//			String SourceOrgName  = "SITELEVEL";
//			String SourceOrgValue = validPlantsMap.get("Source Org: ");
		String sourceOrg = paramMap.get("sourceOrg");
		System.out.println("sourceOrg = " + sourceOrg);
//			mcoHeaderMap.put("Source Org", new String[]{SourceOrgName, sourceOrg});
//		MapList outputMapList = (MapList) paramMap.get("outputMapList");
//		ArrayList validOrgsToAssign = (ArrayList) paramMap.get("validOrgsToAssign");
		ECOObject ECOObj = new ECOObject();
		ECOObj.setName(sECODefName);

//		ERPDebugWriter.debugOut(mn, "Updating ECO TYPE mapping with default value");
		HashMap<String, String> outputMap = new HashMap<>();
		String ECOTypeName  = "ECOTYPE";
		String ECOTypeValue = sECODefType;
		out.write("ECOTypeValue = " + ECOTypeValue + "\n");
//		ERPDebugWriter.debugOut(mn, " --- ECO Type mapping: Name = " + ECOTypeName + "; Value = " + ECOTypeValue);
		mcoHeaderMap.put("ECO Type", new String[]{ECOTypeName, ECOTypeValue});
		out.write("mcoHeaderMap = " + mcoHeaderMap + "\n");
//		ERPDebugWriter.debugOut(mn, "GOT HERE 12");

		ECOObj.setECOAttributesMap(mcoHeaderMap);
		out.write("ECOObj = " + ECOObj + "\n");
//		ERPDebugWriter.debugOut(mn, "GOT HERE 13");
		String refOrgList = "";
//		ERPDebugWriter.debugOut(mn, "validOrgsToAssign.size: " + validOrgsToAssign.size());
		for (int inx=0; inx < validOrgsToAssign.size(); inx++)
		{
//			ERPDebugWriter.debugOut(mn, "validOrgsToAssign: " + (String)validOrgsToAssign.get(inx));
			if (validOrgsToAssign.size() != inx+1)
				refOrgList = refOrgList + (String)validOrgsToAssign.get(inx) + "|";
			else
				refOrgList = refOrgList + (String)validOrgsToAssign.get(inx);
		}
		System.out.println("refOrgList = " + refOrgList);
		out.write("refOrgList = " + refOrgList + "\n");
//		ERPDebugWriter.debugOut(mn, "refOrgList: " + refOrgList);
		out.write("commonItemsList = " + commonItemsList + "\n");
		out.write("assignItemsList = " + assignItemsList + "\n");
		for(String assignItem : assignItemsList)
		{
			Map BOMFilledHeaderMap = new HashMap();
//						ERPDebugWriter.debugOut(mn, "(Assign) Creating BOM Header Map for: " + (String)alAssignItems.get(i));
			BOMFilledHeaderMap.put("Name", new String[]{"BOMID", assignItem});
			BOMFilledHeaderMap.put("CommonBOM Ref Orglist", new String[]{"CBREFORGLIST", refOrgList});
			BOMFilledHeaderMap.put("CommonBOM Items Only Flag", new String[]{"CBITEMSONLY", "Y"});
			BOMFilledHeaderMap.put("CommonBOM Check and Create Items", new String[]{"CBCHKCREATEITEMS", "ParentOnly"});

			BOMObject newBOM = new BOMObject();
			newBOM.setName(assignItem);
			newBOM.setBOMAttributesMap(BOMFilledHeaderMap);

			// Add the new bom to the ECO
			ECOObj.addNewBOM(newBOM);
		}
		for(String commonItem : commonItemsList)
		{
			Map BOMFilledHeaderMap = new HashMap();
			BOMFilledHeaderMap.put("Name", new String[]{"BOMID", commonItem});
			BOMFilledHeaderMap.put("CommonBOM Ref Orglist", new String[]{"CBREFORGLIST", refOrgList});
			BOMFilledHeaderMap.put("CommonBOM Items Only Flag", new String[]{"CBITEMSONLY", "N"});

			BOMObject newBOM = new BOMObject();
			newBOM.setName(commonItem);
			newBOM.setBOMAttributesMap(BOMFilledHeaderMap);

			// Add the new bom to the ECO
			ECOObj.addNewBOM(newBOM);
		}

//		ERPDebugWriter.debugOut(mn, "-------- ECO CONTENTS BEFORE XML GENERATION --------");
		ECOObj.printECO();
//		ERPDebugWriter.debugOut(mn, "-------- END ECO CONTENTS BEFORE XML GENERATION --------");
		String currSubTransactionID =  ERPCommon.generateTransactionID(sECODefName) + "_" + sourceOrg.replace(' ', '_') ;
//		ERPDebugWriter.debugOut(mn, "currSubTransactionID: " + currSubTransactionID);

		// Produce XML based on the maps; return an XML Object
//		ERPDebugWriter.debugOut(mn, "Sending ECOObj to XML creator");
		ERPXMLCreator XMLWriter = new ERPXMLCreator();
		System.out.println("Made XML Writer");
//		ERPDebugWriter.debugOut(mn, "New XML creator created");
		out.write("ECOObj = " + ECOObj.toString() + "\n");
		out.write("sourceOrg = " + sourceOrg + "\n");
		out.write(("currSubTransactionID = " + currSubTransactionID + "\n"));
		String XML = XMLWriter.createECOOutput(context, ECOObj, sourceOrg, currSubTransactionID);
		out.write("XML = " + XML + "\n");
		System.out.println("Made XML String");
//		ERPDebugWriter.debugOut(mn, "Returned XML is:\n"+ XML );

		// Get org connection data
		baseERPiniMap = ERPCommon.getBaseINIData(context, "Standard");
		erp_objectNamesMap = ERPCommon.getMERPNames(context, namesObjectName, baseERPiniMap);
		System.out.println("erp_objectNamesMap = " + erp_objectNamesMap);
		System.out.println("baseERPiniMap = " + baseERPiniMap);
		Map currOrgConnectMap = ERPCommon.getOrgConnectData(context, sourceOrg, erp_objectNamesMap, baseERPiniMap);
		System.out.println("currOrgConnectMap = " + currOrgConnectMap);
		out.write("currOrgConnectMap = " + currOrgConnectMap + "\n");
		String connectObjectID = (String)currOrgConnectMap.get("connectObjectID");

		// Post the XML - send the XML to the listener URL defined in the connect map
		String toSend[] = new String[3];
		toSend[0] = XML;
		toSend[1] = (String)currOrgConnectMap.get("URL");
		toSend[2] = currSubTransactionID;
		System.out.println("toSend = " + toSend);
		out.write("toSend = " + Arrays.toString(toSend) + "\n");
//		ERPDebugWriter.debugOut(mn, "Sending XML to MERPPost");
		String postResult = MERPPost.MERPPostXML(context, toSend);
//		out.write("postResult = " + postResult + "\n");
		System.out.println("postResult = " + postResult);
//		ERPDebugWriter.debugOut(mn, "Return string from MERPPost is:\n"+ postResult );

		// Get the status of transaction from the returned XML
		String returnStatusValue = MERPMessage.getXMLTagContents(postResult, "STATUS");
		out.write("returnStatusValue = " + returnStatusValue + "\n");
		System.out.println("returnStatusValue = " + returnStatusValue);
//		ERPDebugWriter.debugOut(mn, "returnStatusValue: " + returnStatusValue);

		// Change status of status object to success if successful; otherwise place error and abort,
		// Post result string
		String status = "";
//		returnStatusValue = "error";
		if (returnStatusValue.toLowerCase().equals("error"))
		{
			// Get the message from the Listener
			String returnMessageValue = MERPMessage.getXMLTagContents(postResult, "TEXT");
			System.out.println("returnMessageValue = " + returnMessageValue);
//			ERPDebugWriter.debugOut(mn + "Error Received from Listener after sending XML: " + returnMessageValue + " , transaction aborted\n");

			// Cleanup error messages displayed to user.
			String[] errorMessages = returnMessageValue.split("\\n");
			System.out.println("errorMessages = " + Arrays.toString(errorMessages));
			userMessage = "Errors encountered while sending ECO with Transaction ID "+currSubTransactionID+":\n";

//				Pattern errorPattern = Pattern.compile("^(Error: \\\w+ )(.*)");
			Pattern errorPattern = Pattern.compile("^(Error: \\w+ )(.*)");
			for (int msgidx = 0; msgidx < errorMessages.length; msgidx++) {
				if (!errorMessages[msgidx].startsWith("Success")
						&& !errorMessages[msgidx].startsWith("Error: BO ")
						&& !errorMessages[msgidx].equals("XmlServer/Listener Error:")
						&& !errorMessages[msgidx].equals("1")
						&& !errorMessages[msgidx].equals("Exceptions while execute: An error was found in performing the ECO action:"))
				{
					if (errorMessages[msgidx].startsWith(" Error:")) {
						errorMessages[msgidx] = errorMessages[msgidx].substring(1);
					}
					Matcher errorMatcher = errorPattern.matcher(errorMessages[msgidx]);
					if (errorMatcher.matches()) {
						errorMessages[msgidx] = errorMatcher.group(2);
					}
					userMessage += errorMessages[msgidx]+"\n";
				}
			}
//			ERPDebugWriter.debugOut(mn + "userMessage: " + userMessage + "\n");
			status = "Error";
			returnMessage = MERPMessage.MERPGetMessage(context, "Merp_XML_Error", returnMessageValue, baseERPiniMap);
			returnMessage = userMessage;
//			throw new Exception(MERPMessage.MERPGetMessage(context, "Merp_XML_Error", returnMessageValue, baseERPiniMap));
		}
		else if (returnStatusValue.toLowerCase().equals("fault"))
		{
//			ERPDebugWriter.debugOut(mn, "Error Received from Listener after sending XML, transaction aborted");
			status = "Error";
			returnMessage = MERPMessage.MERPGetMessage(context, "Merp_XML_Error", "", baseERPiniMap);
//			throw new Exception(MERPMessage.MERPGetMessage(context, "Merp_XML_Error", "", baseERPiniMap));

		}
		else
		{
			// Get message from the Listener and add to success string
			String returnMessageValue = MERPMessage.getXMLTagContents(postResult, "TEXT");
			outputMap.put("test", returnMessageValue);
			XMLSuccessMessages += "\n" + returnMessageValue;
			status = MERPMessage.MERPGetMessage(context, "MERP_BOM_complete", "", baseERPiniMap);// + "----\n" + XMLSuccessMessages;
			returnMessage = XMLSuccessMessages;
			// Cleanup message displayed to user
			userMessage = "MCO successfully exported.";
			System.out.println("MERPAssignMBOMPartToERPOrgJPO_mxJPO.commonParts Finished");
			ERPDebugWriter.closeStream();
			out.close();
		}
		outputMap.put("status", status);
		outputMap.put("message", returnMessage);

//		outputMapList.add(errorMap);
//		return outputMapList;
		return outputMap;
	}

	public ArrayList<String> getListFromString(String name, HashMap<String, String> map) throws Exception
	{
//		BufferedWriter out = new BufferedWriter(new FileWriter("C:\\Users\\Jorefice\\Desktop\\logs\\mylog3.txt"));
		String str = map.get(name);
		System.out.println("MERPAssignMBOMPartToERPOrgJPO_mxJPO.getListFromString");
		System.out.println("str = " + str);
		ArrayList<String> ret = new ArrayList<>();
		if(!str.equalsIgnoreCase("[]") && str.length() >= 2)
		{
			// remove []
			str = str.substring(1, str.length()-1);
			ret = new ArrayList<>(Arrays.asList(str.split(",\\s*")));
//			ret = new ArrayList<>(Arrays.asList(str.split(",")));
		}
		return ret;
	}

	/**
	 * This method validates the input given in the Assign Parent Items dialog.
	 * @param context
	 * @param itemsTobeAssigned
	 * @param sourceOrg
	 * @param destinationOrgs
	 * @throws MatrixException
	 */
	public void validateInput(Context context, String itemsTobeAssigned, String sourceOrg, String destinationOrgs) throws Exception
	{
		long valStart = System.currentTimeMillis();
		//String plantQryMQL = "temp query bus Plant * * vault \"eService Production\" orderby attribute[Sort Value] select attribute[Sort Value] dump |";
		String plantQryMQL = "temp query bus Plant * * vault \"eService Production\" select attribute[Plant ID] dump |";
		System.out.println("plantQryMQL = " + plantQryMQL);

		MQLCommand command = new MQLCommand();
		command.open(context);
		String plantsOut = MQLCommand.executeCommand(command, context,
				plantQryMQL);

		String[] plantQryLinesArr = plantsOut.split("\n");

		ArrayList<String> plantVect = new ArrayList<String>();

		for (int inx = 0; inx < plantQryLinesArr.length; inx++) {
			String plantLineStr = plantQryLinesArr[inx];
//String[] plantLineValArr = plantLineStr.split("|");
			String[] plantLineValArr = plantLineStr.split("\\|");
			String plantStr = plantLineValArr[1];
			plantVect.add(plantStr);
		}

		if (!plantVect.contains(sourceOrg))
		{
			String[] messageValues = new String[] { sourceOrg };
			String sMessage = MessageUtil.getMessage( context,
					null,
					"fsgEngineeringCentral.AssignItems.InvalidSourceOrg.Error",
					messageValues,
					null,
					context.getLocale(),
					"emxEngineeringCentralStringResource" );
			throw new Exception(sMessage);
		}

		String[] destOrgsArr = destinationOrgs.split(",");

		String qryERPAvailableOrgs = "print attribute \"FSG Destination ERP Orgs For Commoning\" select range dump |";
		String strAvailableERPOrgs = MQLCommand.executeCommand(command, context,
				qryERPAvailableOrgs);
		strAvailableERPOrgs = strAvailableERPOrgs.replace("= ", "");
//String[] availableERPOrgsArr = strAvailableERPOrgs.split("|");
		String[] availableERPOrgsArr = strAvailableERPOrgs.split("\\|");

		Vector<String> availableERPOrgsVect = new Vector<String>();
		String invalidDestOrgs = "";
		for (int i=0; i< availableERPOrgsArr.length; i++)
		{
			availableERPOrgsVect.add(availableERPOrgsArr[i]);
		}

		for(String dest : destOrgsArr)
		{
			dest = dest.trim();
			if(!availableERPOrgsVect.contains(dest))
			{
				invalidDestOrgs += dest + ",";
			}
		}

		if (invalidDestOrgs.length() > 0)
		{
			invalidDestOrgs = invalidDestOrgs.substring(0,invalidDestOrgs.length()-1);
			String[] messageValues = new String[] { invalidDestOrgs };
			String sMessage = MessageUtil.getMessage( context,
					null,
					"fsgEngineeringCentral.AssignItems.DestinationOrgs.InvalidSelection.Error",
					messageValues,
					null,
					context.getLocale(),
					"emxEngineeringCentralStringResource" );

			throw new Exception(sMessage);
		}

		String existingDesOrgs = "";
		for (int i=0; i< destOrgsArr.length; i++)
		{
			if (plantVect.contains(destOrgsArr[i]))
			{
				existingDesOrgs += destOrgsArr[i];
				existingDesOrgs += ",";
			}
		}

		if (existingDesOrgs.length() > 0)
		{
			existingDesOrgs = existingDesOrgs.substring(0,existingDesOrgs.length()-1);

			String[] messageValues = new String[] { existingDesOrgs };
			String sMessage = MessageUtil.getMessage( context,
					null,
					"fsgEngineeringCentral.AssignItems.InvalidDestinationOrgs.Error",
					messageValues,
					null,
					context.getLocale(),
					"emxEngineeringCentralStringResource" );

			throw new Exception(sMessage);
		}
		System.out.println("Input was valid");
		long valTime = (System.currentTimeMillis() - valStart) / 1000;
		System.out.println("Time to validate inputs: " + valTime);
	}

	/**
	 * Method to recursively check for optional children and add it to the assignItemsList, commonItemsList.
	 * @param context
	 * @param sPartId
	 * @param sourceOrg
	 * @param commonItemsList
	 * @param assignItemsList
	 * @return
	 * @throws FrameworkException
	 * @throws Exception
	 */
	public void checkForOptionalAndAddChildren(Context context, String sPartId, String sourceOrg, ArrayList<String> commonItemsList, ArrayList<String> assignItemsList, Date currentDate) throws FrameworkException, Exception
	{
		String mn = "MERPAssignMBOMPartToERPOrgJPO.checkForOptionalAndAddChildren: ";

		HashMap mbomFilterMap = new HashMap();
		mbomFilterMap.put("MFGMBOMPlantCustomFilter", sourceOrg);
		mbomFilterMap.put("MBOMWIPBOMCustomFilter", "false");
		mbomFilterMap.put("emxExpandFilter", "1");
		mbomFilterMap.put("sMBOMDateCustomFilterMs", null);

		DomainObject doPart = new DomainObject(sPartId);
		String sPartName = (String)doPart.getInfo(context, DomainConstants.SELECT_NAME);
		enoMBOMConsolidated_mxJPO enoMBOM = new enoMBOMConsolidated_mxJPO( context, new String[] {} );
		MapList mlMBOM = enoMBOM.getMBOMListOfAPart(context, mbomFilterMap, sPartId, MBOMConstants.RELATIONSHIP_MBOM, "", "");
		//mlMBOM.sortStructure(DomainConstants.SELECT_FIND_NUMBER, "ascending", "integer");
		mlMBOM.sort(DomainConstants.SELECT_FIND_NUMBER, "ascending", "integer");
		ERPDebugWriter.debugOut(mn, "mlMBOM: "+mlMBOM);

		boolean atLeastOneChildOptional = false;
		ArrayList<String> childrenAtThisLevelList = new ArrayList<String>();
		if (mlMBOM.size() > 0) {
			//ERPDebugWriter.debugOut(mn + "Check if any optional children\n");
			for (Object mChild : mlMBOM)
			{
				String sChildName = (String) ((Map)mChild).get(DomainConstants.SELECT_NAME);
				ERPDebugWriter.debugOut(mn, "sChildName: "+sChildName+"\n");
				childrenAtThisLevelList.add(sChildName);
				String sOptional = (String) ((Map)mChild).get("attribute[MMI Optional]");
				ERPDebugWriter.debugOut(mn, "sOptional: "+sOptional+"\n");
				if ("Yes".equals(sOptional)) {
					atLeastOneChildOptional = true;
					String sChildPartId = (String) ((Map)mChild).get(DomainConstants.SELECT_ID);
					checkForOptionalAndAddChildren(context, sChildPartId, sourceOrg, (ArrayList) commonItemsList, (ArrayList) assignItemsList, currentDate);
				}
			}
			//ERPDebugWriter.debugOut(mn + "atLeastOneChildOptional: "+atLeastOneChildOptional+"\n");
			if (atLeastOneChildOptional) {
				//ERPDebugWriter.debugOut(mn + "Add parent "+sPartMasterName+" to commonItemsList\n");
				if (!commonItemsList.contains(sPartName)) {
					commonItemsList.add(sPartName);
					if (assignItemsList.contains(sPartName)) {
						assignItemsList.remove(sPartName);
					}
				}
				//ERPDebugWriter.debugOut(mn + "Add all children of "+sPartMasterName+" to assignItemsList\n");
			}
			//ERPDebugWriter.debugOut(mn + "commonItemsList: "+commonItemsList);
			//ERPDebugWriter.debugOut(mn + "assignItemsList: "+assignItemsList);
		}
	}

	public void checkForConfigurable(Context context, String partId, String sourceOrg, ArrayList<String> commonItemsList, ArrayList<String> assignItemsList, HashMap<Integer, String> commonHash, String busWhere, int depth) throws Exception
	{
		if(depth > 10)
		{
//			System.out.println("Infinite Recursion");
			return;
		}
		HashMap mbomFilterMap = new HashMap();
		mbomFilterMap.put("MFGMBOMPlantCustomFilter", sourceOrg);
		mbomFilterMap.put("MBOMWIPBOMCustomFilter", "false");
		mbomFilterMap.put("emxExpandFilter", "1");
		mbomFilterMap.put("sMBOMDateCustomFilterMs", null);
		DomainObject domObj = new DomainObject(partId);
		String partName = domObj.getInfo(context, DomainConstants.SELECT_NAME);
		enoMBOMConsolidated_mxJPO enoMBOM = new enoMBOMConsolidated_mxJPO(context, new String[] {});
		MapList maplist = enoMBOM.getMBOMListOfAPart(context, mbomFilterMap, partId, MBOMConstants.RELATIONSHIP_MBOM, busWhere, "");
		maplist.sort(DomainConstants.SELECT_FIND_NUMBER, "ascending", "integer");
		ArrayList<String> children = new ArrayList<>();
		for(int i = 0; i < maplist.size(); i++)
		{
			Map childMap = (Map) maplist.get(i);
			String childName = (String) childMap.get(DomainConstants.SELECT_NAME);
			String childType = (String) childMap.get(DomainConstants.SELECT_TYPE);
			children.add(childName);
			String childrenAtDepth = commonHash.get(depth);
			if(childrenAtDepth == null)
			{
				commonHash.put(depth, childName);
			}
			else
			{
				commonHash.put(depth, childrenAtDepth += ", " + childName);
			}
			commonItemsList.add(childName);
			String childId = (String) childMap.get(DomainConstants.SELECT_ID);
			checkForConfigurable(context, childId, sourceOrg, commonItemsList, assignItemsList, commonHash, busWhere, depth + 1);
		}
		if(maplist.size() > 0 && !commonItemsList.contains(partName))
		{
			commonItemsList.add(partName);
			assignItemsList.remove(partName);
		}
//		System.out.println("depth = " + depth);
	}
	//change the name to be getConfigurableWhere or something
	//Figure out why there's infinite recursion. Pretty sure it's because I didn't actually use a where clause
	public String getConfigurableWhere(Context context) throws FrameworkException
	{
		String types = MqlUtil.mqlCommand(context, "print type MMIOracleConfiguratorPart select derivative dump ,");
		ArrayList<String> typeList = new ArrayList<>(Arrays.asList(types.split(",")));
		for(int i = 0; i < typeList.size(); i++)
		{
			String type = typeList.get(i).toLowerCase();
			if(type.contains("restock") || type.contains("routingstep"))
			{
				System.out.println("Removing " + typeList.get(i));
				typeList.remove(i);
				i--;
			}
		}
		System.out.println("Configurable Parts List = " + typeList);
		String where = "";
		for(String type : typeList)
		{
			where += " || type == " + type;
		}
		if(typeList.size() > 0)
		{
			where = where.substring(4);
		}
		System.out.println("My where = " + where);
		return where;
	}

	/**
	 *
	 *putItem()
	 *
	 *
	 *@param an array of objects containing the following:
	 *@param type the type string for the part to be exported
	 *@param pNamp the name string for the part to be exported
	 *@param rev the revision string for the part to be exported
	 *@param objectID the ID string for the part to be exported
	 *@param vault the vault string for the part to be exported
	 *@param erp_iniMap the INI map obtained from a call to ERPCommon.getINIData()
	 *@param erp_objectNamesMap the NAMES map obtained from a call to ERPCommon.getMERPNames()
	 *@param calledFromPutEC a boolean value telling the method wether it is being called from a
	 *      putEC call(turns off completion messages and some other output)
	 *@return an Integer indicating the success or failure of the operation 0 if sucess 1 if failure
	 *//**
 public int putItem (Context context, String id, String type, String name, String rev, String vault, String plant) throws Exception
 {
 String mn = "MERPAssignMBOMPartToERPOrgJPO.putItem: ";

 String iniObjectName = "MERP_INI";     //defines the name of the INI object from which data will be read
 String namesObjectName = "MERP_NAMES";      //defines the name of the MERP_NAMES object from which naming data will be read

 Map erp_iniMap = new HashMap();
 BusinessObject currBusObj = null;
 String currBusObjObjId = "";
 String currBusObjType = "";
 String currBusObjName = "";
 String currBusObjRev = "";
 String currBusObjVault = "";
 String currTransactionID = "";
 ERPStatusObj masterErpStatusObj = null;
 statusObjects = new Vector();
 String XMLSucessMessages = "";
 String returnMessage = "";

 ERPDebugWriter.debugOut(mn + "START of MERPAssignMBOMPartToERPOrgJPO v" + version +"\n");

 //set information about the current Matrix Object
 currBusObjObjId = id;//(String) inputArgs[0];                         // ID of Part Master
 currBusObjType = type;//(String) inputArgs[1];                          // should be Part Master
 currBusObjName = name;//(String) inputArgs[2];                          // Part Master name
 currBusObjRev = rev;//(String) inputArgs[3];                           // Part Master rev
 currBusObjVault = vault;//(String) inputArgs[4];
 MCOPlantName   = plant;

 try
 {
 erp_iniMap = ERPCommon.getINIData(context, iniObjectName);
 }
 catch(Exception e)
 {
 ERPDebugWriter.debugOut(mn + "Error getting MERP_INI " + e + "\n");
 return 1;
 }
 //
 //Try to get the ERP names values, if we get an error abort
 //
 try
 {
 erp_objectNamesMap = ERPCommon.getMERPNames(context, namesObjectName, erp_iniMap);
 }

 catch(Exception e)
 {
 ERPDebugWriter.debugOut(mn + "Error getting MERP_NAMES " + e + "\n");
 return 1;
 }

 ERPDebugWriter.debugOut(mn + "Matrix Object Information\n");
 ERPDebugWriter.debugOut(mn + "ObjectId = " + currBusObjObjId + "\n");
 ERPDebugWriter.debugOut(mn + "Type = " + currBusObjType + "\n");
 ERPDebugWriter.debugOut(mn + "Name = "+ currBusObjName + "\n");
 ERPDebugWriter.debugOut(mn + "Revision = " + currBusObjRev + "\n");
 ERPDebugWriter.debugOut(mn + "Vault = " + currBusObjVault + "\n");

 String cmd = "list server betsy*";
 String sBetsyInstance = MqlUtil.mqlCommand(context,cmd);

 String sRDOName = "";


 DomainObject partMasterObj = new DomainObject(currBusObjObjId);

 StringList selectStmts = new StringList(1);
 selectStmts.addElement(DomainConstants.SELECT_ID);
 selectStmts.addElement(DomainConstants.SELECT_TYPE);
 selectStmts.addElement(DomainConstants.SELECT_NAME);
 selectStmts.addElement(DomainConstants.SELECT_REVISION);
 selectStmts.addElement(DomainConstants.SELECT_DESCRIPTION);

 StringList selectRelStmts = new StringList(6);
 selectRelStmts.addElement(DomainConstants.SELECT_RELATIONSHIP_ID);

 MapList mlPRs = partMasterObj.getRelatedObjects(context,
 MBOMConstants.RELATIONSHIP_PART_REVISION, // relationship pattern
 MBOMConstants.TYPE_PART, // object pattern
 selectStmts, // object selects
 selectRelStmts, // relationship selects
 false, // to direction
 true, // from direction
 (short) 1, // recursion level
 null, // object where clause
 null);
 if (mlPRs.size() > 0)
 {
 Map map = (Map) mlPRs.get(mlPRs.size()-1);
 String currPartObjId = (String) map.get(DomainConstants.SELECT_ID);

 DomainObject doPart = new DomainObject(currPartObjId);
 sRDOName = doPart.getInfo(context, "to["+DomainConstants.RELATIONSHIP_DESIGN_RESPONSIBILITY+"].from.name");
 }

 ERPDebugWriter.debugOut(mn + "sRDOName: " + sRDOName + "\n");
 sRDOName = sRDOName.replaceAll(" ", "");
 //create a java businessObject and connect to it
 try {
 currBusObj = new BusinessObject(currBusObjObjId);
 currBusObj.open(context);
 } catch(Exception e) {
 ERPDebugWriter.debugOut(mn + "ERROR opening business object " + e +"\n");
 ERPDebugWriter.debugOut(mn + "Could not open business object for: " + currBusObjType
 + " " +currBusObjName + " " + currBusObjRev + " Export halted\n");
 ERPDebugWriter.debugOut(mn + "Cannot continue. Exiting \n");
 MERPMessage.MERPSendError(context,"MERP_Open_BusObj_Error", e.toString(), erp_iniMap);
 return 1;
 }

 //set transaction id, and create transaction status object
 currTransactionID = ERPCommon.generateTransactionID(currBusObjName);
 ERPDebugWriter.debugOut(mn + "currTransactionID: " + currTransactionID + "\n");
 try {
 masterErpStatusObj = new ERPStatusObj(context,currTransactionID, currBusObjObjId,
 "MASTER", "ERP EXPORT of " + currBusObjType
 + " " +currBusObjName + " " + currBusObjRev,
 erp_iniMap);
 //add to cleanup vector
 statusObjects.add(masterErpStatusObj);
 } catch(Exception e) {
 ERPDebugWriter.debugOut(mn + "ERROR creating status object " + e +"\n");
 ERPDebugWriter.debugOut(mn + "Could not create Status object for: " + currBusObjType
 + " " +currBusObjName + " " + currBusObjRev + " Export halted\n");
 ERPDebugWriter.debugOut(mn + "Cannot continue. Exiting \n");
 MERPMessage.MERPSendError(context,"MERP_Master_Status_Create_Fail", e.toString(), erp_iniMap);
 return 1;
 }

 String subTransactionID = currTransactionID + MCOPlantName.replace(' ', '_') ;
 ERPDebugWriter.debugOut(mn + "subTransactionID: " + subTransactionID + "\n");
 ERPStatusObj currChildStatusObj = null;

 //create transaction ID and childStatus object
 try {
 currChildStatusObj = masterErpStatusObj.createChildObject(context, subTransactionID, currBusObjObjId,
 MCOPlantName, "Export for " + currBusObjType +
 " " + currBusObjName + " " +  currBusObjRev +
 " to" + MCOPlantName, erp_iniMap);
 statusObjects.add(currChildStatusObj);
 } catch(Exception e) {
 ERPDebugWriter.debugOut(mn + "Could not create child status object for " + MCOPlantName +
 "will try to export to other business units\n");
 MERPMessage.MERPSendError(context, "MERP_Child_Status_Create_Fail", e.toString(), erp_iniMap);
 }

 //Get connection data for the organization
 Map orgConnectMap = null;
 try {

 orgConnectMap = ERPCommon.MERPGetConfigValues(context, "CONNECT_ERP", "-", "=");
 //make sure we have vault info
 if(orgConnectMap.get("VAULT") == null) {
 throw new Exception();
 }
 if(orgConnectMap.get("URL") == null) {
 throw new Exception();
 }
 } catch(Exception e) {

 currChildStatusObj.update(context, "ERROR", MERPMessage.MERPGetMessage(context,"MERP_No_Connect_Data_Error", "", erp_iniMap), null, null);
 cleanup(context, erp_iniMap, MERPMessage.MERPGetMessage(context,"MERP_No_Connect_Data_Error", "", erp_iniMap) , currBusObj);
 MERPMessage.MERPSendError(context, "MERP_No_Connect_Data_Error", e.toString(), erp_iniMap);
 return 1;
 }

 String sERPVault = (String)orgConnectMap.get("VAULT");
 ERPDebugWriter.debugOut(mn + "sERPVault: " + sERPVault + "\n");

 String sNewComponentName = name;
 ERPDebugWriter.debugOut(mn + "sNewComponentName: " + sNewComponentName + "\n");
 String sNewComponentId = id;
 ERPDebugWriter.debugOut(mn + "sNewComponentId: " + sNewComponentId + "\n");

 StringBuffer sbWhereClause = new StringBuffer();
 sbWhereClause.append("policy == \'");
 sbWhereClause.append(DomainConstants.POLICY_EC_PART);
 sbWhereClause.append("\' && current == \'");
 sbWhereClause.append(DomainConstants.STATE_PART_RELEASE);
 sbWhereClause.append("\'");

 StringList busSelList = new StringList();
 busSelList.addElement(DomainObject.SELECT_ID);
 busSelList.addElement(DomainObject.SELECT_REVISION);
 busSelList.addElement(DomainObject.SELECT_DESCRIPTION);
 busSelList.addElement(DomainObject.SELECT_ATTRIBUTE_UNITOFMEASURE);

 MapList mlParts = DomainObject.findObjects(context,
 DomainConstants.TYPE_PART,
 sNewComponentName,
 "*",
 "*",
 currBusObjVault,
 sbWhereClause.toString(),
 true,
 busSelList);
 mlParts.sort(DomainObject.SELECT_REVISION,"descending","String");
 Map mPart = (Map) mlParts.get(0);
 String sNewComponentUoM = (String) mPart.get(DomainObject.SELECT_ATTRIBUTE_UNITOFMEASURE);
 Map mNewComponentERPMap = new HashMap();
 mNewComponentERPMap.put("Name", new String[]{"ITEM", sNewComponentName});
 mNewComponentERPMap.put("ERP-Status", new String[]{"USERAREA=ITEMSTATUS", "Active"});
 mNewComponentERPMap.put("Unit of Measure", new String[]{"UOM", sNewComponentUoM});
 i18nNow loc = new i18nNow();
 String sContextDFF = loc.GetString("emxMBOM", context.getLocale().toString(), "mmiMBOM."+sRDOName+".ContextDFF");
 ERPDebugWriter.debugOut(mn + "sContextDFF: " + sContextDFF + "\n");
 mNewComponentERPMap.put("Attribute Category", new String[]{"USERAREA=ATTR_CATEGORY", sContextDFF});
 BusinessObject boNewComponent = new BusinessObject(sNewComponentId);
 boNewComponent.open(context);

 StringList slDestinationOrgs = FrameworkUtil.split(destinationOrgs, ",");
 ERPDebugWriter.debugOut(mn + "slDestinationOrgs: " + slDestinationOrgs + "\n");

 ERPDebugWriter.debugOut(mn + "plant: " + plant + "\n");

 boolean bSendComponent = false;
 MapList mlERPComp = DomainObject.findObjects(context,
 "ERP Part Master2",
 sNewComponentName,
 plant,
 "*",
 sERPVault,
 null,
 true,
 new StringList("attribute[Item Status]"));
 if (mlERPComp.size() > 0) {
 ERPDebugWriter.debugOut(mn+sNewComponentName+" already exists in "+plant+"\n");
 Map mERPComp = (Map)mlERPComp.get(0);
 String sOracleItemStatus = (String)mERPComp.get("attribute[Item Status]");
 if (!"Active".equals(sOracleItemStatus)) {
 ERPDebugWriter.debugOut(mn+" "+sNewComponentName+" Item Status not Active in "+plant+"\n");
 bSendComponent = true;
 }
 } else {
 bSendComponent = true;
 }
 if (bSendComponent) {
 ERPDebugWriter.debugOut(mn+" "+sNewComponentName+" sending to org "+plant+"\n");
 String newComponentTransactionID = ERPCommon.generateTransactionID(sNewComponentName)+plant;
 ERPStatusObj newComponentStatusObj = masterErpStatusObj.createChildObject(context, newComponentTransactionID, sNewComponentId,
 MCOPlantName, "Export for Part Master" +
 " " + sNewComponentName +
 " to " + plant, erp_iniMap);
 statusObjects.add(newComponentStatusObj);

 ERPXMLCreator XMLWriter = new ERPXMLCreator();
 String XML = XMLWriter.createItemOutput(context, boNewComponent, plant,
 newComponentTransactionID, mNewComponentERPMap, null);
 ERPDebugWriter.debugOut(mn + "Returned XML is:\n"+ XML +"\n");

 newComponentStatusObj.update(context, "PENDING", null , null, null);

 //send the XML to the Plant in the connect map
 String toSend[] = new String[3];
 toSend[0] = XML;
 toSend[1] = (String)orgConnectMap.get("URL");
 toSend[2] = newComponentTransactionID;
 ERPDebugWriter.debugOut(mn + "Sending XML to MERPPost\n");

 //Commented out for validating the output and check the result

 String postResult = MERPPost.MERPPostXML(context, toSend);
 ERPDebugWriter.debugOut(mn + "Return string from MERPPost is:\n"+ postResult +"\n");

 // Change status of status object to success if successful otherwise place error and
 // abort, post result string
 if(postResult.toLowerCase().indexOf("error") != -1) {
 //get message from listener
 int startErrorMessage = postResult.indexOf("<TEXT>") + 6;
 int endErrorMessage = postResult.indexOf("</TEXT>");
 String XMLErrorMessage = postResult.substring(startErrorMessage, endErrorMessage);
 newComponentStatusObj.update(context, "ERROR", postResult, null, null);
 ERPDebugWriter.debugOut(mn + "Error received from listener after sending XML: "+XMLErrorMessage+"\nTransaction aborted.\n");

 // Cleanup error messages displayed to user.
 String userMessage = "\nError importing item "+currBusObjName+" into "+MCOPlantName+" org in "+sBetsyInstance+": ";
 String[] errorMessages = XMLErrorMessage.split("\\n");
 for (int msgidx = 0; msgidx < errorMessages.length; msgidx++) {
 if (errorMessages[msgidx].startsWith("Exceptions while execute:")) {
 if (errorMessages[msgidx].startsWith("Exceptions while execute: Item import failed:  Error: ITEM")) {
 userMessage += errorMessages[msgidx].substring(59,errorMessages[msgidx].length());
 } else {
 userMessage += errorMessages[msgidx].substring(26,errorMessages[msgidx].length());
 }
 }
 }
 ERPDebugWriter.debugOut(mn + "userMessage: "+userMessage+"\n");
 MERPMessage.MERPSendError(context, "Merp_XML_Error", userMessage, erp_iniMap);
 cleanup(context, erp_iniMap,
 MERPMessage.MERPGetMessage(context, "Merp_XML_Error", XMLErrorMessage, erp_iniMap),
 currBusObj);
 return 1;
 }
 if(postResult.toLowerCase().indexOf("fault") != -1) {
 newComponentStatusObj.update(context, "ERROR", postResult, null, null);
 ERPDebugWriter.debugOut(mn + "Error received from listener after sending XML, transaction aborted\n");
 MERPMessage.MERPSendError(context, "Merp_XML_Error", "", erp_iniMap);
 cleanup(context, erp_iniMap,
 MERPMessage.MERPGetMessage(context, "Merp_XML_Error", "", erp_iniMap), currBusObj);
 return 1;
 } else {
 //get message from listener
 int startErrorMessage = postResult.indexOf("<TEXT>") + 6;
 int endErrorMessage = postResult.indexOf("</TEXT>");
 ERPDebugWriter.debugOut(mn + "postResult message: " + postResult.substring(startErrorMessage, endErrorMessage) + "\n");
 XMLSucessMessages += "\n" + postResult.substring(startErrorMessage, endErrorMessage);
 newComponentStatusObj.update(context, "SUCCESS", postResult.substring(startErrorMessage, endErrorMessage), null, null);
 }
 }

 boNewComponent.close(context);
 ERPDebugWriter.debugOut(mn + "END of MERPPutItem\n");

 //
 //return success
 //
 return 0;
 }
 //end putItem()--------------------------------------------------------------------

 //
 //cleans up database objects created in put item and closes the debug stream
 //
 private void cleanup(Context context, Map erp_iniMap, String historyMessage, BusinessObject historyBusObj)
 {
 String mn = "cleanup: ";
 //
 //delete status object if we arent saving them
 //
 if((erp_iniMap.get("KeepStatusObjects") != null && ((String)erp_iniMap.get("KeepStatusObjects")).equalsIgnoreCase("FALSE"))
 || erp_iniMap.get("KeepStatusObjects") == null)
 {

 while(statusObjects != null && statusObjects.size() > 0)
 {
 ERPStatusObj temp = (ERPStatusObj) statusObjects.remove(0);
 try
 {
 temp.delete(context);
 }
 catch(Exception e)
 {
 ERPDebugWriter.debugOut(mn + "Error in putItem cleanup " + e + "\n");
 }
 }
 }//end if we arent saving the status objects

 //
 //write the history message to the given business object
 //
 try
 {
 ERPDebugWriter.debugOut(mn + "Adding to history\n");
 MQLCommand mql = new MQLCommand();
 mql.open(context);
 String rpeVal = "modify bus " + historyBusObj.getObjectId() +" add history \"MERP " + historyMessage +"\";";
 ERPDebugWriter.debugOut(mn + "MQL call is: " + rpeVal + "\n");
 mql.executeCommand(context, rpeVal);
 mql.close(context);
 }
 catch(Exception e)
 {
 ERPDebugWriter.debugOut(mn + "Error in putItem cleanup " + e + "\n");
 }
 }
 //end cleanup()-------------------------------------------------------------------

 */
}//end class MERPAssignMBOMPartToERPOrgJPO
