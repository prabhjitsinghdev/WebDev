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
define(['N/task', 'N/runtime'], (task, runtime) => {
	const RESOURCES = {
		SCRIPTS: {
			MR_CHECKLIST: {
				SCRIPTID: "customscript460",
				DEPLOYID: "customdeploy1"

			}
		}
	}
	const afterSubmit = (scriptContext) => {
		if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) {
			let mrTask = task.create({
				taskType: task.TaskType.MAP_REDUCE,
				scriptId: RESOURCES.SCRIPTS.MR_CHECKLIST.SCRIPTID,
				deploymentId: RESOURCES.SCRIPTS.MR_CHECKLIST.DEPLOYID
			});
			let mrTaskId = mrTask.submit();
			log.debug({ title: "DEBUG", details: mrTaskId });
		}
	}
	return {
		afterSubmit
	};

});
