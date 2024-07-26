/* 
* snippet_pullingParamsInfo.js
*
*
* On Suitelets using the context OR scriptcontext to pull the fields / in this case sublist information and using that data after 
*/
if (context.request.method === https.Method.GET) {
    //create form and other fields here on there
    //along with the sublist 
    //i.e 

    const form = serverWidget.createForm({
        title: 'NEW FORM',
        hideNavBar: true
    });

    form.addSubmitButton(); // this will go into POST when clicked 


}else if (context.request.method === https.Method.POST) {
    log.debug('DEBUG POST FUCN', `starting post functions here!`);
    try {
        //log.debug("DEBUG context post", `context ${JSON.stringify(context)}`);
        //log.debug("DEBUG post param", `context.request.parameters ${context.request.parameters} // ${JSON.stringify(context.request.parameters)}`);
        const params = context.request.parameters; 
        //log.debug("DEBUG post param", typeof params.custpage_search_sublistdata);
        const sublistId = 'custpage_search_sublist';
        const sublistLength = context.request.getLineCount({ group: sublistId });
        log.debug("DEBUG post param", `sublistLength ${sublistLength}`);
        const lineItemArr = getLineItems(context);
        /*
        const lineItemArr = getLineItems(context);
        if(lineItemArr.length > 0 ){
            callMR(lineItemArr);
        }
        */
    } catch (error) {
        log.error({ title: 'ERROR post', details: error });
    }

}

const getLineItems = (context) => {
    try {
        const lineItemArr = []; 
        const lineCount = context.request.getLineCount({
            group: 'custpage_search_sublist'
        });
        for (let x = 0; x < lineCount; x++) {
            let tempObj = {};
            let readyToEmal = context.request.getSublistValue({
                group: 'custpage_search_sublist',
                name: 'custpage_txn_to_email',
                line: x
            });
            if(readyToEmal == 'F'){ continue; }
            tempObj.email = readyToEmal;
            let pulledInternalID = context.request.getSublistValue({
                group: 'custpage_search_sublist',
                name: 'custpage_txn_internalid',
                line: x
            });
            tempObj.id = pulledInternalID;
            lineItemArr.push(tempObj);

            log.debug("DEBUG getLineItems", `print obj ${JSON.stringify(tempObj)}`);
        }
        log.debug("DEBUG getLineItems", `length: ${lineItemArr.length} and lineItemArr ${lineItemArr}`);

        return lineItemArr;

    } catch (error) {
        log.error({ title: 'ERROR getLineItems', details: error });
    }
}


/* ***** ORIGINAL EXAMPLE ***** */

function getAppliedLines(scriptContext) {
    const stLogTitle = 'getAppliedLines';
    try {
        const appliedLines = [];
        const sublistId = 'custpage_retainer_budgets';
        const sublistLength = scriptContext.request.getLineCount({ group: sublistId });
        for (let i = 0; i < sublistLength; i++) {
            const apply = scriptContext.request.getSublistValue({ group: sublistId, name: 'custpage_apply', line: i });
            if (apply === 'T') {
                const amountApplied = scriptContext.request.getSublistValue({ group: sublistId, name: 'custpage_commit_amount', line: i });
                const retainer = scriptContext.request.getSublistValue({ group: sublistId, name: 'custpage_retainer', line: i });
                appliedLines.push({ amountApplied, retainer });
            }
        }

        return appliedLines;
    } catch (e) {
        log.error(stLogTitle, e.message);
    }
}