/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');

var app = express();

var db;

var cloudant;

var fileToUpload;

var dbCredentials = {
    dbName: 'my_sample_db',    
    patientDbName : 'patientdb'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

function initDBConnection() {
    //When running on Bluemix, this variable will be set to a json object
    //containing all the service credentials of all the bound services
    if (process.env.VCAP_SERVICES) {
        var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
        // Pattern match to find the first instance of a Cloudant service in
        // VCAP_SERVICES. If you know your service key, you can access the
        // service credentials directly by using the vcapServices object.
        for (var vcapService in vcapServices) {
            if (vcapService.match(/cloudant/i)) {
                dbCredentials.url = vcapServices[vcapService][0].credentials.url;
            }
        }
    } else { //When running locally, the VCAP_SERVICES will not be set

        // When running this app locally you can get your Cloudant credentials
        // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
        // Variables section for an app in the Bluemix console dashboard).
        // Alternately you could point to a local database here instead of a
        // Bluemix service.
        // url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
        dbCredentials.url = "REPLACE ME";
    }

    cloudant = require('cloudant')(dbCredentials.url);

    // check if DB exists if not create
    cloudant.db.create(dbCredentials.dbName, function(err, res) {
        if (err) {
            console.log('Could not create new db: ' + dbCredentials.dbName + ', it might already exist.');
        }
    });

    db = cloudant.use(dbCredentials.dbName);
}

initDBConnection();

app.get('/', routes.index);


app.post('/api/users', function(request, response) {
    console.log("Create Invoked..");
    var user = {
        username: 'johnsmith', password: 'password', firstName: 'John', lastName: 'Smith', organization: {
            orgName: 'SAINT FRANCIS MEDICAL GROUP INC',
            orgDescription: 'GROUP PRACTICE',
            homeURL: '/provider'
        }
    };
    saveDocument(null, user, response);
});


app.get('/api/users', function(request, response) {
    console.log("/api/users method invoked.. ");

    db = cloudant.use(dbCredentials.dbName);
    var userList = [];
    var i = 0;
    db.list(function(err, body) {
        if (!err) {
            var len = body.rows.length;
            console.log('total # of users -> ' + len);
            body.rows.forEach(function(document) {
                db.get(document.id, {
                    revs_info : true
                }, function(err, user) {
                    if (!err) {
                        userList.push(user);
                        i++;
                        console.log('User is ->' + user);

                        if (i >= len) {
                            response.write(JSON.stringify({
                                status : 200,
                                body : userList
                            }));

                            response.end();
                            console.log('ending response...');
                        }
                    } else {
                        response.write(JSON.stringify({
                            status : 200
                        }));
                        response.end();
                    }
                });
                console.log('Fetching User');
            });
        } else {
            console.log(err);
            response.write(JSON.stringify({
                status : 200
            }));
            response.end();
        }
    });
});

var saveDocument = function(id, json, response) {
    if (id === undefined) {
        // Generated random id
        id = '';
    }

    db.insert(json, id, function(err, doc) {
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
}


http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
