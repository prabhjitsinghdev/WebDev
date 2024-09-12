/**
@NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope Public
 *
 * using the url resolve script we can trigger the related SL to print the txn pdf
 * if needed we can add a paramter to choose the pdf template as well
 *
 */

define([
    'N/record',
    'N/url'
    ],(record, url) => {
    'use strict';
      
    const beforeLoad = (context) => {
        try{
            const newRec = context.newRecord;
            const form = context.form;
            const acceptedContxt = ['view', 'edit'];
            const suiteletDirect = url.resolveScript({
                scriptId: 'customscript_param_sl_print',
                deploymentId: 'customdeploy_param_sl_print',
                params:{
                    custscript_param_so_id: newRec.id
                }
            });
            const printPerforma = `window.open('${suiteletDirect}', '_blank').focus();`;
            if(acceptedContxt.includes(context.type)){
                form.addButton({
                    id : 'custpage_print_performa',
                    label : 'Print Performa',
                    functionName: printPerforma
                });
            }


        }catch (e) {
            log.error({ title:'ERROR beforeLoad', details: e });
        }
    }

    return {
        beforeLoad
    };
});
