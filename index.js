const csv = require('csv-parser');
const fs = require('fs');

const file_path = "Data/Test.csv"

function Order(event){
    this.Action = event["Action"];
    this.Time = event["Time"];
    this.ISIN = event["ISIN"];
    this.Ticker = event["Ticker"];
    this.Name = event["Name"];
    this.Shares = event["No. of shares"];
    this.Price = event["Price / share"];
    this.Currency = event["Currency (Price / share)"];
    this.FX = event["Exchange rate"];
    this.Result = event["Result (GBP)"];
    this.Total = event["Total (GBP)"];
}

function Dividend(event){
    this.Action = event["Action"];
    this.Time = event["Time"];
    this.ISIN = event["ISIN"];
    this.Ticker = event["Ticker"];
    this.Name = event["Name"];
    this.Shares = event["No. of shares"];
    this.Price = event["Price / share"];
    this.Currency = event["Currency (Price / share)"];
    this.Total = event["Total (GBP)"];
    this.WithholdingTax = event["Withholding tax"];
}

function Transaction(event){
    this.Action = event["Action"];
    this.Time = event["Time"];
    this.Total = event["Total (GBP)"];
}

var orders = [];
var dividends = [];
var transactions = [];

function processCSV(events){

    //Seperate the events into different arrays
    for (let index = 0; index < events.length; index++) {
        const event = events[index];

        if(event["Action"] === "Market sell" || event["Action"] === "Market buy"){
            orders.push(new Order(event));
        }

        if(event["Action"] === "Dividend (Ordinary)" || event["Action"] === "Dividend (Property income)"){
            dividends.push(new Dividend(event))
        }

        if(event["Action"] === "Deposit" || event["Action"] === "Withdrawal"){
            transactions.push(new Transaction(event))
        }
    }

    //TODO - Combine market buy/sell events to get a total amount of shares

    console.log("Finished Processing");
}

async function readCSV(path){
    return new Promise(function(resolve, reject) {
        var events = []

        fs.createReadStream(path).pipe(csv()).on('data', (row) => {
            events.push(row);
        }).on('end', () => {
            console.log('CSV file successfully processed. Length: ' + events.length);
            resolve(events)
        });
    })
}

async function app(){
    var events = await readCSV(file_path);
    processCSV(events)
}

app();