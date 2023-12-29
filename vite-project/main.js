const baseURL = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=TSLA&interval=5min&apikey=754XM1A6MI6WI2K4'
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
getData(baseURL);