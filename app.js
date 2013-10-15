// ––––––––––––––––––––––––––––––––––––––––––––––––––
/* 
WHERE IS MY DATA
APON PALANUWECH
*/
// include node's modules
var connect = require('connect'),
	fs = require('fs'),
	util = require('util'),
	io = require('socket.io').listen(9001), // WS port
	port = 9000, // HTTP port
	spawn = require('child_process').spawn,
	exec = require('child_process').exec,
    spwn = spawn('tshark', ['tcp port 80 and (((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12]&0xf0)>>2)) != 0)']),
    awk = spawn('awk', ['{print "?" $2 ">" $4 "&"}']),
    colors = require('colors'),
    mongo = require('mongoskin'),
    db = mongo.db('localhost:27017/test?auto_reconnect', {safe: false}),
    $ = require('jquery').create(),
	child,
	myIp = 0;

colors.setTheme({
	info: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});
// WEB SERVER –––––––––––––––––––––––––––––––––––––––––––––––
connect.createServer(
	connect.static(__dirname + '/public') // two underscores
).listen(port);
util.log('the server is running on port: ' + port);

// run mongod
child = exec('mongod',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});
// get ip address
child = exec("ip addr show wlan0 | grep inet | awk '{print $2}' | cut -d/ -f1",
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});

// SOCKET.IO –––––––––––––––––––––––––––––––––––––––––––––––
io.set('log level', 1);
io.sockets.on('connection', function(socket) {
	util.log('Ooooooh, someone just poked me :)');
});
// SPAWN HANDLER –––––––––––––––––––––––––––––––––––––––––––––––
spwn.stdout.on('data', function (data) {
  awk.stdin.write(data);
});

spwn.on('close', function (code) {
  if (code !== 0) {
    console.log('spwn process exited with code ' + code);
  }
  awk.stdin.end();
});

awk.stdout.on('data', function (data) {
  rawArray = data.replace('/?/g', '').split('\n');
  console.log(rawArray);
  // io.sockets.emit('data', data.toString());
});

awk.stderr.on('data', function (data) {
  console.log('awk stderr: ' + data);
});

awk.on('close', function (code) {
  if (code !== 0) {
    console.log('awk process exited with code ' + code);
  }
});

// DATA PROCESSING –––––––––––––––––––––––––––––––––––––––––––––––
function processData(raw) {
	// dataArray = raw.replace('/?/g', '').split('\n');
	// dataArray.shift();
	// dataArray.pop();
}

