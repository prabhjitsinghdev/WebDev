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

    const onPost = (context) => {
        try {
            //get the payload first 
            const payload = context.payload;
            if(payload.length > 0 || payload != undefined){
                verifyPayload(payload);
            }
            
        } catch (error) {
            log.error({ title: "ERROR onPost", details: `error ${error}`});
        }
    }
    const verifyPayload = (payload) => {
        try {
            Object.keys(payload).forEach((segment)=>{
                if(segment.type == "salesorder"){
                    //check if payment is prepaid
                    if(segment.values["paymenttype"] == "prepaid"){return;}
                }
            });
        } catch (error) {
            log.error({ title:"ERROR verifyPayload", details: error });
        }
    }
    return{
        onPost
    }
    
});
