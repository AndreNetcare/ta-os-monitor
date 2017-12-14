var memChart = null;
var cpuChart = null;

var cpuType = '';
var noOfCpu = 0;

var ctx = document.getElementById('memoryChart');
var ctx2 = document.getElementById('cpuusageChart');



// And for a doughnut chart
function ngOnInit() {
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

this.memChart  = new Chart(ctx, {
    type: 'doughnut',
    data: doughnutGraphData,
    options: {}
});

var cpuLoadGraphData = {
    datasets: [{
      label: 'CPU Load System',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.4)',
    },{ 
      label: "CPU Load Java",
      data: [],
      borderColor: "#8e5ea2",
      fill: false
    }],
    labels: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],

  };
  
  this.cpuChart = new Chart(ctx2, {
    type: 'line',
    data: cpuLoadGraphData,
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
            if ( dataset.data.length > 9) {
              dataset.data.shift();
            }
            dataset.data.push(event.loadavg[0] * 100);
          });

          cpuChart.update(0);
        }

}

function updateCPUChart(event){

    
    cpuChart.data.datasets.forEach((dataset) => {
        if ( dataset.data.length > 9) {
          dataset.data.shift();
        }
        dataset.data.push(event);
      });
      
      cpuChart.update(0);
}

function updateCompCPUChart(event){
  
      
      
          if (  cpuChart.data.datasets[0].data.length > 9) {
            cpuChart.data.datasets[0].data.shift();
          }
          cpuChart.data.datasets[0].data.push(event);
      
        
        cpuChart.update(0);
  }

  function updateJavaCPUChart(event){
    
        
    if (  cpuChart.data.datasets[1].data.length > 9) {
      cpuChart.data.datasets[1].data.shift();
    }
    cpuChart.data.datasets[1].data.push(event);

  
  cpuChart.update(0);
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

function connected(connectData) {
        cpuType = connectData.types;
        noOfCpu = connectData.cpus;
      }