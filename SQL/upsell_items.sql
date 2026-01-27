SELECT 
    BUILTIN_RESULT.TYPE_STRING(item.itemid) AS itemid,
    BUILTIN_RESULT.TYPE_STRING(ItemPresentationItem.presentationitem) AS presentationitem,
FROM  
    item, ItemPresentationItem
WHERE  
    item."ID" = ItemPresentationItem.superitem(+) 
    AND ((item."ID" IN (${itemsArr})
    AND ItemPresentationItem.presentationitem IS NOT NULL))

/* my code */ 
SELECT 
    BUILTIN_RESULT.TYPE_STRING(item.itemid) AS itemid,
    BUILTIN_RESULT.TYPE_STRING(ItemPresentationItem.presentationitem) AS presentationitem,
    item.description AS salesdescription,
    invBal.quantityOnHand AS qtyonhand
FROM  
    item, ItemPresentationItem
    LEFT JOIN 
        ItemInventoryBalance invBal on item.id = invBal.item
WHERE  
    item."ID" = ItemPresentationItem.superitem(+) 
    AND ((item."ID" IN (${itemsArr})
    AND ItemPresentationItem.presentationitem IS NOT NULL))


/* AI code updated */ 
SELECT 
    BUILTIN_RESULT.TYPE_STRING(item.itemid) AS itemid,
    BUILTIN_RESULT.TYPE_STRING(ItemPresentationItem.presentationitem) AS presentationitem,
    SUM(ItemInventoryBalance.quantityonhand) AS total_quantity_on_hand
FROM  
    item
LEFT JOIN ItemPresentationItem
    ON item."ID" = ItemPresentationItem.superitem
LEFT JOIN ItemInventoryBalance
    ON item."ID" = ItemInventoryBalance.item
WHERE  
    item."ID" IN (101455)
    AND ItemPresentationItem.presentationitem IS NOT NULL
GROUP BY
    item.itemid,
    ItemPresentationItem.presentationitem


/* testing with Helton to fix this */

/* first step to check everythign in the itempresentationitem table */
SELECT *
FROM ItemPresentationItem
WHERE 
superitem = 101455

/* next we work backwards and removed unncertain joins for final query below */

SELECT 
BUILTIN.DF(ipi.superitem) as superitem,
ipi.superitem,
ipi.presentationitem as upsellitem,
ipi.presitemid,
ipi. description,
SUM(iib.quantityonhand) as quantity_on_hand
FROM ItemPresentationItem ipi
JOIN
   ItemInventoryBalance iib ON ipi.presitemid = iib.item
WHERE 
ipi.superitem = 101455
GROUP BY
BUILTIN.DF(ipi.superitem),
ipi.superitem,
ipi.presentationitem,
ipi.presitemid,
ipi. description


/* final query below */ 
SELECT 
BUILTIN.DF(ipi.superitem) as superitem,
ipi.superitem,
ipi.presentationitem as upsellitem,
ipi.presitemid,
ipi. description,
SUM(iib.quantityonhand) as quantity_on_hand
FROM ItemPresentationItem ipi
JOIN
   ItemInventoryBalance iib ON ipi.presitemid = iib.item
WHERE 
ipi.superitem = 101455
GROUP BY
BUILTIN.DF(ipi.superitem),
ipi.superitem,
ipi.presentationitem,
ipi.presitemid,
ipi. description


