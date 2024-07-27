define(['N/record', 'N/search', 'N/runtime'], (record, search, runtime)=>{
  /***
  ** Returns an Arry of Objects with the line and some information
  **/
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

  
  /** Generic limited serach builder 
  *
  */
  const genericLimitedSearch = (searchFilters, searchColumns, searchType, rangeLimit) => {
    try{
      /*
      //How the filters and columns should look like when being passed through 
      
      const filters = [
        ['customer.internalid', 'anyof',  customer], "AND",
        ["type", "anyof", "CustInvc"],
        "AND",
        ["mainline", "is", "T"],
        "AND",
        ["trandate", "onorafter", formatedDate],
      ];
      const columns = [
        { name: "ordertype", sort: search.Sort.ASC },
        { name: "trandate" },
        { name: "tranid" },
        { name: "account" },
        { name: "amount" },
        { name: "entity", join: "createdfrom" },
      ];
      */
      if(searchFilters && searchColumns && searchType){
        if(!NaN(rangeLimit)){
          const builtSearch = search.create({
              type: searchType,
              filters: searchFilters,
              columns: searchColumns,
          });
          const ranSearch = builtSearch.run().getRange(0, rangeLimit).map((result) => {
                    console.log(`DEBUG result ${JSON.stringify(result)}`);
                  });
        }
      }
      
    }catch(e){
      log.error('ERROR running Search', e );
    }
  }


  return{
    getLineItems
  }
});

