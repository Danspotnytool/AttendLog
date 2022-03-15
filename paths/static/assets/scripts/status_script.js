
const graphContainer = Array.from(document.getElementsByClassName('graphContainer'));



// Resize apiUsageContainer
const resizeApiUsageContainer = () => {
    graphContainer.forEach((graphContainer) => {
        graphContainer.style.height = `${graphContainer.innerHeight * 0.7}px`;
    });
};
resizeApiUsageContainer();

window.onresize = () => {
    resizeApiUsageContainer();
};



// Charts Default config
// Should have a point on the last point
const getChartConfig = (name) => {
    return {
        type: 'line',
        data: {
            labels: [
                '', '', '', '', '', '', '', '', '', '',
                '', '', '', '', '', '', '', '', '', '',
                '', '', '', '', '', '', '', '', '', ''
            ],
            datasets: [{
                label: name,
                data: [],
                backgroundColor: 'transparent',
                borderColor: '#01284D',
                borderWidth: 1,
                fill: true,
                pointRadius: 0
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        maxTicksLimit: 5,
                        stepSize: 1,
                        callback: function (value, index, values) {
                            return value;
                        }
                    },
                    gridLines: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x'
                    }
                }
            }
        }
    }
};

const apiCallsChartElem = document.getElementById('apiCallsChartElem');
const apiCallsChart = new Chart(apiCallsChartElem, getChartConfig('API Calls Per Minute'));

const signUpsChartElem = document.getElementById('signUpsChartElem');
const signUpsChart = new Chart(signUpsChartElem, getChartConfig('Sign Ups'));

const signInsChartElem = document.getElementById('signInsChartElem');
const signInsChart = new Chart(signInsChartElem, getChartConfig('Sign Ins'));

const connectedUsersChartElem = document.getElementById('connectedUsersChartElem');
const connectedUsersChart = new Chart(connectedUsersChartElem, getChartConfig('Connected Users'));



const port = location.port;

// Path: '/status'
const statusSocket = io.connect(`${window.location.href}`);
statusSocket.on('connect', () => {
    console.log(`Connected to server as ${statusSocket.id}`);
});
statusSocket.on('disconnect', () => {
    console.log(`Disconnected from server as ${statusSocket.id}`);
});
statusSocket.on('connectedUsers', (data) => {
    connectedUsersChart.data.datasets[0].data = data;
    connectedUsersChart.update();
});
statusSocket.on('apiCalls', (data) => {
    data.forEach((data, index) => {
        apiCallsChart.data.labels[index] = '';
    });
    apiCallsChart.data.datasets[0].data = data;

    apiCallsChart.update();
});
statusSocket.on('signups', (data) => {
    data.forEach((data, index) => {
        signUpsChart.data.labels[index] = '';
    });
    signUpsChart.data.datasets[0].data = data;

    signUpsChart.update();
});
statusSocket.on('signins', (data) => {
    data.forEach((data, index) => {
        signInsChart.data.labels[index] = '';
    });
    signInsChart.data.datasets[0].data = data;

    signInsChart.update();
});



statusSocket.on('uptime', (data) => {
    const uptimeSentence = document.getElementById('uptimeSentence');
    uptimeSentence.innerText = `Server has been up for: ${data}`;
});
statusSocket.on('startupTime', (data) => {
    const startupTime = document.getElementById('startupTime');
    startupTime.innerText = `${data}`;
});