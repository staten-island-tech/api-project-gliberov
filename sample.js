function greet(name){
    const greetPromise = new Promise(function (resolve, rejected) {
        resolve(`Hello ${name}`);
    });
    return greetPromise;
}
const nuggies = greet("Katherine");
nuggies.then((result)=> {
    console.log(result);
})

const URL = `https://api.quotable.io/random`;

async function getData(URL){
    try {
    const response = await fetch(URL);
    console.log(response);
    if( response.status != 200){
        throw new Error(response.statusText);
    }
    //take respone from server and convert it to JSON
    const data = await response.json();
    document.querySelector("h1").textContent = data.content;
    document.querySelector("h2").textContent = data.author;  
    } catch (error) {
        document.querySelector("h1").textContent = error;  
        document.querySelector("h2").textContent = "Please search for something else";  
    }
  
}
getData(URL);