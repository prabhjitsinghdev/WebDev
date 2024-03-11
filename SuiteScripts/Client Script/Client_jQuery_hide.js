/*******************************************************************
*pj92singh 
*Prabhjit Singh 
*
* Name: Client Checbox checker
* Script Type: Client Script
* Version: 1.0.0
*
*
* Author: pj92singh
Prabhjit Singh 
* Purpose: SS1.0 This script usse external jQuery libray functions.
* In this case it will hide the expense sublist 
*
*
* ******************************************************************* */

function pageLoadHideSublist(){
	
	
	var recID = nlapiGetRecordId();
	var recType = nlapiGetRecordType();
	nlapiLogExecution('DEBUG', 'recstuff', 'rectype ' +recType +'recID ' +recID); 
	
	try{
		nlapiLoadRecord(type, id, initializeValues)
		var POrec = nlapiLoadRecord(recType, recID);
		nlapiLogExecution('DEBUG', 'begin hide', 'hiding using jQuery');
		//hide sublist
		jQuery('#expenselnk').hide();  

	}catch(error){
		nlapiLogExecution('DEBUG', 'catch', '***catch error*** ' +JSON.stringify(error)); 
	}
}