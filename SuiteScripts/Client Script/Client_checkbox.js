/*******************************************************************
*
*
* Name: Client Checbox checker
* Script Type: Client Script
* Version: 1.0.0
*
*
* Author: pj92singh
Prabhjit Singh 

* Purpose: This script checks value of custom field (checkbox type) 
* Then based on the value it will allow the access of the record
* else alert and lock the record
*
* ******************************************************************* */


/**
 * @NApiVersion 2.x
 *@NScriptType ClientScript
 *
 */
define(['N/currentRecord', 'N/search', 'N/runtime', 'N/ui/message'],
	 function(currentRecord, search, runtime, message){
	 	function checkBoxcheck(scriptcontext){
		//on the current record 
		//get the entity and check that entity 
		alert('start of checkboxx script'); 
		var crec = currentRecord.get();
		

		
		//use lookupfield 
		try{
			if (custEntity != null){
					var custEntity = crec.getValue({ fieldId: 'entity'}); 
					//console
					log.debug({ title: 'DEBUG', details: 'entity: ' +custEntity});
					//log it 
					try{
						var createdFromField = crec.getValue({ fieldId: 'createdfrom'});
						//console
						log.debug({ title: 'DEBUG', details: 'createdfrom: ' +createdFromField});
					}catch(error){
						log.debug({title: 'DEBUG', details: 'createdfrom catch error'}); 
					}
			        var customerField = search.lookupFields({
			            type: search.Type.CUSTOMER,
			            id: custEntity,
			            columns : [ 'custentity14']
			        });
			        /*
			        original 
			         var customerField = search.lookupFields({
			            type: search.Type.CUSTOMER,
			            id: custEntity,
			            columns : [ 'custentity14']
			        });
					 var checkboxx = customerField.custentity14; 
			         */
			        var checkboxx = customerField.custentity14.value;

			        log.debug({ title: 'DEBUG', details: 'cheboxx status: ' +checkboxx});

			        //if option to create or not create the record 
			        if(checkboxx == true){
			            var envyType = runtime.envType; 
			            var cType = runtime.ContextType;


			           //console
			           log.debug({ title: 'DEBUG', details: 'envType: ' +envyType +'cType: ' +cType});

			            //also check context
			            if(scriptcontext == 'CREATE' || scriptcontext == 'EDIT' || createdFromField == undefined || createdFromField != null){
			            	//let the create the invoice
			            
			            }else{
			            	//allowed
			            	//console
			            	log.debug({ title: 'DEBUG', details: 'cust: ' +custEntity +' allowed!'}); 
			            }

			        }
			        //elsee if the checkboxx is fals 
			        //don't let them create the record
			        else if(checkboxx == false){
			        		if(scriptcontext == 'CREATE' && createdFromField == undefined){
			        			 //console
			        			 log.debug({ title: 'DEBUG', details: 'cust: ' +custEntity +' allowed in condtion 2'}); 
			        		 	//allow only if stand alone invoice 
			        		}else{
			            		//don't let them create the record
			            		//console
			            		log.debug({ title: 'DEBUG', details: 'cust: ' +custEntity + ' condtion2 not allowed!'}); 
			            	 var notAllowedMessage = message.create({
					            title: "NOT ALLOWED", 
					            message: "Customer: " +custEntity +' not allowed!!', 
					            type: message.Type.WARNING
					        });

        					notAllowedMessage.show(); 
        				}
			            	

			        }
			    }//end if custEntity != null 
        //endcatch
        }catch(error){
        		log.debug({ title: 'DEBUG', details: 'catch error!!!'}); 

        }

    }
    /* Validate field function 
    -check the script context & check what entity is being inputted
    -depending on that you can warn/alert the user 
    -then not save the record 
    */
    function validateCustomer(scriptcontext, crec, custEntity, createdFromField){
    	//also check the customer when field is changed
    	log.debug({ title: 'DEBUG', details: '>> fieldValidate function<< '});
    	var validateContext = scriptcontext.fieldId;
    	 log.debug({ title: 'DEBUG', details: '>> fieldValidate context ' +validateContext});

    	//var custEntity = crec.getValue({ fieldId: 'entity'}); 
    	//if(scriptcontext.fieldId == 'entity'){
		    	try{
					//if (custEntity != null){
						
							var crec = currentRecord.get();
							var custEntity = crec.getValue({ fieldId: 'entity'}); 
							var createdFromField = crec.getValue({ fieldId: 'createdfrom'});
							log.debug({ title: 'DEBUG', details: 'createdfrom in validate: ' +createdFromField});
						
					        var customerField = search.lookupFields({
					            type: search.Type.CUSTOMER,
					            id: custEntity,
					            columns : [ 'custentity14']
					        });
			        		var checkboxx = customerField.custentity14;
					        //var supervisor = customerField.supervisor[0].text;
					        //console
					        log.debug({ title: 'DEBUG', details: 'cheboxx status: ' +checkboxx});

					        //alert('chekbox: ' +email +'supervisor: ' +supervisor); 


					        //if option to create or not create the record 
					        if(checkboxx == true){
					            var envyType = runtime.envType; 
					            var cType = runtime.ContextType;


					           //console
					           log.debug({ title: 'DEBUG', details: 'envType: ' +envyType +'cType: ' +cType});

					            //also check context
					            if(scriptcontext == 'CREATE' || scriptcontext == 'EDIT' || createdFromField == undefined || createdFromField != null){
					            	//let the create the invoice
					            	log.debug({ title: 'DEBUG', details: 'cust: ' +custEntity +' condtion 1 allowed!'}); 
					            	//alert 
					            	var allowedInfoMessage = message.create({
						                title: "Allowed", 
						                message: "Customer " +custEntity + " is allowed.", 
						                type: message.Type.INFORMATION
						            });

						            allowedInfoMessage.show();
						            setTimeout(allowedInfoMessage.hide, 10000);
					            
					            }else{
					            	//allowed
					            	//console
					            	log.debug({ title: 'DEBUG', details: 'cust: ' +custEntity +' condtion 1 not allowed!'}); 
					            }

					        }
					        //elsee if the checkboxx is fals 
					        //don't let them create the record
					        else if(checkboxx == false){
					        		if(scriptcontext == 'CREATE' && createdFromField == undefined){
					        			 //console
					        			 log.debug({ title: 'DEBUG', details: 'cust: ' +custEntity +' Allowed in condtion 2'}); 
					        		 	//allow only if stand alone invoice 
					        		}else{
					            		//don't let them create the record
					            		//console
					            		log.debug({ title: 'DEBUG', details: 'cust: ' +custEntity +' Not allowed in condtion 2 !'}); 

								         var notAllowedMessage = message.create({
								            title: "NOT ALLOWED", 
								            message: "Customer: " +custEntity +' not allowed!!', 
								            type: message.Type.WARNING
								        });

			        					notAllowedMessage.show(); 
			        					setTimeout(notAllowedMessage.hide, 10000);
						            	
					            	}

					        }
					   //}//end if custEntity != null 
		        //endcatch
		        }catch(error){
		        	log.debug({ title: 'DEBUG', details: 'catch error!!!'}); 

		        }
		   // }//end of main if 
		    

    }
    //save record function
    function saveRecord(checkboxx, createdFromField){
    	if(checkboxx == false || createdFromField == null){
    		//cannot save record
    		return false;
    	}else if(checkboxx == true || createdFromField != null){
    		return true; 
    	}
    }
    //end of save record function 
    return{
    	pageInit: checkBoxcheck,
    	validateField: validateCustomer,
    	saveRecord: saveRecord
    }

}); 
