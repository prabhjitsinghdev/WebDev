/**
 * @NApiVersion 2.1
 * @NScriptType clientScript
 * @NModuleScope Public
 *
 * Version    Date          Author              Remarks
 * 1.00       05-05-2926    Prabhjit Singh      acs_cs_sl_Companion_JE_Creator.js
 * 1.01       19-05-2026    Prabhjit Singh      updating to set reversal date
 * 1.02       25-05-2026    Prabhjit Singh      v3 of script to reload SL 
 *
 */

define(['N/currentRecord', 'N/url'], (currentRecord, url) => {
    'use strict';

    const LOADER_ID = 'acs-je-loader-overlay';

    const showResults = () => {
        console.log('DEBUG showResults', `showResults function called`);
        const cRec = currentRecord.get();
        const headerSub = cRec.getValue({ fieldId: 'custpage_subsidiary' });
        const headerCurrency = cRec.getValue({ fieldId: 'custpage_currency' });
        const txnFld = cRec.getValue({ fieldId: 'custpage_select_fld' });
        let txnType = 'Bill'; 
        if(txnFld == 0){
            txnType = 'Bill';
        } else if (txnFld == 1) {
            txnType = 'Purchase Order';
        }
        console.log('DEBUG showResults params', `headerSub ${headerSub} and headerCurrency ${headerCurrency} and txnType ${txnType}`);
        const view_suitelet = url.resolveScript({
            scriptId: 'customscript_acs_sl_acc_je_server_v3',
            deploymentId: 'customdeploy_v3_deploy1',
            params: ({
                'subsidiary': headerSub,
                'currency': headerCurrency,
                'txnType': txnType
            })
        });
        showPageLoader('Loading Query Results...');
        window.onbeforeunload = null;
        window.location.assign(view_suitelet);  
    }

    const processInfo = () => {
        console.log('DEBUG START', `CS script started for processInfo function`);
        try {
            const cRec = currentRecord.get();
            const headerSub = cRec.getValue({ fieldId: 'custpage_subsidiary' });
            const headerCurrency = cRec.getValue({ fieldId: 'custpage_currency' });

            const lineCount = cRec.getLineCount({
                sublistId: 'custpage_search_sublist'
            });
            const lineItemArr = [];
            for (let x = 0; x < lineCount; x++) {
                const tempObj = {};
                const readyToCreate = cRec.getSublistValue({
                    sublistId: 'custpage_search_sublist',
                    fieldId: 'custpage_txn_to_process',
                    line: x
                });
                if (readyToCreate === false || readyToCreate === 'F') { continue; }
                const pulledInternalID = cRec.getSublistValue({
                    sublistId: 'custpage_search_sublist',
                    fieldId: 'custpage_txn_id',
                    line: x
                });
                lineItemArr.push(pulledInternalID);
            }
            console.log("CS script processInfo", `length: ${lineItemArr.length} and lineItemArr ${lineItemArr.toString()}`);
            if (lineItemArr.length === 0) {
                hidePageLoader();
                alert('No line items were selected to process. Please select at least one line item and resubmit.');
                return false;
            }else{
                return true;
            }

        } catch (e) {
            hidePageLoader();
            console.log('ERROR processInfo error', e);
            alert(`There was an issue checking line items. Please try again or contact your administrator.\n\n${e.message || e}`);

            return false; 
        }

    }

    const suppressLeaveWarning = () => {
        try {
            if (typeof window === 'undefined') { return; }

            window.onbeforeunload = null;
            window.ischanged = false;

            if (typeof window.setWindowChanged === 'function') {
                window.setWindowChanged(window, false);
            }

            window.addEventListener('beforeunload', (event) => {
                event.stopImmediatePropagation();
            }, { capture: true });
        } catch (error) {
            console.log('DEBUG suppressLeaveWarning error', error);
        }
    }

    const showPageLoader = (message) => {
        try {
            if (typeof document === 'undefined' || !document.body) { return; }

            let loaderOverlay = document.getElementById(LOADER_ID);
            if (!loaderOverlay) {
                loaderOverlay = document.createElement('div');
                loaderOverlay.id = LOADER_ID;
                loaderOverlay.innerHTML = `
                    <div class="acs-je-loader-card" role="status" aria-live="polite">
                        <div class="acs-je-loader-spinner" aria-hidden="true"></div>
                        <div class="acs-je-loader-message"></div>
                    </div>
                `;
                document.body.appendChild(loaderOverlay);
                addLoaderStyles();
            }

            const messageElement = loaderOverlay.querySelector('.acs-je-loader-message');
            if (messageElement) {
                messageElement.textContent = message || 'Processing...';
            }

            loaderOverlay.style.display = 'flex';
            loaderOverlay.setAttribute('aria-hidden', 'false');
        } catch (error) {
            console.log('DEBUG showPageLoader error', error);
        }
    }

    const hidePageLoader = () => {
        try {
            if (typeof document === 'undefined') { return; }

            const loaderOverlay = document.getElementById(LOADER_ID);
            if (!loaderOverlay) { return; }

            loaderOverlay.style.display = 'none';
            loaderOverlay.setAttribute('aria-hidden', 'true');
        } catch (error) {
            console.log('DEBUG hidePageLoader error', error);
        }
    }

    const addLoaderStyles = () => {
        if (document.getElementById(`${LOADER_ID}-styles`)) { return; }

        const styleElement = document.createElement('style');
        styleElement.id = `${LOADER_ID}-styles`;
        styleElement.textContent = `
            #${LOADER_ID} {
                align-items: center;
                background: rgba(17, 24, 39, 0.48);
                bottom: 0;
                display: none;
                justify-content: center;
                left: 0;
                position: fixed;
                right: 0;
                top: 0;
                z-index: 100000;
            }

            #${LOADER_ID} .acs-je-loader-card {
                align-items: center;
                background: #ffffff;
                border: 1px solid #d8dee6;
                border-radius: 6px;
                box-shadow: 0 14px 40px rgba(15, 23, 42, 0.28);
                color: #1f2937;
                display: flex;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 14px;
                font-weight: 600;
                gap: 12px;
                min-height: 64px;
                min-width: 260px;
                padding: 18px 22px;
            }

            #${LOADER_ID} .acs-je-loader-spinner {
                animation: acs-je-loader-spin 0.8s linear infinite;
                border: 3px solid #d8dee6;
                border-radius: 50%;
                border-top-color: #2563eb;
                flex: 0 0 auto;
                height: 26px;
                width: 26px;
            }

            @keyframes acs-je-loader-spin {
                to {
                    transform: rotate(360deg);
                }
            }
        `;
        document.head.appendChild(styleElement);
    }

    const pageInit = (context) => {

    }

    const saveRecord = (context) => {
        try {
            const curRec = context.currentRecord;
            const subsidiary = curRec.getValue({ fieldId: 'custpage_subsidiary' });
            const currency = curRec.getValue({ fieldId: 'custpage_currency' });
            const processFlag = processInfo();
            if (processFlag === false) {
                return processFlag;
            }else if(processFlag === true){
                if (subsidiary && currency) {
                    showPageLoader('Creating Journal Entry...');
                    return true;
                }
            }
            
        } catch (error) {
            console.log('DEBUG saveRecord error', error);
        }

        return true;
    }

    const fieldChanged = (context) => {
        const curRec = context.currentRecord;
        const fieldId = context.fieldId;
        const sublistID = context.sublistId;
        const line = context.line;
        console.log(`DEBUG fieldChanged`, `fieldId ${fieldId} , sublist ${sublistID} , line ${line}`);
        if (sublistID === 'custpage_search_sublist' && fieldId === 'custpage_txn_to_process') {
            updateSelectedTotal(curRec);
        }

    }

    const updateSelectedTotal = (curRec) => {
        try {
            if (!curRec) { return; }

            const lineCount = curRec.getLineCount({
                sublistId: 'custpage_search_sublist'
            });
            let totalAmount = 0;

            for (let x = 0; x < lineCount; x++) {
                const isSelected = curRec.getSublistValue({
                    sublistId: 'custpage_search_sublist',
                    fieldId: 'custpage_txn_to_process',
                    line: x
                });
                if (isSelected !== true && isSelected !== 'T') { continue; }

                const lineAmount = curRec.getSublistValue({
                    sublistId: 'custpage_search_sublist',
                    fieldId: 'custpage_txn_amount',
                    line: x
                });
                totalAmount += parseAmount(lineAmount);
            }

            curRec.setValue({
                fieldId: 'custpage_total',
                value: Number(totalAmount.toFixed(2)),
                ignoreFieldChange: true
            });
            console.log(`DEBUG updateSelectedTotal`, `totalAmount ${totalAmount}`);
        } catch (error) {
            console.log('DEBUG updateSelectedTotal error', error);
        }
    }

    const parseAmount = (value) => {
        if (value === null || value === undefined || value === '') { return 0; }
        if (typeof value === 'number') { return value; }

        const parsedAmount = Number(String(value).replace(/,/g, ''));
        return Number.isFinite(parsedAmount) ? parsedAmount : 0;
    }

    const markAll = () => {
        console.log(`running markAll function`)
        const cRec = currentRecord.get();
        if (!cRec) { return; }
        const lineCnt = cRec.getLineCount({
            sublistId: 'custpage_search_sublist'
        });
        console.log(`getting line count ${lineCnt}`);
        if (lineCnt > 0) {
            for (let x = 0; x < lineCnt; x++) {
                cRec.selectLine({
                    sublistId: 'custpage_search_sublist',
                    line: x
                });
                cRec.setCurrentSublistValue({
                    sublistId: 'custpage_search_sublist',
                    fieldId: 'custpage_txn_to_process',
                    value: true,
                    line: x
                });
                cRec.commitLine({
                    sublistId: 'custpage_search_sublist',
                    ignoreRecalc: true
                });
            }
        }
        updateSelectedTotal(cRec);
    }

    const unMarkAll = () => {
        console.log(`running unMarkAll function`)
        const cRec = currentRecord.get();
        if (!cRec) { return; }
        const lineCnt = cRec.getLineCount({
            sublistId: 'custpage_search_sublist'
        });
        console.log(`getting line count ${lineCnt}`);
        if (lineCnt > 0) {
            for (let x = 0; x < lineCnt; x++) {
                cRec.selectLine({
                    sublistId: 'custpage_search_sublist',
                    line: x
                });
                cRec.setCurrentSublistValue({
                    sublistId: 'custpage_search_sublist',
                    fieldId: 'custpage_txn_to_process',
                    value: false,
                    line: x
                });
                cRec.commitLine({
                    sublistId: 'custpage_search_sublist',
                    ignoreRecalc: true
                });
            }
        }
        updateSelectedTotal(cRec);
    }

    return {
        showResults,
        pageInit,
        saveRecord,
        fieldChanged,
        markAll,
        unMarkAll
    };
});
