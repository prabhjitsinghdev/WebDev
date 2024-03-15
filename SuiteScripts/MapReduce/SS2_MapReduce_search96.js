/*******************************************************************
*
*
* Name: MapReudce search96
* Script Type: Map Reduce Script
* Version: 1.0.0
*
*
* Author: prabhjitsinghdev
Prabhjit Singh 

* Purpose: Map/reduce script example 
-referring to search parameter in test account 
-then retrive related fields and return appropriate data
*
*
* ******************************************************************* */

/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript 
 */
define(['N/search', 'N/record', 'N/runtime'], (search, record, runtime) => {
    const NS_CONST = {
        RECORDS : {
            CUST_EMP_TXN : {
                TYPE : "custrec_etxn_emp",
                BODY_FIELDS : {
                    MEMO: "custrec_etxn_memo",
                    UNIQUE_ID: "custrec_etxn_uni_id",
                    EMP_TYPE: "custrec_etxn_etype",
                    INACTIVE : "inactive"
                },
            }
        },

        LISTS : {
            RECRUITER: 1,
            MANAGER: 2,
            ADVISOR: 3
        }

    }
    const getInputData = (context) => {
        try {
            const script = runtime.getCurrentScript();
            const params = {
                search_id: script.getParameter('custscript_fbn_mr_ach_search'),
                max_records: script.getParameter('custscript_fbn_mr_ach_max_records')
            };
            log.debug({ title: 'DEBUG search', details: params.search_id });
            if (isEmpty(params.search_id)) {
                log.error({ title: 'ERROR missing search', details: `Search is required.` });
                return;
            }
            const s = search.load({
                id: params.search_id
            });

            return s;

        } catch (e) {
            log.error({ title: 'ERROR getInputData', details: e });
        }
    }
    const map = (context) => {
        try {
            //key data
            const key = context.key;
            const recobj = JSON.parse(context.value); //gettting object
            const trandate = recobj.values.trandate;
            const transactionnumber = recobj.values.transactionnumber;
            const salesrepName = recobj.values.salesrep.text;
            const salesrepID = recobj.values.salesrep.value;
            const salesrepSupID = recobj.values['supervisor.salesRep'].value;
            const salesrepSupName = recobj.values['supervisor.salesRep'].text;
            log.debug({ title: 'DEBUG',details: 'rec obj: ' + recobj });
            //now break that down more
            const salesrep = recobj.values.salesrep;
            //now try to get supevisor's id
            //values.values.supervisor.text??
            const supervisorName = recobj.values.supervisor.text;
            log.debug({ title: 'DEBUG', details: `Supervisor Name: ${supervisorName}` });
            context.write({
                key: salesrepID,
                value: transactionnumber
            });
            //update the custom field of each SALES REP
            //with this line
            //the sales orders under your name are: " "
            if(!salesrepID){ return; }
            const empSrch = search.create({
                type: NS_CONST.RECORDS.CUST_EMP_TXN.TYPE,
                filters: [
                    [NS_CONST.RECORDS.CUST_EMP_TXN.BODY_FIELDS.UNIQUE_ID, "IS", salesrepID], 
                    "AND",
                    [NS_CONST.RECORDS.CUST_EMP_TXN.BODY_FIELDS.INACTIVE, "IS", false ]
                ],
                columns: [
                    "internalid",
                    NS_CONST.RECORDS.CUST_EMP_TXN.BODY_FIELDS.UNIQUE_ID,
                    NS_CONST.RECORDS.CUST_EMP_TXN.BODY_FIELDS.EMP_TYPE,
                    NS_CONST.RECORDS.CUST_EMP_TXN.BODY_FIELDS.MEMO,
                ]
            }).run().getRange(0, 1000).map((row) => {

            });
            /*
            search.lookupFields({
                type: ,
                id: salesrepID,
                columns: 
            });
            */
            const updateStng = `the sales orders under your name are: ${transactionnumber}`
            if (salesrepID) {
                record.submitFields({
                    type: NS_CONST.RECORDS.CUST_EMP_TXN.TYPE,
                    id: salesrepID,
                    values: updateStng,
                    options: {
                        enablesourcing: false
                    }
                });
            }


        } catch (e) {
            log.error({ title: 'ERROR map', details: e });
        }


    }

    return {
        getInputData,
        map
    }
});
