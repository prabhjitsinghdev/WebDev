/**
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 *
 * Version    Date          Author              Remarks
 * 1.00       10-23-2024   Prabhjit Singh       SL_DeleteCusotomRecs.js
 *
 */

define(['N/https', 'N/record', 'N/search'], (https, record, search) => {
    'use strict';

    const onRequest = (context) => {
        if (context.request.method === https.Method.GET) {
            for (let x = 1000; x > 1010; x--) {
                try {
                    record.delete({
                        type: 'customrecord_acs_raw_payment_line',
                        id: x
                    });
                } catch (error) {
                    log.error({ title: `ERROR GET`, details: error });
                }
            }

        }

    }


    return {
        onRequest
    };
});
