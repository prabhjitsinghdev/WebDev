/* THIS ONE IS WORKING */ 
SELECT
    ut.id                  AS unit_type_id,
    ut.name            AS unit_type_name,
    uom.internalid         AS uom_id,
    uom.unitName           AS uom_name,
    uom.conversionRate,
    uom.baseUnit
FROM
    UnitsType ut
INNER JOIN
    UnitsTypeUom uom
        ON ut.id = uom.unitstype
WHERE
    ut.id = 2 ---this needs to be updated to the internal id of the UOM record
    AND
    uom.abbreviation = 'PC (64 SF)'
