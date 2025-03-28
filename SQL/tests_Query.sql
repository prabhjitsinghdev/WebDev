/* Trying to pull txn's between a certain date period */
 SELECT *
FROM transaction t
 WHERE t.trandate BETWEEN TO_DATE('2024-03-01', 'YYYY-MM-DD') and TO_DATE('2024-03-31', 'YYYY-MM-DD')


 SELECT t.id, t.tranid, FROM TRANSACTION t
 LEFT JOIN transactionLine tl on t.id = tl.transaction and tl.mainLine = 'F' 
WHERE t.type = 'VendBill' and t.status is IN ('VendBill:A', 'VendBill:D')



/* deubgging to get all fields from the transaction line */ 
/* with the query below we can and then we saw these fields 
"foreignamount"
"netAmount"
“foreignpaymentamountused”
“creditforeignamount” 
“fxamountlinked”
*/
SELECT 
    tl.*
FROM 
    Transaction tr
INNER JOIN 
    TransactionLine tl ON tr.id = tl.transaction and tl.mainLine = 'F' 
WHERE 
    tr.type = 'CustPymt' and tr.id = 51429050

/* pulling all of those amount fields */
SELECT 
    tl.id,
    tl.foreignamount,
    tl.netAmount,
    tl.foreignpaymentamountused,
    tl.creditforeignamount,
    tl.fxamountlinked
FROM 
    Transaction tr
INNER JOIN 
    TransactionLine tl ON tr.id = tl.transaction
WHERE 
    tr.type = 'CustPymt' and tr.id = 17029628;


/* *****  TransactionLine **** */
SELECT 
    *
FROM 
    TransactionLine
WHERE 
    TransactionLine.transaction = 51429052

/* ****  NextTransactionLineLink *** */
/* march 27th */
/* using this simple sql we can see the linked "next transaction line link" for each line and the amount assoicated 
* the aount is the correct one 
*/
SELECT * FROM NextTransactionLineLink WHERE nextDoc = 17036720
