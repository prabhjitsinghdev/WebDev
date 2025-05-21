/* saved search notes 


Summary criteria is put in AFTER the standard search criteria is done (if its removing some of the results aka item is a specific one )  therefore the summary can be inaccurate. 
*/

/* 
* Different ways to run the saved searches 
* 
* 1) Range method 
* 2) Second run() for each 
*/
require(["N/search", "N/currentRecord", "N/ui/dialog", "N/runtime"], (
  search,
  currentRecord,
  dialog,
  runtime
) => {

    const isEmpty = (stValue) => {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    };

  const cRec = currentRecord.get();
  const pulledCust = cRec.getValue({ fieldId: "entity" });
  const pulledRef = cRec.getValue({ fieldId: "otherrefnum" });
  if (isEmpty(pulledCust)) {
    return;
  }
  if (isEmpty(pulledRef)) {
    return;
  }
  const filters = [
    ["type", "anyof", "CashSale", "SalesOrd"],
    "AND",
    ["mainline", "is", "T"],
    "AND",
    ["entity", "anyOf", pulledCust],
    "AND",
    ["otherrefnum", "equalto", pulledRef],
  ];
  const columns = [
    search.createColumn({ name: "internalid", label: "Internal ID" }),
    search.createColumn({ name: "entrynumber", label: "Entry Number" }),
    search.createColumn({ name: "tranid", label: "Document Number" }),
  ];
  const txnSearch = search.create({
    type: search.Type.TRANSACTION,
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
const searchResultCount = invoiceSearchObj.runPaged().count;
console.log("invoiceSearchObj result count",searchResultCount);
  
const resultsObj = txnSearch.run();
const resultLen = resultsObj.getRange(0, 2); 
console.log('DEBUG results leng', `resultLen: ${resultLen.length}`);
let scriptObj = runtime.getCurrentScript();
console.log("Remaining governance units: ", scriptObj.getRemainingUsage());

if(resultLen > 0){
    dialog.alert({
        title: 'Existing Record',
        message: `There is already a cashsale or sales order using this PO# ${pulledRef}`
    }).then(success).catch(failure);
}

/* or run it with the each */

/*
const results = itemlocationconfigurationSearchObj.run();
let cost; 
 results.each((result)=>{
    log.debug('DEBUG getCostInfo 1.0', JSON.stringify(result));
  
});
*/

}); 


/* QUERY RUNNING */ 
 const runQuery = (entityId, strtDate, endDate) => {
        try {
            const txnQuery = `SELECT t.id, t.tranid, t.trandate, t.type as txn_type
            FROM transaction t
            LEFT JOIN transactionLine tl on t.id = tl.transaction and tl.mainLine = 'F' 
            WHERE tl.entity = ${entityId}
            AND t.trandate BETWEEN TO_DATE('${strtDate}', 'MM/DD/YYYY') and TO_DATE('${endDate}', 'MM/DD/YYYY')
            AND t.type IN ('CustInvc', 'CustCred', 'CustPymt', 'Journal', 'CustDep')`;
            const queryResults = query.runSuiteQL({
                query: txnQuery
                //params: [entityId, strtDate, endDate]
            });
            log.debug('DEBUG runQuery', `queryResults ${queryResults} `);
            const mappedRes = queryResults.asMappedResults();
            log.debug('DEBUG runQuery', `mappedRes ${mappedRes} // lenght ${mappedRes.length}`);
            //let iterator = mappedRes.iterator();
            /*
            mappedRes.each((result)=>{
                log.debug('DEBUG query results', `result ${result} // json ${JSON.stringify(result)} `);
            });
            */
           for(let x = 0; x < mappedRes.length; x++){
            log.debug('DEBUG query results', `result ${mappedRes[x]} // json ${JSON.stringify(mappedRes[x])} `);
           }

           return mappedRes; 

        } catch (error) {
            log.error('ERROR runQuery', error);
        }
    }


/**** running 1.0 ss search */
var ledSrch = nlapiSearchRecord("customrecord_acs_lead_src_com_rec",null,
  [
     ["custrecord_acs_lead_src_emp","anyof","11"], 
     "AND", 
     ["isinactive","is","F"]
  ], 
  [
     new nlobjSearchColumn("custrecord_acs_lead_src_emp"), 
     new nlobjSearchColumn("custrecord_acs_lead_src_com_perc"), 
     new nlobjSearchColumn("custrecord_acs_lead_src_cat")
  ]
  );
  for (var i = 0; i < ledSrch.length; i++) {
      var records = ledSrch[i];
      var columns = records.getAllColumns();
      console.log('DEBUG', columns); 
      var emp = records.getValue(columns[0]);
      console.log('DEBUG', emp); 

      var percent = records.getValue(columns[1]);
      console.log('DEBUG', percent); 

      var category = records.getValue(columns[2]);
      console.log('DEBUG', category); 

  }


  /* loades search we can pull filters and add them */ 
  const paramSearch = search.load({ id: savedSearchParam }).run();
  const defaultFilters = paramSearch.filterExpression; //use filterExpression not filters 
  const customFilters = []; // this isn't necessary you can just push to the default filters 
  //i.e
defaultFilters.push("AND")
defaultFilters.push(['postingperiod', 'ANYOF', '1']);
  //We will add the new filter in customFilters
  customFilters = ['postingperiod', 'ANYOF', '1'];

//We will push the customFilters into defaultFilters
defaultFilters.push(customFilters);
 paramSearch.filterExpression = defaultFilters; 
//now we can run it 

/* below are examples of pagenated search */
 function getAllSearchResults(objSearch) {
        var stLogTitle = 'getAllSearchResults';
        try {
            var arrReturnSearchResults = new Array();
            var maxResults = 1000;
            var objResultset = objSearch.run();
            var intSearchIndex = 0;
            var arrResultSlice = null;
            do {
                arrResultSlice = objResultset.getRange(intSearchIndex, intSearchIndex + maxResults);
                if (arrResultSlice == null) {
                    break;
                }
                arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);
                intSearchIndex = arrReturnSearchResults.length;
            } while (arrResultSlice.length >= maxResults);
            return arrReturnSearchResults;
        } catch (error) {
            log.error(stLogTitle, error.message);
        }
    }

//exmaple 2 
const getInputData = () => {
        const script = runtime.getCurrentScript();
        const deploymentId = script.deploymentId;
        let searchId = '';
        if (deploymentId === 'customdeploy_ns_acs_sumopratn_search08') {
            // Scheduled run
            searchId = script.getParameter({ name: 'custscript_ns_acs_wocompletion_reqr_op' });
        } else {
            // One-time full run
            searchId = script.getParameter({ name: 'custscript_ns_acs_wocompletion_allorder' });
        }
        const loadedSearch = search.load({ id: searchId });
        const results = [];
        let start = 0;
        let maxResults = 1000;
        while (true) {
            const slice = loadedSearch.run().getRange({ start, end: start + maxResults });
            if (!slice || slice.length === 0) break;
            results.push(...slice);
            start += maxResults;
            // Optional: log progress
            log.audit('Fetched Records So Far', results.length);
        }
        log.audit('Final Record Count', results.length);
        return results;
    };

//example 3
var objSavedSearch = search.load({
    id: stSearchId
});
var maxResults = 1000;
var objResultset = objSavedSearch.run();
var intSearchIndex = 0;
var arrReturnSearchResults = new Array();
var arrResultSlice = null;
do {
    arrResultSlice = objResultset.getRange(intSearchIndex, intSearchIndex + maxResults);
    if (arrResultSlice == null) {
        break;
    }

    arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);
    intSearchIndex = arrReturnSearchResults.length;
}
while (arrResultSlice.length >= maxResults);
