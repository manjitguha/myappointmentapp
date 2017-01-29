'use strict';

exports.secretoryServices =  function(app, secretorydb){
	app.post('/api/searchsecretory', function(request, response) {
	    console.log("Search secretory Invoked..");
	    var searchParams = request.body;
	 	
	 	console.log(searchParams);


		secretorydb.find(searchParams, function(err, body) {
		  if (!err){
      		console.log(JSON.stringify(body.docs));
 	 		console.log('total # of secretorys -> ' + body.docs.length);

            response.write(JSON.stringify({
                status : 200,
                body : body.docs
            }));
			response.end();
		  }
		});

	    console.log("Search secretory Successful..");
	});	


	app.get('/api/secretoryAllDocs', function(request, response) {
	    console.log("/api/secretorys method invoked.. ");

	    var secretoryList = [];
	    var i = 0;
	    secretorydb.list({include_docs:true},function(err, body) {
	        if (!err) {
				console.log('total # of docs -> ' + body.rows.length);
 	          	
 	          	(function(body,response,secretoryList){	 
 	          		for(var loopCounter in body.rows){
 	          			if(body.rows[loopCounter].doc.docType === 'SECRETORY'){
	 	          			secretoryList.push(body.rows[loopCounter].doc);
	 	          		}
 	          		}         	

 	          		response.write(JSON.stringify({
		                status : 200,
		                body : secretoryList
		            }));
					response.end();
				})(body,response, secretoryList);
	          	
	        } else {
	            console.log(err);
	            response.write(JSON.stringify({
	                status : 200
	            }));
	            response.end();
	        }
	    });
	});

	app.post('/api/secretory', function(request, response) {
	    console.log("Create secretory Invoked..");
	    var secretory = request.body;
	    savesecretoryDocument(secretory._id, secretory, response);
	    console.log("secretory Created Successfully..");
	});	

	app.post('/api/saveallsecretorys', function(request, response) {
	   	var secretorys = request.body;
	    var timer = 1;
	    for(var loopCounter in secretorys){
	    	timer++;
    		console.log("Create secretory Invoked..");
	    	secretorydb.insert(secretorys[loopCounter], '', function(err, doc) {
		        if (err) {
		            console.log(err);
		        } 
		    });
		    console.log("secretory Created Successfully..");
	    }
        response.write(JSON.stringify({
            status : 200,
            body : '{"message":"Records Sent for Addition"}'
        }));
        response.end();	
	});	


	var savesecretoryDocument = function(id, json, response) {
	    if (id === undefined) {
	        // Generated random id
	        id = '';
	    }

	    secretorydb.insert(json, id, function(err, doc) {
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
