SELECT t.id as vendpyment_internalid, t.tranid, t.transactionnumber, BUILTIN.DF(t.entity) as vendor, t.memo as payment_memo, BUILTIN.DF(t.status) as payment_status, t.trandate, tl.netAmount, cft.id as related_bill_id, BUILTIN.DF(cft.status) as related_bill_status, cft.externalid as related_bill_externalid, cft.memo as related_bill_memo, cft.tranid as bill_tranID, ptll.foreignAmount as line_applied_amount, ptll.previousType, ptll.previousDoc as correct_bill_id
  FROM transaction t 
    LEFT JOIN transactionLine tl on t.id = tl.transaction and tl.mainLine = 'F'
    LEFT JOIN PreviousTransactionLineLink ptll ON ptll.nextdoc = t.id 
    LEFT JOIN transactionLine cftl ON ptll.previousdoc = cftl.transaction AND cftl.id = ptll.previousline
    LEFT JOIN transaction cft ON ptll.previousDoc = cft.id
  WHERE t.type = 'VendPymt' AND t.id = {}

/* added statement to pull credits applied from the Vendor Payment record */
SELECT distinct transaction.trandisplayname as appliedto,credmemo.tranid as refnumber,credit.previousdoc as doc2,credit.foreignamount as amount 
  FROM AppliedCreditTransactionLineLink as credit
    join transaction on (transaction.id = credit.previousdoc) 
    join transactionline on (transactionline.transaction = transaction.id)
    join transaction as credmemo on (credmemo.id = credit.nextdoc) 
  WHERE credit.paymenttransaction = 4372093  and transactionline.accountinglinetype = 'ACCOUNTSPAYABLE'"
