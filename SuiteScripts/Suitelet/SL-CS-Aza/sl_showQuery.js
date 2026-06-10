/**
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 *
 * Version    Date          Author              Remarks
 * 1.00       09-04-2026   Prabhjit Singh       sl_showQuery.js
 * 1.01       22-04-2026   Prabhjit Singh       updates to insert sublist function
 * 1.02       30-04-2026   Prabhjit Singh       adding new header fields
 * 1.03       05-05-2926   Prabhjit Singh       adding URL field to sublist and creating the get interaction to populate it
 * 1.04       19-05-2026   Prabhjit Singh       updating date function to get first day of next month
 *
 */

define(['N/https', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/query', 'N/url'], (https, record, search, serverWidget, query, url) => {
    'use strict';

    const CLIENT_SCRIPT_MODULE_PATH = './ACS/acs_cs_sl_Companion_QueryRunner_v2.js';

    const onRequest = (context) => {

        if (context.request.method === https.Method.GET) {
            try {
                const form = serverWidget.createForm({
                    title: 'ACS | show query results',
                    hideNavBar: false
                });
                form.clientScriptModulePath = CLIENT_SCRIPT_MODULE_PATH;
                const currentPeriod = getCurrentPeriod();
                populateForm(form, currentPeriod);
                form.addSubmitButton({
                    label: 'Show Results'
                });
             
                context.response.writePage(form);
                
            } catch (error) {
                log.error({ title: `ERROR GET`, details: error });
            }

        }
        else if (context.request.method === https.Method.POST) {
            log.debug('DEBUG POST FUCN', `starting post functions here!`);
            try {
                //log.debug("DEBUG context post", `context ${JSON.stringify(context)}`);
                log.debug("DEBUG post param", `context.request.parameters ${context.request.parameters} // ${JSON.stringify(context.request.parameters)}`);
                const params = context.request.parameters; 
                const form = serverWidget.createForm({
                    title: 'ACS | show query results',
                    hideNavBar: false
                });
                form.clientScriptModulePath = CLIENT_SCRIPT_MODULE_PATH;
                form.addSubmitButton({
                    label: 'Show Results'
                });
                const tempTxnType = params['custpage_select_fld'] || '0';
                let txnType = 'Bill'; 
                if(tempTxnType == 0){
                    txnType = 'Bill';
                } else if (tempTxnType == 1) {
                    txnType = 'Purchase Order';
                }
                const headerSub = params['custpage_subsidiary'];
                const headerCurrency = params['custpage_currency'];
                log.debug('DEBUG POST', `headerSub ${headerSub} and headerCurrency ${headerCurrency} and txnType ${txnType}`);
                const currentPeriod = getCurrentPeriod();
                populatePOSTForm(form, headerSub, headerCurrency, currentPeriod);
                const invSublist = populateSublistPOST(form, txnType, headerCurrency, headerSub); 
                context.response.writePage(form);
            } catch (error) {
                log.error({ title: 'ERROR post', details: error });
                const htmlcode = `
                <html><body>
                    <p>ERROR -- Please check the script logs.
                    <br><br><b>ERROR:</b><br>
                    ${error.message}
                    </p>
                </body></html>`;
                context.response.write(htmlcode);
            }

        }
    }

    const getCurrentPeriod = () => {
        let currentPeriod; 
        const accountingperiodSearchObj = search.create({
            type: "accountingperiod",
            filters:
                [
                    ["closed", "is", "F"],
                    "AND",
                    ["startdate", "onorbefore", "today"],
                    "AND",
                    ["enddate", "onorafter", "today"],
                    "AND",
                    ["isquarter", "is", "F"],
                    "AND",
                    ["isyear", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "periodname", label: "Name" }),
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                ]
        });
        const searchResultCount = accountingperiodSearchObj.runPaged().count;
        log.debug("accountingperiodSearchObj result count", searchResultCount);
        accountingperiodSearchObj.run().each(function (result) {
            log.debug('DEBUG getCurrentPeriod', `current period is ${result.getValue({ name: 'periodname' })} and id is ${result.getValue({ name: 'internalid' })}`);
            currentPeriod = result.getValue({ name: 'periodname' });

            return true;
        });

        return currentPeriod;
    }

    const runQueryForTxns = (txnType, currencyId, subsidiary) => {
        try {
            const resultsArr = []; 

            log.debug('DEBUG runQueryForTxns', `Param check subsidiary ${subsidiary} // txnType ${txnType} // currencyId ${currencyId}`);

            if (!subsidiary) {
                log.error('ERROR subsidiary missing', 'Subsidiary IS MISSING and required to run query!');
                return [];
            }
            if (!currencyId) {
                log.error('ERROR currency missing', 'Currency IS MISSING and required to run query!');
                return [];
            }
            const subsidiaryId = Number(subsidiary);
            const selectedCurrencyId = Number(currencyId);
            if (!Number.isFinite(subsidiaryId) || !Number.isFinite(selectedCurrencyId)) {
                log.error('ERROR invalid query filters', `Subsidiary and currency must be valid internal IDs. subsidiary=${subsidiary}, currencyId=${currencyId}`);
                return [];
            }
            const billQuery = `
            select
                    TransactionName.name as Type,
                    Subsidiary.id as SubsidiaryInternalId,
                    subsidiary.name	as Subsidiary,
                    transaction.tranid as DocumentNumber,
                    transaction.id	as InternalId,
                    Vendor.companyName	as VendorName,
                    TransactionStatus.fullName	as Status,
                    transaction.trandate as TransactionDate,
                    accountingPeriod.periodName as PostingPeriod,
                    transactionLine.netAmount	as Amount,
                    transactionLine.foreignAmount	as FxAmount,
                    currency.name	as Currency,
                    Account.fullName	as account,
                    Account.id as account_id,
                    transaction.exchangeRate as ExchangeRate,
                    department.name as Department,
                    department.id as dep_id,
                    classification.name as Class,
                    classification.id as class_id,
                    transactionLine.custcol_acs_one_time_item as OTE_Flag,
                    transactionLine.custcol_acs_one_time_item_amount as OTE_Amount,
                    transactionLine.id as LineID
            from transaction
                    join TransactionName on transaction.type = TransactionName.type and transaction.customtype = TransactionName.customtype
                    join entity on transaction.entity = entity.id
                    join Vendor on entity.vendor = Vendor.id
                    join TransactionStatus on transaction.status = TransactionStatus.id and transaction.type = TransactionStatus.trantype and transaction.customtype = TransactionStatus.trancustomtype
                    join accountingPeriod on transaction.postingperiod = accountingPeriod.id
                    join transactionLine on transaction.id = transactionLine.transaction
                    join currency on transaction.currency = currency.id
                    join department on transactionLine.department = department.id
                    join Subsidiary on transactionLine.subsidiary = Subsidiary.id
                    join classification on transactionLine.class = classification.id
                    join TransactionAccountingLine on transactionLine.id = TransactionAccountingLine.transactionline and transactionLine.transaction = TransactionAccountingLine.transaction
                    join Account on TransactionAccountingLine.account = Account.id
            where TransactionStatus.fullName in ('Bill : Pending Approval',  'Purchase Order : Open')
                    and TransactionName.name = ? -- Set by Filter
                    and Subsidiary.id = ?  -- Set by Filter
                    and currency.id = ? -- Set by Filter
                    and transactionLine.taxLine = 'F'
                    and transactionLine.mainLine = 'F'
            `;
            const queryResults = query.runSuiteQL({
                query: billQuery,
                params: [txnType, subsidiaryId, selectedCurrencyId]
            });
            const totalMappedRes = queryResults.asMappedResults();
            log.debug('DEBUG query results length', totalMappedRes.length); 
           
            for (let x = 0; x < totalMappedRes.length; x++) {
                log.debug('DEBUG runQuery', `totalMappedRes at ${x} -- ${JSON.stringify(totalMappedRes[x])}`);
                const subsidiary = totalMappedRes[x].subsidiary;
                const tranid = totalMappedRes[x].documentnumber;
                const internalId = totalMappedRes[x].internalid;
                const vendorName = totalMappedRes[x].vendorname;
                const status = totalMappedRes[x].status;
                const transactionDate = totalMappedRes[x].transactiondate;
                const postingPeriod = totalMappedRes[x].postingperiod;
                const amount = totalMappedRes[x].amount;
                const fxAmount = totalMappedRes[x].fxamount;
                const currency = totalMappedRes[x].currency;
                const account = totalMappedRes[x].account;
                const accountId = totalMappedRes[x].account_id;
                const exchangeRate = totalMappedRes[x].exchangerate;
                const department = totalMappedRes[x].department;
                const departmentId = totalMappedRes[x].dep_id;
                const classification = totalMappedRes[x].class;
                const classificationId = totalMappedRes[x].class_id;
                let tempFlagValue = totalMappedRes[x].ote_flag;
                let oteFlag;
                if(tempFlagValue == 'F'){
                    oteFlag = false;
                }else if(tempFlagValue == 'T'){
                    oteFlag = true; 
                }
                const oteAmount = totalMappedRes[x].ote_amount;
                const lineId = totalMappedRes[x].lineid;
                const tempObj = {
                    subsidiary,
                    tranid,
                    internalId,
                    vendorName,
                    status,
                    transactionDate,
                    postingPeriod,
                    amount,
                    fxAmount,
                    currency,
                    account,
                    accountId,
                    exchangeRate,
                    department,
                    departmentId,
                    classification,
                    classificationId,
                    oteFlag,
                    oteAmount,
                    lineId
                }
                resultsArr.push(tempObj);
            }
            return resultsArr; 

        } catch (error) {
            log.debug('running query error ' + error);
        }
    }



    const populateForm = (form, currentPeriod) => {
        try {
            //custFld.isMandatory = true;
            const subFld = form.addField({
                id: 'custpage_subsidiary',
                label: 'Subsidiary',
                type: serverWidget.FieldType.SELECT,
                source: record.Type.SUBSIDIARY,
            });
            subFld.isMandatory = true;

            const selectFld = form.addField({
                id: 'custpage_select_fld',
                label: 'Transaction type FLd',
                type: serverWidget.FieldType.SELECT
            });
            selectFld.addSelectOption({
                value : 0,
                text : 'Bill'
            });
            selectFld.addSelectOption({
                value : 1,
                text : 'Purchase Order'
            });
            selectFld.defaultValue = 0;
            selectFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            const currncyFld = form.addField({
                id: 'custpage_currency',
                label: 'Currency',
                type: serverWidget.FieldType.SELECT,
                source: record.Type.CURRENCY, 
            });
            currncyFld.isMandatory = true;
            const postingFld = form.addField({
                id: 'custpage_posting_period',
                label: 'Posting Period',
                type: serverWidget.FieldType.TEXT
            });
            postingFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            postingFld.defaultValue = currentPeriod;
            const lastDayFld = form.addField({
                id: 'custpage_last_day',
                label: 'Last Day of Month',
                type: serverWidget.FieldType.DATE
            });
            const lastDate = getLastDayOfMonth();
            lastDayFld.defaultValue = lastDate;
            lastDayFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });

        } catch (error) {
            log.error({ title:'ERROR populateForm', details: error });
        }
    }

    const populateSublistPOST = (form, txnType, currencyId, headerSub) =>{
        try {
            const invSublist = form.addSublist({
                id: 'custpage_search_sublist',
                label: 'Search Sublist',
                type: serverWidget.SublistType.LIST
            }); 
            //invSublist.addMarkAllButtons(); // adding mark all button 
            invSublist.addButton({
                id: 'custpage_btn_mark_all',
                label: 'Mark All',
                functionName : 'markAll()'
            });
            invSublist.addButton({
                id: 'custpage_btn_unmark_all',
                label: 'UnMark All',
                functionName : 'unMarkAll()'

            })
            invSublist.addField({
                id: 'custpage_txn_to_process',
                label: 'Select to Process',
                type: serverWidget.FieldType.CHECKBOX
            });
            invSublist.addField({
                id: 'custpage_txn_sub',
                label: 'Subsidiary',
                type: serverWidget.FieldType.TEXT
            });
            invSublist.addField({
                id: 'custpage_txn_doc_num',
                label: 'Doc Number',
                type: serverWidget.FieldType.TEXT
            });
            const linkFld = invSublist.addField({
                id: 'custpage_txn_link',
                label: 'Transaction Link',
                type: serverWidget.FieldType.URL
            });
            linkFld.linkText = 'View Record';
            /*
            linkFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            */

            invSublist.addField({
                id: 'custpage_txn_id',
                label: 'Internal ID',
                type: serverWidget.FieldType.TEXT
            });
            invSublist.addField({
                id: 'custpage_vendor_name',
                label: 'Vendor Name',
                type: serverWidget.FieldType.TEXT
            });
            invSublist.addField({
                id: 'custpage_txn_status',
                label: 'Txn Status',
                type: serverWidget.FieldType.TEXT
            });
            invSublist.addField({
                id: 'custpage_txn_date',
                label: 'Txn Date',
                type: serverWidget.FieldType.TEXT
            });
            invSublist.addField({
                id: 'custpage_txn_posting_date',
                label: 'Posting Date',
                type: serverWidget.FieldType.TEXT
            });
            const amountFld = invSublist.addField({
                id: 'custpage_txn_amount',
                label: 'Amount',
                type: serverWidget.FieldType.FLOAT
            });
            amountFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            const fxAmountFld = invSublist.addField({
                id: 'custpage_txn_fx_amount',
                label: 'FX Amount',
                type: serverWidget.FieldType.FLOAT
            });
            fxAmountFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            const currencyFld = invSublist.addField({
                id: 'custpage_txn_currency',
                label: 'Currency',
                type: serverWidget.FieldType.TEXT,
            });
            currencyFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            invSublist.addField({
                id: 'custpage_txn_acct',
                label: 'Account',
                type: serverWidget.FieldType.TEXT,
            });
            invSublist.addField({
                id: 'custpage_txn_acct_id',
                label: 'Account ID',
                type: serverWidget.FieldType.INTEGER,
            });
            invSublist.addField({
                id: 'custpage_txn_dept',
                label: 'Department',
                type: serverWidget.FieldType.TEXT,
            });
            invSublist.addField({
                id: 'custpage_txn_dept_id',
                label: 'Department ID',
                type: serverWidget.FieldType.INTEGER,
            });
            invSublist.addField({
                id: 'custpage_txn_class',
                label: 'Class',
                type: serverWidget.FieldType.TEXT,
            });
            invSublist.addField({
                id: 'custpage_txn_class_id',
                label: 'Class ID',
                type: serverWidget.FieldType.INTEGER,
            });
            const oteFlagFld = invSublist.addField({
                id: 'custpage_txn_ote_flag',
                label: 'OTE Flag',
                type: serverWidget.FieldType.CHECKBOX
            });
            oteFlagFld.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
            });
            invSublist.addField({
                id: 'custpage_txn_ote_amount',
                label: 'OTE Amount',
                type: serverWidget.FieldType.FLOAT
            });
            invSublist.addField({
                id: 'custpage_txn_lineid',
                label: 'Line ID',
                type: serverWidget.FieldType.TEXT,
            });
            const idFld = invSublist.addField({
                id: 'custpage_txn_internalid',
                label: 'InternalID',
                type: serverWidget.FieldType.FLOAT,
            });
            idFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN 
            });
            const results = runQueryForTxns(txnType, currencyId, headerSub);
            if (!results || results.length === 0) {
                const noResultsFld = form.addField({
                    id: 'custpage_no_results',
                    label: 'No Results',
                    type: serverWidget.FieldType.INLINEHTML
                });
                noResultsFld.defaultValue = '<div style="margin-top:12px;padding:10px 12px;border:1px solid #d8dee6;background:#f8fafc;color:#1f2937;">No transactions found for the selected subsidiary and currency.</div>';
                return invSublist;
            }
            processSearchPOST(invSublist, results) 

            return invSublist;

        } catch (error) {
            log.error({ title:'ERROR populateSublist', details: error });
        }
    }

    const processSearchPOST = (invSublist, adjustedResults) => {
        try {
            if (!adjustedResults || adjustedResults.length === 0) { return; }

            let headerPostingPeriod; 
            for(let x = 0; x < adjustedResults.length; x++){
                //log.debug('DEBUG tempvalues', `typeof ${typeof tempValues} , tempValues ${tempValues}`);
                //log.debug('DEBUG temptype', `tempType ${tempType}`);
                const result = adjustedResults[x];
                log.debug({ title:'DEBUG processSearch suitelet', details: `result ${JSON.stringify(result)}` });
                invSublist.setSublistValue({
                    id: 'custpage_txn_sub',
                    value: result.subsidiary || '',
                    line: x
                });
                if(result.tranid){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_doc_num',
                        value: result.tranid,
                        line: x
                    });
                }
                if(result.internalId){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_id',
                        value: result.internalId,
                        line: x
                    });
                    const outputURL = url.resolveRecord({
                        recordType: 'vendorbill',
                        recordId: result.internalId,
                        isEditMode: false
                    });
                    log.debug('DEBUG processSearch suitelet', `outputURL ${outputURL}`);
                    invSublist.setSublistValue({
                        id: 'custpage_txn_link',
                        //value: `${netsuiteURL}${result.internalId}`,
                        value: outputURL,
                        line: x
                    });
                }
                if(result.vendorName){
                    invSublist.setSublistValue({
                        id: 'custpage_vendor_name',
                        value: result.vendorName,
                        line: x
                    });
                }
                if(result.accountId){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_acct_id',
                        value: result.accountId,
                        line: x
                    });
                }
                if(result.status){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_status',
                        value: result.status,
                        line: x
                    });
                }
                if(result.transactionDate){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_date',
                        value: result.transactionDate,
                        line: x
                    });
                }
                if(result.postingPeriod){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_posting_date',
                        value: result.postingPeriod,
                        line: x
                    });
                    if(!headerPostingPeriod){
                        headerPostingPeriod = result.postingPeriod;
                    }
                }
                if(result.amount){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_amount',
                        value: result.amount,
                        line: x
                    });
                }
                if(result.fxAmount){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_fx_amount',
                        value: result.fxAmount,
                        line: x
                    });
                }
                if(result.currency){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_currency',
                        value: result.currency,
                        line: x
                    });
                }
                if(result.account){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_acct',
                        value: result.account,
                        line: x
                    });
                }
                if(result.department){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_dept',
                        value: result.department,
                        line: x
                    });
                }
                if(result.departmentId){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_dept_id',
                        value: result.departmentId,
                        line: x
                    });
                }
                if(result.classification){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_class',
                        value: result.classification,
                        line: x
                    });
                }
                if(result.classificationId){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_class_id',
                        value: result.classificationId,
                        line: x
                    });
                }
                if(result.oteFlag == true){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_ote_flag',
                        value: 'T',
                        line: x
                    });
                }
                if(result.oteAmount){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_ote_amount',
                        value: result.oteAmount,
                        line: x
                    });
                }
                if(result.lineId){
                    invSublist.setSublistValue({
                        id: 'custpage_txn_lineid',
                        value: result.lineId,
                        line: x
                    });
                }
            }

        } catch (error) {
            log.debug({ title:'ERROR processSearch', details: error });
        }

    }

    
    const getLastDayOfMonth = () => {
        const d = new Date();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const year = d.getFullYear();
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        log.debug('DEBUG createJE', `month ${month} and lastDayOfMonth ${lastDayOfMonth} --- date ${new Date(`${month}/${lastDayOfMonth}/${year}`)} `);
        const lastDate = new Date(`${month}/${lastDayOfMonth}/${year}`);

        return lastDate;
    }


    const getFirstDayOfNextMonth = () => {
        const d = new Date();
        const month = d.getMonth() + 2;
        const day = d.getDate();
        const year = d.getFullYear();
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        log.debug('DEBUG createJE', `month ${month} and lastDayOfMonth ${lastDayOfMonth} --- date ${new Date(`${month}/${lastDayOfMonth}/${year}`)} `);
        const firstDayDate = new Date(`${month}/${lastDayOfMonth}/${year}`);

        return firstDayDate;
    }


     const populatePOSTForm = (form, subsidiaryID, currencyValue, currentPeriod) => {
        try {
            const subFld = form.addField({
                id: 'custpage_subsidiary',
                label: 'Subsidiary',
                type: serverWidget.FieldType.SELECT,
                source: record.Type.SUBSIDIARY,
            });
            subFld.isMandatory = true;
            subFld.defaultValue = subsidiaryID;
            const selectFld = form.addField({
                id: 'custpage_select_fld',
                label: 'Transaction type FLd',
                type: serverWidget.FieldType.SELECT
            });
            selectFld.addSelectOption({
                value : 0,
                text : 'Bill'
            });
            selectFld.addSelectOption({
                value : 1,
                text : 'Purchase Order'
            });
            selectFld.defaultValue = 0;
            selectFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            const currncyFld = form.addField({
                id: 'custpage_currency',
                label: 'Currency',
                type: serverWidget.FieldType.SELECT,
                source: record.Type.CURRENCY, 
            });
            currncyFld.isMandatory = true;
            currncyFld.defaultValue = currencyValue;
            const postingFld = form.addField({
                id: 'custpage_posting_period',
                label: 'Posting Period',
                type: serverWidget.FieldType.TEXT
            });
            postingFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            postingFld.defaultValue = currentPeriod;

            const lastDayFld = form.addField({
                id: 'custpage_last_day',
                label: 'Last Day of Month',
                type: serverWidget.FieldType.DATE
            });
            const lastDate = getLastDayOfMonth();
            lastDayFld.defaultValue = lastDate;
            lastDayFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            lastDayFld.defaultValue = lastDate;

            const totalFld = form.addField({
                id: 'custpage_total',
                label: 'Selected Total',
                type: serverWidget.FieldType.FLOAT
            });
            totalFld.defaultValue = '0.00';
            totalFld.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            form.addButton({
                id: 'custpage_btn_submit',
                label: 'Create Accrual Journal',
                functionName: `createJE()`
            });
            
        } catch (error) {
            log.error({ title:'ERROR populatePOSTForm', details: error });
        }
    }



    return {
        onRequest
    };
});
