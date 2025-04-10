require(['N/currentRecord'], (currentRecord)=>{
    recordObj = currentRecord.get();
    let sublistName = 'item'; 

    let itemPulled = recordObj.getCurrentSublistValue({
        sublistId: sublistName,
        fieldId: 'item'
    });
    let locationPulled = recordObj.getCurrentSublistValue({
        sublistId: sublistName,
        fieldId: 'location'
    });
    console.log('DEBUG setLineItems', `itemPulled ${itemPulled} vs locationPulled ${locationPulled}`); 
    const invDetailRec = recordObj.getCurrentSublistSubrecord({
        sublistId: sublistName,
        fieldId: 'inventorydetail'
    });
    console.log('DEBUG invDetail', `invDetailRec ${invDetailRec}`); 
    if(invDetailRec){
        invDetailRec.selectLine({
            sublistId: 'inventoryassignment',
            line: 0
        });
        let binnum = invDetailRec.getValue({
            sublistId: 'inventoryassignment',
            fieldId: 'binnumber'
        });
        console.log(`binnum ${binnum}`); 
        let quantity = invDetailRec.getValue({
            sublistId: 'inventoryassignment',
            fieldId: 'quantity'
        });
        console.log(`quantity ${quantity}`); 
        let status = invDetailRec.getValue({
            sublistId: 'inventoryassignment',
            fieldId: 'toinventorystatus'
        });
        console.log(`status ${status}`); 

        toinventorystatus
    }
});