/**
 * @NApiVersion 2.1
 * @NScriptType scheduledScript
 * @NModuleScope Public
 *
 * Version     Author            
 * 1.00        prabhjitsinghdev   
 *
 */

define(['N/runtime', 'N/task'], (runtime, task) => {
    'use strict';

    /**
     *
     * Scheduled scripts are server-side scripts that are executed (processed) with SuiteCloud Processors.
     * You can deploy scheduled scripts so they are submitted for processing at a future time, or at future times on
     * a recurring basis. You can also submit scheduled scripts on demand from the deployment record or from another
     * script with the task.ScheduledScriptTask API.
     *
     * @param scriptContext = { type: string }
     */
    const execute = (scriptContext) => {
        try {
            const script = runtime.getCurrentScript();
            const params = {
                search_id: script.getParameter('custscript_acs_script_saved_search'),
                file_folder: script.getParameter('custscript_acs_file_folder_id'),
                file_name: script.getParameter('custscript_acs_csv_file_name')
            };
            log.debug({ title: 'DEBUG script paramters', details: `search id ${params.search_id}, folder id ${params.file_folder} , file_name ${params.file_name}` });
            if (!params.search_id) {
                log.error({ title: 'ERROR missing search', details: `Search is required. Nothing to process` });
              
                return;
            }
            if (!params.file_folder) {
                log.error({ title: 'ERROR missing search', details: `File Folder is required. Nothing to process` });
              
                return;
            }

            const myTask = task.create({
                taskType: task.TaskType.SEARCH
            });
            myTask.savedSearchId = params.search_id;
            myTask.filePath = `${params.file_folder}/${params.file_name}`;
            const myTaskId = myTask.submit();
            log.debug({ title: 'DEBUG myTaskId', details: `MR task submitted; ${myTaskId}` });


        } catch (error) {
            log.error({ title: 'ERROR execute', details: error });
        }

    }

    return {
        execute
    };
});

