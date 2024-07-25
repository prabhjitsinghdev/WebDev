define(['N/record', 'N/search', 'N/runtime'], (record, search, runtime)=>{
  const getLineItems = (recordObj) => {
        try {
            const lineItemArr = [];
            if (!recordObj) { return false; }
            const lineCount = recordObj.getLineCount({
                sublistId: 'item'
            });
            for (let x = 0; x < lineCount; x++) {
                let tempObj = {};
                let pulledItem = recordObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: x
                });
                tempObj.item = pulledItem;
                let pulledQty = recordObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: x
                });
                tempObj.quantity = pulledQty;
                let pulledAmnt = recordObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'amount',
                    line: x
                });
                tempObj.amount = pulledAmnt;
                lineItemArr.push(tempObj);

                log.debug("DEBUG getLineItems", `print obj ${JSON.stringify(tempObj)}`);
            }
            log.debug("DEBUG getLineItems", `length: ${lineItemArr.length} and lineItemArr ${lineItemArr}`);

            return lineItemArr;

        } catch (error) {
            log.error({ title: 'ERROR getLineItems', details: error });
        }
    }

  return{
    getLineItems
  }
});

