SELECT 
    tl.*
FROM 
    InboundShipment tr
INNER JOIN 
    InboundShipmentItem tl ON tr.id = tl.InboundShipment
WHERE tr.id = 2338



SELECT
    resolved.item_internal_id,
    BUILTIN.DF(resolved.item_internal_id) AS item_name,
    SUM(resolved.inbound_quantity)        AS inbound_quantity
FROM (
    SELECT
        candidate.inbound_line_id,
        MAX(candidate.item_internal_id)   AS item_internal_id,
        MAX(candidate.inbound_quantity)   AS inbound_quantity
    FROM (
        SELECT DISTINCT
            isi.id                       AS inbound_line_id,
            tl.item                      AS item_internal_id,
            NVL(isi.quantityexpected, 0) AS inbound_quantity
        FROM
            InboundShipmentItem isi
        INNER JOIN
            transactionline tl
                ON tl.transaction = isi.purchaseordertransaction
                AND tl.mainline = 'F'
                AND tl.item IS NOT NULL
        LEFT JOIN
            item i
                ON i.id = tl.item
        WHERE
            isi.inboundshipment = ?
            AND (
                i.description = isi.shipmentitemdescription
                OR tl.memo = isi.shipmentitemdescription
                OR BUILTIN.DF(tl.item) = isi.shipmentitemdescription
            )
    ) candidate
    GROUP BY
        candidate.inbound_line_id
    HAVING
        COUNT(DISTINCT candidate.item_internal_id) = 1
) resolved
GROUP BY
    resolved.item_internal_id,
    BUILTIN.DF(resolved.item_internal_id)
ORDER BY
    BUILTIN.DF(resolved.item_internal_id)
