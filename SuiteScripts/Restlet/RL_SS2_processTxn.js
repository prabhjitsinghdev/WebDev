/**
* @NApiVersion 2.1
* @NScriptType Restlet
* @NModuleScope Public

*/
define([
    'N/record',
    'N/log',
    'N/search'
], (record, log, search) => {

    const acceptedPayments = ["CreditCard", "ACH", "Cheque"];

    const onPost = (context) => {
        try {
            //get the payload first 
            const payload = context.payload;
            if (payload.length > 0 || payload != undefined) {
                verifyPayload(payload);
            }

        } catch (error) {
            log.error({ title: "ERROR onPost", details: `error ${error}` });
        }
    }
    const verifyPayload = (payload) => {
        try {
            Object.keys(payload).forEach((segment) => {
                if (segment.type == "salesorder") {
                    //check if payment is prepaid
                    if (segment.values["paymenttype"] == "prepaid") { 
                        return;
                    }else if(acceptedPayments.includes(segment.type)){
                        buildRecord(segment);
                    }
                }
            });
        } catch (error) {
            log.error({ title: "ERROR verifyPayload", details: error });
        }
    }
    const buildRecord = (data) => {
        try {
            const newRec = record.create({
                type: data.type,
                isDynamic: false
            });
            Object.keys(data).forEach((fields)=>{
                if(data[fields] !== "items"){
                    newRec.setValue({ fieldId: data[fields], value: data[fields][value] });
                }else{
                    let sublistLen = data[fields]["items"].length; 
                    for(let x = 0; x < sublistLen; x++){
                        let tempItemObj = data[fields]["items"];
                        Object.keys(tempItemObj).forEach((itemField) =>{ 
                            newRec.setSublistValue({ sublistId: "item", fieldId: tempItemObj[itemField], value: tempItemObj[itemField][value] });
                        });
                    }
                }
            });
            const savedRec = newRec.save();
            log.audit({ title:'AUDIT savedRecord', details: savedRec });
           
        } catch (error) {
            log.error({ title: "ERROR buildRecord", details: error });
        }
    }
    return {
        onPost
    }

});
