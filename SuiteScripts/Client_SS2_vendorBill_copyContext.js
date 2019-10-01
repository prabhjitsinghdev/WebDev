/*******************************************************************
*
*
* Name: Client_SS2_vendorBill_copyContext.js
* Script Type: ClientScript
* Version: 0.0.1
*
*
* Author: Prabhjit Singh
* pj92singh
* Purpose: Inactive Vendor > Make Copy of Vendor Bill > Show warning message
*
* script runs on vednor bills/payment 
* **** if bill is not stand alone then the system treats it as a copy 
* so the script will execute in that context as well ****
* ******************************************************************* */
 /**
 * @NApiVersion 2.x
 *@NScriptType ClientScript
 *
 */
 define(['N/record', 'N/currentRecord', 'N/ui/message', 'N/ui/dialog'],
	function(record, currentRecord, message, dialog){
		function pageInit(context){
			log.debug({title: 'DEBUG', details: 'CLIENT SS2' +'context ' +context +'JSON ' +JSON.stringify(context)}); 
			if(context.mode == 'create'){	
					//get record?!?!	
					//
					//new record
					var recID = record.id;
					var recType = record.type;
                    log.debug({title: 'DEBUG', details: 'id//type: ' +recID +' // ' +recType}); 
                     //alert-------------------------------
                        dialog.alert({
                            title: 'Alert',
                            message: 'being made originally!' 
                        });				
        }
        //in copy mode!!! 
        if(context.mode =='copy'){
            log.debug({title: 'DEBUG', details: 'copy mode'}); 
            //alert-------------------------------
            dialog.alert({
                title: 'Alert',
                message: 'being made in copy!' 
            });
            //alert--end--------------------------
        }
	}
		return{
			pageInit: pageInit

		}
	});