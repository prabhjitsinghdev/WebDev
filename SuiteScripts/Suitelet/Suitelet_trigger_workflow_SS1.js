/*******************************************************************
*
*
* Name: Suitelet_SS1_triggerWorkflow.js 
* Script Type: Suitelet Script
* Version: 1.0.0
*
*
* Author: Prabhjit Singh 
* Purpose: tigger worflow4075 
*
*
* ******************************************************************* */ 
//ss1.0
//script used for running workflow
//SUITELET
function triggerTheWorkflow(scriptcontext){

	nlapiLogExecution('DEBUG', 'start script', 'starting scrit//workflow should be running');
	nlapiTriggerWorkflow('purchaseorder', '4500', 'customworkflow130', 'workflowaction4075');
	//using the 'workflowaction4075'
	//this action creates the button 
	//so this is what you reference to "trigger" the button click
		var html = '<html><body><h1>Suitelet RAN; check the Purchase order 4500</h1></body></html>';
	response.write(html); 
	nlapiLogExecution('DEBUG', 'end script', 'ENDING script// workflow should be running');

	nlapiSendEmail(author, recipient, subject, body, cc, bcc, records, attachments, notifySenderOnBounce, internalOnly, replyTo)
}