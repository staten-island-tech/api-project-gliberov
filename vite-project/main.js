/* const baseURL = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=TSLA&interval=5min&apikey=754XM1A6MI6WI2K4'
async function getData(URL){
    try {
    const response = await fetch(URL);
    console.log(response);
    if( response.status != 200){
        throw new Error(response.statusText);
    }
    //take respone from server and convert it to JSON
    const data = await response.json();
    console.log(data)
    } catch (error) {
        
    }
  
}
getData(baseURL); */

const margin = { top:70, right: 30, bottom: 40, left: 80};
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const x = d3.scaleTime()
    .range([0,width]);
const y = d3.scaleLinear()
    .range([height,0]);

const svg = d3.select("#chart-container")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=TSLA&interval=5min&outputsize=full&apikey=754XM1A6MI6WI2K4").then(function (data) {
    const dates = Object.keys(data['Time Series (5min)']);
    const datesList = []
    dates.forEach(date => datesList.push(date))
    console.log(datesList.sort())
    
});

x.domain(d3.extent(data, d => d.date));
y.domain([0, d3.max(data, d => d.value)]);

svg.append('g')
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x)
    .ticks(d3.timeMonth.every(1))
    .tickFormat(d3.timeFormat("%b %Y")));

svg.append('g')
    .call(d3.axisLeft(y))

const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value));

svg.append('path')
    .datum(dataset)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1)
    .attr("d", line);