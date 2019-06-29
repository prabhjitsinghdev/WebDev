//SS1.0 
/* 
pj92singh
Prabhjit Singh 

RESTlet ss1.0 takes in the JSON data paramters 
And using the post function it will
create a record and checks if sales order then adds line item 

*/
function postRESTlet(datain) {
	// body...
	nlapiLogExecution('DEBUG', 'post function', 'POST');

    try{
    	var record = nlapiCreateRecord(datain.recordtype);

    	record.setFieldValue('entityid', datain.entityid);
        record.setFieldValue('companyname', datain.companyname);
        record.setFieldValue('email', datain.email);
        //record.setFieldValue('subsidiary', datain.subsidiary);
        record.setFieldValue('memo', datain.memo);  

        	//checking JSON data-in for SalesOrder recrody type
            if (datain.recordtype == 'salesorder')
            {
                record.setFieldValue('customer', datain.entityid);
                record.setFieldValue('subsidiary', datain.subs);
                nlapiLogExecution('DEBUG', 'rec = salesorder', 'addingline item');
                var item1 = datain.item.id;
                nlapiLogExecution('DEBUG', 'item1', 'item1:: '+item1);
                var item1_qty = datain.item.quantity;
                nlapiLogExecution('DEBUG', 'item1_qty', 'item1_qty:: '+item1_qty);

                var line1 = nlapiSelectLineItem('item', 1);
                record.setCurrentLineItemValue('item', 'item', item1);
                record.setCurrentLineItemValue('item', 'quantity', item1_qty);
                record.commitLineItem('item');

            }


        var recordId = nlapiSubmitRecord(record);
        nlapiLogExecution('DEBUG', 'id='+recordId);

        var nlobj = nlapiLoadRecord(datain.recordtype, recordId);

    }catch(error){
        nlapiLogExecution('DEBUG', 'catch error', 'error: ' +error);
    }

    return nlobj;

}