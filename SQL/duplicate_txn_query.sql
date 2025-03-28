SELECT
    t.type as type,
    t.trandate,
    t.tranid,
    t.entity,
    t.foreignTotal,
    BUILTIN.DF(t.status) as status
FROM
    transaction t
WHERE
    (t.entity, t.foreignTotal) IN (
        SELECT
            entity,
            foreignTotal
        FROM
            transaction where transaction.trandate between to_date('20240101', 'YYYYMMDD') and to_date('20250131', 'YYYYMMDD')
					and transaction.type = 'SalesOrd'
        GROUP BY
            entity,
            foreignTotal
        HAVING
            COUNT(*) > 1
    ) and t.trandate between to_date('20240101', 'YYYYMMDD') and to_date('20250131', 'YYYYMMDD')
	and t.type = 'SalesOrd'
    ---and t.entity = 9428 (removing this to find ALL duplicate SalesOrders
ORDER BY
    t.entity,
    t.foreignTotal,
    t.tranid;


/* Txn query 1 */ 
SELECT
    distinct t.id, BUILTIN.DF(t.status) as status, t.tranid, t.trandate, t.type as txn_type, t.foreigntotal as amount, t.foreignpaymentamountused as payment, t.custbody_acs_chck_exclude_statment,  BUILTIN.DF(t.currency) as currency
FROM transaction t
    LEFT JOIN transactionLine tl on t.id = tl.transaction and tl.mainLine = 'F' 
WHERE t.entity IN (16864867)
    AND t.trandate BETWEEN TO_DATE('01/01/2024', 'MM/DD/YYYY') and TO_DATE('03/26/2025', 'MM/DD/YYYY')
    AND t.type IN ('CustInvc', 'CustCred', 'Journal', 'CustDep')
    AND t.status IN ('CustInvc:A', 'CustCred:A', 'Journal:B')
    AND (t.custbody_acs_chck_exclude_statment IS NULL OR t.custbody_acs_chck_exclude_statment = 'F')
    ORDER BY t.trandate ASC

/* JE query 2 */ 
SELECT 
      distinct t.id, BUILTIN.DF(t.status), t.tranid, t.trandate, t.type, tl.debitforeignamount, tl.creditforeignamount, tl.entity, t.custbody_acs_chck_exclude_statment, BUILTIN.DF(t.currency) as currency
FROM transaction t
      LEFT JOIN transactionLine tl on t.id = tl.transaction
WHERE tl.entity IN (16864867)
      AND t.type = 'Journal'
      AND t.status IN ('Journal:B')
      AND t.trandate BETWEEN TO_DATE('01/01/2024', 'MM/DD/YYYY') and TO_DATE('03/26/2025', 'MM/DD/YYYY')
      AND tl.expenseaccount = 122
      ORDER BY t.trandate ASC


/* Payments query 3 */
SELECT 
    tpayment.id as internalid,
    tpayment.trandate as date,
    tpayment.tranid as tranid,
    BUILTIN.DF(tpayment.status) as status,
    tinvoice.tranid as tranid_invoice,
    ap.foreignamount as amount_due,
    tinvoice.foreigntotal as orginal_amount,
    tpayment.custbody_acs_chck_exclude_statment,
    BUILTIN.DF(tpayment.currency) as payment_currency,
    BUILTIN.DF(tinvoice.currency) as invoice_currency
FROM
    NextTransactionLineLink as ap
        JOIN transaction tpayment on (tpayment.id = ap.nextdoc
            AND tpayment.type = 'CustPymt') 
        JOIN transaction tinvoice on (tinvoice.id = ap.previousdoc and tinvoice.type = 'CustInvc' 
            AND tinvoice.entity = tpayment.entity) 
        JOIN TransactionLine tl ON tinvoice.id = tl.transaction
            AND tl.mainLine = 'T'
WHERE 
    ap.linktype = 'Payment' 
    AND tpayment.status IN ('CustPymt:C')
    AND tpayment.trandate BETWEEN TO_DATE('01/01/2015', 'MM/DD/YYYY') and TO_DATE('03/26/2025', 'MM/DD/YYYY')
    AND tpayment.entity IN (11082692)
AND (tpayment.custbody_acs_chck_exclude_statment IS NULL OR tpayment.custbody_acs_chck_exclude_statment = 'F')
