/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    patient = require('./modules/patient'),
    provider = require('./modules/provider'),
    pharmacy = require('./modules/pharmacy'),
    lab = require('./modules/lab'),
    drug = require('./modules/drug'),
    user = require('./modules/user'),
    secretory = require('./modules/secretory')
    dbconfig = require('./config/dbconfig');

var app = express();


var db;
var cloudant;

var dbCredentials = {
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
        dbCredentials.url = "https://8cf84732-fde5-498c-b67b-1b41b826c8af-bluemix:f30d83821412744e2b514b105254e7a0befbbc8d8fd06d27b7728567df19919e@8cf84732-fde5-498c-b67b-1b41b826c8af-bluemix.cloudant.com";
    }
    
    console.log(dbCredentials.url);

    cloudant = require('cloudant')(dbCredentials.url);


    for(dbkey in dbconfig.dbDetails){
        (function(dbkey){ 
            console.log('Initializing - ' + dbconfig.dbDetails[dbkey].dbname);
            var dbRef;
            cloudant.db.create(dbconfig.dbDetails[dbkey].dbname, function(err, res) {
                if (err) {
                    console.log('Could not create new db: ' + dbconfig.dbDetails[dbkey].dbname + ', it might already exist.');
                }
            });
            dbRef = cloudant.use(dbconfig.dbDetails[dbkey].dbname);
            console.log('Initialized - ' + dbconfig.dbDetails[dbkey].dbname);
            dbconfig.dbDetails[dbkey].dbRef = dbRef;
        })(dbkey);
    }

    console.log(JSON.stringify(dbconfig));
}

initDBConnection();

app.get('/', routes.index);

patient.patientServices(app,dbconfig.dbDetails['patientdb'].dbRef);
provider.providerServices(app,dbconfig.dbDetails['providerdb'].dbRef);
pharmacy.pharmacyServices(app,dbconfig.dbDetails['pharmacydb'].dbRef);
lab.labServices(app,dbconfig.dbDetails['labdb'].dbRef);
drug.drugServices(app,dbconfig.dbDetails['drugdb'].dbRef);
user.userServices(app,dbconfig.dbDetails['userdb'].dbRef);
secretory.secretoryServices(app,dbconfig.dbDetails['secretorydb'].dbRef);

http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
