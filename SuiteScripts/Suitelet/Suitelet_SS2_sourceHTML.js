 /*******************************************************************
*
*
* Name: Suitelet_SS2_sourceHTML.js 
* Script Type: Suitelet Script
* Version: 1.0.0
*
*
* Author: Prabhjit Singh 
* Purpose: Suitelet to pass html code  in 2 methods
* 2 ways to deal with this
*   1) create FORM with INLINEHTML field that sources the 
*       file information as the deafult value
*   2) create everythign via HTML code including button
*       using button tag
*
*
* ******************************************************************* */
  /**
 * @NApiVersion 2.x
 *@NScriptType Suitelet
 *
 */
 define(['N/runtime', 'N/file', 'N/ui/serverWidget', 'N/ui/dialog'], 
 (runtime, file, ui, dialog) =>{
 /*
 testing SUITELET to pass html code 
 for case 
 3258463
 How to pass data to HTML suitelet 37380 Advanced Cloud Solutions LLP

 -------*********************--------
 FINAL NOTES
 2 ways to deal with this
 1) create FORM with INLINEHTML field that sources the 
     file information as the deafult value
 2) create everythign via HTML code including button
 -using button tag
 ----**********************----------
 Oct 10th 2019, adding 
   var scriptObj2 = runtime.getCurrentScript();
log.debug("Remaining governance units2 in mapp stage " + scriptObj2.getRemainingUsage());

this is for testing usage limit
-----*************************----------

  */

 const onRequest = (context) =>{
     const reponse = context.response; 
     const request = context.request; 
     const method = request.method; 
     //if(method == 'POST'){
             const runInfo = runtime.getCurrentSession(); 
             log.debug({ title: 'DEBUG', details: 'runInfo ' +runInfo });
             //testing for suiteanswers as well
             //ID: 30315
             const test_h1 = '<html><body><h1>SUITELET running method 1</h1><button type="button" id="testbutton" onclick="myclickFunction()">Click Me!</button><br><form method="post"> <h1>First name:</h1><br><input type="text" name="fname" value="Mickey" id="fname"><br><h1>Last name:</h1><br><input type="text" name="lastname" value="Mouse"><br><br><input type="submit"/></form><script>function myclickFunction(){alert("BUTTON CLICKED");}</script></body></html>';
             const test_h2_no_form = '<html><body><h1>SUITELET running method 2</h1><button type="button" id="testbutton" onclick="myclickFunction()">Click Me!</button><br><input type="submit" value="Submit" onclick="myclickFunction()"><script>function myclickFunction(){alert("BUTTON CLICKED method 2");}</script><script>function mySubmitFunc(){}</script></body></html>';
             //load the file
             //and see if we can extract its contents
             //also have form for butotn
             try{
                 //add a form for button 
                 //2nd thing requested by custome
                 //cannot do both bc it needs writePage func
                 //so use the html button tage instead

                 /*
                 const form = ui.createForm({
                   title: 'Create HTML sourcing SUIETLET'
                 });
                 //add button to form
                form.addButton({
                     id : 'custpage_options',
                     label : 'My Options',
                     functionName : 'options_fxn'
                 }); 
                 */

                 //load file
                 const basicFile = file.load({
                     id: 'SuiteScripts/basic_h.txt'
                 });
                 log.debug({ title: 'DEBUG', details: 'basicFile ' +basicFile });
                 const bfile_info = basicFile.getContents();
               //do inline html 
               //
               /*
               const bf_form = form.addField({
                   id: 'custpage_bfile_info',
                   label: 'bfile_info',
                   type: ui.FieldType.INLINEHTML
               });
                bf_form.defaultValue = bfile_info; 
                */
                 /* Method used to pass the next line as an argument to a developer-defined function. You can call this method multiple times to loop over the file contents as a stream.

                 Return false to stop the loop. Return true to continue the loop. By default, false is returned when the end of the file is reached.

                 This method can be used on text or .csv files.
                 */
                 log.debug({ title: 'DEBUG', details: 'bfile_info ' +bfile_info });
                 //1st method 
                 //writepage
                 //to create form with default inlinehtml field
                 //context.response.writePage(form);
                 /************************************** */
                 //2nd method here 
                 //using write and add the html code for button
                 //context.response.write(test_h2_no_form +bfile_info);

                 //testing for suiteanswers
                 context.response.write(test_h1); 
                             const scriptObj2 = runtime.getCurrentScript();
                 log.debug({title: "DEBUG", details:"Remaining governance units " + scriptObj2.getRemainingUsage()});

             }catch(error){
                 log.debug({ title: 'error', details: 'error ' +error +' JSON error: ' +JSON.stringify(error) });
             }
         //}//else method == post
         //else if(method == 'POST'){
             log.debug({ title: 'else post', details: 'ELSE POST METHOD'});
             try{
                 //get value
                 const fname_post = request.parameters.test_h1; 
                 log.debug({ title: 'fname_post', details: 'fname_post: ' +fname_post});
             }catch(error2){
                 log.debug({ title: 'error', details: 'error2 ' +error2 +' JSON error2: ' +JSON.stringify(error2) });
             }
         //}
 }


 return{
     onRequest
   }

});
