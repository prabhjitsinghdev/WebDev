Object.keys(tempObj).forEach((key) => {
    //log.debug({ title: 'DEBUG key /value ', details: `key ${key} ,  value ${tempObj[key]}` });
    switch (key) {
        case "netCharge":
            vendorBillRec.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'amount', value: tempObj[key], line: obj });
            break;
        case "customerRef":
            log.debug('createBill', `customerRef ${tempObj[key]}`);
            tranId = tempObj[key];
            if (!NSUtil.isEmpty(tranId)) {
                tranId = tempObj[key];
                cancelFlag = basicSetUp(tranId, cancelFlag, vendorBillRec, obj, lineOfBusinessId);
                if (!cancelFlag) {
                    tranId = '';
                }
                return;
            } else {
                tranId = '';
            }
            break;
        case "orgRef2":
            log.debug('createBill', `orgRef2 ${tempObj[key]}`);
            if (NSUtil.isEmpty(tranId) && cancelFlag) {
                tranId = tempObj[key];
                cancelFlag = basicSetUp(tranId, cancelFlag, vendorBillRec, obj, lineOfBusinessId);
                if (!cancelFlag) {
                    tranId = '';
                }
                return;
            } else {
                tranId = '';
            }
            break;
        case "orgRef3":
            log.debug('createBill', `orgRef3 ${tempObj[key]}`);
            if (NSUtil.isEmpty(tranId) && cancelFlag) {
                tranId = tempObj[key];
                cancelFlag = basicSetUp(tranId, cancelFlag, vendorBillRec, obj, lineOfBusinessId);

                return;
            }
            break;
    }
    return true;
});