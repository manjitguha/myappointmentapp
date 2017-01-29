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
 	          		var rows = 0; 
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
	    var timer = 1;
	    for(var loopCounter in providers){
	    	timer++;
    		console.log("Create provider Invoked..");
	    	providerdb.insert(providers[loopCounter], '', function(err, doc) {
		        if (err) {
		            console.log(err);
		        } 
		    });
		    console.log("provider Created Successfully..");
	    }
        response.write(JSON.stringify({
            status : 200,
            body : '{"message":"Records Sent for Addition"}'
        }));
        response.end();	
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

	var camelCase = function(str){
		return str.charAt(0).toUpperCase()+str.substring(1).toLowerCase();
	}
};
