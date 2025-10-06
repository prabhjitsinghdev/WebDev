const sublistChecker = (oldRec, newRec, sublistId) => {
    const finalData = [], oldLines = {}, addedLines = [];
    const deletedLines = [];
    const oldLineCount = oldRec.getLineCount({ sublistId });
    const newLineCount = newRec.getLineCount({ sublistId });


    if (oldLineCount !== newLineCount) {
        log.debug('Line count changed', `Old: ${oldLineCount}, New: ${newLineCount}`);
        for (let i = 0; i < oldLineCount; i++) {
            const uniqueKey = oldRec.getSublistValue({
                sublistId: sublistId,
                fieldId: 'lineuniquekey',
                line: i
            });
            oldLines[uniqueKey] = oldRec.getSublistValue({ sublistId, fieldId: 'item', line: i });
        }

        for (let x = 0; x < newLineCount; x++) {
            const newItem = newRec.getSublistValue({ sublistId, fieldId: 'item', line: x });
            const newLineUniqueKey = newRec.getSublistValue({
                sublistId: sublistId,
                fieldId: 'lineuniquekey',
                line: x
            });

            if (newLineUniqueKey && oldLines.hasOwnProperty(newLineUniqueKey)) {
                // Line exists in both old and new (it was modified or untouched)
                delete oldLines[newLineUniqueKey];
            } else {
                // Line does not have a key in the old map, so it's a NEW line
                var newItemId = newRec.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'item',
                    line: x
                });
                addedLines.push(newItemId);
            }
        }


    } else if (oldLineCount === newLineCount) {
        for (let i = 0; i < oldLineCount; i++) {
            for (let x = 0; x < newLineCount; x++) {
                let itemObj = {};
                const oldItem = oldRec.getSublistValue({ sublistId, fieldId: 'item', line: i });
                const newItem = newRec.getSublistValue({ sublistId, fieldId: 'item', line: x });

                if (oldItem === newItem) {
                    const fieldsToCheck = ['quantity', 'rate', 'amount', 'grant'];
                    fieldsToCheck.forEach(fieldId => {
                        const oldValue = oldRec.getSublistValue({ sublistId, fieldId, line: i });
                        const newValue = newRec.getSublistValue({ sublistId, fieldId, line: x });

                        if (oldValue !== newValue) {
                            log.debug(`Field ${fieldId} changed for item ${oldItem}`, `Old: ${oldValue}, New: ${newValue}`);
                            itemObj[fieldId] = { old: oldValue, new: newValue };

                        }
                    });
                    finalData.push({ item: oldItem, changes: itemObj });
                }
            }
        }
    }


    return finalData;
}


//gemni code 
function findSublistChanges(oldRecord, newRecord, sublistId) {
    var oldLines = {};
    var oldLineCount = oldRecord.getLineCount({ sublistId: sublistId });
    var newLineCount = newRecord.getLineCount({ sublistId: sublistId });
    var addedLines = [];
    var deletedLines = [];

    // Step 1: Map all lines from the old record using lineuniquekey (most stable ID)
    for (var i = 0; i < oldLineCount; i++) {
        var lineUniqueKey = oldRecord.getSublistValue({
            sublistId: sublistId,
            fieldId: 'lineuniquekey',
            line: i
        });
        // Store the old line for comparison (using internal ID of the item for context)
        oldLines[lineUniqueKey] = oldRecord.getSublistValue({
            sublistId: sublistId,
            fieldId: 'item', // Use a key field like 'item' for context
            line: i
        });
    }

    // Step 2: Iterate the new record and remove matches from the oldLines map
    for (var i = 0; i < newLineCount; i++) {
        var newLineUniqueKey = newRecord.getSublistValue({
            sublistId: sublistId,
            fieldId: 'lineuniquekey',
            line: i
        });

        if (newLineUniqueKey && oldLines.hasOwnProperty(newLineUniqueKey)) {
            // Line exists in both old and new (it was modified or untouched)
            delete oldLines[newLineUniqueKey];
        } else {
            // Line does not have a key in the old map, so it's a NEW line
            var newItemId = newRecord.getSublistValue({
                sublistId: sublistId,
                fieldId: 'item',
                line: i
            });
            addedLines.push(newItemId);
        }
    }

    // Step 3: Any remaining entries in the oldLines map are DELETED lines
    for (var key in oldLines) {
        if (oldLines.hasOwnProperty(key)) {
            deletedLines.push(oldLines[key]); // The value is the deleted item's ID
        }
    }

    return {
        added: addedLines,
        deleted: deletedLines
    };
}

// Example usage in an afterSubmit function:
// var changes = findSublistChanges(oldRecord, newRecord, 'item');
// log.debug('Changes', 'Added Items: ' + changes.added.join(', '));
// log.debug('Changes', 'Deleted Items: ' + changes.deleted.join(', '));