# Trading212-CSV-Processing
 
 ## About
 This project is a Node.js program that can process the Trading212 history CSV into a more useable form for Portfolio and Dividend Trackers. Current problem with the output that Trading212 provides, is that it doesnt make it easy to put into Portfolio and Dividend Trackers. So this program currently outputs two forms of documents, one that shows a summary of the portfolio's holdings, and second that shows a table of total diviends each month 
 
 ## How to use
  - Go to Trading212
  - Navigate to the History page
  - Download your transaction history (Trading212 is limited to downloading 1 year at a time)
  - Git clone the project, then run npm install to download the dependencies
  - Run the index.js file. This will create the Data/ and Output/ folders
  - Put all the CSV's into the Data/ folder
  - All outputs are created in the Output/ folder

## Example

### Portfolio Output
| ISIN | Ticker | Name | Shares | Price | Currency |
| ---- | ---- | ---- | ---- | ---- | ---- |
| GB00B03MM408 |	RDSB |	Royal Dutch Shell |	14.85 |	1087.2 |	GBX |
| US46625H1005 |	JPM |	JPMorgan Chase |	2.1368505 |	88.55 |	USD |
| US88160R1014 |	TSLA |	Tesla |	2.126 |	505.39 |	USD |

### Dividend Output
| Year  | January |  Feburary | March | April | May | June | July | August | September | October | November | December |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 2020 | 0 | 1.23 | 0.93 |  2.04 | 3.53 | 1.31 | 21.28 | 4.74 | 5.82 | 4.12 | 1.96 | 4.92 |
| 2021 | 7.23 | 3.57 | 10.00 | 12.22 | 12.92 | 2.99 | 4.54 | 6.23 | 8.24 | 8.95 | 6.77 | 5.34 |

## Future Plans
 - Add Yahoo Finance upload support
 - Add Simply Wall St upload support

## Known Issues 
 - Stock Splits: When a stock split has occured Trading212 doesnt reflect this in the history. So for stocks that have split the total shares maybe incorrect.
 - Missing Orders: Trading212's history isn't complete in some cases as there was a bug where some orders didnt get reported. So some stocks may still be in the portfolio breakdown.
