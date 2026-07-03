/* serach for EFT  payment file admin relationship with its payments */ 
const transactionSearchObj = search.create({
   type: "transaction",
   settings:[{"name":"includeperiodendtransactions","value":"F"}],
   filters:
   [
      ["mainline","is","T"], 
      "AND", 
      ["custrecord_2663_parent_payment.internalid","noneof","@NONE@"]
   ],
   columns:
   [
      search.createColumn({name: "trandate", label: "Date"}),
      search.createColumn({name: "tranid", label: "Document Number"}),
      search.createColumn({
         name: "formulatext",
         formula: "CASE WHEN {type} = 'Cash Refund' THEN {otherrefnum} ELSE {tranid} END",
         label: "Memo(Number)"
      }),
      search.createColumn({name: "postingperiod", label: "Period"}),
      search.createColumn({name: "entity", label: "Name"}),
      search.createColumn({name: "amount", label: "Amount"}),
      search.createColumn({name: "approvalstatus", label: "Approval Status"})
   ]
});
const searchResultCount = transactionSearchObj.runPaged().count;
log.debug("transactionSearchObj result count",searchResultCount);
transactionSearchObj.run().each(function(result){
   // .run().each has a limit of 4,000 results
   return true;
});

/*
transactionSearchObj.id="customsearch1772736780357";
transactionSearchObj.title="Payments per Payment File - pj  (copy)";
const newSearchId = transactionSearchObj.save();
*/
