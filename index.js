var FileManagement = require("./FileManagement")
var ds = require("./DataStructures")
var logging = require("./Logging")
/*
TODO List:
    - Fix rounding issue with diviends - DONE (No Issue)
    - Filter out duplicate events. In case there is an overlap in CSV data
    - Seperate into multiple JS files e.g. FileManagement - DONE
    - Output transaction history with summary of money in/out
    - Clean code
*/

const debug_log = false;

var orders = [];
var dividends = [];
var transactions = [];

var portfolio = new Map();
var dividendHistory = new Map();

function processCSV(events){

    //Seperate the events into different arrays
    for (let index = 0; index < events.length; index++) {
        const event = events[index];

        if(event["Action"] === "Market sell" || event["Action"] === "Market buy"){
            orders.push(new ds.Order(event));
        }

        if(event["Action"] === "Dividend (Ordinary)" || event["Action"] === "Dividend (Property income)" || event["Action"] === "Dividend (Bonus)"){
            dividends.push(new ds.Dividend(event))
        }

        if(event["Action"] === "Deposit" || event["Action"] === "Withdrawal"){
            transactions.push(new ds.Transaction(event))
        }
    }

    logging.log("Finished Processing", "DEBUG");
}

function buildPortfolio(){
    
    for (let index = 0; index < orders.length; index++) {
        const order = orders[index];
        const Ticker = order.Ticker;

        if(portfolio.has(Ticker)){
            if(order.Action === "Market buy"){
                portfolio.get(Ticker).buy(order);
            }else if(order.Action === "Market sell"){
                portfolio.get(Ticker).sell(order)
            }
        }else{
            portfolio.set(Ticker, new ds.Portfolio(order))
        }
    }

    portfolio.forEach((stock, key) => { 
        if(stock.Shares <= 0.00000001){
            portfolio.delete(key);
        }
     } )

     logging.log("Finished Building Portfolio", "DEBUG")
}

function buildDividendList(){

    for (let index = 0; index < dividends.length; index++) {
        const dividend = dividends[index];

        var date = new Date(dividend.Time);        
        var keyDate = new Date(0)

        keyDate.setFullYear(date.getFullYear())
        keyDate.setMonth(date.getMonth())
        keyDate = keyDate.toISOString()

        if(dividendHistory.has(keyDate)){
            const currentValue = dividendHistory.get(keyDate)
            let sum = currentValue + dividend.Total
            dividendHistory.set(keyDate, +sum.toFixed(2))
        }else{
            dividendHistory.set(keyDate, dividend.Total)
        }
    }
}



function app(){

    FileManagement.checkFolders()

    var file_list = FileManagement.listFiles();

    const dataPromises = []
    for (let i = 0; i < file_list.length; i++) {
        const file = file_list[i];
        dataPromises.push(FileManagement.readCSV(file))
    }

    Promise.all(dataPromises).then(result => {
        for(const events of result){
            processCSV(events);    
        }
        
        buildPortfolio()
        buildDividendList()

        FileManagement.writeCSVPortfolio(portfolio)
        FileManagement.writeCSVDividend(dividendHistory)
    })
}

app();