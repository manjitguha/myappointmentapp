'use strict';

exports.drugServices =  function(app, drugdb){
	app.post('/api/searchdrug', function(request, response) {
	    console.log("Search drug Invoked..");
	    var searchParams = request.body;
	 	


	 	drugdb.find(searchParams, function(err, body) {
		  if (!err){
      		console.log(JSON.stringify(body.docs));
 	 		console.log('total # of drugs -> ' + body.docs.length);

            response.write(JSON.stringify({
                status : 200,
                body : body.docs
            }));
			response.end();
		  } else {
            response.write(JSON.stringify({
                status : 200
            }));
            response.end();
          }
		});

	    console.log("Search drug Successful..");
	});	


	app.get('/api/drugAllDocs', function(request, response) {
	    console.log("/api/drugs method invoked.. ");

	    var drugList = [];
	    var i = 0;
	    drugdb.list({include_docs:true},function(err, body) {
	        if (!err) {
				console.log('total # of docs -> ' + body.rows.length);
 	          	
 	          	(function(body,response,drugList){	 
 	          		for(var loopCounter in body.rows){
 	          			if(body.rows[loopCounter].doc.docType === 'DRUG'){
	 	          			drugList.push(body.rows[loopCounter].doc);
	 	          		}
 	          		}         	

 	          		response.write(JSON.stringify({
		                status : 200,
		                body : drugList
		            }));
					response.end();
				})(body,response, drugList);
	          	
	        } else {
	            console.log(err);
	            response.write(JSON.stringify({
	                status : 200
	            }));
	            response.end();
	        }
	    });
	});

	app.post('/api/drug', function(request, response) {
	    console.log("Create drug Invoked..");
	    var drug = request.body;
	    savedrugDocument(drug._id, drug, response);
	    console.log("drug Created Successfully..");
	});	


	app.post('/api/savealldrugs', function(request, response) {
	    var drugs = request.body;
	    console.log(drugs.length);

	    for(var loopCounter in drugs){
	    	console.log("Create drug Invoked..");
	    	savedrugDocument(drugs[loopCounter]._id, drugs[loopCounter], response);
	  	    console.log("Drug Created Successfully..");
		}
	});	

	var savedrugDocument = function(id, json, response) {
	    if (id === undefined) {
	        // Generated random id
	        id = '';
	    }

	    drugdb.insert(json, id, function(err, doc) {
	        if (err) {
	            console.log(err);
	            response.sendStatus(500);
	        } else{
	            response.write(JSON.stringify({
	                status : 200,
	                body : doc
	            }));
	        }
	        response.end();
	    });
	};
};
