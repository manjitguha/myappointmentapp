'use strict';

exports.patientServices =  function(app, patientdb){
	app.post('/api/searchPatient', function(request, response) {
	    console.log("Search Patient Invoked..");
	    var searchParams = request.body;
	 	
	 	console.log(searchParams);

		patientdb.find(searchParams, function(err, body) {
		  if (!err){
      		console.log('total # of patients -> ' + body.docs.length);

            response.write(JSON.stringify({
                status : 200,
                body : body.docs
            }));
			response.end();
		  }
		});

	    console.log("Search Patient Successful..");
	});	


	app.get('/api/patientAllDocs', function(request, response) {
	    console.log("/api/patients method invoked.. ");

	    var patientList = [];
	    var i = 0;
	    patientdb.list({include_docs:true},function(err, body) {
	        if (!err) {
				console.log('total # of docs -> ' + body.rows.length);
 	          	
 	          	(function(body,response,patientList){	 
 	          		for(var loopCounter in body.rows){
 	          			if(body.rows[loopCounter].doc.docType === 'PATIENT'){
	 	          			patientList.push(body.rows[loopCounter].doc);
	 	          		}
 	          		}         	

 	          		response.write(JSON.stringify({
		                status : 200,
		                body : patientList
		            }));
					response.end();
				})(body,response, patientList);
	          	
	        } else {
	            console.log(err);
	            response.write(JSON.stringify({
	                status : 200
	            }));
	            response.end();
	        }
	    });
	});

	app.post('/api/patient', function(request, response) {
	    console.log("Create Patient Invoked..");
	    var patient = request.body;
	    savePatientDocument(patient._id, patient, response);
	    console.log("Patient Created Successfully..");
	});	


	app.post('/api/saveallpatients', function(request, response) {
	    var patients = request.body;
	    var timer = 1;
	    for(var loopCounter in patients){
	    	timer++;
    		console.log("Create patient Invoked..");
	    	patientdb.insert(patients[loopCounter], '', function(err, doc) {
		        if (err) {
		            console.log(err);
		        } 
		    });
		    console.log("patient Created Successfully..");
	    }
        response.write(JSON.stringify({
            status : 200,
            body : '{"message":"Records Sent for Addition"}'
        }));
        response.end();	
	});	

	var savePatientDocument = function(id, json, response) {
	    if (id === undefined) {
	        // Generated random id
	        id = '';
	    }

	    patientdb.insert(json, id, function(err, doc) {
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
