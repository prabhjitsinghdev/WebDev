/**
 * Companion_CS_SL_combo.js
 * THIS CS script is a companion script to run on a SUITELET
 * It will take 2 fields from the Suitelet to create and run a search
 * The results will be showed on a sublist that the Suitelet Has 
 *
 * @NApiVersion 2.1
 * @NScriptType clientScript
 * @NModuleScope Public
 *
 * Version    Date          Author              Remarks
 * 1.00       07-24-2024    Prabhjit Singh     Companion_CS_SL_combo.js
 *
 */

define(['N/currentRecord', 'N/search', 'N/format'], (currentRecord, search, format) => {
    'use strict';

    const onSubmit = () => {
        console.log('DEBUG START', `CS script started`); 
        const cRec = currentRecord.get();
        runInvSearch(cRec); 
        /*
        const lineItemArr = getLineItems(); 
        if(lineItemArr.length > 0 ){
            callMR(lineItemArr);
        } */
        alert('Below are the Invoice results');
    }

    const getLineItems = () => {
        try {
            const recordObj = currentRecord.get();
            const lineItemArr = [];
            if (!recordObj) { return false; }
            const lineCount = recordObj.getLineCount({
                sublistId: 'custpage_search_sublist'
            });
            for (let x = 0; x < lineCount; x++) {
                let tempObj = {};
                let readyToEmal = recordObj.getSublistValue({
                    sublistId: 'custpage_search_sublist',
                    fieldId: 'custpage_txn_to_email',
                    line: x
                });
                if(!readyToEmal){ continue; }
                tempObj.email = readyToEmal;
                let pulledInternalID = recordObj.getSublistValue({
                    sublistId: 'custpage_search_sublist',
                    fieldId: 'custpage_txn_internalid',
                    line: x
                });
                tempObj.id = pulledInternalID;
                /* let pulledAmnt = recordObj.getSublistValue({
                    sublistId: 'custpage_search_sublist',
                    fieldId: 'amount',
                    line: x
                });
                tempObj.amount = pulledAmnt; */
                lineItemArr.push(tempObj);

                console.log("DEBUG getLineItems", `print obj ${JSON.stringify(tempObj)}`);
            }
            console.log("DEBUG getLineItems", `length: ${lineItemArr.length} and lineItemArr ${lineItemArr}`);

            return lineItemArr;

        } catch (error) {
            log.error({ title: 'ERROR getLineItems', details: error });
        }
    }

    const callMR = (lineItemArr) => {
        //TODO 
        task.create({
            taskType: task.TaskType.MAP_REDUCE,
            scriptId: 'customscript_mr_script1',
            deploymentId: 'customdeploy_mr_deploy1',
            params: {
                "custscript_mr_rcrds_arr" : lineItemArr
            }
        });
    }

    const fieldChanged = (context) => {

        console.log('DEBUG fieldChanged', `${JSON.stringify(context)}`);
        if(context.fieldId == 'custpage_customer'){
            const cRec = currentRecord.get();
            //update the search
           let customer = cRec.getValue({ fieldId: 'custpage_customer' });
           console.log('DEBUG fldChanged', `customer ${customer}`);
           //runInvSearch(customer, cRec);
        }

    }

    const pageInit = (context) => {

    }

    const runInvSearch = (cRec) => {
      if (!cRec) {
        return;
      }
      const customer = cRec.getValue({ fieldId: 'custpage_customer'});
      const startDate = cRec.getValue({ fieldId: 'custpage_srtdate'});
      const formatedDate = format.format({
        value: startDate,
        type: format.Type.DATE
      });
      const filters = [
        ['customer.internalid', 'anyof',  customer], "AND",
        ["type", "anyof", "CustInvc"],
        "AND",
        ["mainline", "is", "T"],
        "AND",
        ["trandate", "onorafter", formatedDate],
      ];
      const columns = [
        { name: "ordertype", sort: search.Sort.ASC },
        { name: "trandate" },
        { name: "tranid" },
        { name: "account" },
        { name: "amount" },
        { name: "entity", join: "createdfrom" },
      ];
      const invSearch = search.create({
        type: "invoice",
        filters: filters,
        columns: columns,
      });
      let count = 0;
      const invSublist = cRec.getSublist({
        sublistId: 'custpage_search_sublist'
      });
      const ranSearch = invSearch.run().getRange(0, 15).map((result) => {
        console.log(`DEBUG result ${JSON.stringify
            (result)}`);
        
        let tempType = result['recordType'];
        cRec.selectNewLine({
            sublistId: 'custpage_search_sublist'
        });
        cRec.setCurrentSublistValue({
            sublistId: 'custpage_search_sublist',
            fieldId: 'custpage_txn_typ',
            value: tempType,
            line: count
        });
        let tempID = result['id']
        cRec.setCurrentSublistValue({
            sublistId: 'custpage_search_sublist',
            fieldId: 'custpage_txn_internalid',
            value: tempID,
            line: count
        });
        //let tempTranID = result.values.tranid;
        let tempTranID = result.getValue({ name: 'tranid' });
        cRec.setCurrentSublistValue({
            sublistId: 'custpage_search_sublist',
            fieldId: 'custpage_txn_doc_num',
            value: tempTranID,
            line: count
        });
        let tempAcc = result.getText({ name: 'account' });
        cRec.setCurrentSublistValue({
            sublistId: 'custpage_search_sublist',
            fieldId: 'custpage_txn_acct',
            value: tempAcc,
            line: count
        });
        let tempAmt =result.getValue({ name: 'amount' });
        cRec.setCurrentSublistValue({
            sublistId: 'custpage_search_sublist',
            fieldId: 'custpage_txn_amount',
            value: tempAmt,
            line: count
        });
        cRec.commitLine({
            sublistId: 'custpage_search_sublist',
            ignoreRecalc: true
        });
        
      });
        

    };

    return {
        onSubmit,
        fieldChanged,
        pageInit
    };
});
