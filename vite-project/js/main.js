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


DOMSelectors.form.addEventListener('submit', function(event) {
    event.preventDefault();
    async function getTimeSeriesData() {
    let symbol = DOMSelectors.symbol.value.toUpperCase()
    console.log(symbol)
    const URL = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=full&apikey=754XM1A6MI6WI2K4`
    try {
        const response = await fetch(URL)
        if (response.status != 200){throw new Error(response.statusText); }
        const data = await response.json()
        const dates = Object.keys(data['Time Series (5min)']);
        const fullList = []
        const margin = { top:70, right: 30, bottom: 40, left: 80};
        const width = 1200 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const x = d3.scaleTime()
            .range([0,width]);
        const y = d3.scaleLinear()
            .range([height,0]);

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.open));

        const svg = d3.select("#chart-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");
        
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
        y.domain(d3.extent(fullList, d => d.open));

        svg.append('g')
            .attr("transform", `translate(0,${height})`)
            .style("font-size", "14px")
            .call(d3.axisBottom(x)
                .tickValues(x.ticks(d3.timeDay.every(5)))
                .tickFormat(d3.timeFormat("%Y-%m-%d")))
            .call(g => g.select(".domain").remove())
            .selectAll(".tick line")
            .style("stroke-opacity", 0)
        svg.selectAll(".tick text")
            .attr("fill", "#777");

        svg.append("text")
        .attr("transform","rotate(-90)")
        .attr("x",0-(height/2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#777")
        .style("font-family", "sans-serif")
        .text("Placeholder");

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
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", .5);

        svg.selectAll("yGrid")
            .data(y.ticks((d3.max(fullList, d=> d.open))).slice(1))
            .join("line")
            .attr("x1",0)
            .attr("x2", width)
            .attr("y1", d => y(d))
            .attr("y2", d => y(d))
            .attr("stroke", "#e0e0e0")
            .attr("stroke-width", .5)

        const path = svg.append('path')
            .datum(fullList)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1)
            .attr("d", line); 

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
                .style("left", `${xPos +100}px`)
                .style("top", `${yPos+ 50}px`)
                .html(`<strong>Date:</strong> ${d.date}<br><strong>Price:</strong> ${d.open}`)
        })
            listeningRect.on("mouseleave", function() {
                circle.transition()
                    .duration(50)
                    .attr("r",0);
                
                tooltip.style("display","none")
            })

            svg.append("text")
                .attr("class", "chart-title")
                .attr("x", margin.left - 115)
                .attr("y", margin.top - 100)
                .style("font-size", "24px")
                .style("font-weight", "bold")
                .style("font-family", "sans-serif")
                .text(`${symbol} Time Series`)
            
                svg.append("text")
                .attr("class", "source-credit")
                .attr("x", width-1125)
                .attr("y", height+ margin.bottom -3)
                .style("font-size", "9px")
                .style("font-family", "sans-serif")
                .text("ty AlphaVantage for the datasets")
    }
    catch (error) {
        document.querySelector("h1").textContent = error;  
        document.querySelector("h2").textContent = "Please search for something else";
    }
    }
    getTimeSeriesData(URL);
}
)