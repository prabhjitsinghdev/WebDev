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
            if (['create', 'copy', 'edit'].includes(context.type)) {
                log.debug('DEBUG beforeLoad 1.1', `In right context we will disable the field based on the recType`);
                const form = context.form;
                const newRec = context.newRecord;
                const recType = context.newRecord.type;
                log.debug('DEBUG param check', `newRec ${newRec} // recType ${recType} `);
                const accepRecs = ['lotnumberedassemblyitem'];
                const secondAccpRec = ['customer']; 
                if(runtime.contexttype !== 'USERINTERFACE'){ return; }
                if (accepRecs.includes(recType)) {

                    //header?
                    /*\
                    const priceQty2FLD = form.getField({ id: 'price1quantity2'});
                    priceQty2FLD.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                    */
                    disableItemFlds(newRec, form);
                }else if(secondAccpRec.includes(recType)){
                    log.debug('DEBUG beforeLoad 2.1', `Custom record accepted rec - recType - ${recType}`);
                    disableCustomerFlds(newRec, form);
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

    const disableItemFlds = (newRec, form) =>{
        const priceFldsArr = ['price1', 'price2', 'price3', 'price4' ];
        for(let z = 0; z < priceFldsArr.length; z++){
             const lineCnt = newRec.getLineCount({
                 sublistId: priceFldsArr[z]
            });
            log.debug('DEBUG disableItemFlds 1.0', `-- lineCnt pricelevel ${lineCnt} -- `);
            for (let x = 0; x < lineCnt; x++) {
                //price_1_
                const price1Fld = form.getSublist({
                    id: priceFldsArr[z]
                }).getField({ id: 'price_1_' });
                price1Fld.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                //price_2_
                const price2Fld = form.getSublist({
                    id: priceFldsArr[z]
                }).getField({ id: 'price_2_' });
                price2Fld.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                //price_3_
                const price3Fld = form.getSublist({
                    id: priceFldsArr[z]
                }).getField({ id: 'price_3_' });
                price3Fld.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                //price_4_
                const price4Fld = form.getSublist({
                    id: priceFldsArr[z]
                }).getField({ id: 'price_4_' });
                price4Fld.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                //price_5_
                const pric5Fld = form.getSublist({
                    id: priceFldsArr[z]
                }).getField({ id: 'price_5_' });
                pric5Fld.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

            }
        }
    }

    const disableCustomerFlds = (newRec, form) => {
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

    return {
        beforeLoad,
        beforeSubmit,
        afterSubmit
    }
});
