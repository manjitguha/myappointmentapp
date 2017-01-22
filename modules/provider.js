'use strict';

exports.providerServices =  function(app, providerdb){
	app.post('/api/searchprovider', function(request, response) {
	    console.log("Search provider Invoked..");
	    var searchParams = request.body;
	 	
	 	console.log(searchParams);

		providerdb.find(searchParams, function(err, body) {
		  if (!err){
      		console.log(JSON.stringify(body.docs));
 	 		console.log('total # of providers -> ' + body.docs.length);

            response.write(JSON.stringify({
                status : 200,
                body : body.docs
            }));
			response.end();
		  }
		});

	    console.log("Search provider Successful..");
	});	


	app.get('/api/providerAllDocs', function(request, response) {
	    console.log("/api/providers method invoked.. ");

	    var providerList = [];
	    var i = 0;
	    providerdb.list({include_docs:true},function(err, body) {
	        if (!err) {
				console.log('total # of docs -> ' + body.rows.length);
 	          	
 	          	(function(body,response,providerList){	 
 	          		for(var loopCounter in body.rows){
 	          			if(body.rows[loopCounter].doc.docType === 'PROVIDER'){
	 	          			providerList.push(body.rows[loopCounter].doc);
	 	          		}
 	          		}         	

 	          		response.write(JSON.stringify({
		                status : 200,
		                body : providerList
		            }));
					response.end();
				})(body,response, providerList);
	          	
	        } else {
	            console.log(err);
	            response.write(JSON.stringify({
	                status : 200
	            }));
	            response.end();
	        }
	    });
	});

	app.post('/api/provider', function(request, response) {
	    console.log("Create provider Invoked..");
	    var provider = request.body;
	    saveproviderDocument(provider._id, provider, response);
	    console.log("provider Created Successfully..");
	});	

	app.post('/api/saveallproviders', function(request, response) {
	    var providers = request.body;
	    for(loopCounter in providers){
	    	console.log("Create provider Invoked..");
	    	saveproviderDocument(providers[loopCounter]._id, providers[loopCounter], response);
	  	    console.log("provider Created Successfully..");
		}
	});	


	var saveproviderDocument = function(id, json, response) {
	    if (id === undefined) {
	        // Generated random id
	        id = '';
	    }

	    providerdb.insert(json, id, function(err, doc) {
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
