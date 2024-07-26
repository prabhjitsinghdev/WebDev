/**
 * Display a saved search and its results in a sublist to then have user select which ones to process
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 *
 * Version    Date          Author              Remarks
 * 1.00       07-26-2024   Prabhjit Singh       SL_ShowSearch_Process.js
 *
 */

define(['N/https', 'N/search', 'N/ui/serverWidget', 'N/task'], (https, search, serverWidget, task) => {
    'use strict';
    const onRequest = (context) => {

        if (context.request.method === https.Method.GET) {
            try {
                const form = serverWidget.createForm({
                    title: 'Check Approvals',
                    hideNavBar: false
                });
                /*
                const checkSublist = form.addSublist({
                    id: 'custpage_checks_sublist',
                    label: 'Checks Sublist',
                    tab: 'Checks',
                    type: serverWidget.SublistType.INLINEEDITOR
                }); 
                */
                populateSublist(form);
                form.addSubmitButton();

                context.response.writePage(form);

            } catch (error) {
                log.error({ title: `ERROR GET`, details: error });
            }

        }
        else if (context.request.method === https.Method.POST) {
            log.debug('DEBUG POST FUCN', `starting post functions here!`);
            try {
                //log.debug("DEBUG context post", `context ${JSON.stringify(context)}`);
                //log.debug("DEBUG post param", `context.request.parameters ${context.request.parameters} // ${JSON.stringify(context.request.parameters)}`);
                const params = context.request.parameters; 
                //log.debug("DEBUG post param", typeof params.custpage_search_sublistdata);
                
                /* 
                const sublistId = 'custpage_search_sublist';
                const sublistLength = context.request.getLineCount({ group: sublistId });
                log.debug("DEBUG post param", `sublistLength ${sublistLength}`);
                 */
                const lineItemArr = getLineItems(context);
                let taskID; 
                if(lineItemArr.length > 0 ){
                     //taskID = callMR(lineItemArr);
                }
                let htmlcode = `<html><body><p>Task submitted to MR Script for Processing... You can close this tab now.</p></body></html>`;

                context.response.write(htmlcode);
                
            } catch (error) {
                log.error({ title: 'ERROR post', details: error });
            }
        }
    }

    const populateSublist = (form) =>{
        try {
            const searchSublist = form.addSublist({
                id: 'custpage_search_sublist',
                label: 'Search Sublist',
                tab: 'Invoices',
                type: serverWidget.SublistType.INLINEEDITOR
            }); 
            searchSublist.addField({
                id: 'custpage_txn_to_email',
                label: 'To Email',
                type: serverWidget.FieldType.CHECKBOX
                //source: string,
                //container: string
            });
            searchSublist.addField({
                id: 'custpage_txn_typ',
                label: 'Txn Type',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            searchSublist.addField({
                id: 'custpage_txn_doc_num',
                label: 'Doc Number',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            searchSublist.addField({
                id: 'custpage_txn_internalid',
                label: 'Internal ID',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            searchSublist.addField({
                id: 'custpage_txn_acct',
                label: 'Account',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            searchSublist.addField({
                id: 'custpage_txn_amount',
                label: 'Amount',
                type: serverWidget.FieldType.FLOAT
                //source: string,
                //container: string
            });
            processSearch(searchSublist);

        } catch (error) {
            log.error({ title:'ERROR populateSublist', details: error });
        }
    }

    const processSearch = (checksSublist) => {
        try {
            const resultsArr = []
            const checksSearch = search.load({
                id: 2418
            });
            let count = 0; 
            checksSearch.run().each((result)=>{
                let tempObj = {}
                log.debug('DEBUG results', `result: ${result} // stingify ${JSON.stringify(result)}`);
                tempObj = result; 
                resultsArr.push(tempObj);
                let tempType = result['recordType'];
                let tempValues = result.values;
                //log.debug('DEBUG tempvalues', `typeof ${typeof tempValues} , tempValues ${tempValues}`);
                log.debug('DEBUG temptype', `tempType ${tempType}`);
                checksSublist.setSublistValue({
                    id: 'custpage_txn_typ',
                    value: tempType,
                    line: count
                });
                let tempID = result['id']
                log.debug('DEBUG temptype', `tempID ${tempID}`);
                checksSublist.setSublistValue({
                    id: 'custpage_txn_internalid',
                    value: tempID,
                    line: count
                });
                //let tempTranID = result.values.tranid;
                let tempTranID = result.getValue({ name: 'tranid' });
                log.debug('DEBUG temptype', `tempTranID ${tempTranID}`);
                checksSublist.setSublistValue({
                    id: 'custpage_txn_doc_num',
                    value: tempTranID,
                    line: count
                });
                let tempAcc = result.getText({ name: 'accountmain' });
                log.debug('DEBUG temptype', `tempAcc ${tempAcc}`);
                checksSublist.setSublistValue({
                    id: 'custpage_txn_acct',
                    value: tempAcc,
                    line: count
                });
                let tempAmt = result.getValue({ name: 'amount' });
                log.debug('DEBUG temptype', `tempAmt ${tempAmt}`);
                checksSublist.setSublistValue({
                    id: 'custpage_txn_amount',
                    value: tempAmt,
                    line: count
                });
                

                count++;


                return true;
            });

        } catch (error) {
            log.error({ title:'ERROR processSearch', details: error });
        }
    }

    const getLineItems = (context) => {
        try {
            const lineItemArr = []; 
            const lineCount = context.request.getLineCount({
                group: 'custpage_search_sublist'
            });
            for (let x = 0; x < lineCount; x++) {
                let tempObj = {};
                let readyToEmal = context.request.getSublistValue({
                    group: 'custpage_search_sublist',
                    name: 'custpage_txn_to_email',
                    line: x
                });
                if(readyToEmal == 'F'){ continue; }
                tempObj.email = readyToEmal;
                let pulledInternalID = context.request.getSublistValue({
                    group: 'custpage_search_sublist',
                    name: 'custpage_txn_internalid',
                    line: x
                });
                tempObj.id = pulledInternalID;
                lineItemArr.push(tempObj);

                log.debug("DEBUG getLineItems", `print obj ${JSON.stringify(tempObj)}`);
            }
            log.debug("DEBUG getLineItems", `length: ${lineItemArr.length} and lineItemArr ${lineItemArr}`);

            return lineItemArr;

        } catch (error) {
            log.error({ title: 'ERROR getLineItems', details: error });
        }
    }

    return {
        onRequest
    };
});
