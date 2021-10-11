const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const input_folder_path = "Data/"
const output_folder_path = "Output/"

const debug_log = false;

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
var dividendHistory = new Map();

function processCSV(events){

    //Seperate the events into different arrays
    for (let index = 0; index < events.length; index++) {
        const event = events[index];

        if(event["Action"] === "Market sell" || event["Action"] === "Market buy"){
            orders.push(new Order(event));
        }

        if(event["Action"] === "Dividend (Ordinary)" || event["Action"] === "Dividend (Property income)" || event["Action"] === "Dividend (Bonus)"){
            dividends.push(new Dividend(event))
        }

        if(event["Action"] === "Deposit" || event["Action"] === "Withdrawal"){
            transactions.push(new Transaction(event))
        }
    }

    print("Finished Processing", "DEBUG");
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

     print("Finished Building Portfolio", "DEBUG")
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

function listFiles(path){
    var csvFiles = []
        
        //Gets a list of all CSV Files
        var files = fs.readdirSync(path);

        files.forEach(file => {
            if(file.endsWith("csv")){
                csvFiles.push(input_folder_path + file)
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
            print('CSV file successfully processed. Length: ' + events.length, "DEBUG");
            resolve(events); //return csv parsed result
        }); 
    })
}

function writeCSVPortfolio(data){
    const csvWriterPortfolio = createCsvWriter({
        path: 'Output/PortfolioOutput.csv',
        header: [
            {id: 'ISIN', title: 'ISIN'},
            {id: 'Ticker', title: 'Ticker'},
            {id: 'Name', title: 'NAME'},
            {id: 'Shares', title: 'Shares'},
            {id: 'Price', title: 'Price'},
            {id: 'Currency', title: 'Currency'}
        ]
    });

    var stocks = []

    data.forEach((stock, key) => { 
        stocks.push(stock)
    } )

    csvWriterPortfolio.writeRecords(stocks).then(() => {
        print('Portfolio File created', "DEBUG");
    });
 
}

function writeCSVDividend(data){
    const csvWriterDividends = createCsvWriter({
        path: 'Output/DividendOutput.csv',
        header: [
            {id: 'year', title: 'Year'},
            {id: '1', title: 'January'},
            {id: '2', title: 'Febuary'},
            {id: '3', title: 'March'},
            {id: '4', title: 'April'},
            {id: '5', title: 'May'},
            {id: '6', title: 'June'},
            {id: '7', title: 'July'},
            {id: '8', title: 'August'},
            {id: '9', title: 'September'},
            {id: '10', title: 'October'},
            {id: '11', title: 'November'},
            {id: '12', title: 'December'},
        ]
    })

    var years = new Map()

    data.forEach((value, key) => {
        const date = new Date(key)
        if(!years.has(date.getFullYear())){
            years.set(date.getFullYear(), new Array(13))
            years.get(date.getFullYear())[date.getMonth()+1] = value
        }else{
            years.get(date.getFullYear())[date.getMonth()+1] = value
        }
    } )

    var arrayList = []

    years.forEach((value, key) => {
        var emptyObject = {}
        
        emptyObject.year = key;

        for (let index = 1; index < value.length; index++) {
            const month = value[index];
            if(month == undefined){
                emptyObject[index] = 0
            }else{
                emptyObject[index] = month;
            }
            
        }

        arrayList.push(emptyObject)
    })
    

    csvWriterDividends.writeRecords(arrayList).then(() => {
        print('Dividend File created', "DEBUG");
    });
}

function print(msg, level){
    if(level == "DEBUG" && debug_log == true){
        console.log("DEBUG - " + msg)
    }else if(level == "INFO"){
        console.log("INFO - " + msg);
    }
}

function app(){

    if (!fs.existsSync(output_folder_path)){
        fs.mkdirSync(output_folder_path);
    }

    if (!fs.existsSync(input_folder_path)){
        fs.mkdirSync(input_folder_path);
    }

    var file_list = listFiles(input_folder_path);

    if(file_list <= 0) {
        print("No Files", "INFO")
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
        buildDividendList()

        writeCSVPortfolio(portfolio)
        writeCSVDividend(dividendHistory)
    })
}

app();