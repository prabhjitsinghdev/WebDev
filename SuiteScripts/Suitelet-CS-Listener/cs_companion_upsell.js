/**
 * @NApiVersion 2.1
 * @NScriptType clientScript
 * @NModuleScope Public
 *
 * Version    Date          Author          Remarks
 * 1.00       01-22-2026    Prabhjit Singh  cs_companion_upsell.js 
 */

define(['N/runtime', 'N/url', 'N/currentRecord', 'N/https', 'N/ui/message'], (runtime, url, currentRecord, https, message) => {

    const saveRecord = (context) => {
        return true;
    }

    const redirectToSuitelet = () => {
        try {
            const response = confirm('Directing to Upsell Suitelet -- Are you sure you want to proceed?');
            if (!response) { return; }
            const curRecord = currentRecord.get();
            /*
            https.requestSuitelet.promise({
                    scriptId: "customscript_acs_sl_upsell_items",
                    deploymentId: "customdeploy_acs_sl_upsell_items",
                    
                    urlParams: {
                        salesorderid: curRecord.id
                    },
                    method: https.Method.GET
                })
                .then(function (response) {
                    console.log('DEBUG resposne from suitelet', `response ${JSON.stringify(response)}`);
                     https.request({
                        method: https.Method.GET,
                        url: stURL
                    });
                    window.location.href = stURL;
                    //window.location.href = `/app/center/card.nl`;
                    //trying the confirm dialgo to show up 
                    
                })
                .catch(function onRejected(reason) {
                    log.debug({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                    alert(`ERROR in delete PO: ${reason}`);
                   
                });
                */
                const itemArr = getLineItems(curRecord, 'item', ['item', 'quantity', 'amount', 'location']);
                const stURL = url.resolveScript({
                    scriptId: 'customscript_acs_sl_upsell_items',
                    deploymentId: 'customdeploy_acs_sl_upsell_items',
                    params: {
                        salesorderid: curRecord.id,
                        itemsArr: JSON.stringify(itemArr)
                    },
                    returnExternalUrl: false
                });
                https.request({
                    method: https.Method.GET,
                    url: stURL
                });
                const feature = 'width=1000,height=800,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=yes'; 
                //window.open(stURL, '_blank', 'noopener,noreferrer');
                window.open(stURL, '_blank', feature);
                window.addEventListener('message', (event) => {
                
                const returnedItemsArr = event.data || {};
                console.log('DEBUG returnedItemsArr', `${returnedItemsArr} // typeof ${typeof returnedItemsArr} // length  ${returnedItemsArr.length}// returnedItemsArr: ${JSON.stringify(returnedItemsArr)}`);
                if (!returnedItemsArr) return;
                console.log(`pulling itemArr ${returnedItemsArr.itemArr} // type ${typeof returnedItemsArr.itemArr}`);
                const lineItemsarr = returnedItemsArr.itemArr;
                console.log('DEBUG lineItemsarr', `lineItemsarr: ${JSON.stringify(lineItemsarr)} // length: ${lineItemsarr.length}`);
                const parentRec = currentRecord.get();
                    for (let j = 0; j < lineItemsarr.length; j++) {
                        console.log('DEBUG adding item', `item to add: ${JSON.stringify(lineItemsarr[j])}`);
                        parentRec.selectNewLine({
                            sublistId: 'item'
                        });
                        parentRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: lineItemsarr[j].item,
                            ignoreFieldChange: false,
                            forceSyncSourcing: true
                        });
                        parentRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: lineItemsarr[j].quantity,
                            ignoreFieldChange: false,
                            forceSyncSourcing: true
                        });
                        parentRec.commitLine({
                            sublistId: 'item'
                        });
                    }
            }, { once: true });




                } catch (e) {
                    log.error("deletePO", e.message);
                    alert(e.message);
                    return false;
                }
        }

    const pageInit = (context) => {
            console.log('debug cs script', `looging context ${JSON.stringify(context)} `);
            var myMsg = message.create({
                title: "Confirm Deletion",
                message: "Purchase Orrder has been deleted successfully.",
                type: message.Type.CONFIRMATION
            });
            myMsg.show();
            return true;

    }

      const getLineItems = (recordObj, sublistName, fldsArr) => {
            try {
                const lineItemArr = [];
                if (!recordObj) { return false; }
                const lineCount = recordObj.getLineCount({
                    sublistId: sublistName
                });
                console.log('sublist count', lineCount);
                for (let x = 0; x < lineCount; x++) {
                    let tempObj = {};
                    for (let fld = 0; fld < fldsArr.length; fld++) {
                        //console.log(typeof fldsArr[fld]);
                        let pulledValue = recordObj.getSublistValue({
                            sublistId: sublistName,
                            fieldId: fldsArr[fld],
                            line: x
                        });
                        tempObj[fldsArr[fld]] = pulledValue;
                    }
                    lineItemArr.push(tempObj);
                    console.log("DEBUG getLineItems", `print obj ${JSON.stringify(tempObj)}`);
                }
                console.log("DEBUG getLineItems", `length: ${lineItemArr.length} and lineItemArr ${lineItemArr}`);

                return lineItemArr;

            } catch (error) {
                console.log({ title: 'ERROR getLineItems', details: error });
            }
        }

        const onSubmit = () => {
            const cRec = currentRecord.get();
            const itemArr = getLineItems(cRec, 'custpage_search_sublist', ['custpage_txn_apply_item','custpage_txn_items_purchased', 'custpage_txn_ite_to_upsell', 'custpage_txn_item_qty']);
            console.log('DEBUG onSubmit', `itemArr: ${JSON.stringify(itemArr)}`);
            if(itemArr.length === 0){
                alert('No items to add to Sales Order');
                return;
            }
            const itemsToAdd = []
            for(let i = 0; i < itemArr.length; i++){
                if(itemArr[i].custpage_txn_apply_item === true){
                    console.log('DEBUG onSubmit', `itemArr[i]: ${JSON.stringify(itemArr[i])}`);
                    itemsToAdd.push({
                        item: itemArr[i].custpage_txn_ite_to_upsell,
                        quantity: itemArr[i].custpage_txn_item_qty
                    });
                }
            }

            console.log('DEBUG onSubmit', `length ${itemsToAdd.length} //itemsToAdd: ${JSON.stringify(itemsToAdd)}`);
            let parentWindow = window.opener();
            console.log('DEBUG onSubmit', `parentWindow: ${parentWindow}`);

            window.opener.addItemsToSalesOrder = (items) => {
                    const parentRec = currentRecord.get();
                    for (let j = 0; j < items.length; j++) {
                        parentRec.selectNewLine({
                            sublistId: 'item'
                        });
                        parentRec.setCurrentSublistText({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: items[j].item
                        });
                        parentRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: items[j].quantity
                        });
                        parentRec.commitLine({
                            sublistId: 'item'
                        });
                    }
                }
           

        }

        return {
            saveRecord,
            redirectToSuitelet,
            //pageInit,
            onSubmit
        }
    });
