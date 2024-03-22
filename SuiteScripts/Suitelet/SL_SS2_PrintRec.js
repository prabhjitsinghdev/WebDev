/**
* @NApiVersion 2.1
* @NScriptType Suitelet
* @NModuleScope Public
*
* SL_SS2_PrintRec.js
*
* Suitelet to print the Return Authorization and their different PDF versions that are passed via a CS script
* The CS script will allow the user to select an option to which PDF version they want and that is passed as an 
* parameter whcich is used in this Suitelet to display the correct PDF. 
*/
define([
    'N/record',
    'N/render',
    'N/log'
], (record, render, log) => {

    const onRequest = (context) => {
        try {
            const pdfTemplateID = context.request.parameters['custscript_param_pdf_template_id'];
            const idRA = context.request.parameters['custscript_param_rec_id'];
            //log.debug({ title: 'DEBUG 1', details: `Script parameter Return Auth ID: ${idRA} && PDF ID ${pdfTemplateID}` });
            if (!idRA || !pdfTemplateID) {
                let myHTMLResponse = `<html><body><p>COULD NOT CREATE PDF / MISSING parameters (Record ID or Tempalte ID)</p></body></html>`
                context.response.write(myHTMLResponse);
            }
            const renderer = render.create();
            renderer.setTemplateById(pdfTemplateID);
            renderer.addRecord('record', record.load({
                type: record.Type.RETURN_AUTHORIZATION,
                id: idRA
            }));
            let printedPDFRender = renderer.renderAsPdf();
            log.debug({ title: 'AUDIT pdf', details: `printedPDF ${printedPDFRender}` });

            context.response.writeFile(printedPDFRender, true);
        } catch (e) {
            log.error({ title: 'ERROR SL PDF', details: e });
        }
    }

    return {
        onRequest
    }
});
