'use strict';

exports.labServices =  function(app, labdb){
	app.post('/api/searchlab', function(request, response) {
	    console.log("Search lab Invoked..");
	    var searchParams = request.body;
	 	
	 	console.log(searchParams);

		labdb.find(searchParams, function(err, body) {
		  if (!err){
      		console.log(JSON.stringify(body.docs));
 	 		console.log('total # of labs -> ' + body.docs.length);

            response.write(JSON.stringify({
                status : 200,
                body : body.docs
            }));
			response.end();
		  }
		});

	    console.log("Search lab Successful..");
	});	


	app.get('/api/labAllDocs', function(request, response) {
	    console.log("/api/labs method invoked.. ");

	    var labList = [];
	    var i = 0;
	    labdb.list({include_docs:true},function(err, body) {
	        if (!err) {
				console.log('total # of docs -> ' + body.rows.length);
 	          	
 	          	(function(body,response,labList){	 
 	          		for(var loopCounter in body.rows){
 	          			if(body.rows[loopCounter].doc.docType === 'LAB'){
	 	          			labList.push(body.rows[loopCounter].doc);
	 	          		}
 	          		}         	

 	          		response.write(JSON.stringify({
		                status : 200,
		                body : labList
		            }));
					response.end();
				})(body,response, labList);
	          	
	        } else {
	            console.log(err);
	            response.write(JSON.stringify({
	                status : 200
	            }));
	            response.end();
	        }
	    });
	});

	app.post('/api/lab', function(request, response) {
	    console.log("Create lab Invoked..");
	    var lab = request.body;
	    savelabDocument(lab._id, lab, response);
	    console.log("lab Created Successfully..");
	});	

	app.post('/api/savealllabs', function(request, response) {
	   	var labs = request.body;
	    var timer = 1;
	    for(var loopCounter in labs){
	    	timer++;
    		console.log("Create lab Invoked..");
	    	labdb.insert(labs[loopCounter], '', function(err, doc) {
		        if (err) {
		            console.log(err);
		        } 
		    });
		    console.log("lab Created Successfully..");
	    }
        response.write(JSON.stringify({
            status : 200,
            body : '{"message":"Records Sent for Addition"}'
        }));
        response.end();	
	});	


	var savelabDocument = function(id, json, response) {
	    if (id === undefined) {
	        // Generated random id
	        id = '';
	    }

	    labdb.insert(json, id, function(err, doc) {
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
