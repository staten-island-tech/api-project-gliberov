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
import {data} from "../vite-project/demo.js"
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

d3.json("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=NVDA&interval=5min&outputsize=full&apikey=ET1R73GNIE7MF4EU"
).then(function (data) {
    const dates = Object.keys(data['Time Series (5min)']);
    const fullList = []
    
    dates.forEach(date => {
        const point = { 
            date: date, 
            open: parseFloat(data['Time Series (5min)'][date]["1. open"]),
            high: parseFloat(data['Time Series (5min)'][date]["2. high"]),
            low: parseFloat(data['Time Series (5min)'][date]["3. low"]),
            close: parseFloat(data['Time Series (5min)'][date]["4. close"]),
            volume: parseFloat(data['Time Series (5min)'][date]["5. volume"])}
    fullList.push(point)
    })
    fullList.reverse()
    const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S")
    fullList.forEach( d => {
        d.date = parseDate(d.date);
        d.open = +d.open;
    });

x.domain(d3.extent(fullList, d => d.date));
y.domain([0, d3.max(fullList, d => d.open)]);

svg.append('g')
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x)
    .ticks(d3.timeMonth.every(1))
    .tickFormat(d3.timeFormat("%b %Y")));

svg.append('g')
    .call(d3.axisLeft(y))

const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.open));

svg.append('path')
    .datum(fullList)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1)
    .attr("d", line); 
})