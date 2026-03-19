/**
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 *
 * Version    Date          Author              Remarks
 * 1.00       17-03-2026    Prabhjit Singh      mr_moveSubFiles.js -- moving files for certain txns associated with a specific subsidiary; The saved search will return those txn's and script moves their files to a specific folder that is passed as a parameter. It will still ATTACH the files to the correct txn as well. 
 * 
 * */
define([
    'N/runtime',
    'N/record',
    'N/search',
    'N/log',
    'N/file'
], (runtime, record, search, log, file) => {

    const getInputData = (context) => {
        try {
            const script = runtime.getCurrentScript();
            const params = {
                search_id: script.getParameter('custscript_acs_mr_files_search')
            };
            log.debug({ title: 'DEBUG search', details: params.search_id });
            if (isEmpty(params.search_id)) {
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
        try {
            //log.debug('DEBUG map', `context ${JSON.stringify(context)}`);
            const script = runtime.getCurrentScript();
            const params = {
                indFolderid: Number(script.getParameter('custscript_acs_fldr_id'))
            };
            //log.debug({ title: 'DEBUG search', details: params.indFolderid });
            const txnId = context.key;
            const data = JSON.parse(context.value);
            const rectype = data.recordType;

            const valuesObj = data.values; 
            const fileName = valuesObj['name.file'];
            const fileId = valuesObj['internalid.file'].value;
            const folderId = valuesObj['folder.file'].value;
            log.debug('DEBUG map file details', `fileName ${fileName} // fileId ${fileId} // folderId ${folderId}`);
            if(folderId !== params.indFolderid){
                moveFile(fileId, txnId, rectype);
            }

            context.write({key: 'Moved file', value: fileId });

        } catch (error) {
            log.error('ERROR map', error);
        }
    }

    const summarize = (context) => {
        try {
            let type = context.toString();
            log.audit('SUMMARIZE usage consumed', `SUMMARY Usage Consumed ${context.usage} `);
            log.audit('SUMMARIZE Concurrency Number', `SUMMARY Concurrency Number ${context.concurrency} `);
            log.audit('SUMMARIZE Number of Yields', `SUMMARY Number of Yields ${context.yields} `);
            let totalfilesMoved = 0, failedEmailData = [];

            context.output.iterator().each((key, value) => {
                //log.audit({ title: ' summary.output.iterator', details: `key: ${key} / value: ${value} // typeof ${typeof value}` });
                if (key !== 'ERROR') {
                    if (!isEmpty(value)) {
                        totalfilesMoved++;
                    }

                } else if (key === 'ERROR') {
                    if (!isEmpty(value)) {
                        failedEmailData.push(JSON.parse(value));
                    }
                } 
                return true;

            });

            log.audit({ title: 'AUDIT Total records', details: `total records moved: ${totalfilesMoved}` });
            log.debug('DEBUG summarize failedEmailData', `length ${failedEmailData.length} // failedEmailData ${JSON.stringify(failedEmailData)}`);


        } catch (e) {
            log.error({ title: 'ERROR summarize stage', details: e });
        }
    }

    const isEmpty = (stValue) => {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    };

    /**
       * Method to delete and "move" the original to a processed folder and also attach the file to the record
       * @param {*} fileId 
       * @returns 
       */
    const moveFile = (fileId, txnId, rectype) => {
        try {
            const scriptObj = runtime.getCurrentScript();
            const procssedFolder = Number(scriptObj.getParameter({ name: 'custscript_acs_fldr_id' }));
            if (isEmpty(procssedFolder)) { return; }
            if (isEmpty(fileId)) { return; }
            //log.debug('Debug movefile params', `params FILEID: ${fileId} , FOLDER: ${procssedFolder}`);
            const copiedfileObj = file.copy({
                id: Number(fileId),
                folder: procssedFolder,
                conflictResolution: file.NameConflictResolution.OVERWRITE
            });
            log.audit('AUDIT movefile', `saving the file in the new processed folder ${copiedfileObj} // moved file id ${copiedfileObj.id} // JSON.strinfigy ${JSON.stringify(copiedfileObj)}`);
            let recT; 
            switch (rectype) {
                case 'salesorder':
                    recT = record.Type.SALES_ORDER;
                    break;
                case 'purchaseorder':
                    recT = record.Type.PURCHASE_ORDER;
                    break;
                case 'vendorbill':
                    recT = record.Type.VENDOR_BILL;
                    break;
            }
            log.debug('DEBUG movefile', `record type is ${rectype} and recT is ${recT}`);

            if (copiedfileObj) {
                //attach the file to the txn
                record.attach({
                    record: {
                        type: 'file',
                        id: copiedfileObj.id
                    },
                    to: {
                        type: rectype,
                        id: txnId
                    }
                });
                log.debug('DEBUG movefile', `file attached to record ${recT} with id ${txnId}`);

                //delete the old file 
                file.delete({
                    id: fileId
                });
                log.audit('AUDIT movefile', `now deleting the old file`);
                
            }
        } catch (error) {
            log.error('ERROR moveFile', error);
        }
    }

    return {
        getInputData,
        map,
        summarize
    }
});
