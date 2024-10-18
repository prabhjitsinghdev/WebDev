/* Trying to pull txn's between a certain date period */
 SELECT *
FROM transaction t
 WHERE t.trandate BETWEEN TO_DATE('2024-03-01', 'YYYY-MM-DD') and TO_DATE('2024-03-31', 'YYYY-MM-DD')


 SELECT t.id, t.tranid, FROM TRANSACTION t
 LEFT JOIN transactionLine tl on t.id = tl.transaction and tl.mainLine = 'F' 
WHERE t.type = 'VendBill' and t.status is IN ('VendBill:A', 'VendBill:D')
