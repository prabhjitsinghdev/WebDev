/**
 * 
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 * @NModuleScope Public
 *
 *  Version    Date          Author             Remarks
 *  1.00       23-04-2025    Prabhjit Singh     WF_ExcepEmail.js
 *                                              There is code for template usage as well -- this works but in our case it wasn't since bc the exception messages are only available during runtime.
 *                                              [ Test out trigger on the UI to make sure the script works in the right context ] 
 *
 */

define(['N/search', 'N/record', 'N/query', 'N/email', 'N/runtime', 'N/render'], (search, record, query, email, runtime, render) => {
    'use strict';

    const onAction = (context) => {
        try {
            log.debug('DEBUG WF context', JSON.stringify(context) );
            const emailBodyParam = runtime.getCurrentScript().getParameter('custscript_acs_email_body');
            const emailSenderParam = runtime.getCurrentScript().getParameter('custscript_acs_email_sender');
            log.debug('DEBUG emailBodyParam', emailBodyParam);
            log.debug('DEBUG emailSenderParam', emailSenderParam);
            const newRec = context.newRecord; 
            const billID = newRec.id; 
            log.debug('DEBUG billID', `${billID} // also running to 3rd party funcrtion`);
            getExistingExceptionId(billID);
            const msgArr = runNAWSrch(billID); 
            if(!isEmpty(msgArr)){
                /*
                * this doesn't work since the exception messages are only available during runtime and this causues "record has been changed" message.
                *
                const submitFlds = record.submitFields({
                    type: record.Type.VENDOR_BILL,
                    id: billID,
                    values: {"custbody_acs_email_msg": msgArr}
                });
                log.audit('AUDIT onACtion', submitFlds );
                */
               //this set value works and saves it on the recrod 
                newRec.setValue({
                    fieldId: 'custbody_acs_email_msg',
                    value: msgArr.toString()
                });
                
                const tranId = newRec.getValue({ fieldId: 'tranid' }); 
                const vendor = newRec.getText({ fieldId: 'entity' });
                const vendorID = newRec.getValue({ fieldId: 'entity' });
                const updatedBody = emailBodyParam.replace('${transaction.tranId}', tranId);
                const updateVendBody = updatedBody.replace('${vendor.companyName}', vendor);
                const finalUpdateBody = updateVendBody.replace('${transaction.custbody_acs_email_msg}', msgArr);
                const sender = 134; // no reply employee
                const recipient = newRec.getValue({ fieldId: 'custbody_flf_requestor' }); // vendor
                const emailSubject = `Vendor Bill ${tranId}`;
                const emailBody = `<br>You have a new Vendor Bill ${tranId}  to review. Please resolve any exceptions and re-submit for approvals. <br>
                ${msgArr.join('<br>')}
                Kindly log in to your NetSuite account at http://www.netsuite.com`;
                //using templates works and here is the code for it
                const renderer = render.create();
                const mergeResult = render.mergeEmail({
                    templateId: 106,
                    transactionId: newRec.id,
                });

                // gabo's way
                const sendEmail = email.send({
                    author: emailSenderParam,
                    body: mergeResult.body,
                    recipients: recipient,
                    subject:  mergeResult.subject,
                    relatedRecords: {
                        transactionId: newRec.id,
                    }
                });
                /* other dev's way and it didn't work
                const sendEmail = email.send({
                    author: emailSenderParam,
                    recipients: recipient,
                    subject: emailContent.subject,
                    body: emailContent.body,
                    relatedRecords: { transactionId: newRec.id, },
                    templateId: 'custemailtmpl_flf_vb_review_notification',
                    merge: {
                        entity: vendorID,
                        recipient: recipient
                    }
                });
                */


                /*
                const sendEmail = email.send({
                    author: emailSenderParam,
                    body: finalUpdateBody,
                    recipients: recipient,
                    subject: emailSubject,
                    relatedRecords: {
                        transactionId: newRec.id,
                    }
                });
                */
                /*
                relatedRecords: {
                        transactionId: newRec.id,
                        recordType: newRec.type
                    }
                */
                
                log.audit('AUDIT sendEmail', `Email sent to ${recipient} with subject ${emailSubject} // ${sendEmail}` );

            }

        } catch (error) {
            log.error('ERROR onAction', error );
        }
    }

    const getExistingExceptionId = (billId) => {
        var exceptionLogSQL = `
            SELECT
                id
            FROM
                customrecord_wd_naw_workflow_excep
            WHERE
                custrecord_wd_naw_linkedrecord_id = ${billId}
            `;

        var results = query.runSuiteQL({ query: exceptionLogSQL }).asMappedResults();
        log.debug('DEBUG query resutls', results.length );
        if (results.length > 0) {
            return results[0].id;
        } else {
            return null
        }
    }

    const isEmpty = (stValue) => {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    };

    const runNAWSrch = (billID) =>{
        if(isEmpty(billID)){
            log.audit('ADUIT runNAWSrch', `No bill ID to search for; returning zero results!`); 
            return;
        }
        
        const filters = [
            ["isinactive", "is", "F"],
            "AND",
            ["custrecord_wd_naw_linkedrecord_id", "contains", billID]
          ];
          const columns = [
            search.createColumn({ name: "internalid", label: "Internal ID" }),
            search.createColumn({ name: "custrecord_wd_naw_exception_list" }),
            search.createColumn({ name: "custrecord_wd_naw_linkedrecord_id"}),
          ];
          const txnSearch = search.create({
            type: 'customrecord_wd_naw_workflow_excep',
            filters: filters,
            columns: columns,
          });
          /*
          const resultsObj = txnSearch
            .run()
            .getRange(0, 2)
            .map((result) => {
              console.log("DEBUG result", `${JSON.stringify(result)}`);
            });
        */
        const resultSet = txnSearch.runPaged()
        //const searchResultCount = txnSearch.runPaged().count;
        const searchResultCount = resultSet.count; 
        log.debug("invoiceSearchObj result count",searchResultCount);
        const msgArr = []; 
        txnSearch.run().each((result) => {
            log.debug("DEBUG result", `${JSON.stringify(result)}`);
            let msg = result.getValue({ name:  'custrecord_wd_naw_exception_list' });
            log.debug('DEBUG result msg', msg); 
            if(!isEmpty(msg)){
                const replacedString = msg.replaceAll(',', '\n');
                msgArr.push(replacedString); 
            }

        });

        return msgArr; 
    }

    return {
        onAction
    }
});
