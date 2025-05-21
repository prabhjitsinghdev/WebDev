/**
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 *
 * Version    Date          Author              Remarks
 * 1.00       10-23-2024   Prabhjit Singh       SL_BulkEmails.js - saving backup before code review 
 *                                              also uses the companion CS script to run with 
 *
 */

define(['N/https', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/task', 'N/runtime'], (https, record, search, serverWidget, task, runtime) => {
    'use strict';

    const onRequest = (context) => {
        if (context.request.method === https.Method.GET) {
            try {
                const form = serverWidget.createForm({
                    title: 'Invoice Emailing',
                    hideNavBar: false
                });
               //form.clientScriptFileId = 1324117; need to add the CS script id here 
                const userObj = runtime.getCurrentUser();
                const currUsrId = userObj.id; 
                populateForm(form, currUsrId);
                populateSublist(form);

                form.addSubmitButton({
                    label: 'Submit For Processing'
                });
                
                form.addButton({
                    id: 'custpage_btn_submit',
                    label: 'Run Search',
                    functionName: `onSubmit()`
                });
                
                
                context.response.writePage(form);
                
            } catch (error) {
                log.error({ title: `ERROR GET`, details: error });
            }

        }
        else if (context.request.method === https.Method.POST) {
            log.debug('DEBUG POST FUCN', `starting post functions here!`);
            try {
                //log.debug("DEBUG context post", `context ${JSON.stringify(context)}`);
                log.debug("DEBUG post param", `context.request.parameters ${context.request.parameters} // ${JSON.stringify(context.request.parameters)}`);
                const params = context.request.parameters; 
                //log.debug("DEBUG post param", typeof params.custpage_search_sublistdata);
                const checkboxFld = params['custpage_sendtome'];
                log.debug('DEBUG checkboxFld', `checkboxFld ${checkboxFld}` );
                //throw new Error ('stop here!'); 
                let userId; 
                if(checkboxFld == 'T'){
                    userId = params['custpage_curr_user'];
                    log.debug('DEBUG POST', `userId ${userId}`); 
                }
                /* 
                const sublistId = 'custpage_search_sublist';
                const sublistLength = context.request.getLineCount({ group: sublistId });
                log.debug("DEBUG post param", `sublistLength ${sublistLength}`);
                 */
                const lineItemArr = getLineItems(context);
                /*
                const salesRepStrg = params['custpage_sales_rep'];
                const delimiter = /\u0005/;
                const salesRepArr = salesRepStrg.split(delimiter);
                log.audit('AUDIT POST', `salesRepArr ${salesRepArr}`); 
                const secondArr = [];
                for(let x = 0; x < salesRepArr.length; x++){
                    log.debug('DEBUG post', `x in ${salesRepArr[x]}`);
                    secondArr.push(parseInt(salesRepArr[x]));
                }
                */
                let taskID; 
                let htmlcode = ''
                if(lineItemArr.length > 0 ){
                     //org
                     //taskID = callMR(lineItemArr, secondArr);
                     taskID = callMR(lineItemArr, userId);
                     htmlcode = `<html><body><p>Task submitted to MR script for bulk processing!</p></body></html>`;
                }else{
                    htmlcode = `<html><body><p>ERROR -- No task submitted, please check the script logs.</p></body></html>`;
                }
               

                context.response.write(htmlcode);
                
            } catch (error) {
                log.error({ title: 'ERROR post', details: error });
            }

        }
    }

    const populateForm = (form, currUsrId) => {
        try {
            const custFld = form.addField({
                id: 'custpage_customer',
                label: 'Customer',
                type: serverWidget.FieldType.SELECT,
                source: record.Type.CUSTOMER, //with source you can refer to a custom rec/list id as well
            });
            custFld.isMandatory = true;
            
            const salesRepFld = form.addField({
                id: 'custpage_sales_rep',
                label: 'Send to Sales Rep',
                type: serverWidget.FieldType.MULTISELECT
            });
            const salesRepArr = runSalesRepSearch(salesRepFld);
            salesRepFld.defaultValue = salesRepArr; 
            

            const selectFld = form.addField({
                id: 'custpage_select_fld',
                label: 'My Select FLd',
                type: serverWidget.FieldType.SELECT
            });
            selectFld.addSelectOption({
                value : 0,
                text : 'First test'
            });
            
            selectFld.addSelectOption({
                value : 1,
                text : 'Albert'
            });
            const currUsrFld = form.addField({
                id: 'custpage_curr_user',
                label: 'Current User ID',
                type: serverWidget.FieldType.FLOAT
            });
            currUsrFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            currUsrFld.defaultValue = currUsrId; 
            form.addField({
                id: 'custpage_sendtome',
                label: 'Send To Me',
                type: serverWidget.FieldType.CHECKBOX
            });
            const startDateFld = form.addField({
                id: 'custpage_srtdate',
                label: 'Start Date',
                type: serverWidget.FieldType.DATE
            });
            startDateFld.isMandatory = true;
            const endDateFld = form.addField({
                id: 'custpage_enddate',
                label: 'End Date',
                type: serverWidget.FieldType.DATE
            });
            /*
            endDateFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            */
            const headerInfoFld = form.addField({
                id: 'custpage_info_hdr',
                label: 'Information',
                type: serverWidget.FieldType.INLINEHTML
            });
            headerInfoFld.defaultValue = `<p>The search will be limited 14 days from the start date selected.</p>`

        } catch (error) {
            log.error({ title:'ERROR populateForm', details: error });
        }
    }

    const populateSublist = (form) =>{
        try {
            //form.clientScriptFileId = 1324117;
            const invSublist = form.addSublist({
                id: 'custpage_search_sublist',
                label: 'Search Sublist',
                tab: 'Invoices',
                type: serverWidget.SublistType.INLINEEDITOR
            }); 
            //invSublist.addMarkAllButtons(); // adding mark all button 
            invSublist.addButton({
                id: 'custpage_btn_mark_all',
                label: 'Mark All',
                functionName : 'markAll()'
            });
            invSublist.addButton({
                id: 'custpage_btn_unmark_all',
                label: 'UnMark All',
                functionName : 'unMarkAll()'

            })
            invSublist.addField({
                id: 'custpage_txn_to_email',
                label: 'To Email',
                type: serverWidget.FieldType.CHECKBOX
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_typ',
                label: 'Txn Type',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_doc_num',
                label: 'Doc Number',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_date',
                label: 'Transaction Date',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_status',
                label: 'Txn Status',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_amount',
                label: 'Amount',
                type: serverWidget.FieldType.FLOAT
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_otherref',
                label: 'PO #',
                type: serverWidget.FieldType.TEXT,
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_crtdfrm',
                label: 'Created From',
                type: serverWidget.FieldType.TEXT,
                //source: string,
                //container: string
            });
            const idFld = invSublist.addField({
                id: 'custpage_txn_internalid',
                label: 'InternalID',
                type: serverWidget.FieldType.FLOAT,
                //source: string,
                //container: string
            });
            idFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN 
            })

            
            //processSearch(invSublist);

        } catch (error) {
            log.error({ title:'ERROR populateSublist', details: error });
        }
    }
    const processSearch = (invSublist) => {
        try {
            const resultsArr = []
            const checksSearch = search.load({
                id: 8179
            });
            let count = 0; 
            checksSearch.run().each((result)=>{
                let tempObj = {}
                //log.debug('DEBUG results', `result: ${result} // stingify ${JSON.stringify(result)}`);
                tempObj = result; 
                resultsArr.push(tempObj);
                let tempType = result['recordType'];
                let tempValues = result.values;
                //log.debug('DEBUG tempvalues', `typeof ${typeof tempValues} , tempValues ${tempValues}`);
                //log.debug('DEBUG temptype', `tempType ${tempType}`);
                invSublist.setSublistValue({
                    id: 'custpage_txn_typ',
                    value: tempType,
                    line: count
                });
                let tempID = result['id']
                invSublist.setSublistValue({
                    id: 'custpage_txn_internalid',
                    value: tempID,
                    line: count
                });
                //let tempTranID = result.values.tranid;
                let tempTranID = result.getValue({ name: 'tranid' });
                invSublist.setSublistValue({
                    id: 'custpage_txn_doc_num',
                    value: tempTranID,
                    line: count
                });
                let tempAcc = result.getText({ name: 'account' });
                invSublist.setSublistValue({
                    id: 'custpage_txn_acct',
                    value: tempAcc,
                    line: count
                });
                let tempAmt =result.getValue({ name: 'amount' });
                invSublist.setSublistValue({
                    id: 'custpage_txn_amount',
                    value: tempAmt,
                    line: count
                });
                

                count++;


                return true;
            });
            log.audit( 'AUDIT processSearch', `resultsArr.length ${resultsArr.length}` );
            if(resultsArr.length > 0){
                //TODO return the results and show them in a sublist
                //then have approved or reject status field to show as well 
                for(let x = 0; x < resultsArr.length; x++){
                    let tempObj = resultsArr[x];
                    //log.debug( 'DEBUG processSearch', `tempObj ${JSON.stringify(tempObj)}`);
                    Object.keys(tempObj).forEach(keys=>{
                        //tempObj[keys]
                    });
                }


            }else{
                log.audit('AUDIT processSearch', `No results to process therefore nothing to show for approval`); 

                return; 
            }

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
                tempObj.id = parseInt(pulledInternalID);
                //lineItemArr.push(tempObj);
                lineItemArr.push(pulledInternalID);

                //log.debug("DEBUG getLineItems", `print obj ${JSON.stringify(tempObj)}`);
            }
            log.debug("DEBUG getLineItems", `length: ${lineItemArr.length} and lineItemArr ${lineItemArr.toString()}`);

            return lineItemArr;

        } catch (error) {
            log.error({ title: 'ERROR getLineItems', details: error });
        }
    }

    const callMR = (lineItemArr, userId) => {
        const submittedTask = task.create({
            taskType: task.TaskType.MAP_REDUCE,
            scriptId: 'customscript_ns_acs_mr_pr_blk_emails',
            deploymentId: 'customdeploy_ns_acs_mr_pr_blk_emails',
            params: {
                "custscript_acs_mr_rcrds_arr" : lineItemArr,
                "custscript_ns_acs_mr_usrid" : userId
                //"custscript_ns_acs_mr_sales_reps" : salesRepArr
            }
        });
        const taskID = submittedTask.submit();
        log.audit({ title:'AUDIT submitted MR Task', details: `submittedTask ${taskID}` });

        return taskID;
    }

    const runSalesRepSearch = (salesRepFld) => {
        try{
            const employeeSearchObj = search.create({
                type: "employee",
                filters:
                [
                   ["salesrep","is","T"], 
                   "AND", 
                   ["isinactive","is","F"]
                ],
                columns:
                [
                   search.createColumn({name: "entityid", label: "Name"}),
                   search.createColumn({name: "internalid", label: "Internal ID"}),
                   search.createColumn({name: "email", label: "Email"}),
                   search.createColumn({name: "phone", label: "Phone"}),
                   search.createColumn({name: "altphone", label: "Office Phone"}),
                   search.createColumn({name: "fax", label: "Fax"}),
                   search.createColumn({name: "supervisor", label: "Supervisor"}),
                   search.createColumn({name: "title", label: "Job Title"}),
                   search.createColumn({name: "altemail", label: "Alt. Email"})
                ]
             });
             const salesRepArr = [];
             const searchSalesRep = employeeSearchObj.run().each((result)=>{
                let tempRepName = result.getValue({ name: 'entityid' });
                 let tempRepID = result.getValue({ name: 'internalid'}); 
                //log.debug('DEBUG ', `tempRepName ${tempRepName}`);
                salesRepFld.addSelectOption({
                    value : tempRepID,
                    text : tempRepName
                });
                
                salesRepArr.push(tempRepName);

                return true; 
             });
             log.debug('DEBUG runSalesRepSearch', `salesRepArr.length ${salesRepArr.length}`); 

             return salesRepArr;

        }catch(e){
            log.error({ title:'ERROR runSalesRepSearch', details: e });
        }
    }


    return {
        onRequest
    };
});
