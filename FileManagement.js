const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
var logging = require("./Logging")

const input_folder_path = "Data/"
const output_folder_path = "Output/"

module.exports = {

    checkFolders: function(){
        if (!fs.existsSync(output_folder_path)){
            fs.mkdirSync(output_folder_path);
        }
    
        if (!fs.existsSync(input_folder_path)){
            fs.mkdirSync(input_folder_path);
        }
    },

    listFiles: function(){
        //Returns a list of CSV files in a folder
        var csvFiles = []
            
        //Gets a list of all CSV Files
        var files = fs.readdirSync(input_folder_path);

        files.forEach(file => {
            if(file.endsWith("csv")){
                csvFiles.push(input_folder_path + file)
            }
        });
        
        if(csvFiles <= 0) {
            logging.log("No Files", "INFO")
            process.exit()
        }

        return csvFiles;
    },

    readCSV: function(path){
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

    writeCSVPortfolio: function(data){
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
            logging.log('Portfolio File created', "DEBUG");
        });
     
    },
    
    writeCSVDividend: function(data){
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
            logging.log('Dividend File created', "DEBUG");
        });
    }
}