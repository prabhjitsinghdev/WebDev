/*******************************************************************
*
*
* Name: Client_SS2_vendorBill_copyContext.js
* Script Type: ClientScript
* Version: 0.0.2
*
*
* Author: Prabhjit Singh
* psinghdev92
* Purpose: Inactive Vendor > Make Copy of Vendor Bill > Show warning message
*
* script runs on vednor bills/payment 
* **** if bill is not stand alone then the system treats it as a copy 
* so the script will execute in that context as well ****
*
* WE can also use this on the records and break it down to run specific logic for any record type 
* ******************************************************************* */
/**
* @NApiVersion 2.x
*@NScriptType ClientScript
*
*/
define(['N/record', 'N/currentRecord', 'N/ui/message', 'N/ui/dialog'],
    function (record, currentRecord, message, dialog) {
        function pageInit(context) {
            let acceptedContexts = ["create", "edit"]; 
            log.debug({ title: 'DEBUG', details: 'CLIENT SS2' + 'context ' + context + 'JSON ' + JSON.stringify(context) });
            let curRec = currentRecord.get();
            if (acceptedContexts.includes(context.mode)) {
                //new record
                var recID = record.id;
                var recType = record.type;
                log.debug({ title: 'DEBUG', details: 'id//type: ' + recID + ' // ' + recType });
                //alert-------------------------------
                dialog.alert({
                    title: 'Alert',
                    message: 'Record is being created or edited!'
                });
            }
            //in copy mode!!! 
            if (!acceptedContexts.includes(context.mode)) {
                log.debug({ title: 'DEBUG', details: 'copy mode' });
                //alert-------------------------------
                dialog.alert({
                    title: 'Alert',
                    message: 'Record created as a copy!'
                });
                //alert--end--------------------------

                /* Other logic to setup when record is a copy */
                curRec.setValue({ fieldId: 'memo', value: `this record is being created as a copy and is will require admin approval` });
                curRec.setValue({ fieldId: 'custbody_ecm_multitext', value: [3,5,8] });
                curRec.setValue({ fieldId: 'custbody_ecm_checkbox', value: true }); 
            }
        }
        return {
            pageInit: pageInit

        }
    });
