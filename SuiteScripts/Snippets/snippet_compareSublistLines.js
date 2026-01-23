
require(['N/log', 'N/record', 'N/currentRecord'], function (log, record, currentRecord) {

    const oldLineItems = [{ "line": "2", "item": "4408", "amount": 330.24, "rate": 330.24 }, { "line": "1", "item": "4408", "amount": 2395.92, "rate": 2395.92 }];
    const newLineItems = [{ "item": "4408", "amount": 660.48, "rate": 330.24 }];
    const newRec = currentRecord.get();
    try {
        console.log('comapreLineItems start', 'starting the function to comapre lines');
        for (var i = 0; i < oldLineItems.length; i++) {
            for (var j = 0; j < newLineItems.length; j++) {
                oldLineItems[i]['item'] == newLineItems[j]['item']
                if (oldLineItems[i]['item'] == newLineItems[j]['item'] && oldLineItems[i]['line'] == newLineItems[j]['line']) {
                    if (oldLineItems[i]['amount'] != newLineItems[j]['amount']) {
                        //add the old amount to custom field 
                        newRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_acs_org_amount',
                            line: j,
                            value: oldLineItems[i]['amount']
                        });
                        console.log('Line Item Changed', 'Item: ' + oldLineItems[i]['item'] + ' // Old amount: ' + oldLineItems[i]['amount'] + ' // New amount: ' + newLineItems[j]['amount']);
                    }
                    if (oldLineItems[i]['rate'] != newLineItems[j]['rate']) {
                        newRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_acs_org_rate',
                            line: j,
                            value: oldLineItems[i]['rate']
                        });
                        console.log('Line Item Changed', 'Item: ' + oldLineItems[i]['item'] + '  // Old Rate: ' + oldLineItems[i]['rate'] + ' // New Rate: ' + newLineItems[j]['rate']);
                    }
                }
            }
        }
    } catch (error) {
        console.log('ERROR comapreLineItems', error);

    }



});