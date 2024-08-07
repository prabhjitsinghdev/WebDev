/*
Robert Bunger Schneider Electric IT Corporation 70 Mechanic Street Foxboro MA 02035 United States
*/
require([
    'N/record',
    'N/currentRecord'
], function (record, currentRecord) {
    const cRec = currentRecord.get();
    let x = cRec.getValue({ fieldId: 'shipaddresslist' });
    console.log(`x ${x}`);
    /*
let loadedAdd = record.load({ type:'address', id: x });
console.log( loadedAdd.getValue({ fieldId: 'attention' }) );
*/
    const sublistFieldValue = cRec.getSubrecord({
        fieldId: 'shippingaddress'
    });
    console.log(`DEBUG sublist country ${sublistFieldValue.getValue({ fieldId: 'country' })}`);
    console.log(`DEBUG sublist addressee ${sublistFieldValue.getValue({ fieldId: 'addressee' })}`);
    console.log(`DEBUG sublist addr1 ${sublistFieldValue.getValue({ fieldId: 'addr1' })}`);
    console.log(`DEBUG sublist city ${sublistFieldValue.getValue({ fieldId: 'city' })}`);
    console.log(`DEBUG sublist state ${sublistFieldValue.getValue({ fieldId: 'state' })}`);
    console.log(`DEBUG sublist zip ${sublistFieldValue.getValue({ fieldId: 'zip' })}`);
    
    //this did not work properly 
    /*
    console.log(`DEBUG line count ${cRec.getLineCount({ sublistId: 'shipgroup' })}`);
    console.log(`DEBUG ${cRec.getSublistValue({
        sublistId: 'shipgroup', fieldId: 'destinationaddress', line: 0
    })}`);
    */

});

/* ss1.0 code that works */
let shipaddress = nlapiViewSubrecord('shippingaddress')
let shipcountry = shipaddress.getFieldText('country');
console.log(`shipcountry ${shipcountry}`);
let shipstate = shipaddress.getFieldText('dropdownstate');
