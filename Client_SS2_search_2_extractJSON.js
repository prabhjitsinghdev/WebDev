/*******************************************************************
*
*
* Name: Client_SS2_search_2_extractJSON.js
* Script Type: ClientScript
* Version: 0.0.1
*
*
* Author: PJ
* Purpose: testing search and forEach function
* to get results and log them
*
* added GROUP search results and testing getting the results via JSON extraction
* this way this info can be used for other purposes
*
* ******************************************************************* */
/**
* @NApiVersion 2.x
*@NScriptType ClientScript
*
*/
/*1st test with the search and the information it returns
 */
require(['N/search'],
	function(search){
				var mysearch = search.load({ id: 'customsearch98'});
				console.log({ title: 'DEBUG', details: 'search details: ' + mysearch +' JSON: ' +JSON.stringify(mysearch)});
                console.log({ title: 'DEBUG', details: 'run search' });
                var mycolumns = mysearch.columns; 
                console.log({title: 'DEBUG', details: 'mycolumns: '+mycolumns});
                var resultSet = mysearch.run();
                console.log('column numbers: ' +resultSet.columns.length);
                resultSet.columns.forEach(function(col){
                    console.log('col ' + col); 
                });
				var results1 = resultSet.each(function (result) {
					var entity = result.getValue({
						name: 'name'
					});
					console.log({ title: 'DEBUG', details: 'entity : ' + entity });
					var custrecord13 = result.getValue({
						name: 'custrecordcust_vehicle_make_1'
					});
					console.log({ title: 'DEBUG', details: 'custrecord13 : ' + custrecord13 });
					return true;
				});
				console.log({ title: 'DEBUG', details: 'results: ' + results1 + 'JSON:  ' + JSON.stringify(results1) });
});

/*****************************
 * 2nd
 *testing full json data return
 * also extraction of the data for
 * storage and later usage 
 */
require(['N/record', 'N/search'],
function(record, search) {
        var avgLeadTimeSearch = search.load({
            id : 'customsearch98'
        });
        avgLeadTimeSearch.run().each(function(result){ // log each column
			console.log("Search Column (group): "+ JSON.stringify(result));
			var z = JSON.stringify(result); 
			console.log('z **: ' +z);
			var obj = JSON.parse(z);
			console.log('obj: ' +JSON.stringify(obj)); 
			//extract data from JSON value and group arrays 
			var values1 = obj.values; 
			console.log('values1 **: ' +values1 +' stringify: ' +JSON.stringify(values1));
			var hh = JSON.stringify(values1); 
			console.log('hh: '+hh); 
			//for loop for split
			var hhL = hh.length; 
			console.log('hhL: ' +hhL); 
			var col_count = 0; 
			for(var i=0; i < hhL; i++){
					//split 

					if(hh[i] == ":"){
						col_count++; 
					}
			}
					console.log('col_count: ' +col_count); 
					if(col_count != 0){
						var zz = hh.split(":", 2);
						console.log('zz[0]: ' +zz[0] +' zz[1]: ' +zz[1]); 
					}


            return true;
        });
});