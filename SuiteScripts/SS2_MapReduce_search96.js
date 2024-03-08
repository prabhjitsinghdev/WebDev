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
//2nd map reduce for custom 15 saved serach 
define(['N/search'], (search) => {
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
            //key stuff
            var key = context.key;
            var recobj = JSON.parse(context.value); //gettting object
            var trandate = recobj.values.trandate;
            var transactionnumber = recobj.values.transactionnumber;
            var salesrepName = recobj.values.salesrep.text;
            var salesrepID = recobj.values.salesrep.value;
            var salesrepSupID = recobj.values['supervisor.salesRep'].value;
            var salesrepSupName = recobj.values['supervisor.salesRep'].text;
            log.debug({
                title: 'DEBUG',
                details: 'rec obj: ' + recobj
            });
            //now break that down more
            var salesrep = recobj.values.salesrep;
            //now try to get supevisor's id
            //values.values.supervisor.text??
            var supervisorName = recobj.values.supervisor.text;
            log.debug({
                title: 'DEBUG',
                details: 'Supervisor Name: ' + supervisorName
            });

            context.write({
                key: salesrepID,
                value: transactionnumber
            });
            //update the memo of each SALES REP
            //with this line
            //the sales orders under your name are: " "

        } catch (e) {
            log.error({ title: 'ERROR map', details: e });
        }


    }

    return {
        getInputData,
        map
    }
});
