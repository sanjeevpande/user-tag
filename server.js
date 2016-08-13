var handler = function(req, res) {

    var request = url.parse(req.url, true);
    var action = request.pathname;
     
    if (action == '/scripts/jquery.min.js') {
        var data = fs.readFileSync('./scripts/jquery.min.js');
        res.writeHead(200, {'Content-Type': 'text/javascript' });
        res.end(data, 'binary');
    }
    else if (action == '/scripts/app.js') {
        var data = fs.readFileSync('./scripts/app.js');
        res.writeHead(200, {'Content-Type': 'text/javascript' });
        res.end(data, 'binary');
    }
    else if (action == '/persons.json') {
        var data = fs.readFileSync('./persons.json');
        res.writeHead(200, {'Content-Type': 'application/json' });
        res.end(data);
    }
    else { 
        fs.readFile('./index.html', function (err, data) {
            if(err){
                throw err;
            }
            res.writeHead(200);
            res.end(data);
        });    
    }
}
var app = require('http').createServer(handler);
var fs = require('fs');
var url = require('url');

var port = process.env.PORT || 3000;
 
app.listen(port);