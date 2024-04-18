/*******************************************************************
*
*
* Name: Client ProjOps
* Script Type: Client Script
* Version: 1.0.1
*
*
* Author: prabhjitsinghdev
* Prabhjit Singh 

* Purpose: 
* client script works on native project record and custom record
* it will pull the related ProjOp record and gets its value
* This value can be used for various purposes (show on PDF/employee record etc)

*
*
* ******************************************************************* */


/**
 * @NApiVersion 2.x
 *@NScriptType ClientScript
 *
 */
define(['N/error', 'N/currentRecord', 'N/record', 'N/runtime', 'N/log'],
    //customer script to test ProjOps
    //accquire the title 
    //runs in edit mode
    (error, currentRecord, record, runtime, log) => {
        const pageInit = (context) => {
            const currentScript = runtime.getCurrentScript();
            const myScriptParameter = currentScript.getParameter({
                name: "pi"
            });
            console.log(`custscript_paramter ${myScriptParameter}`);
            //get params
            //checking another paramter here for logging purpose
            /* var recID_p = context.request.parameters.pr; 
            log.debug({
                         title: 'DEBUG',
                         details: '*recID params* '+recID_p
                     });
             //get all params
             var params = JSON.stringify(context.request.parameters);
              log.debug({
                         title: 'DEBUG',
                         details: '*params '+params
                     });

             */
            //if(context == 'view' || context == 'edit'){
            const currentRec = context.currentRecord;
            const projOppRec_id = currentRec.id;
            const projOppRec_type = currentRec.type;

            console.log(`prjOps ID 4${projOppRec_id}`);
            console.log(`prjOps type* ${projOppRec_type}`);
            //load the relaated record
            //get the title from it
            const ProjOppRec = record.load({
                type: 'customrecord166',
                id: projOppRec_id
            });
            const Proj_name = ProjOppRec.getValue({
                fieldId: 'name'
            });
            console.log(`PROJOpp Rec NAME: ${ProjOppRec.getValue({ fieldId: 'name' })} and Proj_name Rec: ${Proj_name}`);

            if (!ProjOppRec || !Proj_name) {
                const myError = error.create({
                    message: `Missing paramter`,
                    name: `Missing_Param`,
                    notifyOff: false
                });

                alert(myError);
            }

        }

        return {
            pageInit: pageInit
        }
    });
