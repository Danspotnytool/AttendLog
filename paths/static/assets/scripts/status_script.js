
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
const getChartConfig = (name) => {
    return {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: name,
                data: [],
                backgroundColor: 'transparent',
                borderColor: '#01284D',
                borderWidth: 1,
                fill: false
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    }
};

const apiUsageChartElem = document.getElementById('apiUsageChartElem');
const apiUsageChart = new Chart(apiUsageChartElem, getChartConfig('API Usage'));

const signUpsChartElem = document.getElementById('signUpsChartElem');
const signUpsChart = new Chart(signUpsChartElem, getChartConfig('Sign Ups'));

const signInsChartElem = document.getElementById('signInsChartElem');
const signInsChart = new Chart(signInsChartElem, getChartConfig('Sign Ins'));

const connectedUsersChartElem = document.getElementById('connectedUsersChartElem');
const connectedUsersChart = new Chart(connectedUsersChartElem, getChartConfig('Connected Users'));