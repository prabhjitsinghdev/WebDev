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
