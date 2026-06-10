SELECT 
    tl.*
FROM 
    InboundShipment tr
INNER JOIN 
    InboundShipmentItem tl ON tr.id = tl.InboundShipment
WHERE tr.id = 2338
