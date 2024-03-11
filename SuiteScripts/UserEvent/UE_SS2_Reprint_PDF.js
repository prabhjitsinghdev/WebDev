/*******************************************************************
*
*
* Name: UE_SS2_Reprint_PDF.js 
* Script Type: UserEvent Script
* Version: 1.0.0
*
*
* Author: Prabhjit Singh 
* Purpose: UE script for testing to set custom field on record
* this will notify on the PDF if the PDF was printed or reprinted
* and is a helpful tool to track if users are repriting the PDF/record
*
************updates from test *******************
* testing in other context => beforeload//beforesubmit//aftersubmit
* so far only beforeload does anything on the refresh
*
* ******************************************************************* */
/**
*@NApiVersion 2.x
*@NScriptType UserEventScript
*/
define(['N/record', 'N/render', 'N/runtime', 'N/search'], (record, render, runtime, search) => {
    const NS_CONSTANT = {
        CLASS: {
            DIRECT: 4,
            DROPSHIP: 6
        },
        ROLES: {
            DEV: 1446,
            MANAGER: 1590,
            SALES_REP: 2810
        }
    }
    const beforeLoad = (context) => {
        try {
            //do print work needed for printing 
            doPrintWork(context);
            /* thinking about adding a button and then firing a script to print. Using render>> 
            doens't work// keeps looking the pdf and re-running script 
            */
            const acceptedContext = ["create", "copy"];

            if (acceptedContext.includes(context.type)) {
                //other processing work
                initialBuilder(context);
            }
        } catch (error2) {
            log.debug({ title: 'ERROR BeforeLoad', details: `error2:  ${error2}` });
        }
    }
    const initialBuilder = (context) => {
        try {
            const newRec = context.newRecord;
            if (!newRec) { return; }
            const usrObj = runtime.getCurrentUser();
            const cust = newRec.getValue({ fieldId: 'entity'});
            //if sales rep
            if (usrObj.id == NS_CONSTANT.ROLES.SALES_REP) {
                newRec.setValue({ fieldId: 'custbody_created_by_mg', value: 'sales rep' });
                newRec.setValue({ fieldId: 'custbody_checkbox_salesapp', value: true });
                newRec.setValue({ fieldId: 'class', value: NS_CONSTANT.CLASS.DIRECT });
            }
            if(cust){
                const busType = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: cust,
                    columns: ['custent_cust_type']
                }).custent_cust_type;
                !!busType ? newRec.setValue({ fieldId: 'custbody_bs_type', value: busType }) : newRec.setValue({ fieldId: 'custobody_cus_multi', value: [2,4,8] });
            }
        } catch (error) {
            log.error({ title: 'ERRORf initialBuilder', details: error });
        }
    }
    const doPrintWork = (context) => {
        if (context.type == context.UserEventType.PRINT) {
            try {
                var recID = record.id;
                var recType = record.type;
            } catch (error1) {
                log.error({ title: 'doPrint Error', details: 'error1: ' + error1 + 'JSON error: ' + JSON.stringify(error1) });
            }
            try {
                var rec = record.load({
                    type: record.Type.SALES_ORDER,
                    id: 4606
                });
                var reprinted = rec.setValue({
                    fieldId: 'custbody100',
                    value: 'Reprinted'
                });
                log.debug({ title: 'Catch', details: 'reprinted: ' + reprinted });
                var getreprinted = rec.getValue({ fieldId: 'custbody100' });
                log.debug({ title: 'DEBUG', details: 'getprinted: ' + getreprinted });
                rec.save({});

                return;

            } catch (error) {
                log.debug({ title: 'ERROR doPrintWork', details: `error: ${error}` });
            }

        } else if (context.type != context.UserEventType.PRINT) {
            log.debug({ title: 'DEBUG', details: `NOT PRINT context THEREFORE DO NOTHING!!` });
        }
    }

    return {
        beforeLoad
    }
});
