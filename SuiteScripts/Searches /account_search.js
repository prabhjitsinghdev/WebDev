// account search 
const accountSearchObj = search.create({
   type: "account",
   filters:
   [
      ["internalid","anyof","123"]
   ],
   columns:
   [
      search.createColumn({name: "name", label: "Name"}),
      search.createColumn({name: "displayname", label: "Display Name"}),
      search.createColumn({name: "type", label: "Account Type"}),
      search.createColumn({name: "description", label: "Description"}),
      search.createColumn({name: "balance", label: "Balance"}),
      search.createColumn({name: "custrecord_fam_account_showinfixedasset", label: "Show in Fixed Assets Management"})
   ]
});
const searchResultCount = accountSearchObj.runPaged().count;
log.debug("accountSearchObj result count",searchResultCount);
accountSearchObj.run().each(function(result){
   // .run().each has a limit of 4,000 results
   return true;
});
