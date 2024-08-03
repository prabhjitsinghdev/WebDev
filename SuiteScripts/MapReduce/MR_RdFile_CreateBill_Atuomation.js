/**
 * MR script to read a csv file -- extract the data then create the related Vendor Bill record 
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 *
 * Version     Author              Remarks
 * 1.00       Prabhjit Singh      MR_RdFile_CreateBill_Atuomationjs
 *
 */

define(['N/runtime', 'N/file', 'N/record', 'N/log'],
    (runtime, file, record, log) => {
    'use strict';

    /**
     *
     * Marks the beginning of the script’s execution. The purpose of the input stage is to generate the input data.
     * Executes when the getInputData entry point is triggered. This entry point is required.
     *
     * @param inputContext = { isRestarted: boolean, ObjectRef: { id: [string | number], type: string} }
     * @returns {Array | Object | search.Search | inputContext.ObjectRef | file.File Object}
     */
    const getInputData = (inputContext) => {
        try{
            const script = runtime.getCurrentScript();
            const params = {
                file_folder: script.getParameter('custscript_acs_file_folder_id'),
                file_id: script.getParameter('custscript_acs_csv_file_id')
            };
            log.debug({ title: 'DEBUG script paramters', details: `file_folder ${params.file_folder}, file_id ${params.file_id}`});
            if(!params.file_folder){
                log.audit('AUDIt getInputData', `Missing file folder ID`);
                return;
            }
            if(!params.file_id){
                log.audit('AUDIt getInputData', `Missing excel file ID`);
                return;
            }

            return [params.file_id];

        }catch (e) {
            log.error('getInputData error', e);
        }
    }


    /**
     *
     * Executes when the map entry point is triggered.
     * The logic in your map function is applied to each key/value pair that is provided by the getInputData stage.
     * One key/value pair is processed per function invocation, then the function is invoked again for the next pair.
     * The output of the map stage is another set of key/value pairs. During the shuffle stage that always follows,
     * these pairs are automatically grouped by key.
     *
     * @param context = { isRestarted: boolean, executionNo: property, errors: iterator, key: string, value: string }
     */
    const map = (context) => {
        try{
            log.debug('DEBUG map', `context ${context} // context.value = ${JSON.stringify(context.value)}`);
            let csvString = '';

            const fileId = parseInt(context.value);
            log.debug('DEBUG fileID', `fileId ${fileId} // type of ${typeof fileId}`);
            if(!fileId){
                log.audit('AUDIT map', `No file Id to load // exiting`);
                return;
            }
            const fileObj = file.load({ id: fileId });
            log.debug('DEBUG map', `loaded file - now iterate // fileObj  ${fileObj}`);

            const dataArr = [];
            let iterator = fileObj.lines.iterator();
            let fileIdx = 0;
            iterator.each(function (row) {
                log.debug('DEBUG map', `row ${JSON.stringify(row)} `);
                let rowDataArray = row.value.split(',');
                const billToAccount =  convNull(rowDataArray[0]);
                log.debug('DEBUG billToAccount', billToAccount); // coll A
                const invoiceDate = convNull(rowDataArray[1]);  //Col B
                log.debug('DEBUG invoiceDate', invoiceDate);
                const invoiceNumber = convNull(rowDataArray[2]);  //Col C
                log.debug('DEBUG invoiceNumber', invoiceNumber);
                const netCharge = parseFloat(rowDataArray[3]);  //Col D NetCharge
                log.debug('DEBUG netCharge', netCharge);
                let orgCustRef = convNull(rowDataArray[4]);     //Col E
                let orgRef2 = convNull(rowDataArray[5]);     //Col F
                let orgRef3 = convNull(rowDataArray[6]); //Col G

                csvString = csvString + netCharge + '\r\n';

                var rowData = {};

                rowData.billToAccount = billToAccount;
                rowData.invoiceDate = invoiceDate;
                rowData.invoiceNumber = invoiceNumber;
                rowData.netCharge = netCharge;
                rowData.customerRef = orgCustRef;
                rowData.orgRef = orgRef2;
                rowData.orgRef3 = orgRef3;
                log.debug('DEBUG map rowData', rowData);

                dataArr.push(rowData);
                fileIdx++;

                return true;
            });

            log.audit('AUDIT row count', `row count ${idx}`);

            context.write({ key: 'rowData', value: dataArr });

            return dataArr;
        }catch (e) {
            log.error('map error', e);
        }

    }


    /**
     *
     * Executes when the reduce entry point is triggered.
     * The logic in your reduce function is applied to each key, and its corresponding list of value.
     * Only one key, with its corresponding values, is processed per function invocation.
     * The function is invoked again for the next key and corresponding set of values.
     * Data is provided to the reduce stage by one of the following:
     *  - The getInputData stage — if your script has no map function.
     *  - The shuffle stage — if your script uses a map function. The shuffle stage follows the map stage.
     *    Its purpose is to sort data from the map stage by key.
     *
     * @param context = { isRestarted: boolean, executionNo: property, errors: iterator, key: string, value: string }
     */
    const reduce = (context) => {
        try{
            log.debug('DEBUG reduce', `context ${JSON.stringify(context)} // context.value = ${JSON.stringify(context.value)}`);

            //look at the data and change antyhing 
            //then pass it over to create the bill
            createBill(context.value); 

        }catch (e) {
            log.error('reduce error', e);
        }
        //context.write({key: stSalesOrderId});
    }


    /**
     *
     * Executes when the summarize entry point is triggered.
     * When you add custom logic to this entry point function, that logic is applied to the result set.
     *
     * @param context = { isRestarted: read-only boolean, concurrency: number, dateCreated: Date, seconds: number, usage: number,
     *                           yields: number, inputSummary: object, mapSummary: object, reduceSummary: object, output: iterator }
     */
    const summarize = (context) => {
        try {
            let type = context.toString();
            log.audit(`${type} SUMMARY USAGE CONSUMED`, context.usage);
            log.audit(`${type} SUMMARY CONCURRENCY NUMBER`, context.concurrency);
            log.audit(`${type} SUMMARY NUMBER OF YIELDS`, context.yields);

        } catch (error) {
            log.error({title: 'ERROR sumarize stage', details: error});
        }
    }
    const convNull = (value) => {
        if(value == null || value == undefined)
                value = '';
            return value;
    }

    const createBill = (data) => {
        try{.
            const vendBill = record.create({
                type: record.Type.VENDOR_BILL*,
                isDynamic: false
            });
            //---- set values 

            const savedBill = vendBill.save({
                enableSourcing: false,
                ignoreMandatoryFields: true
            }); 
            log.audit('AUDIT createBill', `savedBill id: ${savedBill}`); 

            return savedBill; 

        }catch (e) {
            log.error({title: 'ERROR createBill', details: e});
        }
    }

    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});
