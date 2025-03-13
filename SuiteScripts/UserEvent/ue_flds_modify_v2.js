/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * 
 * ue_flds_modify_v2.js 
 * this version works 
 */
define(['N/record', 'N/runtime', 'N/ui/serverWidget'], (record, runtime, serverWidget) => {
    const beforeLoad = (context) => {
        try {
            log.debug('DEBUG beforeload', `context ${JSON.stringify(context)} `);
            if (context.type = ['create', 'copy', 'edit']) {
                log.debug('DEBUG beforeLoad 1.1', `In right context we will disable the field based on the recType`);
                const form = context.form;
                const newRec = context.newRecord;
                const recType = context.newRecord.type;
                log.debug('DEBUG param check', `newRec ${newRec} // recType ${recType} `);
                const accepRecs = ['lotnumberedassemblyitem'];
                const secondAccpRec = ['customer']; 
                if (accepRecs.includes(recType)) {
                    const lineCnt = newRec.getLineCount({
                        sublistId: 'price1'
                    });
                    log.debug('DEBUG beforeLoad 1.3', `lineCnt ${lineCnt} -- `);
                    for (let x = 0; x < lineCnt; x++) {
                        //currency
                        const currencyFld = form.getSublist({
                            id: 'price1'
                        }).getField({ id: 'currency' });
                        currencyFld.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        
                        //discount 
                        const discountFld = form.getSublist({
                            id: 'price1'
                        }).getField({ id: 'discount' });
                        discountFld.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });

                        //discountdisplay
                        const discountdisplayFld = form.getSublist({
                            id: 'price1'
                        }).getField({ id: 'discountdisplay' });
                        discountdisplayFld.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });

                        //discountdisplay
                        const pricelevelFld = form.getSublist({
                            id: 'price1'
                        }).getField({ id: 'pricelevel' });
                        pricelevelFld.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        //price1quantity1_fs_lbl
                        const testFld = form.getSublist({
                            id: 'price1'
                        }).getField({ id: 'price1quantity1_fs_lbl' });
                        testFld.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        //price1_price_1_1_fs
                    }
                    
                }else if(secondAccpRec.includes(recType)){
                    log.debug('DEBUG beforeLoad 2.1', `Second accepted rec - recType - ${recType}`);
                    const lineCnt = newRec.getLineCount({
                        sublistId: 'itempricing'
                    });
                    log.debug('DEBUG beforeLoad 2.2', `lineCnt ${lineCnt} -- `);
                    for(let x = 0; x < lineCnt; x++){
                        const itemFld = form.getSublist({
                            id: 'itempricing'
                        }).getField({ id: 'item' });
                        itemFld.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });

                        const levelFld = form.getSublist({
                            id: 'itempricing'
                        }).getField({ id: 'level' });
                        levelFld.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });

                        const priceFld = form.getSublist({
                            id: 'itempricing'
                        }).getField({ id: 'price' });
                        priceFld.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                    }
                }
                    

            }
        } catch (error) {
            log.error('ERROR beforeload', error);
        }
    }

    const beforeSubmit = (context) => {
        try {
            //log.debug('DEBUG beforeSubmit', `running before submit test script`); 
            log.debug('DEBUG beforeSubmit context', `context ${logString(JSON.stringify(context))}`);
        } catch (error) {
            log.error('ERROR beforeSubmit', error);
        }
    }

    const afterSubmit = (context) => {
        try {
            //log.debug('DEBUG afterSubmit', `running after submit test script`); 
            log.debug('DEBUG afterSubmit context', `context ${logString(JSON.stringify(context))}`);
        } catch (error) {
            log.error('ERROR afterSubmit', error);
        }
    }

    const logString = (striInput) => {
        let maxLen = 3000;
        let count = Math.ceil(striInput.length / maxLen);
        for (let x = 0; x < count; x++) {
            log.debug('logging string func', `${x} , ${striInput.substr(x * maxLen, maxLen)}`);
        }

    }

    return {
        beforeLoad,
        beforeSubmit,
        afterSubmit
    }
});