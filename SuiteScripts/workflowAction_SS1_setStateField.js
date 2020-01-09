/*******************************************************************
*
*
* Name: workflowAction_SS1_setStateField.js 
* Script Type: workflowAction Script
* Version: 1.0.0
*
*
* Author: Prabhjit Singh 
* Purpose: workflowaction script ss1.0 to set state field on 
* workflow ID = 56
* Name = workflow field testing
*
* make sure the script returns 1 and also on the script record page 
* the script return type is correct 
*
*
* ******************************************************************* */ 

function setFieldState() {
	nlapiLogExecution('DEBUG', 'start', 'setting the state field');
	var x = 'my string to set'; 
	nlapiSetFieldValue('custwfstate2', x, false, false);
	return 1; 
}
function randomizer11(){
	//will be used later stages to randomize 
	//custom field value 
}