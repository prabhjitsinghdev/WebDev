/*******************************************************************
*
*
* Name: MapReduce_SS2_myTest.js
* Script Type: MapReduce Script
* Version: 0.0.2
*
*
* Author: pj92singh 
* Prabhjit Singh 
* Purpose:  testing map/reduce script
* running a serach and with the data set given we can manipulate records
* and process it efficiently using lookUp fields and SubmitFields 
*
*
* ******************************************************************* */
/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record'],
    function (search, record) {

        function InputData() {
            log.debug({ title: 'DEBUG', details: 'load search' });
            try {
                //load bob search
                var searchSO = search.load({
                    id: 21
                });
                // var resultSet = searchSO.run();
                return searchSO;
            } catch (error1) {
                log.debug({ title: 'catch1', details: 'load search fail/run fail: ' + error1 });
            }

        }
        //map function will take the data and
        //preform a task
        //map is triggered everytime for each key value pair it gets
        //and set custom field on salesrecordtest
        function map(context) {
            log.debug({ title: 'DEBUG', details: 'map function' +' JSON context: ' +JSON.stringify(context)});
            //JSON map parse stuff
            try {
                var rec = context.value;
                log.debug({ title: 'DEBUG', details: 'rec: ' + rec });
                var rec1 = JSON.parse(rec); 
                log.debug({ title: 'DEBUG', details: 'rec1: ' + rec1 });
                var recID = rec1.id;
                var recType = rec1.recordType; 
                log.debug({ title: 'DEBUG', details: 'recID: ' +recID +' recType: ' +recType });


                //if rec and id are not empty set the custom field
                if(rec1 != null || rec1 != 'undefiend'){
                    if(recID != null && recType != null){
                        var custRichText = search.lookupFields({
                            type: search.Type.SALES_ORDER,
                            id: recID,
                            columns: ['custbody90']
                        });

                        var custRichText1 = custRichText + ' :added through myTest M/R script: '; 

                        //submit custombody field
                        var id = record.submitFields({
                            type: record.Type.SALES_ORDER,
                            id: recID,
                            values: {
                                custbody90: custRichText1   
                             },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields : true
                            }
                        });
                    }
                }
            } catch (error2) {
                log.debug({ title: 'catch1', details: 'map fail: ' + error2 });
            }
        }
        //testing reduce function with the data set it gets
        //invoked one time for each unique key
        function reduce(context){
            log.debug({ title: 'DEBUG', details: 'reduce function' +' JSON context: ' +JSON.stringify(context)});

        }
        return {
            getInputData: InputData,
            map: map,
            reduce: reduce
        }
    });