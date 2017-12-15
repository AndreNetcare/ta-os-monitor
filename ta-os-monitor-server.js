var fs = require('fs');
var app = require('express')();
var express = require('express');
//ssl cert and keys 

var config = require('./config')

//https with ssl
//var server = require('https').createServer(config.certs_retail, app);
//http for testing
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var osm = require("os-monitor");
var win_cpu = require('windows-cpu');






app.use(express.static(__dirname + '/public'));

io.on('connection', function(){ 
    console.log("dsgdfgfgdfhzd");
 });

 io.on('connect', function (socket) {
    socket.emit('connected', {
        status: 'connected',
        type: osm.os.type(), 
        cpus: osm.os.cpus(),
    });
});

io.on('disconnect', function (socket) {
    socket.emit('disconnected');
});


osm.start({
    delay: 10000 // interval in ms between monitor cycles
    , stream: false // set true to enable the monitor as a Readable Stream
    , immediate: false // set true to execute a monitor cycle at start()
}).pipe(process.stdout);


// define handler that will always fire every cycle
osm.on('monitor', function (monitorEvent) {
    io.emit('os-update', monitorEvent);
    //io.emit('cpu-update', win_cpu.totalLoad(function(error, results) {return results; }));
    if(osm.os.platform() == 'win32'){
        win_cpu.totalLoad(function(error, results) {
            console.log('totalLoad= ' + results[0]  + '% ');
            var averageCPULoad = 0;
            if(results instanceof Array){
                results.forEach((retult) => {
                    averageCPULoad +=  retult;
                });
                averageCPULoad = averageCPULoad / results.length;
            }else{
                averageCPULoad = results;
            }
            io.emit('cpu-update', (averageCPULoad));
        });
        win_cpu.findLoad('java', function(error, results) {
            if(error) {
                console.log(' No Java Process Found.');
                io.emit('cpu-java-update', 0);
                }else{
                    console.log('javaLoad= ' + results.load  + '% ');
                    console.log(results);
                    io.emit('cpu-java-update', results.load / results.found.length);
                }
            
        });  
        //totalCPULoad();
        //info(); 
        //javaCPULoad(); 
    }
    
});

function javaCPULoad(){
    win_cpu.findLoad('java', function(error, results) {test(error, results)});
}
var done = 0;
function test(error, result){
    if(done == 2){

        console.log("wuuuu");
    }
    console.log("what? " + result);
    ++done;
}

function totalCPULoad(){
    
    win_cpu.totalLoad(function(error, results) {
        if(error) {
        //return console.log(error);
        }
        results.forEach((retult) => {
            console.log('CPU Load ' + retult + '%.');
        });
    });
    
}

function info(){
    win_cpu.cpuInfo(function(error, results) {
        if(error) {
        return console.log(error);
        }
        
        // results =>
        // [
        //    'Intel(R) Xeon(R) CPU E5-2609 0 @ 2.40GHz',
        //    'Intel(R) Xeon(R) CPU E5-2609 0 @ 2.40GHz'
        // ]
        
        console.log('Installed Processors: ', results);
    });
}


server.listen(process.env.npm_package_config_port);