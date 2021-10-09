const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const csvWriter = createCsvWriter({
    path: 'Output/Output.csv',
    header: [
        {id: 'ISIN', title: 'ISIN'},
        {id: 'Ticker', title: 'Ticker'},
        {id: 'Name', title: 'NAME'},
        {id: 'Shares', title: 'Shares'},
        {id: 'Price', title: 'Price'},
        {id: 'Currency', title: 'Currency'}
    ]
});

const folder_path = "Data/"

class Portfolio{
    constructor(order){
        this.ISIN = order.ISIN;
        this.Ticker = order.Ticker;
        this.Name = order.Name;
        this.Shares = order.Shares;
        this.Price = order.Price;
        this.Currency = order.Currency;
    }
    
    buy(order){
        this.Shares += order.Shares;
    }

    sell(order){
        this.Shares -= order.Shares;
    }
}

function Order(event){
    this.Action = event["Action"];
    this.Time = event["Time"];
    this.ISIN = event["ISIN"];
    this.Ticker = event["Ticker"];
    this.Name = event["Name"];
    this.Shares = parseFloat(event["No. of shares"]);
    this.Price = parseFloat(event["Price / share"]);
    this.Currency = event["Currency (Price / share)"];
    this.FX = parseFloat(event["Exchange rate"]);
    this.Result = parseFloat(event["Result (GBP)"]);
    this.Total = parseFloat(event["Total (GBP)"]);
}

function Dividend(event){
    this.Action = event["Action"];
    this.Time = event["Time"];
    this.ISIN = event["ISIN"];
    this.Ticker = event["Ticker"];
    this.Name = event["Name"];
    this.Shares = parseFloat(event["No. of shares"]);
    this.Price = parseFloat(event["Price / share"]);
    this.Currency = event["Currency (Price / share)"];
    this.Total = parseFloat(event["Total (GBP)"]);
    this.WithholdingTax = parseFloat(event["Withholding tax"]);
}

function Transaction(event){
    this.Action = event["Action"];
    this.Time = event["Time"];
    this.Total = parseFloat(event["Total (GBP)"]);
}

var orders = [];
var dividends = [];
var transactions = [];
var portfolio = new Map();

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
    console.log("Finished Processing");
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
            portfolio.set(Ticker, new Portfolio(order))
        }
    }

    portfolio.forEach((stock, key) => { 
        if(stock.Shares <= 0.00000001){
            portfolio.delete(key);
        }
     } )

    console.log("Finished Building Portfolio")
}

function listFiles(path){
    var csvFiles = []
        
        //Gets a list of all CSV Files
        var files = fs.readdirSync(path);

        files.forEach(file => {
            if(file.endsWith("csv")){
                csvFiles.push(folder_path + file)
            }
        });

    return csvFiles;
}

function readCSV(path){
    return new Promise((resolve) => {
        var events = [];
        fs.createReadStream(path)
          .pipe(csv())
          .on('data', (row) => {
            // this code called in future
            events.push(row);
        }).on('end', () => {
            // this code called in future to, 
            console.log('CSV file successfully processed. Length: ' + events.length);
            resolve(events); //return csv parsed result
        }); 
    })
}

function writeCSV(data){
    var stocks = []

    data.forEach((stock, key) => { 
        stocks.push(stock)
    } )

    csvWriter.writeRecords(stocks).then(() => {
        console.log('File created');
    });
 
}

function app(){

    var file_list = listFiles(folder_path);

    if(file_list <= 0) {
        console.log("No Files")
        process.exit()
    }

    const dataPromises = []
    for (let i = 0; i < file_list.length; i++) {
        const file = file_list[i];
        dataPromises.push(readCSV(file))
    }

    Promise.all(dataPromises).then(result => {
        for(const events of result){
            processCSV(events);    
        }
        
        buildPortfolio()

        writeCSV(portfolio)
    })
}

app();