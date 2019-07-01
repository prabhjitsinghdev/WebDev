/*******************************************************************
*
*
* Name: Client ProjOps
* Script Type: Client Script
* Version: 1.0.0
*
*
* Author: pj92isngh
* Prabhjit Singh 

* Purpose: 
* client script works on  native project record and custom record
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
    function (error, currentRecord, record, runtime, log) {
            function pageInit(context){
                    log.debug({
                        title: 'DEBUG',
                      details: '>>StarCLIENTScript<<'
                    });
                    var currentScript = runtime.getCurrentScript();
                    var myScriptParameter = currentScript.getParameter({
                    name : "pi"
                    });
                    log.debug({
                                title: 'DEBUG',
                                details: '*custscript_paramter* '+myScriptParameter
                            });
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
                        var currentRec = context.currentRecord;
                        var projOppRec_id = currentRec.id;
                        var projOppRec_type = currentRec.type;


                        log.debug({
                                title: 'DEBUG',
                                details: '*prjOps ID* '+projOppRec_id
                            });
                        log.debug({
                                title: 'DEBUG',
                                details: '*prjOps type* '+projOppRec_type
                            });


                    //load the relaated record
                    //get the title from it
                    var ProjOppRec = record.load({
                        type: 'customrecord166',
                        id: projOppRec_id
                    }); 

                    log.debug({
                        title: 'DEBUG',
                        details: '>>PROJOpp Rec NAME<: ' +ProjOppRec.getValue({
                            fieldId: 'name'
                        })
                    });


                    var Proj_name = ProjOppRec.getValue({
                        fieldId: 'name'
                    });
                    log.debug({
                        title: 'DEBUG',
                        details: '>>Proj_name Rec<: ' +Proj_name
                    });

          }

        return{
            pageInit: pageInit
        }
    });
