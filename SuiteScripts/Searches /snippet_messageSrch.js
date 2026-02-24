/** @NApiVersion 2.1 */
const messageSearchObj = search.create({
   type: "message",
   filters:
   [
      ["transaction.type","anyof","CustInvc"], 
      "AND", 
      ["transaction.custbody_acs_deliv_cert_status","anyof","2"], 
      "AND", 
      ["hasattachment","is","T"], 
      "AND", 
      ["messagedate","within","today"], 
      "AND", 
      ["author","noneof","281798"]
   ],
   columns:
   [
      search.createColumn({name: "view", label: "View"}),
      search.createColumn({name: "messagedate", label: "Date"}),
      search.createColumn({name: "subject", label: "Subject"}),
      search.createColumn({name: "attachments", label: "Attachments"}),
      search.createColumn({
         name: "name",
         join: "attachments",
         label: "Name"
      }),
      search.createColumn({
         name: "filetype",
         join: "attachments",
         label: "Type"
      }),
      search.createColumn({
         name: "internalid",
         join: "transaction",
         label: "Invoice internalID"
      }),
      search.createColumn({name: "message", label: "Message"}),
      search.createColumn({name: "recipient", label: "Primary Recipient"}),
      search.createColumn({name: "messagetype", label: "Type"}),
      search.createColumn({name: "hasattachment", label: "Files"}),
      search.createColumn({name: "isemailed", label: "Email Sent"}),
      search.createColumn({name: "isincoming", label: "Is Incoming"}),
      search.createColumn({name: "internalonly", label: "Internal Only"}),
      search.createColumn({name: "cc", label: "Cc"}),
      search.createColumn({name: "bcc", label: "Bcc"})
   ]
});
const searchResultCount = messageSearchObj.runPaged().count;
log.debug("messageSearchObj result count",searchResultCount);
messageSearchObj.run().each(function(result){
   // .run().each has a limit of 4,000 results
   return true;
});

/*
messageSearchObj.id="customsearch1771956648156";
messageSearchObj.title="ACS | Message Search (copy)";
const newSearchId = messageSearchObj.save();
*/
