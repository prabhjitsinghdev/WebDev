/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 * @author prabhjitsinghdev
 *
 *  Remarks
 *  MR_CreateCSV.js
 * Using a saved search we will extract certain information,
 * then look up other information with supporting searches and build the 
 * csv file which will be put in a specific folder 
 *
 */
define([
    'N/runtime',
    'N/file',
    'N/search',
    'N/log'
], (runtime, file, search, log) => {

    const getInputData = (context) => {
        try {
            const script = runtime.getCurrentScript();
            const params = {
                search_id: script.getParameter('custscript_acs_mr_ss'),
                file_folder: script.getParameter('custscript_acs_file_folder_id')
            };
            log.debug({ title: 'DEBUG search', details: params.search_id });
            if (!params.search_id) {
                log.error({ title: 'ERROR missing search', details: `Search is required.` });
                return;
            }
            const loadedSearch = search.load({
                id: params.search_id
            });

            return loadedSearch;

        } catch (error) {
            log.error({ title: "ERROR getInput", details: error });

        }

    }
    const map = (context) => {
        try{
            //log.debug({ title: 'DEBUG map context', details: `Map value ${JSON.stringify(context.value)}` });
            const data = JSON.parse(context.value); 
            //log.debug('DEBUG map', `data ${data} // JSON ${JSON.stringify(data)}` );
            const valuesObj = data.values; 
            let rowData = '';
            let tempDataObj = {};
            //log.debug('DEBUG valuesObj', `valuesObj ${valuesObj} // JSON ${JSON.stringify(valuesObj)}`);
            
            //log.debug('DEBUG other way', `GROUP(checkdate) ${valuesObj["GROUP(checkdate)"]}`); 
            const empId = valuesObj["GROUP(internalid.employee)"]["value"] || ''; 
            //const empId = valuesObj.getValue({ name: 'employee', summary: 'GROUP' }); 
            log.debug('DEBUG empId', `empId ${empId}` );
            if(empId){
                tempDataObj.id = empId; 
            }
            const checkDate = valuesObj["GROUP(checkdate)"] || ''; 
            log.debug('DEBUG checkDate', `checkDate ${checkDate}` );
            if(checkDate){
                tempDataObj.date = checkDate; 
            }
            const address = valuesObj["GROUP(address1.employee)"] || ''; 
            log.debug('DEBUG address', `address ${address}` );
            if(address){
                tempDataObj.address = address; 
            }
            const address2 = valuesObj["GROUP(address2.employee)"] || ''; 
            const city = valuesObj["GROUP(city.employee)"] || ''; 
            const state = valuesObj["GROUP(state.employee)"]["value"] || ''; 
            const zipCode = valuesObj["GROUP(zipcode.employee)"] || '';
            const birthDate = valuesObj["GROUP(birthdate.employee)"] || '';
            const hireDate = valuesObj["GROUP(hiredate.employee)"] || ''; 
            const terminateDate = valuesObj["GROUP(releasedate.employee)"] || ''; 
            const reHireDate = valuesObj["GROUP(custentity1.employee)"] || '';
            const empStatus = valuesObj["GROUP(employeestatus.employee)"]["text"] || ''; 

            //rowData.push(tempDataObj);
            log.audit('AUDIT map', `tempDataObj ${JSON.stringify(tempDataObj)}`); 
            rowData = `${empId}, ${checkDate}, ${address}, ${address2}, ${city}, ${state}, ${zipCode}, ${birthDate}, ${hireDate}, ${terminateDate}, ${reHireDate}, ${empStatus}` + '\r\n';
            log.audit('ADUIT rowData map', `rowData ${rowData}`); 
            context.write({ key: 'data', value: rowData });
            

        }catch(error){
            log.error('ERROR map', error ); 
        }
    }

    

    const summarize = (context) => {
        try {
            const script = runtime.getCurrentScript();
            const params = {
                file_folder: script.getParameter('custscript_acs_file_folder_id')
            };
            const folderID = params.file_folder; 
            let type = context.toString();
            log.audit(type + 'SUMMARY Usage Consumed', context.usage);
            log.audit(type + 'SUMMARY Concurrency Number ', context.concurrency);
            log.audit(type + 'SUMMARY Number of Yields', context.yields);
            let fContents = `Employee ID, Check Date, Address1, Address2, City, State, ZipCode, Date of Birth, Hire Date, Date of Termination, ReHire Date, Employee Status` + '\r\n';
            context.output.iterator().each((key, value) => {
                fContents += value;
                return true;
            });
            log.audit('AUDIT SUMMARIZE', `fContents isempty ${isEmpty(fContents)}`);
            if (!isEmpty(fContents)) {
                createCSVFile(fContents, folderID);
            }


        } catch (e) {
            log.error({ title: 'ERROR summarize stage', details: e });
        }

    }

    const createCSVFile = (data, folderID) =>{
        try {
            let unique = new Date();
            const fileObj = file.create({ 
                name: `testcsv_${unique}_new`,
                contents: data,
                fileType: file.Type.CSV,
                folder: folderID
            });
            const fileID = fileObj.save();
            log.audit('ADUIT saved file', `fileID ${fileID} `); 

        } catch (error) {
            log.error('ERROR createCSVFile', error );
        }
    }

    const isEmpty = (stValue) => {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    };


    return {
        getInputData,
        map,
        summarize
    }
});
