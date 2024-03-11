/*******************************************************************
*
*
* Name: UserEvent Lock Record
* Script Type: UserEvent Script
* Version: 1.0.0
*
*
* Author: prabhjitsinghdev
Prabhjit Singh 

* Purpose: this script removes the edit button 
* & is a work around for those who want to lock the record
* If the user role is not the Administrator then they cannot edit the record
*
*
* ******************************************************************* */
/**
*@copyright 2024 
*@author prabhjitsinghdev
*/

function beforeload(context) {
	if (type == 'view') {
		if (nlapiGetRole() !== 3) {
			form.removeButton('edit');
			nlapiLogExecution('DEBUG', 'removebutton', 'done');
		}
	}
	else if (type == 'edit') {
		//if the user clicks EDIT in the list view
		//we check this here and then proceed or not allow them 
		if (nlapiGetRole() == 3) {
			nlapiLogExecution('DEBUG', 'equals 3', 'continue');

		} else {
			form.removeButton('save');
			alert('You are not Administrator; closing window');
			setTimeout(function () { window.close(); }, 5000);
		}
	}
}
