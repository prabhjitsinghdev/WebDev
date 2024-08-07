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
  
