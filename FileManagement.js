const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
var logging = require("./Logging")

const input_folder_path = "Data/"
const output_folder_path = "Output/"

module.exports = {

    checkFolders: function () {
        //Checks if folders exist if they dont it creates them
        if (!fs.existsSync(output_folder_path)) {
            fs.mkdirSync(output_folder_path);
        }

        if (!fs.existsSync(input_folder_path)) {
            fs.mkdirSync(input_folder_path);
        }
    },

    listFiles: function () {
        //Returns a list of CSV files in a folder
        var csvFiles = []

        //Gets a list of all CSV Files
        var files = fs.readdirSync(input_folder_path);

        files.forEach(file => {
            if (file.endsWith("csv")) {
                csvFiles.push(input_folder_path + file)
            }
        });

        if (csvFiles <= 0) {
            logging.log("No Files", "INFO")
            process.exit()
        }

        return csvFiles;
    },

    readCSV: function (path) {

        //Reads the CSV file
        return new Promise((resolve) => {
            var events = [];
            fs.createReadStream(path)
                .pipe(csv())
                .on('data', (row) => {
                    events.push(row);
                }).on('end', () => {
                    logging.log('CSV file successfully processed. Length: ' + events.length, "DEBUG");
                    resolve(events);
                });
        })
    },

    writeCSVPortfolio: function (data) {
        const csvWriterPortfolio = createCsvWriter({
            path: 'Output/PortfolioOutput.csv',
            header: [
                { id: 'ISIN', title: 'ISIN' },
                { id: 'Ticker', title: 'Ticker' },
                { id: 'Name', title: 'NAME' },
                { id: 'Shares', title: 'Shares' },
                { id: 'Price', title: 'Price' },
                { id: 'Currency', title: 'Currency' }
            ]
        });

        var stocks = []

        data.forEach((stock, key) => {
            stocks.push(stock)
        })

        //Sort alphabetically by ticker
        stocks.sort(function (a, b) {
            if (a.Ticker < b.Ticker) { return -1; }
            if (a.Ticker > b.Ticker) { return 1; }
            return 0;
        })

        csvWriterPortfolio.writeRecords(stocks).then(() => {
            logging.log('Portfolio File created', "DEBUG");
        });

    },

    writeYahooFinancePortfolio: function (data) {
        const csvWriterYahooPortfolio = createCsvWriter({
            path: 'Output/YahooPortfolioOutput.csv',
            header: [
                { id: 'Ticker', title: 'Symbol' },
                { id: 'no_value', title: 'Current' },
                { id: 'no_value', title: 'Price' },
                { id: 'no_value', title: 'Date' },
                { id: 'no_value', title: 'Time' },
                { id: 'no_value', title: 'Change' },
                { id: 'no_value', title: 'Open' },
                { id: 'no_value', title: 'High' },
                { id: 'no_value', title: 'Low' },
                { id: 'no_value', title: 'Volume' },
                { id: 'no_value', title: 'Trade Date' },
                { id: 'no_value', title: 'Purchase Price' },
                { id: 'Shares', title: 'Quantity' },
                { id: 'no_value', title: 'Commission' },
                { id: 'no_value', title: 'High Limit' },
                { id: 'no_value', title: 'Low Limit' },
                { id: 'no_value', title: 'Comment' }
            ]
        });

        var stocks = []

        data.forEach((stock, key) => {
            let ISIN_Country_Code = stock["ISIN"].substring(0, 2)

            //Adds .L to the end of UK stocks
            if (ISIN_Country_Code == "GB" || ISIN_Country_Code == "IE") {
                stock["Ticker"] = stock["Ticker"] + ".L"
            }

            //Fills fields with a space
            stock['no_value'] = " "
            stocks.push(stock)
        })

        csvWriterYahooPortfolio.writeRecords(stocks).then(() => {
            logging.log('Yahoo Portfolio File created', "DEBUG");
        });
    },

    writeCSVDividend: function (data) {
        const csvWriterDividends = createCsvWriter({
            path: 'Output/DividendOutput.csv',
            header: [
                { id: 'year', title: 'Year' },
                { id: '1', title: 'January' },
                { id: '2', title: 'Febuary' },
                { id: '3', title: 'March' },
                { id: '4', title: 'April' },
                { id: '5', title: 'May' },
                { id: '6', title: 'June' },
                { id: '7', title: 'July' },
                { id: '8', title: 'August' },
                { id: '9', title: 'September' },
                { id: '10', title: 'October' },
                { id: '11', title: 'November' },
                { id: '12', title: 'December' },
            ]
        })


        var years = new Map()

        //Adds the dividends to the month & year
        data.forEach((value, key) => {
            const date = new Date(key)
            if (!years.has(date.getFullYear())) {
                years.set(date.getFullYear(), new Array(13))
                years.get(date.getFullYear())[date.getMonth() + 1] = value
            } else {
                years.get(date.getFullYear())[date.getMonth() + 1] = value
            }
        })

        var arrayList = []

        //Converts into a format that can be used by csv-writer
        years.forEach((value, key) => {
            var emptyObject = {}

            emptyObject.year = key;

            for (let index = 1; index < value.length; index++) {
                const month = value[index];
                if (month == undefined) {
                    emptyObject[index] = 0
                } else {
                    emptyObject[index] = month;
                }

            }

            arrayList.push(emptyObject)
        })


        csvWriterDividends.writeRecords(arrayList).then(() => {
            logging.log('Dividend File created', "DEBUG");
        });
    }
}