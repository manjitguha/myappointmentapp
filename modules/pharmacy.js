'use strict';

exports.pharmacyServices =  function(app, pharmacydb){
	app.post('/api/searchpharmacy', function(request, response) {
	    console.log("Search pharmacy Invoked..");
	    var searchParams = request.body;
	 	
	 	console.log(searchParams);

		pharmacydb.find(searchParams, function(err, body) {
		  if (!err){
      		console.log(JSON.stringify(body.docs));
 	 		console.log('total # of pharmacys -> ' + body.docs.length);

            response.write(JSON.stringify({
                status : 200,
                body : body.docs
            }));
			response.end();
		  }
		});

	    console.log("Search pharmacy Successful..");
	});	


	app.get('/api/pharmacyAllDocs', function(request, response) {
	    console.log("/api/pharmacys method invoked.. ");

	    var pharmacyList = [];
	    var i = 0;
	    pharmacydb.list({include_docs:true},function(err, body) {
	        if (!err) {
				console.log('total # of docs -> ' + body.rows.length);
 	          	
 	          	(function(body,response,pharmacyList){	 
 	          		for(var loopCounter in body.rows){
 	          			if(body.rows[loopCounter].doc.docType === 'PHARMACY'){
	 	          			pharmacyList.push(body.rows[loopCounter].doc);
	 	          		}
 	          		}         	

 	          		response.write(JSON.stringify({
		                status : 200,
		                body : pharmacyList
		            }));
					response.end();
				})(body,response, pharmacyList);
	          	
	        } else {
	            console.log(err);
	            response.write(JSON.stringify({
	                status : 200
	            }));
	            response.end();
	        }
	    });
	});

	app.post('/api/pharmacy', function(request, response) {
	    console.log("Create pharmacy Invoked..");
	    var pharmacy = request.body;
	    savepharmacyDocument(pharmacy._id, pharmacy, response);
	    console.log("pharmacy Created Successfully..");
	});	


	app.post('/api/saveallpharmacys', function(request, response) {
	    var pharmacys = request.body;
	    for(loopCounter in pharmacys){
	    	console.log("Create pharmacy Invoked..");
	    	savepharmacyDocument(pharmacys[loopCounter]._id, pharmacys[loopCounter], response);
	  	    console.log("pharmacy Created Successfully..");
		}
	});	

	var savepharmacyDocument = function(id, json, response) {
	    if (id === undefined) {
	        // Generated random id
	        id = '';
	    }

	    pharmacydb.insert(json, id, function(err, doc) {
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
