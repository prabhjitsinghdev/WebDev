/**
*
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 *
 * Version    Date          Author              Remarks
 * 1.00       15-11-2024    prabhjitsinghdev     SL_CustomerStatmentBuilder.js
 * Using a SuiteQL query to pull txn's for a specific time range and showing the statement to the customer
 * Uses a XML / adv PDF 
 * The use of the custom Data for the PDF is also easily udpated as per use case 
 *
 */

define(['N/https', 'N/record', 'N/render', 'N/ui/serverWidget', 'N/runtime', 'N/query', 'N/format'],
    (https, record, render, serverWidget, runtime, query, format) => {
        'use strict';

        function onRequest(context) {
            if (context.request.method === https.Method.GET) {
                try { 
                    const form = serverWidget.createForm({
                        title: 'Customer Statment Builder',
                        hideNavBar: false
                    });
                    const userObj = runtime.getCurrentUser();
                    const currUsrId = userObj.id;
                    populateForm(form, currUsrId);

                    form.addSubmitButton({
                        label: 'Submit For Processing'
                    });

                    context.response.writePage(form);
                } catch (error) {
                    log.error('ERROR onRequest GET', error);
                }
            }
            else if (context.request.method === https.Method.POST) {
                try {
                    //log.debug("DEBUG post param", `context.request.parameters ${context.request.parameters} // ${JSON.stringify(context.request.parameters)}`);
                    const params = context.request.parameters;
                    const pulledCust = params['custpage_customer'];
                    log.debug('post customer', `pulledCust ${pulledCust}`);
                    const strtDate = params["custpage_srtdate"];
                    log.debug('post strtDate', `strtDate ${strtDate}`);
                    const endDate = params["custpage_enddate"];
                    log.debug('post endDate', `endDate ${endDate}`);
                    const startDate = format.format({
                        value: new Date(strtDate),
                        type: format.Type.DATE
                    });
                    const endDate2 = format.format({
                        value: new Date(endDate),
                        type: format.Type.DATE
                    });
                    const renderer = render.create();
                    const resultsDataObj = runQuery(pulledCust, startDate, endDate2);
                    //renderer.setTemplateById(140); //107 other tempalte
                    renderer.setTemplateByScriptId('CUSTTMPL_ACS_TEST2');
                    // 140 is my custom one

                    if (!isEmpty(resultsDataObj)) {
                        log.audit('AUDIT customdata', `${JSON.stringify(resultsDataObj.resultsArr)} `);
                        const loadedCust = record.load({
                            type: record.Type.CUSTOMER,
                            id: pulledCust
                        })
                        renderer.addRecord({ templateName: 'record', record: loadedCust });
                        renderer.addCustomDataSource({
                            alias: 'JSON',
                            format: render.DataSource.OBJECT,
                            data: {
                                transactionData: resultsDataObj.resultsArr,
                                startDate: startDate,
                                endDate: endDate2,
                                amountTotal: resultsDataObj.amountTotal,
                                paymentTotal: resultsDataObj.paymentTotal,
                                statementTotal: resultsDataObj.statementTotal
                            }
                        });
                    }
                    const newPDFRender = renderer.renderAsPdf();
                    log.debug('DEBUG newPDFRender 17-11-2024', newPDFRender);
                    context.response.writeFile(newPDFRender, true);
                } catch (error) {
                    log.error('ERROR onRequest POST', error);
                }
            }
        }
        const populateForm = (form, currUsrId) => {
            try {
                const custFld = form.addField({
                    id: 'custpage_customer',
                    label: 'Customer',
                    type: serverWidget.FieldType.SELECT,
                    source: record.Type.CUSTOMER,
                });
                custFld.isMandatory = true;
                const currUsrFld = form.addField({
                    id: 'custpage_curr_user',
                    label: 'Current User ID',
                    type: serverWidget.FieldType.FLOAT
                });
                currUsrFld.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                currUsrFld.defaultValue = currUsrId;
                form.addField({
                    id: 'custpage_sendtome',
                    label: 'Send To Me',
                    type: serverWidget.FieldType.CHECKBOX
                });
                const startDateFld = form.addField({
                    id: 'custpage_srtdate',
                    label: 'Start Date',
                    type: serverWidget.FieldType.DATE
                });
                startDateFld.isMandatory = true;
                const endDateFld = form.addField({
                    id: 'custpage_enddate',
                    label: 'End Date',
                    type: serverWidget.FieldType.DATE
                });
                endDateFld.isMandatory = true;

            } catch (error) {
                log.error({ title: 'ERROR populateForm', details: error });
            }
        }

        const runQuery = (entityId, strtDate, endDate) => {
            try {
                let resultsArr = [];
                let tempAmountTotal = 0;
                let tempPaymentTotal = 0;
               
                const txnQuery = `SELECT t.id, t.tranid, t.trandate, t.type as txn_type, t.foreigntotal as amount,  t.foreignpaymentamountused as payment
            FROM transaction t
            LEFT JOIN transactionLine tl on t.id = tl.transaction and tl.mainLine = 'F' 
            WHERE tl.entity = ${entityId}
            AND t.trandate BETWEEN TO_DATE('${strtDate}', 'MM/DD/YYYY') and TO_DATE('${endDate}', 'MM/DD/YYYY')
            AND t.type IN ('CustInvc', 'CustCred', 'CustPymt', 'Journal', 'CustDep')
            ORDER BY t.trandate DESC`;
                const queryResults = query.runSuiteQL({
                    query: txnQuery
                });
                log.debug('DEBUG runQuery', `queryResults ${queryResults} `);
                const mappedRes = queryResults.asMappedResults();
                log.debug('DEBUG runQuery', `mappedRes ${mappedRes} // length ${mappedRes.length}`);
                for (let x = 0; x < mappedRes.length; x++) {
                    log.debug('DEBUG query results', `result ${mappedRes[x]} // json ${JSON.stringify(mappedRes[x])} `);
                    let tempBalance = 0;
                    tempAmountTotal += mappedRes[x].amount;
                    tempPaymentTotal += mappedRes[x].payment;
                    tempBalance = mappedRes[x].amount - mappedRes[x].payment; 
                    const formattedAmount = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(mappedRes[x].amount);
                      const formattedPayment = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(mappedRes[x].payment);
                      const formattedBalance = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(tempBalance.toFixed(2));
                    resultsArr.push({
                        internalid: mappedRes[x].id,
                        trandate: mappedRes[x].trandate,
                        tranid: mappedRes[x].tranid,
                        type: mappedRes[x].txn_type,
                        amount: formattedAmount,
                        payment: formattedPayment,
                        balance: formattedBalance
                    });
                }
                const amountTotal = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(tempAmountTotal.toFixed(2));
                
                const paymentTotal = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(tempPaymentTotal.toFixed(2));
                
                const tempStatementTotal = (tempAmountTotal.toFixed(2) - tempPaymentTotal.toFixed(2)).toFixed(2); 
                const statementTotal = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(tempStatementTotal);
                log.debug('DEBUG query restuls 1.1', `length ${resultsArr.length}  // amountTotal ${amountTotal} // paymentTotal ${paymentTotal} // statementTotal ${statementTotal} `);

                return {
                    mappedRes,
                    resultsArr,
                    amountTotal,
                    paymentTotal,
                    statementTotal
                }

            } catch (error) {
                log.error('ERROR runQuery', error);
            }
        }

        const isEmpty = (stValue) => {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        };

        return {
            onRequest
        };
    });
