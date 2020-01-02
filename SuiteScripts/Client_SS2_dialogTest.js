/*******************************************************************
*
*
* Name: Client_SS2_dialogTest.js 
* Script Type: Client Script
* Version: 1.0.0
*
*
* Author: Prabhjit Singh 
* Purpose: CLIENT script teting on custom Serial Num record
*
*
* ******************************************************************* */
/**
 * @NApiVersion 2.x
 *@NScriptType ClientScript
 *
 */
define(['N/ui/message', 'N/ui/dialog'], 
    function(message, dialog){
        function showAlert(){
          log.debug({title: 'DEBUG', details: '>>client start<<'});
          try{
             //confirmation message test
                var myMsg = message.create({
                    title: "My Title", 
                    message: "My Message", 
                    type: message.Type.CONFIRMATION
                });
                // will disappear after 5s
                myMsg.show({duration: 5000}); 
            }catch(error1){
                 log.debug({title: 'DEBUG', details: 'catch 1 error1: ' +error1}); 
            }
            try{
                //testing message information
                var myMsg2 = message.create({
                    title: "My Title 2", 
                    message: "My Message 2", 
                    type: message.Type.INFORMATION
                });

                myMsg2.show();
                setTimeout(myMsg2.hide, 15000); // will disappear after 15s
            }catch(error2){
                log.debug({title: 'DEBUG', details: 'catch 2 error2: ' +error2}); 
            }
            try{
                var myMsg3 = message.create({
                    title: "My Title 3", 
                    message: "My Message 3", 
                    type: message.Type.WARNING
                });
                myMsg3.show(); // will stay up until hide is called.
            }catch(error3){
                log.debug({title: 'DEBUG', details: 'catch 3 error3: ' +error3}); 
            }

            //alert-------------------------------
             dialog.alert({
                        title: 'Alert',
                        message: 'Use only for custom scripts, Click OK to continue.' 
            });
            //alert--end--------------------------
         log.debug({title: 'DEBUG', details: '>>client END<<'});
        }
        return{
            pageInit: showAlert
        }
});