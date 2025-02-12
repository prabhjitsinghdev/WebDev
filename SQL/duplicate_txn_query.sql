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
