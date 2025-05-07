/**
 *
 * @NApiVersion 2.0
 * @NScriptType customglplugin
 * @NModuleScope Public
 *
 */

define(['N/currentRecord', 'N/ui/dialog'], function (currentRecord, dialog) {
    const NS_CONST = {
        ACCOUNTS : {
             COGS_LABOUR : 1069, //52000
             COGS_OVER_HEAD : 1201, //69910
             COGS_MATERIAL : 1060, //51100
             MATERIALS_STANDARD : 129//51025
        }
    };

    function customizeGlImpact(context){
        log.debug('DEBUG customizeGlImpact', 'start of the func!'); 
        log.debug('DEBUG context', JSON.stringify(context) );

        var currentTxn = context.transactionRecord;
        var recType = currentTxn["recordType"];
        var recID = currentTxn["id"]; 
        log.debug('DEBUG recType', 'recType: '+recType +' recID: ' +recID );
        if(recType !== 'itemfulfillment'){ 
            log.audit('AUDIT exiting', 'record type isnt item fulfillment, exiting GL plugin'); 

            return;
        }
        var ifSubCnt = currentTxn.getLineCount('item')
        log.debug('DEBUG line count', ifSubCnt );
        for(var z = 0; z < ifSubCnt; z++ ){
            // this works
            //log.debug('DEBUG IF sublist loop', currentTxn.getSublistFields('item') );
          /* This is used to pull custom fields that will be used later on */
            var ovrHdCost = currentTxn.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_acs_overhead_cost',
                line: z
            });
            var mtrlCost = currentTxn.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_acs_material_cost',
                line: z
            });
            var labCost = currentTxn.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_acs_labor_cost',
                line: z
            });
            
            log.debug('DEBUG IF sublist loop', 'ovrHdCost: ' +ovrHdCost +' mtrlCost: '+mtrlCost +' labCost: ' +labCost );
        }
            
        var customLines = context.customLines;
        log.debug('DEBUG customizeGlImpact customLines', customLines );
        var standardLines = context.standardLines;
        log.debug('DEBUG customizeGlImpact standardLines', standardLines );
        var stLinesCount = standardLines.count;

        for(var x = 0; x < stLinesCount; x++){
            log.debug('DEBUG loop line info', standardLines.getLine({ index: x }) ); 
            //log.debug('DEBUG loop line info', JSON.stringify(standardLines.getLine({ index: x })) ); 

            var line = standardLines.getLine({ index: x });
            processLine(customLines, line, ovrHdCost, mtrlCost, labCost); 
        }


    }

    function processLine(customLines, line, ovrHdCost, mtrlCost, labCost) {
        try {
            var ovrHeadCal, matCost, labcalc, leftOverAmt;
            //var account = standardLines.getLine({ index: x }).accountId;
            var account = line.accountId;
            log.debug('DEBUG processline loop', 'account ' + account);

            //var lineAmt = standardLines.getLine({ index: x }).amount;
            var lineAmt = line.amount;
            log.debug('DEBUG processline loop', 'lineAmt ' + lineAmt);

            //var debitAmt = standardLines.getLine({ index: x }).debitAmount;
            var debitAmt = parseFloat(line.debitAmount);
            log.debug('DEBUG processline loop', 'debitAmt ' + debitAmt);

            var creditAmt = parseFloat(line.creditAmount);
            log.debug('DEBUG processline loop', 'creditAmt ' + creditAmt);

            if (debitAmt > 0) {
                ovrHeadCal = parseFloat((debitAmt * ovrHdCost).toFixed(2));
                log.debug('DEBUG processline loop', 'overHead calculation ' + ovrHeadCal);
                matCost = parseFloat((debitAmt * mtrlCost).toFixed(2));
                log.debug('DEBUG processline loop', 'material calculation ' + matCost);
                labcalc = parseFloat((debitAmt * labCost).toFixed(2));
                log.debug('DEBUG processline loop', 'labour calculation ' + labcalc);

                var customTotal = parseFloat(ovrHdCost + matCost + labcalc);
                if(customTotal !== debitAmt){
                    leftOverAmt = parseFloat((debitAmt - customTotal).toFixed(2)); 
                    log.debug('DEBUG processLine loop total', 'leftOverAmt: '+leftOverAmt); 
                }
            }
            
            var currentLine = {
                id: line.Id,
                accountId: line.accountId,
                entity: line.entityId,
                subsidiary: line.subsidiaryId,
                department: line.departmentId,
                class: line.classId,
                credit: line.creditAmount,
                debit: line.debitAmount,
                location: line.locationId,
                memo: line.memo,
            };
            log.debug('DEBUG processline', 'currentLine : ' + JSON.stringify(currentLine));
            if (line.accountId == NS_CONST.ACCOUNTS.MATERIALS_STANDARD) {
                log.debug('DEBUG reversing line', 'starting reverse line now!');
                var reversedLine = customLines.addNewLine();
                log.debug('DEBUG account', currentLine.accountId);
                reversedLine.accountId = parseInt(currentLine.accountId);
                reversedLine.classId = currentLine.class;
                if (currentLine.debit > 0) reversedLine.creditAmount = currentLine.debit;
                if (currentLine.credit > 0) reversedLine.debitAmount = currentLine.credit;
                reversedLine.departmentId = currentLine.department;
                reversedLine.entityId = currentLine.entity;
                reversedLine.locationId = currentLine.location;
                reversedLine.memo = 'Reversal of JE line ' + currentLine.id;
                log.debug('DEBUG added reverse', 'added reverse line now we will add new custom line');
                //now add new line
                addNewLine(customLines, line, ovrHeadCal, matCost, labcalc);

                if(leftOverAmt !== 0){
                     log.debug('DEBUG adding leftover', 'adding left over amount line');
                    var leftOverLine = customLines.addNewLine();
                    leftOverLine.accountId = parseInt(NS_CONST.ACCOUNTS.MATERIALS_STANDARD);
                    //leftOverLine.setCreditAmount(parseFloat(standardCredit));
                    leftOverLine.debitAmount = leftOverAmt;
                    leftOverLine.memo = 'ACS GL plugin adding left over cost'; 
                }
            }

        } catch (error) {
            log.error('ERROR processLine', error);
        }
    }

    function addNewLine(customLines, line, ovrHeadCal, matCost, labcalc) {
        try {
             //move values
             if(ovrHeadCal > 0 && !isNaN(ovrHeadCal)){
                log.debug('DEBUG addNewLine 1.0', 'adding the custom over head cost line with ovrHeadCal: '+ovrHeadCal );
                var cancelCustomLine = customLines.addNewLine();
                cancelCustomLine.accountId = parseInt(NS_CONST.ACCOUNTS.COGS_OVER_HEAD);
                //cancelCustomLine.setCreditAmount(parseFloat(standardCredit));
                cancelCustomLine.debitAmount = ovrHeadCal;
                cancelCustomLine.memo = 'ACS GL plugin adding overhead cost'; 
            }
            if(matCost > 0 && !isNaN(matCost)){
                log.debug('DEBUG addNewLine 1.1', 'adding the custom material cost line with matCost: '+matCost);
                var cancelCustomLine = customLines.addNewLine();
                cancelCustomLine.accountId = parseInt(NS_CONST.ACCOUNTS.COGS_MATERIAL);
                //cancelCustomLine.setCreditAmount(parseFloat(standardCredit));
                cancelCustomLine.debitAmount = matCost;
                cancelCustomLine.memo = 'ACS GL plugin adding material cost'; 
            }
            if(labcalc > 0 && !isNaN(labcalc)){
                log.debug('DEBUG addNewLine 1.2', 'adding the custom labour cost line with labcalc: '+labcalc);
                var cancelCustomLine = customLines.addNewLine();
                cancelCustomLine.accountId = parseInt(NS_CONST.ACCOUNTS.COGS_LABOUR);
                //cancelCustomLine.setCreditAmount(parseFloat(standardCredit));
                cancelCustomLine.debitAmount = labcalc; 
                cancelCustomLine.memo = 'ACS GL plugin adding labour cost'; 
            }

            /*
            var newLine = customLines.addNewLine();

            newLine.setAccountId(line.getAccountId());
            newLine.setEntityId(line.getEntityId());
            if (line.getCreditAmount() > 0) newLine.setCreditAmount(line.getCreditAmount());
            if (line.getDebitAmount() > 0) newLine.setDebitAmount(line.getDebitAmount());
            newLine.setClassId(line.getClassId());
            newLine.setLocationId(location);
            newLine.setDepartmentId(line.getDepartmentId());
            */
        } catch (error) {
            log.error('ERROR addNewLine', error);
        }
    }
    return{
        customizeGlImpact: customizeGlImpact
    }
});
