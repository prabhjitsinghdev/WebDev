/*******************************************************************
*
*
* Name: UE_SS2_Reprint_PDF.js 
* Script Type: UserEvent Script
* Version: 1.0.0
*
*
* Author: Prabhjit Singh 
* Purpose: UE script for testing to set custom field on record
* this will notify on the PDF if the PDF was printed or reprinted
* and is a helpful tool to track if users are repriting the PDF/record
*
************updates from test *******************
* testing in other context => beforeload//beforesubmit//aftersubmit
* so far only beforeload does anything on the refresh
*
* ******************************************************************* */
/**
*@NApiVersion 2.x
*@NScriptType UserEventScript
*/
define (['N/record', 'N/render'], function(record, render){
	function beforeLoad(context){
      log.debug({title: 'DEBUG', details: 'scriptcontext before IF statement:' +context});
      // +'JSON :: ' +context});
      		try{
      			//do print work needed for printing 
      			doPrintWork(context);
              /* thinking about adding a button and then firing a script to print. Using render>> 
              doens't work// keeps looking the pdf and re-running script 
              */
						/*
                        var rec = record.load({
							type:record.Type.SALES_ORDER,
							id: 4606,
                          isDynamic: true
						});
		       			rec.addButton({
	 							id: 'custpage_pdf_noah',
				 				label: 'Create PDFFF Noah',
				 				functoinName: 'createReturn'
		 			});
                    */
       		}catch(error2){

					   log.debug({
						   title: 'Catch',
						   details: 'error2: ' +error2
					   });
       		}
			
	}
	function beforeSubmit(context){
		 log.debug({title: 'DEBUG', details: 'BEFORE SUBMIT ::: scriptcontext:' +'JSON :: ' +context});// +JSON.stringify(context)});

		//doPrintWork(context); 
	}
	function afterSubmit(context){
		 log.debug({title: 'DEBUG', details: 'AFTER SUBMIT *** scriptcontext:' +'JSON :: ' +context});// +JSON.stringify(context)});

	}	
	function doPrintWork(context){

			if(context.type == context.UserEventType.PRINT){
              log.debug({title: 'DEBUG', details: 'scriptcontext:' +'JSON :: ' +context});// +JSON.stringify(context)});
              try{
				var recID = record.id;
				var recType = record.type;
				/*log.debug({
					title: 'Debug',
					details: 'recID: ' +recID + '-recTYPE: ' +recType 
				});
				*/
              }catch(error1){
 				log.debug({ title: 'Catch', details: 'error1: ' +error1 +'JSON error: ' +JSON.stringify(error1)});
              }

				   try{
						var rec = record.load({
							type:record.Type.SALES_ORDER,
							id: 4606
						});
						var reprinted = rec.setValue({
							fieldId: 'custbody100',
							 value:  'Reprinted'
						});
						log.debug({
						   title: 'Catch',
						   details: 'reprinted: ' +reprinted 
					   });
                     var getreprinted = rec.getValue({fieldId: 'custbody100'});
                     log.debug({title: 'DEBUG', details: 'getprinted: '+getreprinted});
						rec.save({});
						//render doesn't work for some reason
						//keeps looping the pdf and re-runing the script 
						//don't try this for now 
                     /*
                     var transactionFile = render.transaction({
                        entityId: 4606,
                        printMode: render.PrintMode.PDF,
                        inCustLocale: true
                      });
                      */
              		return;
					   
				   }catch(error){

					   log.debug({
						   title: 'Catch',
						   details: 'error: ' +error 
					   });
				   }
			   
			}else if(context.type != context.UserEventType.PRINT){
				log.debug({title: 'DEBUG', details: 'NOT PRINT context THEREFORE DO NOTHING!!'});
                return; 
			}
	}

	return{
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	}	
});