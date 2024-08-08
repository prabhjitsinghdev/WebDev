/**
* @author prabhjitsinghdev 
*
* There are 2 versions of this snippet 
* 1) First version will just give a predefined set of sublist values 
*
* 2) Second version will take in an arry of field names as a thrid parameter to then return the values of those fields
*
*
**/
/* ******* VERSION 1 below that takes an array of fld values to run through ********** */
require(["N/search", "N/currentRecord", "N/ui/dialog", "N/runtime"], (
    search,
    currentRecord,
    dialog,
    runtime
  ) => {

    const getLineItems = (recordObj, sublistName) => {
        try {
            const lineItemArr = [];
            if (!recordObj) { return false; }
            const lineCount = recordObj.getLineCount({
                sublistId: sublistName
            });
            for (let x = 0; x < lineCount; x++) {
                let tempObj = {};
                let pulledItem = recordObj.getSublistValue({
                    sublistId: sublistName,
                    fieldId: 'item',
                    line: x
                });
                tempObj.item = pulledItem;
                let pulledQty = recordObj.getSublistValue({
                    sublistId: sublistName,
                    fieldId: 'quantity',
                    line: x
                });
                tempObj.quantity = pulledQty;
                let pulledAmnt = recordObj.getSublistValue({
                    sublistId: sublistName,
                    fieldId: 'amount',
                    line: x
                });
                tempObj.amount = pulledAmnt;
                let pulledLocation = recordObj.getSublistValue({
                    sublistId: sublistName,
                    fieldId: 'location',
                    line: x
                });
                tempObj.location = pulledLocation;
                lineItemArr.push(tempObj);

                console.log("DEBUG getLineItems", `print obj ${JSON.stringify(tempObj)}`);
            }
            console.log("DEBUG getLineItems", `length: ${lineItemArr.length} and lineItemArr ${lineItemArr}`);

            return lineItemArr;

        } catch (error) {
            console.log({ title: 'ERROR getLineItems', details: error });
        }
    }
  
    console.log('DEBUG getting line information');
    const cRec = currentRecord.get(); 
    getLineItems(cRec, 'item');

    
    
  });

/* ******* VERSION 2 below that takes an array of fld values to run through ********** */
require(["N/search", "N/currentRecord", "N/ui/dialog", "N/runtime"], (
    search,
    currentRecord,
    dialog,
    runtime
) => {

    const getLineItems = (recordObj, sublistName, fldsArr) => {
        try {
            const lineItemArr = [];
            if (!recordObj) { return false; }
            const lineCount = recordObj.getLineCount({
                sublistId: sublistName
            });
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

    console.log('DEBUG getting line information version 2');
    const cRec = currentRecord.get();
    getLineItems(cRec, 'item', ['item', 'quantity']);

});


  
