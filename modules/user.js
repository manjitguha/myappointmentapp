'use strict';

exports.userServices =  function(app, userdb){
	app.post('/api/searchuser', function(request, response) {
	    console.log("Search user Invoked..");
	    var searchParams = request.body;
	 	
	 	console.log(searchParams);

		userdb.find(searchParams, function(err, body) {
		  if (!err){
      		console.log(JSON.stringify(body.docs));
 	 		console.log('total # of users -> ' + body.docs.length);

            response.write(JSON.stringify({
                status : 200,
                body : body.docs
            }));
			response.end();
		  }
		});

	    console.log("Search user Successful..");
	});	


	app.get('/api/userAllDocs', function(request, response) {
	    console.log("/api/users method invoked.. ");

	    var userList = [];
	    var i = 0;
	    userdb.list({include_docs:true},function(err, body) {
	        if (!err) {
				console.log('total # of docs -> ' + body.rows.length);
 	          	
 	          	(function(body,response,userList){	 
 	          		for(var loopCounter in body.rows){
 	          			if(body.rows[loopCounter].doc.docType === 'user'){
	 	          			userList.push(body.rows[loopCounter].doc);
	 	          		}
 	          		}         	

 	          		response.write(JSON.stringify({
		                status : 200,
		                body : userList
		            }));
					response.end();
				})(body,response, userList);
	          	
	        } else {
	            console.log(err);
	            response.write(JSON.stringify({
	                status : 200
	            }));
	            response.end();
	        }
	    });
	});

	app.post('/api/user', function(request, response) {
	    console.log("Create user Invoked..");
	    var user = request.body;
	    saveuserDocument(user._id, user, response);
	    console.log("user Created Successfully..");
	});	

	app.post('/api/saveallusers', function(request, response) {
	    var users = request.body;
	    for(loopCounter in users){
	    	console.log("Create user Invoked..");
	    	saveuserDocument(users[loopCounter]._id, users[loopCounter], response);
	  	    console.log("user Created Successfully..");
		}
	});	


	var saveuserDocument = function(id, json, response) {
	    if (id === undefined) {
	        // Generated random id
	        id = '';
	    }

	    userdb.insert(json, id, function(err, doc) {
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
