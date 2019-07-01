/*
pj92singh
Prabhjit Singh 

SUITElet which creates a message record between employee and customer
-the script will then redirect to the message record when created
 */
/**
 * @NApiVersion 2.x
 * @NScriptType suitelet
*/
define(['N/record', 'N/ui/dialog', 'N/redirect'], function(record, ui, redirect){

	/*making suitelet for testing message record 
	and setting the CC sublist values 
	*/
	function onRequest(){
		log.debug({
			title: 'dEBUG',
			details: '>>starting suitelet<<'
		});
		var mesRec = record.create({
			type: record.Type.MESSAGE,
			isDynamic: false
		});
		//set values for the fields 
		mesRec.setValue({
			fieldId: 'authoremail',
			value: 'testing1@netsuite.com'
		});
		mesRec.setValue({
			fieldId: 'recipientemail',
			value: 'testing2@netsuite.com'
		});
		mesRec.setValue({
			fieldId: 'subject',
			value: 'SS2.0 Suitelet Message'
		});
		mesRec.setValue({
			fieldId: 'message',
			value: 'test email made via 2.0 suitelet for case testing'
		});
		//get sublist

		var ccsub_list = mesRec.getSublist({
			sublistId: 'ccbcclist '
		});
		log.debug({
			title: 'dEBUG',
			details: 'sublist: ' +ccsub_list
		});
		try{
			var lineNum = mesRec.selectNewLine({
			    sublistId: 'ccbcclist'
			});
				log.debug({
					title: 'dEBUG',
					details: 'new line: ' +lineNum
				});
				/*
				mesRec.selectNewLine({
	            	sublistId: 'ccbcclist'
	       		});*/
				mesRec.setCurrentSublistValue({
						sublistId: 'ccbcclist',
						fieldId: 'cc',
						value: false
					});
				log.debug({
					title: 'dEBUG',
					details: 'cc false'
				});
				mesRec.setCurrentSublistValue({
						sublistId: 'ccbcclist',
						fieldId: 'bcc',
						value: true
					});
				log.debug({
					title: 'dEBUG',
					details: 'bcc true'
				});
					mesRec.setCurrentSublistValue({
						sublistId: 'ccbcclist',
						fieldId: 'email',
						value: 'machan1@netsuite.com'
					});
				log.debug({
					title: 'dEBUG',
					details: 'mchan email'
				});

				mesRec.commitLine({
						sublistId: 'ccbcclist'
				});
				log.debug({
						title: 'dEBUG',
						details: 'end of setting all values'
				});
			}catch(error){
					log.debug({
						title: 'DEBUG',
						details: 'catch error' 
					});
			}
		//submit record
		var messREC_ID = mesRec.save();
		log.debug({
			title: 'DEBUG',
			details: 'finished rec ID: ' +messREC_ID
		});
		alert('message created' +messREC_ID);

	//----------------------------------
      //redirect code
         log.debug({
			title: 'Debug',
            details: 'redirect:start'
		});
        redirect.toRecord({
          type : record.Type.MESSAGE,
          id : messREC_ID
    	});
        log.debug({
			title: 'Debug',
            details: 'redirect:end**'
		});
      //end of redirect code
      //-----------------------------------------------
	}
	return{
		onRequest: onRequest
	}


});