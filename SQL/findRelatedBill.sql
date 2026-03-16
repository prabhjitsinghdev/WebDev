/* find the related PO's bill */
SELECT DISTINCT
    nextdoc, 
    nexttype,
    previousdoc, 
    linktype, 
    ABS (t.foreignTotal) as absolute_bill_total,
    BUILTIN.DF(t.status) as bill_status
FROM 
    PreviousTransactionLineLink
JOIN
    transaction t on t.id = nextdoc
 WHERE
    previousDoc in (${poInternalId})
    and 
    nexttype = 'VendBill'
    and
    t.status != 'VendBill:D'
