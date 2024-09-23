/* Trying to pull txn's between a certain date period */
 SELECT *
FROM transaction t
 WHERE t.trandate BETWEEN TO_DATE('2024-03-01', 'YYYY-MM-DD') and TO_DATE('2024-03-31', 'YYYY-MM-DD')
