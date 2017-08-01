var builder 	= require('botbuilder');
var restify 	= require('restify');
var sqlite3 	= require('sqlite3').verbose();
var luisdb 	= new sqlite3.Database('./luisAppDb.db','OPEN_READONLY');
var async 	= require('async'); 
var globalVarTest = {};

var server = restify.createServer();
server.listen('https://luisappby.azurewebsites.net',PORT=3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
/*
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
*/
var connector = new builder.ChatConnector({
    appId: '8439e283-7b30-4afc-94b7-022441eb8747',
    appPassword: 'RRvDX4a3j7eieMNBA5yMkKN'
});
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session) {
    session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
});

var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/dd40fde3-bf03-4a96-862d-b2a40a5e0a67?subscription-key=937acbcd0f6c4a87b304c085673d5978&verbose=true&timezoneOffset=0&q=');
bot.recognizer(recognizer);

bot.dialog('Greetings', function (session) {
	console.log('listenins');
    	session.endDialog('hello there.');
}).triggerAction({
    matches: 'Greetings'
});

bot.dialog('GreetResponse', function (session) {
    session.endDialog('well...everything is going well.');
}).triggerAction({
    matches: 'GreetResponse'
});

bot.dialog('Help', function (session) {
    session.endDialog('Hi! there..Actually i am in learning mode, so be easy on me.Try with greeting only');
}).triggerAction({
    matches: 'Help'
});

bot.dialog('MarketShare', [
    function (session,args) {
	var countryEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.geography.country');
	var countryName = countryEntity.entity
	marketShareQueries(countryName,function(rowData){
		if(rowData != 'No rec Found'){ 
        	session.send('Category : '+rowData.Category+' Total : '+rowData.Total+' RB_Market : '+rowData.RB_Market+' Market_Share :  '+rowData.Market_Share);
		}
		else{
			session.send('Sorry record found');
			 }
		})
	}        
]).triggerAction({
    	matches: 'MarketShare'
});




	
function createDatabase(){
	luisdb.serialize(function() {
		luisdb.run("CREATE TABLE if not exists company_share (Country TEXT,Date DATE,Category TEXT,Total NUMBER,RB_Market NUMBER,Market_Share NUMBER)");
	});
 	luisdb.close();
}

function marketShareQueries(countryName,callback){
	recConName = countryName;
	var country = "'"+countryName.toUpperCase()+"'";
  	luisdb.each("SELECT Category,Total,RB_Market,Market_Share  FROM company_share WHERE Country = "+country, function(err, row) {
		console.log(row)
		if (err){
      			console.log(err);
			callback('No rec Found');
			}
		else{
			console.log(row);
			callback(row);
			}
  		});
		//luisdb.close();
}

