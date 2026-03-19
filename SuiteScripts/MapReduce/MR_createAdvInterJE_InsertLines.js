/**
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 *
 * Version    Date          Author              Remarks
 * 1.00       10-10-2025    Prabhjit Singh      mr_auto_advinterje_insertLine.js -- this one uses insert line logic instead
 * 1.01       17-03-2026    Prabhjit Singh      updating code to set entity on the last line of the adv iter je  
 * 
 * */
define([
    'N/runtime',
    'N/record',
    'N/search',
    'N/log',
    'N/file'
], (runtime, record, search, log, file) => {

    const NS_CONST = {
        ACCOUNTS : {
            INTERCOMPANY_RECEIVABLE : 1999,
            INTERCOMPANY_PAYABLE : 3949,
            UNAPPLIED_CUSTOMER_DEBIT : 8438,
            UNAPPLIED_DEPOSIT : 8484,
            JPMC_CLEARING : 3290
        },
        DEPARTMENT : {
            NA : 9
        },
        LOCATION : {
             CORPORATE_CANADA : 199,
             OTHER_GA_USA : 127
        },
        SUBSIDIARY : {
            CANADA : 60,
            NEBRASKA: 13,
            HCAFRANCHISE: 73,
            USA : 99
        }

    };

    const getInputData = (context) => {
        try {
            const script = runtime.getCurrentScript();
            const params = {
                search_id: script.getParameter('custscript_acs_mr_payment_srch')
            };
            log.debug({ title: 'DEBUG search', details: params.search_id });
            if (isEmpty(params.search_id)) {
                log.error({ title: 'ERROR missing search', details: `Search is required.` });
                return;
            }
            const loadedSearch = search.load({
                id: params.search_id
            });

            return loadedSearch;

        } catch (error) {
            log.error({ title: "ERROR getInput", details: error });

        }

    }

    const map = (context) => {
        try {
            log.debug('DEBUG map', `context ${JSON.stringify(context)}`);
            const data = JSON.parse(context.value); 
            const valuesObj = data.values; 
            const subsidiary = valuesObj.subsidiary.value;
            const location = valuesObj.location.value;
            const customer = valuesObj.entity.value; 
            const tranid = valuesObj.tranid; 
            const amount = valuesObj.amount;
            const dep = valuesObj.department.value; 
            let country; 

            if(subsidiary){
                //lookup country
                const subLookupObj = search.lookupFields({
                    type: 'subsidiary',
                    id: subsidiary,
                    columns: 'country'
                });
                if(subLookupObj && subLookupObj['country'][0]){
                    log.debug('DEBUG map sublookupObj', JSON.stringify(subLookupObj));
                    country = subLookupObj['country'][0].value;
                }
            }

            const myData = {
                customer: customer,
                location: location,
                subsidiary: subsidiary,
                country: country,
                department: dep,
                tranid: tranid,
                amount: amount
            }

            context.write({key: context.key, value: myData });

        } catch (error) {
            log.error('ERROR map', error);
        }
    }

    const reduce = (context) => {
        try {
            log.debug('DEBUG reduce', `context ${JSON.stringify(context)}`);
            //const data = JSON.parse(context.values);
            //log.debug('DEBUG reduce data', `data ${data}// ${data.length}  // JSON.stringify ${JSON.stringify(data)} `); 
            const data = context.values; 
            
            for( let x = 0; x < data.length; x++){
                const valuesObj = JSON.parse(data[x]);
                log.debug('DEBUG reduce valuesobj', `valuesObj ${valuesObj} //type of ${typeof valuesObj}`);
                const { savedJE } = createAdvJE(valuesObj); 
                //const { savedJE } = createAdvJeStandard(valuesObj);
                if(savedJE){
                    context.write({ key: 'SAVED JE', value: savedJE });
                }
            }
            
            
        } catch (error) {
            log.error({ title: 'ERROR reduce', details: error });
        }
    }

    const summarize = (context) => {
        try {
            let type = context.toString();
            log.audit(type + 'SUMMARY Usage Consumed', context.usage);
            log.audit(type + 'SUMMARY Concurrency Number ', context.concurrency);
            log.audit(type + 'SUMMARY Number of Yields', context.yields);
            let totalRecordsCreated = 0, failedRecs = 0;

            const script = runtime.getCurrentScript();
            const params = {
                csvfolderid: script.getParameter('custscript_acs_csv_fldr_id')
            };
            log.debug({ title: 'DEBUG search', details: params.csvfolderid });
            context.output.iterator().each((key, value) => {
                log.audit({ title: ' summary.output.iterator', details: `key: ${key} / value: ${value} // typeof ${typeof value}` });
                if (key !== 'ERROR') {
                    if (!isEmpty(value)) {
                        totalRecordsCreated++;
                    }

                } else if (key === 'ERROR') {
                    if (!isEmpty(value)) {
                        failedRecs++;
                    }
                } 
                return true;

            });
            log.audit('AUDIT summarize end', `Recs created: ${totalRecordsCreated} // failed recs: ${failedRecs} `);


        } catch (e) {
            log.error({ title: 'ERROR summarize stage', details: e });
        }
    }

    const isEmpty = (stValue) => {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    };


//standard mode
const createAdvJeStandard = (data) => {
    log.debug('DEBUG createAdvJE start', `starting create adv intecompany je function`);
    let sub = data.subsidiary;
    let countryPulled = data.country;
    log.debug('DEBUG createAdvJE check params', `sub ${sub} && country ${countryPulled} `);
    if ([NS_CONST.SUBSIDIARY.NEBRASKA, NS_CONST.SUBSIDIARY.HCAFRANCHISE].includes(sub)) {
        return;
    }
    const createAdvJE = record.create({
        type: record.Type.ADV_INTER_COMPANY_JOURNAL_ENTRY,
        isDynamic: false
    });

    if (countryPulled == 'US') {
        //set header subsidiary first 
        createAdvJE.setValue({
            fieldId: 'subsidiary',
            value: 1,
            ignoreFieldChange: false,
        });
        createAdvJE.setValue({
            fieldId: 'currency',
            value: 1,
            ignoreFieldChange: false,
        });
        createAdvJE.setValue({
            fieldId: 'trandate',
            value: new Date(),
            ignoreFieldChange: false,
        });
        /*
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'linesubsidiary',
            value: 1,
            line: 0
        });
        */
         createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'location',
            value: NS_CONST.LOCATION.OTHER_GA_USA,
            line: 0
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'account',
            value: NS_CONST.ACCOUNTS.UNAPPLIED_CUSTOMER_DEBIT,
            line: 0
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'credit',
            value: data.amount,
            line: 0
        });
        /*
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'entity',
            value: data.customer,
            ignoreFieldChange: true,
            forceSyncSourcing: true
        });
        */
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'department',
            value: 8,
            line: 0
        });
        /* seems like the first line we don't need to set the subsidairy since it is set to the heaader one??
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'linesubsidiary',
            value: sub,
            ignoreFieldChange: true,
            forceSyncSourcing: true
        });
        */
        log.audit('audit createAdvJE', `commiting line 1`);

        //line 2
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'linesubsidiary',
            value: sub,
            line: 1

        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'account',
            value: NS_CONST.ACCOUNTS.INTERCOMPANY_PAYABLE,
            line: 1
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'debit',
            value: data.amount,
            line: 1
        });
        /*
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'entity',
            value: data.customer,
        });
        */
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'location',
            value: NS_CONST.LOCATION.OTHER_GA_USA,
            line: 1
        });
        /*
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'duetofromsubsidiary',
            value: sub,
            ignoreFieldChange: false,
            forceSyncSourcing: true
        });
        */
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'department',
            value: data.department,
            line: 1
        });
        log.audit('audit createAdvJE', `commiting line 2`);


        //line 3
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'duetofromsubsidiary',
            value: 1,
            line: 2
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'account',
            value: NS_CONST.ACCOUNTS.INTERCOMPANY_RECEIVABLE,
            line: 2
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'credit',
            value: data.amount,
            line: 2
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'entity',
            value: data.customer,
            line: 2
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'location',
            value: data.location,
            line: 2
        });
        /*
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'duetofromsubsidiary',
            value: 1,
            ignoreFieldChange: false,
            forceSyncSourcing: true
        });
        */
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'department',
            value: data.department,
            line: 2
        });
        log.audit('audit createAdvJE', `commiting line 3`);


        //line 4
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'account',
            value: NS_CONST.ACCOUNTS.UNAPPLIED_DEPOSIT,
            line: 3
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'credit',
            value: data.amount,
            line: 3
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'entity',
            value: data.customer,
            line: 3
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'location',
            value: data.location,
            line: 3
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'linesubsidiary',
            value: sub,
            line: 3
        });
        createAdvJE.setSublistValue({
            sublistId: 'line',
            fieldId: 'department',
            value: data.department,
            line: 3
        });
        log.audit('audit createAdvJE', `commiting line 4`);

        const lineCountAtEnd = createAdvJE.getLineCount({
            sublistId: 'line'
        });
        log.audit('AUDIT line count end', lineCountAtEnd)
    }

    createAdvJE.setValue({
        fieldId: 'memo',
        value: `“Reclass Customer Payment reversal [${data.tranid}]” `
    });
    createAdvJE.setValue({
        fieldId: 'createdfrom',
        value: data.tranid
    });

    const savedJE = createAdvJE.save({
        enableSourcing: true,
        ignoreMandatoryFields: true
    });
    if (savedJE) {
        return savedJE;
    }
}

    const createAdvJE = (data) =>{
        log.debug('DEBUG createAdvJE start', `starting create adv intecompany je function`); 
        let sub = data.subsidiary;
        let countryPulled = data.country; 
        log.debug('DEBUG createAdvJE check params', `sub ${sub} && country ${countryPulled} `);
        if([NS_CONST.SUBSIDIARY.NEBRASKA, NS_CONST.SUBSIDIARY.HCAFRANCHISE].includes(sub)){
            return; 
        }
        const createAdvJE = record.create({
            type: record.Type.ADV_INTER_COMPANY_JOURNAL_ENTRY,
            isDynamic: false
        });
       
        if(countryPulled == 'US'){
            //set header subsidiary first 
             createAdvJE.setValue({
                fieldId: 'subsidiary',
                value: 1,
                ignoreFieldChange: false,
                forceSyncSourcing: true
            });

            //line 1 
           const sublistOpts = { sublistId: "line", line: 0 };
            createAdvJE.insertLine({ ...sublistOpts });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "linesubsidiary", value: 1 });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "account", value: NS_CONST.ACCOUNTS.UNAPPLIED_CUSTOMER_DEBIT });
            //createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "entity", value: data.customer });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "credit", value: data.amount });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "department", value: 8 });
              createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "location", value: NS_CONST.LOCATION.OTHER_GA_USA })
              ;
            sublistOpts.line++;            
           
            //line 2
            createAdvJE.insertLine({ ...sublistOpts });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "duetofromsubsidiary", value: sub });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "linesubsidiary", value: 1 });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "account", value: NS_CONST.ACCOUNTS.INTERCOMPANY_PAYABLE });
            //createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "entity", value: data.customer });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "debit", value: data.amount });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "department", value: 8 });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "location", value: NS_CONST.LOCATION.OTHER_GA_USA });
            createAdvJE.setSublistValue({...sublistOpts, fieldId: 'eliminate', value: true});
            sublistOpts.line++;        
            //line 3
            createAdvJE.insertLine({ ...sublistOpts });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "duetofromsubsidiary", value: 1 });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "linesubsidiary", value: sub });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "account", value: NS_CONST.ACCOUNTS.INTERCOMPANY_RECEIVABLE});
            //createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "entity", value: data.customer });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "credit", value: data.amount });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "department", value: 8 });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "location", value: data.location });
            createAdvJE.setSublistValue({...sublistOpts, fieldId: 'eliminate', value: true});
            sublistOpts.line++;   
            
            //line 4
            createAdvJE.insertLine({ ...sublistOpts });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "linesubsidiary", value: sub });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "account", value: NS_CONST.ACCOUNTS.UNAPPLIED_DEPOSIT });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "entity", value: data.customer });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "debit", value: data.amount });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "department", value: 8 });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "location", value: data.location });
            sublistOpts.line++;

        


        }else if(countryPulled == 'CA'){
            //set header subsidiary first 
             createAdvJE.setValue({
                fieldId: 'subsidiary',
                value: NS_CONST.SUBSIDIARY.CANADA
            });
            //line 1
           const sublistOpts = { sublistId: "line", line: 0 };
            createAdvJE.insertLine({ ...sublistOpts });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "linesubsidiary", value: 1 });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "account", value: NS_CONST.ACCOUNTS.JPMC_CLEARING });
            //createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "entity", value: data.customer });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "credit", value: data.amount });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "department", value: NS_CONST.DEPARTMENT.NA });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "location", value: NS_CONST.LOCATION.CORPORATE_CANADA });
            sublistOpts.line++;    

            //line 2
            createAdvJE.insertLine({ ...sublistOpts });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "linesubsidiary", value: 1 });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "duetofromsubsidiary", value: sub });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "account", value: NS_CONST.ACCOUNTS.INTERCOMPANY_PAYABLE });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "debit", value: data.amount });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "department", value: NS_CONST.DEPARTMENT.NA });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "location", value: NS_CONST.LOCATION.CORPORATE_CANADA });
            sublistOpts.line++;   

            //line 3 
            createAdvJE.insertLine({ ...sublistOpts });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "linesubsidiary", value: NS_CONST.SUBSIDIARY.CANADA });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "duetofromsubsidiary", value: sub });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "account", value: NS_CONST.ACCOUNTS.INTERCOMPANY_RECEIVABLE });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "credit", value: data.amount });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "department", value: data.department });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "location", value: data.location });
            sublistOpts.line++; 

             //line 4
            createAdvJE.insertLine({ ...sublistOpts });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "linesubsidiary", value: data.subsidiary });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "account", value: NS_CONST.ACCOUNTS.UNAPPLIED_DEPOSIT });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "entity", value: data.customer });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "debit", value: data.amount });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "department", value: data.department });
            createAdvJE.setSublistValue({ ...sublistOpts, fieldId: "location", value: data.location });
            sublistOpts.line++;  

        }

        createAdvJE.setValue({
            fieldId: 'memo',
            value: `“Reclass Customer Payment reversal ${data.tranid}” `
        });
        createAdvJE.setValue({
            fieldId: 'createdfrom',
            value: data.tranid
        });


        const savedJE = createAdvJE.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });
        if(savedJE){
            return savedJE;
        }

    }
   

    return {
        getInputData,
        map,
        reduce,
        summarize
    }
});
