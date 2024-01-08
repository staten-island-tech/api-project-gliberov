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
import '../css/style.css'
import {DOMSelectors} from './selectors'

getTimeSeriesData('AAPL')

DOMSelectors.form.addEventListener('submit', function(event) {
    DOMSelectors.chart.innerHTML = ''
    event.preventDefault();
    let symbol = DOMSelectors.symbol.value.toUpperCase()
    getTimeSeriesData(symbol);
}
)

async function getTimeSeriesData(symbol) {
    d3.select("#chart-container").html("");
    const URL = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=30min&outputsize=full&apikey=P4HCJ66TONTUGOWE`
    try {

        const response = await fetch(URL)
        if (response.status != 200){throw new Error(response.statusText); }
        const data = await response.json()
        const dates = Object.keys(data['Time Series (30min)']);
        const fullList = []
        
        
        const margin = {top:100, right: 50, bottom: 70, left: 80};
        const width = window.innerWidth - margin.left - margin.right;
        const height = window.innerHeight - margin.top - margin.bottom;

        const x = d3.scaleTime()
            .range([0,width]);
        const y = d3.scaleLinear()
            .range([height,0]);

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.open))
        
            

        const svg = d3.select("#chart-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("display", "none") 
        .style("flex-direction", "column") 
        .style("align-items", "center") 
        .style("justify-content", "center");

        dates.forEach(date => {
            const point = { 
                date: date, 
                open: parseFloat(data['Time Series (30min)'][date]["1. open"]),
                high: parseFloat(data['Time Series (30min)'][date]["2. high"]),
                low: parseFloat(data['Time Series (30min)'][date]["3. low"]),
                close: parseFloat(data['Time Series (30min)'][date]["4. close"]),
                volume: parseFloat(data['Time Series (30min)'][date]["5. volume"])}
        
            fullList.push(point)
        })
        fullList.reverse()
        const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S")
        fullList.forEach( d => {
            d.date = parseDate(d.date);
            d.open = +d.open;
        });

        x.domain(d3.extent(fullList, d => d.date));
        y.domain(d3.extent(fullList, d => d.open));

        svg.append('g')
            .attr("transform", `translate(0,${height})`)
            .style("font-size", "14px")
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
            .call(g => g.select(".domain").remove())
            .selectAll(".tick line")
            .style("stroke-opacity", 0)
        svg.selectAll(".tick text")
            .attr("fill", "#777");

        svg.append('g')
        .style("font-size", "14px")
        .call(d3.axisLeft(y)
            .tickSize(0)
            .tickPadding(10))
        .call(g => g.select(".domain").remove())
        .selectAll(".tick text")
        .style("fill", "#777")
        .style("visibility", (d, i, nodes) => {
            if (i === 0) {
                return "hidden";
            } else {
                return "visibile";
            }
        })

        svg.selectAll("xGrid")
        .data(x.ticks().slice(1))
        .join("line")
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("y1",0)
        .attr("y2", height)
        .attr("stroke", "#A9A9A9")
        .attr("stroke-width", .5);

        svg.selectAll("yGrid")
            .data(y.ticks((d3.max(fullList, d=> d.open))).slice(1))
            .join("line")
            .attr("x1",0)
            .attr("x2", width)
            .attr("y1", d => y(d))
            .attr("y2", d => y(d))
            .attr("stroke", "#A9A9A9")
            .attr("stroke-width", .5)

        const path = svg.append('path')
            .datum(fullList)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1)
            .attr("d", line(fullList)); 

        const circle = svg.append("circle")
            .attr("r",0)
            .attr("fill", "steelblue")
            .style("stroke", "white")
            .attr("opacity", .70)
            .style("pointer-events", "none");

        const listeningRect = svg.append("rect")
            .attr("width", width)
            .attr("height", height)

        listeningRect.on("mousemove", function (event) {
            const [xCoord] = d3.pointer(event,this)
            const bisectDate = d3.bisector(d => d.date).left
            const x0 = x.invert(xCoord);
            const i = bisectDate(fullList, x0, 1)
            const d0 = fullList[i - 1]
            const d1 = fullList[i]
            const d = x0 - d0.date > d1.date - x0 ? d1: d0
            const xPos = x(d.date)
            const yPos = y(d.open)

            circle.attr("cx", xPos)
                .attr("cy", yPos)


            circle.transition()
                .duration(50)
                .attr('r', 5)

            tooltip
                .style("display", "block")
                .html(`<strong>Date:</strong>${d.date}<br><strong>Price:</strong> $${d.open}<br><strong>Volume:</strong> ${d.volume}`)
        })
            listeningRect.on("mouseleave", function() {
                circle.transition()
                    .duration(50)
                    .attr("r",0);
                
                tooltip.style("display","none")
            })
        
        displayChartTitle(symbol)
        displaySourceCredit()
        document.querySelector("h3").textContent = "";
        document.querySelector("h4").textContent = "";

    }
    catch (error) {
        console.log(document.querySelector("h4"))
        DOMSelectors.h3.textContent = error;  
        DOMSelectors.h4.textContent = "Please search for something else";
    }
    }

    function displayChartTitle(symbol) {
        DOMSelectors.chartTitle.textContent = `${symbol} Time Series`;
    }

    function displaySourceCredit() {
        DOMSelectors.chartSource.textContent = "ty to AlphaVantage for the datasets";
    }

    