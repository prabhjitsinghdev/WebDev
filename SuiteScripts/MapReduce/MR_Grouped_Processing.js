/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * @author prabsinghdev
 *
 * MR_Grouped_Processing.js
 * sample MR script to filter the search results based on subsidiary 
 * this can be used to group other saved searches and work on specific records once grouped
 */
define([
    'N/search',
    'N/record',
    'N/runtime',
    'N/format',
    'N/log'
], (search, record, runtime, format, log) => {
    const NS_INFO = {
        ACCOUNTS: {
            AR: 123,
            PSL: 983
        }
    }
    /**
     * 
     * @param context 
     * @returns 
     */
    const getInputData = (context) => {
        try {
            const script = runtime.getCurrentScript();
            const params = {
                search_id: script.getParameter('custscript1'),
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

    /**
     * In this case the map function will GROUP the results of the SS by subsidiary
     * Then the reduce stage will worked on the GROUPED results 
     * @param context 
     */
    const map = (context) => {
        try {
            log.debug("map log1", `key ${context.key} , value ${context.value}`);
            const results = JSON.parse(context.value);
            //group all the results per subsidiary
            log.debug("map log2", results.values.subsidiary.value);
            context.write({
                key: results.values.subsidiary.value,
                value: context.value
            });
            //const grouped1 = Object.groupBy(cmObj, ({ subsidiary }) => subsidiary);
        } catch (e) {
            log.error({ title: "ERROR map", details: e });
        }

    }

    /**
     * In this case, reduce stage will work on the GROUPED subsidiary results and then we can go ahead and create the related records
     * @param context 
     */
    const reduce = (context) => {
        try {
            let sObj = context.values;
            //log.debug({ title: "DEBUG reduce result", details: `TypeOf: ${typeof sObj} length ${sObj.length} and obj ${sObj}`});
            //log.debug("DEBUG ", `JSON ${JSON.stringify(sObj)}`);
        } catch (e) {
            log.eror({ title: 'ERROR reduce', details: e });
        }
    }

    /**
     * 
     * @param context 
     */
    const summarize = (context) => {
        try {
            let type = context.toString();
            log.audit(type + 'SUMMARY Usage Consumed', context.usage);
            log.audit(type + 'SUMMARY Concurrency Number ', context.concurrency);
            log.audit(type + 'SUMMARY Number of Yields', context.yields);

            let totalRecordsUpdated = 0;
            context.output.iterator().each((key, value) => {
                log.audit({ title: ' summary.output.iterator', details: 'key: ' + key + ' / value: ' + value });
                totalRecordsUpdated++;
                return true;
            });
            log.audit({ title: 'AUDIT Total records', details: `total records updated: ${totalRecordsUpdated}` });
        } catch (e) {
            log.error({ title: 'ERROR summarize stage', details: e });
        }

    }
    return {
        getInputData,
        map,
        reduce,
        summarize
    }
});
