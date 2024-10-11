/*
* Snippet to test specific internal ID's and pull the search results 
*
*/
require(['N/record', 'N/search'], function (record, search){
    const getInvoiceNumbers = (invoiceIDs) => {
        var invoiceNumberMap = {};
        console.log("invoiceIDs", invoiceIDs);
        var invoiceSearch = search.create({
            type: "transaction",
            //settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters:
                [
                    ["internalid", "anyof", invoiceIDs],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "type", label: "Type" })
                ]
        });
        invoiceSearch.run().each(function (result) {
            var invoiceID = result.id;
            var invoiceNumber = result.getValue('tranid');
            invoiceNumberMap[invoiceID] = invoiceNumber;
            return true;
        });
      console.log('invoiceNumberMap',invoiceNumberMap);
        return invoiceNumberMap;
    }
    let x = [3375086,3384441,3431445,3433884,3433886,3434017,3434019,3434027,3434030,3434042,3435116,3435117,3447230,3617273,3649016,3919252,3919253,3919254,3919255,3919263,3919267,3919370,3919471,3919472,3919473,3919474,3919475,3926496,3936323,3942156]
    getInvoiceNumbers(x);
})

