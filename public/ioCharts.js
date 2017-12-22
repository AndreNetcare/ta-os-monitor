var memChart = null;
var cpuChart = null;
var memBarChart = null;
var polarAreaChart = null;

var cpuType = '';
var noOfCpu = 0;

var doughnutChartCanvas = document.getElementById('memoryChart');
var cpuChartCanvas = document.getElementById('cpuusageChart');
var memoryStackedBarChartCanvas = document.getElementById('memoryStackedBarChart');
var cpuPolarChartCanvas = document.getElementById('cpuusagePolar');

//for polar cpu chart
var cpuIdle = 0;
var cpuTotalload = 0;
var cpuJava = 0;

var updateCount = 0;

// And for a doughnut chart
function ngOnInit() {

  var cpuPolarData = {
    labels: ["Idle","Load","Java"],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        "rgba(255, 0, 0, 0.5)",
        "rgba(100, 255, 0, 0.5)",
        "rgba(200, 50, 255, 0.5)"
      ]
    }]
  };

this.polarAreaChart = new Chart(cpuPolarChartCanvas, {
    type: 'polarArea',
    data: cpuPolarData,
    options: {
      scale: {
          ticks: {
              beginAtZero: true,
              max: 100
          }
      }
    }
  });


var memBarChartData = {
  datasets: [{
    label: 'Free Memory',
    data: [],
    backgroundColor: '#36a2eb',
  },{ 
    label: "Used Memory",
    data: [],
    backgroundColor: "#ff6384",
  }],
  labels: [],
  };

this.memBarChart = new Chart(memoryStackedBarChartCanvas, {
    type: 'bar',
    data: memBarChartData,
    options: {
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [{ stacked: true, display: true,ticks: {
                                                  beginAtZero: true,
                                                  //max: 100
                                                  callback: function(label, index, labels) {
                                                    return formatBytes(label, 2);
                                                          }
                                                    }
         }]
      }
    }
});
  
var doughnutGraphData = {
    datasets: [{
      data: [1, 0],
      backgroundColor: ['#36a2eb', '#ff6384'],
    }],
    labels: [
      'Free',
      'Used',
    ]
  };

this.memChart  = new Chart(doughnutChartCanvas, {
    type: 'doughnut',
    data: doughnutGraphData,
    maintainAspectRatio: true,
    options: {}
});

var cpuLoadGraphData = {
    datasets: [{
      label: 'CPU Load System',
      data: [0,0,0,0,0],
      backgroundColor: 'rgba(75, 192, 192, 0.4)',
    },{ 
      label: "CPU Load Java",
      data: [0,0,0,0,0],
      borderColor: "#8e5ea2",
      fill: false
    }],
    labels: ['x', 'x', 'x', 'x', 'x'],

  };
  
  this.cpuChart = new Chart(cpuChartCanvas, {
    type: 'line',
    data: cpuLoadGraphData,
    maintainAspectRatio: true,
    options: {
      scales: {
        yAxes: [{
          display: true,
          ticks: {
              beginAtZero: true,
              max: 100
          }
      }]
      }
    }
  });

}

  function updateCharts(event) {
    
        memChart.data.labels.pop();
        memChart.data.labels.pop();
        memChart.data.labels.push('Free: ' + formatBytes(event.freemem, 2));
        memChart.data.labels.push('Used: ' + formatBytes(event.totalmem - event.freemem, 2));
    
        memChart.data.datasets.forEach((dataset) => {
          dataset.data.pop();
          dataset.data.pop();
          dataset.data.push(event.freemem);
          dataset.data.push(event.totalmem - event.freemem);
        });

        memChart.update(0);
        //check if all cpu load averages are zero
        if(event.loadavg[0] != 0 && event.loadavg[1] != 0 && event.loadavg[2] != 0){
          cpuChart.data.datasets.forEach((dataset) => {
            if ( dataset.data.length > 5) {
              dataset.data.shift();
            }
            dataset.data.push(event.loadavg[0]);
            cpuTotalload += event.loadavg[0];
            cpuIdle += (100 - event.loadavg[0]);
            cpuJava += 0;
          });

          cpuChart.update(0);
          updateCpuPolarChart();
        }

}

function updateCPUChart(event){

    
    cpuChart.data.datasets.forEach((dataset) => {
        if ( dataset.data.length > 5) {
          dataset.data.shift();
        }
        dataset.data.push(event);
      });
      
      cpuChart.update(0);
}

function updateCompCPUChart(event){
  
      
      
          if (  cpuChart.data.datasets[0].data.length > 5) {
            cpuChart.data.datasets[0].data.shift();
            cpuChart.data.labels.shift();
          }
          cpuChart.data.datasets[0].data.push(event);
          updateCount++;
          cpuTotalload += event;
          cpuIdle += (100 - event);
          var d = new Date();
          cpuChart.data.labels.push('' + fomatTime(d.getHours()) + ':' + fomatTime(d.getMinutes()) + ':' + fomatTime(d.getSeconds()));
      
        
        cpuChart.update(0);
  }

  function updateJavaCPUChart(event){
    
        
    if (  cpuChart.data.datasets[1].data.length > 5) {
      cpuChart.data.datasets[1].data.shift();
    }
    cpuChart.data.datasets[1].data.push(event);
    cpuJava += event;
  
  cpuChart.update(0);
  updateCpuPolarChart();
    }


    function updateCpuPolarChart(){
      polarAreaChart.data.datasets[0].data.pop();
      polarAreaChart.data.datasets[0].data.pop();
      polarAreaChart.data.datasets[0].data.pop();
      polarAreaChart.data.datasets[0].data.push(cpuIdle / updateCount);
      polarAreaChart.data.datasets[0].data.push(cpuTotalload / updateCount);
      polarAreaChart.data.datasets[0].data.push(cpuJava / updateCount);
      polarAreaChart.update(0);
    }

function updateMemBarChart(event){
  
    //memBarChart.options.scales.yAxes.max = event.totalmem;
      
      if (  memBarChart.data.datasets[0].data.length > 5) {
        memBarChart.data.labels.shift();
        memBarChart.data.datasets[0].data.shift();
        memBarChart.data.datasets[1].data.shift();
      }
      var d = new Date();
      memBarChart.data.labels.push('' + fomatTime(d.getHours()) + ':' + fomatTime(d.getMinutes()) + ':' + fomatTime(d.getSeconds()));
      //memBarChart.data.datasets[0].data.label.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
      memBarChart.data.datasets[0].label = ('Free: ' + formatBytes(event.freemem, 2));
      
      memBarChart.data.datasets[0].backgroundColor = '#36a2eb';
      memBarChart.data.datasets[0].data.push(event.freemem);

      memBarChart.data.datasets[1].label = ('Used: ' + formatBytes(event.totalmem - event.freemem, 2));
      
      memBarChart.data.datasets[1].backgroundColor = '#ff6384';
      memBarChart.data.datasets[1].data.push(event.totalmem - event.freemem);
    
      memBarChart.update(0);
}
    
      function formatBytes(bytes, decimals){
        if (bytes === 0) {
          return '0 Bytes';
        }
        const k = 1000,
          dm = decimals || 2,
          sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
          i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
      }

      function fomatTime(time){
        var formetedTime = '0';
        if(time < 10){
          formetedTime += time;
          return formetedTime;
        }else{
          return time;
        }
      }

function connected(connectData) {
        cpuType = connectData.types;
        noOfCpu = connectData.cpus;
      }