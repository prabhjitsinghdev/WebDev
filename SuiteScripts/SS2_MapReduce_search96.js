/* 
pj92singh
Prabhjit Singh 

Map/reduce script example 
-referring to search 96 in test account 
-then retrive related fields and return appropriate data

*/

/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript 
 */
//2nd map reduce for custom 15 saved serach 
 define(['N/search'], 
 	function(search){

 		function getInputData(){

 			return{
 				type: 'search',
 				id: 96
 		}
 		}
 		function map(context){
 			log.debug({ 
 				title: 'DEBUG',
 				details: context
 				});
			

 			//key stuff
 			var key = context.key;
 			var recobj = JSON.parse(context.value); //gettting object
 			var trandate = recobj.values.trandate;
 			var transactionnumber = recobj.values.transactionnumber;
 			var salesrepName = recobj.values.salesrep.text;
			var salesrepID = recobj.values.salesrep.value;
 			var salesrepSupID = recobj.values['supervisor.salesRep'].value;
 			var salesrepSupName = recobj.values['supervisor.salesRep'].text; 
 			log.debug({ 
 				title: 'DEBUG',
 				details: 'rec obj: ' +recobj
 			});
 			//now break that down more
 			var salesrep = recobj.values.salesrep; 
 			log.debug({ 
 				title: 'DEBUG',
 				details: 'salesrepName: ' +salesrepName
 			});
 			log.debug({ 
 				title: 'DEBUG',
 				details: 'salesrepID: ' +salesrepID 				
 			});
 			log.debug({ 
 				title: 'DEBUG',
 				details: 'trandate: ' +trandate
 			});

			log.debug({ 
 				title: 'DEBUG',
 				details: 'transactionnumber: ' +transactionnumber
 			});

			log.debug({ 
 				title: 'DEBUG',
 				details: 'salesrepSupID: ' +salesrepSupID
 			});
			
			log.debug({ 
 				title: 'DEBUG',
 				details: 'salesrepSupName: ' +salesrepSupName
 			});
 			
 			

 			//now try to get supevisor's id
 			//values.values.supervisor.text??
 			var supervisorName = recobj.values.supervisor.text; 
 			log.debug({ 
 				title: 'DEBUG',
 				details: 'Supervisor Name: ' +supervisorName
 				});

 			context.write({
 				key : salesrepID,
 				value : transactionnumber
 			});
 				//update the memo of each SALES REP
 				//with this line
 				//the sales orders under your name are: " "


 		}
 		function reduce(context){
 			log.debug({ 
 				title: 'DEBUG',
 				details: 'reduce: ' +context
 			});


 		}

 		return{
 			getInputData: getInputData,
 			map: map,
 			reduce: reduce
 		}
 		
 });