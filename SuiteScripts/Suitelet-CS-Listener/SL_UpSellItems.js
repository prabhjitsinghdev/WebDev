/**
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 *
 * Version    Date          Author              Remarks
 * 1.00       01-22-2026   Prabhjit Singh       SL_UpSellItems.js
 *
 */

define(['N/https', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/task', 'N/runtime', 'N/query'], (https, record, search, serverWidget, task, runtime, query) => {
    'use strict';

    const onRequest = (context) => {

        if (context.request.method === https.Method.GET) {
            try {
                log.debug("DEBUG post param", `context.request.parameters ${context.request.parameters} // ${JSON.stringify(context.request.parameters)}`);
                const params = context.request.parameters; 
                const salesOrderID = params.salesorderid;
                const itemsArrStr = JSON.parse(params.itemsArr);
                log.debug('DEBUG salesOrderID', `salesOrderID ${salesOrderID}, itemsArrStr ${itemsArrStr}`);
                const form = serverWidget.createForm({
                    title: 'Upsell Items',
                    hideNavBar: true
                });
                form.clientScriptFileId = 10783676;
                const userObj = runtime.getCurrentUser();
                const currUsrId = userObj.id; 
                //populateForm(form, currUsrId);
                populateSublist(form, itemsArrStr);
                
                form.addSubmitButton({
                    label: 'Submit For Processing'
                });
                
                /*
                form.addButton({
                    id: 'custpage_btn_submit',
                    label: 'Add to Sales Order',
                    functionName: `onSubmit()`
                });
                */
                
                
                
                context.response.writePage(form);
                
            } catch (error) {
                log.error({ title: `ERROR GET`, details: error });
            }

        }
        else if (context.request.method === https.Method.POST) {
            log.debug('DEBUG POST FUCN', `starting post functions here!`);
            try {
                //log.debug("DEBUG context post", `context ${JSON.stringify(context)}`);
                log.debug("DEBUG post param", `context.request.parameters ${context.request.parameters} // ${JSON.stringify(context.request.parameters)}`);
                const params = context.request.parameters; 
                //log.debug("DEBUG post param", typeof params.custpage_search_sublistdata);
                /*
                const checkboxFld = params['custpage_sendtome'];
                log.debug('DEBUG checkboxFld', `checkboxFld ${checkboxFld}` );
                //throw new Error ('stop here!'); 
                let userId; 
                if(checkboxFld == 'T'){
                    userId = params['custpage_curr_user'];
                    log.debug('DEBUG POST', `userId ${userId}`); 
                }

                const lineItemArr = getLineItems(context);

                let taskID; 
                let htmlcode = ''
                if(lineItemArr.length > 0 ){
                     //org
                     //taskID = callMR(lineItemArr, secondArr);
                     taskID = callMR(lineItemArr, userId);
                     htmlcode = `<html><body><p>Task submitted to MR script for bulk processing!</p></body></html>`;
                }else{
                    htmlcode = `<html><body><p>ERROR -- No task submitted, please check the script logs.</p></body></html>`;
                }
               

                context.response.write(htmlcode);
                */
               const lineItemArr = getLineItems(context);
               log.debug('DEBUG lineItemArr', `lineItemArr ${JSON.stringify(lineItemArr)}`);
               context.response.write(`
                <html>
                <body>
                    <script>
                    window.opener.postMessage({ itemArr: ${JSON.stringify(lineItemArr)} }, '*');
                    window.close();
                    </script>
                </body>
                </html>`);
                
                
            } catch (error) {
                log.error({ title: 'ERROR post', details: error });
            }

        }
    }

    const populateForm = (form, currUsrId) => {
        try {
            const checkUpSellFld = form.addField({
                id: 'custpage_chck_upsellitms',
                label: 'INCLUDE UPSELL ITEMS BASED ON CUSTOMERS PAST PURHCASES',
                type: serverWidget.FieldType.CHECKBOX
            });
             const checkSuggestFld= form.addField({
                id: 'custpage_chck_suggest',
                label: 'SUGGEST ITEMS PREVIOUSLY PRUCHASED OR IN CURRENT TRANSACTION',
                type: serverWidget.FieldType.CHECKBOX
            });

        } catch (error) {
            log.error({ title:'ERROR populateForm', details: error });
        }
    }

    const populateSublist = (form, data) =>{
        try {
            //orm.clientScriptFileId = 1324117;
            const invSublist = form.addSublist({
                id: 'custpage_search_sublist',
                label: 'Search Sublist',
                tab: 'Invoices',
                type: serverWidget.SublistType.INLINEEDITOR
            }); 
            //invSublist.addMarkAllButtons(); // adding mark all button 
            /*
            invSublist.addButton({
                id: 'custpage_btn_mark_all',
                label: 'Mark All',
                functionName : 'markAll()'
            });
            invSublist.addButton({
                id: 'custpage_btn_unmark_all',
                label: 'UnMark All',
                functionName : 'unMarkAll()'
            });
            */
           invSublist.addField({
                id: 'custpage_txn_apply_item',
                label: 'Apply to Sales Order',
                type: serverWidget.FieldType.CHECKBOX
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_items_purchased',
                label: 'Items Purchased',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_ite_to_upsell',
                label: 'Items to Upsell',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_upsellitem_id',
                label: 'Upsell Item ID',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_ite_desc',
                label: 'Item Description',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_item_qty',
                label: 'Item Quantity',
                type: serverWidget.FieldType.FLOAT
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_qty_on_hand',
                label: 'Quantity on Hand',
                type: serverWidget.FieldType.FLOAT
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_correlation',
                label: 'Correlation',
                type: serverWidget.FieldType.TEXT
                //source: string,
                //container: string
            });
           
            invSublist.addField({
                id: 'custpage_txn_count',
                label: 'count',
                type: serverWidget.FieldType.INTEGER
                //source: string,
                //container: string
            });
            /*
            invSublist.addField({
                id: 'custpage_txn_otherref',
                label: 'PO #',
                type: serverWidget.FieldType.TEXT,
                //source: string,
                //container: string
            });
            invSublist.addField({
                id: 'custpage_txn_crtdfrm',
                label: 'Created From',
                type: serverWidget.FieldType.TEXT,
                //source: string,
                //container: string
            });
            const idFld = invSublist.addField({
                id: 'custpage_txn_internalid',
                label: 'InternalID',
                type: serverWidget.FieldType.FLOAT,
                //source: string,
                //container: string
            });
            idFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN 
            })
            */
            const itemArr = [];
            for (let i = 0; i < data.length; i++) {
                let tempObj = data[i];
                itemArr.push(tempObj.item);
            }
            const upsellItems = runQuery(itemArr);
            const upsellItemsNameArr = [];
            for (let i = 0; i < upsellItems.length; i++) {
                let tempObj = upsellItems[i];
                log.debug('DEBUG upsellItems loop', `tempObj ${JSON.stringify(tempObj)}`);
                /*
                let tempname = tempObj.presentationitem;
                let upsellItemName = tempname.split('Item : ')[1];
                log.debug('DEBUG upsellItemName', `upsellItemName ${upsellItemName}`);
                upsellItemsNameArr.push(upsellItemName);
                */
            }
            //find item description 
            //no need to do this now that the query is working 
            /*
            log.debug('DEBUG upsellItemsNameArr', `length ${upsellItemsNameArr.length} // upsellItemsNameArr ${JSON.stringify(upsellItemsNameArr)}`);
            const itemsInfoArr = runItemDescSrch(upsellItems, upsellItemsNameArr);
            */


            for(let i = 0; i < upsellItems.length; i++){
                let tempObj = upsellItems[i];
                //log.debug('DEBUG populateSublist', `tempObj ${JSON.stringify(tempObj)}`);
                invSublist.setSublistValue({
                    id: 'custpage_txn_items_purchased',
                    value: tempObj.itemPurchased,
                    line: i
                });
                invSublist.setSublistValue({
                    id: 'custpage_txn_item_qty',
                    value: 1,
                    line: i
                });
                invSublist.setSublistValue({
                    id: 'custpage_txn_qty_on_hand',
                    value: tempObj.qtyOnHand || '',
                    line: i
                });
                invSublist.setSublistValue({
                    id: 'custpage_txn_ite_to_upsell',
                    value: tempObj.itemText || '',
                    line: i
                });
                invSublist.setSublistValue({
                    id: 'custpage_txn_upsellitem_id',
                    value: tempObj.item || '',
                    line: i
                });
                invSublist.setSublistValue({
                    id: 'custpage_txn_ite_desc',
                    value: tempObj.itemdescription || '',
                    line: i
                });
                /*
                invSublist.setSublistValue({
                    id: 'custpage_txn_count',
                    value: tempObj.count || '',
                    line: i
                });
                */
            }

            //processSearch(invSublist);

        } catch (error) {
            log.error({ title:'ERROR populateSublist', details: error });
        }
    }
    const processSearch = (invSublist) => {
        try {
            const resultsArr = []
            const checksSearch = search.load({
                id: 8179
            });
            let count = 0; 
            checksSearch.run().each((result)=>{
                let tempObj = {}
                //log.debug('DEBUG results', `result: ${result} // stingify ${JSON.stringify(result)}`);
                tempObj = result; 
                resultsArr.push(tempObj);
                let tempType = result['recordType'];
                let tempValues = result.values;
                //log.debug('DEBUG tempvalues', `typeof ${typeof tempValues} , tempValues ${tempValues}`);
                //log.debug('DEBUG temptype', `tempType ${tempType}`);
                invSublist.setSublistValue({
                    id: 'custpage_txn_typ',
                    value: tempType,
                    line: count
                });
                let tempID = result['id']
                invSublist.setSublistValue({
                    id: 'custpage_txn_internalid',
                    value: tempID,
                    line: count
                });
                //let tempTranID = result.values.tranid;
                let tempTranID = result.getValue({ name: 'tranid' });
                invSublist.setSublistValue({
                    id: 'custpage_txn_doc_num',
                    value: tempTranID,
                    line: count
                });
                let tempAcc = result.getText({ name: 'account' });
                invSublist.setSublistValue({
                    id: 'custpage_txn_acct',
                    value: tempAcc,
                    line: count
                });
                let tempAmt =result.getValue({ name: 'amount' });
                invSublist.setSublistValue({
                    id: 'custpage_txn_amount',
                    value: tempAmt,
                    line: count
                });
                

                count++;


                return true;
            });
            log.audit( 'AUDIT processSearch', `resultsArr.length ${resultsArr.length}` );
            if(resultsArr.length > 0){
                //TODO return the results and show them in a sublist
                //then have approved or reject status field to show as well 
                for(let x = 0; x < resultsArr.length; x++){
                    let tempObj = resultsArr[x];
                    //log.debug( 'DEBUG processSearch', `tempObj ${JSON.stringify(tempObj)}`);
                    Object.keys(tempObj).forEach(keys=>{
                        //tempObj[keys]
                    });
                }


            }else{
                log.audit('AUDIT processSearch', `No results to process therefore nothing to show for approval`); 

                return; 
            }

        } catch (error) {
            log.error({ title:'ERROR processSearch', details: error });
        }

    }

    const getLineItems = (context) => {
        try {
            const lineItemArr = []; 
            const lineCount = context.request.getLineCount({
                group: 'custpage_search_sublist'
            });
            for (let x = 0; x < lineCount; x++) {
                let tempObj = {};
                let readyToEmal = context.request.getSublistValue({
                    group: 'custpage_search_sublist',
                    name: 'custpage_txn_apply_item',
                    line: x
                });
                if(readyToEmal == 'F'){ continue; }
                tempObj.email = readyToEmal;
                let pulledItemName = context.request.getSublistValue({
                    group: 'custpage_search_sublist',
                    name: 'custpage_txn_upsellitem_id',
                    line: x
                });
                let pulledIteQty = context.request.getSublistValue({
                    group: 'custpage_search_sublist',
                    name: 'custpage_txn_item_qty',
                    line: x
                });

                //tempObj.id = parseInt(pulledInternalID);
                //lineItemArr.push(tempObj);
                lineItemArr.push({
                    item: pulledItemName,
                    quantity: parseFloat(pulledIteQty)
                });
                log.debug("DEBUG getLineItems", `print obj ${JSON.stringify(tempObj)}`);
            }
            log.debug("DEBUG getLineItems", `length: ${lineItemArr.length} and lineItemArr ${lineItemArr.toString()}`);

            return lineItemArr;

        } catch (error) {
            log.error({ title: 'ERROR getLineItems', details: error });
        }
    }


    const runQuery = (itemsArr) => {
        try {
            // query to see if items have related records
            var startQuery = new Date();
            /*var suiteQL = `
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
                item."ID" IN (${itemsArr})
                AND ItemPresentationItem.presentationitem IS NOT NULL
            GROUP BY
                item.itemid,
                ItemPresentationItem.presentationitem
            `; 

            */
            const suiteQL =`
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
                ipi.superitem IN (${itemsArr})
            GROUP BY
                BUILTIN.DF(ipi.superitem),
                ipi.superitem,
                ipi.presentationitem,
                ipi.presitemid,
                ipi. description
                `;
            var resultSet = query.runSuiteQL({
                query: suiteQL
            });
            var results = resultSet.results;
            var endQuery = new Date();
            log.debug('DEBUG query time', 'Query Time: ' + (endQuery - startQuery));
            log.debug('DEBUG results.length: ',  results.length);

            const upsellItems = [];
            for (let z = 0; z < results.length; z++) {
                log.debug('DEBUG loop suiteql', results[z]);
                let tempArr = results[z]['values']; 
                log.debug('DEBUG tempArr', `tempArr ${JSON.stringify(tempArr)}`);
                if(tempArr){
                    /*
                    upsellItems[tempArr[0]] = upsellItems[tempArr[0]] || [];
                    upsellItems[tempArr[0]].push({
                        item: tempArr[0],
                        presentationitem: tempArr[1],
                        qtyOnHand: tempArr[2]
                    });
                    */
                   upsellItems.push({
                        itemPurchased: tempArr[0],
                        itemText: tempArr[2],
                        item: tempArr[3],
                        itemdescription: tempArr[4],   
                        qtyOnHand: tempArr[5]
                    });
                }
            }

            log.audit('AUDIT upsellItems', `upsellitems length  ${upsellItems.length} // upsellItems ${JSON.stringify(upsellItems)}`);

            return upsellItems;

        } catch (error) {
            log.error('ERROR runQuery', error);
            return false;
        }
    }

    const runItemDescSrch = (itemArr, itemNames) => {
        try {
            /*
            const itemDescArr = [];
            const itemSearchObj = search.create({
            type: "item",
            filters:
            [
                ["internalid","anyof", itemArr]
            ],
            columns:
            [
                search.createColumn({name: "itemid", label: "Name"}),
                search.createColumn({name: "displayname", label: "Display Name"}),
                search.createColumn({name: "salesdescription", label: "Description"}),
                search.createColumn({name: "type", label: "Type"}),
                search.createColumn({name: "baseprice", label: "Base Price"}),
                search.createColumn({name: "custitem_solupaysp_engstatus", label: "Engineering Status"}),
                search.createColumn({name: "salesdescriptiontranslated", label: "Sales Description (Translated)"})
            ]
            });
            const searchResultCount = itemSearchObj.runPaged().count;
            log.debug("itemSearchObj result count",searchResultCount);
            itemSearchObj.run().each(function(result){
            // .run().each has a limit of 4,000 results
                let tempObj = {};
                tempObj.itemid = result.getValue({name: "itemid"});
                tempObj.displayname = result.getValue({name: "displayname"});
                tempObj.salesdescription = result.getValue({name: "salesdescription"});
                tempObj.type = result.getValue({name: "type"});

                itemDescArr.push(tempObj);

                return true;
            });

            log.audit('AUDIT itemDescArr', `itemDescArr length  ${itemDescArr.length} // itemDescArr ${JSON.stringify(itemDescArr)}`);

            return itemDescArr;

            */
           log.debug('DEBUG runItemDescSrch', `running item search for -- itemNames ${itemNames}`);
            var itemSearch = search.create({
                type: search.Type.ITEM,
                filters: [
                    ['name', 'haskeywords', itemNames]
                ],
                columns: [
                    'itemid',
                    'internalid',
                    'salesdescription'
                ]
            });

            var itemsInfoArr = [];
            itemSearch.run().each(function(result) {
                itemsInfoArr.push({
                    id: result.getValue('internalid'),
                    name: result.getValue('itemid'),
                    description: result.getValue('salesdescription')
                });
                return true;
            });

            log.debug('DEBUG runItemDescSrch', `itemsInfoArr ${JSON.stringify(itemsInfoArr)}`);

            return itemsInfoArr; 

        
        } catch (error) {
            log.error('ERROR runItemDescSrch', error);
            return false;
        }
    }


    return {
        onRequest
    };
});
