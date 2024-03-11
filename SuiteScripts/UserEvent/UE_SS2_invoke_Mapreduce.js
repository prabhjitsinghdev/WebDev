/*******************************************************************
*
*
* Name: UE_SS2_invoke_Mapreduce.js 
* Script Type: UserEvent Script
* Version: 1.0.0
*
*
* Author: Prabhjit Singh 
* Purpose: invoke Map_Reduce script using the task module
*
*
* ******************************************************************* */
/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/task'],

function(task) {

    function afterSubmit(scriptContext) {
    	var mrTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: "customscript460",
			deploymentId: "customdeploy1"
    	});
    	log.debug(mrTask);
    	
    	var mrTaskId = mrTask.submit();
    	log.debug(mrTaskId);
    }
    return {
        afterSubmit: afterSubmit
    };
    
});