var FileManagement = require("./FileManagement")
var ds = require("./DataStructures")
var logging = require("./Logging")
/*
TODO List:
    - Fix rounding issue with diviends - DONE (No Issue)
    - Filter out duplicate events. In case there is an overlap in CSV data - DONE
    - Seperate into multiple JS files e.g. FileManagement - DONE
    - Output transaction history with summary of money in/out
    - Make dates work when / or - are used
    - Clean code
*/

let orders = new Map();
let dividends = new Map();
let transactions = new Map();

var portfolio = new Map();
var dividendHistory = new Map();

function processCSV(events) {

    //Seperate the events into different maps. Maps are used to remove duplicate events
    for (let index = 0; index < events.length; index++) {
        const event = events[index];

        if (event["Action"] === "Market sell" || event["Action"] === "Market buy") {
            if (!orders.has(event["ID"])) {
                orders.set(event["ID"], new ds.Order(event))
            }
        }

        if (event["Action"] === "Dividend (Ordinary)" || event["Action"] === "Dividend (Property income)" || event["Action"] === "Dividend (Bonus)") {

            //UID is created for dividends as they dont have a unique ID 
            let uid = event["Action"] + ":" + event["Ticker"] + ":" + event["Time"] + ":" + event["No. of shares"]

            if (!dividends.has(uid)) {
                dividends.set(uid, new ds.Dividend(event))
            }
        }

        if (event["Action"] === "Deposit" || event["Action"] === "Withdrawal") {
            if (!transactions.has(event["ID"])) {
                transactions.set(event["ID"], new ds.Transaction(event))
            }
        }
    }

    logging.log("Finished Processing", "DEBUG");
}

function buildPortfolio() {

    orders.forEach((value, key) => {
        const Ticker = value.Ticker;

        if (portfolio.has(Ticker)) {
            if (value.Action === "Market buy") {
                portfolio.get(Ticker).buy(value);
            } else if (value.Action === "Market sell") {
                portfolio.get(Ticker).sell(value)
            }
        } else {
            portfolio.set(Ticker, new ds.Portfolio(value))
        }
    })

    //Removes any shares that have less than 7dp (lowest trading212 shows)
    portfolio.forEach((value, key) => {
        if (value.Shares <= 0.00000001) {
            portfolio.delete(key);
        }
    })

    logging.log("Finished Building Portfolio", "DEBUG")
}

function buildDividendList() {

    dividends.forEach((value, key) => {
        var date = new Date(value.Time);
        var keyDate = new Date(0)

        keyDate.setFullYear(date.getFullYear())
        keyDate.setMonth(date.getMonth())
        keyDate = keyDate.toISOString()

        //Adds up the total dividends for each month
        if (dividendHistory.has(keyDate)) {
            const currentValue = dividendHistory.get(keyDate)
            let sum = currentValue + value.Total
            dividendHistory.set(keyDate, +sum.toFixed(2))
        } else {
            dividendHistory.set(keyDate, value.Total)
        }
    })

    logging.log("Finished Building Dividend History", "DEBUG")
}



function app() {

    FileManagement.checkFolders()

    var file_list = FileManagement.listFiles();

    //Adds Promises to an array
    const dataPromises = []
    for (let i = 0; i < file_list.length; i++) {
        const file = file_list[i];
        dataPromises.push(FileManagement.readCSV(file))
    }

    //Waits for all Promises to complete before processing CSV's
    Promise.all(dataPromises).then(result => {
        for (const events of result) {
            processCSV(events);
        }

        buildPortfolio()
        buildDividendList()

        FileManagement.writeCSVPortfolio(portfolio)
        FileManagement.writeYahooFinancePortfolio(portfolio)
        FileManagement.writeCSVDividend(dividendHistory)
    })
}

app();