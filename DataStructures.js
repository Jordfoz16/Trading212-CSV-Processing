module.exports = {
    Portfolio: class {
        constructor(order) {
            this.ISIN = order.ISIN;
            this.Ticker = order.Ticker;
            this.Name = order.Name;
            this.Shares = order.Shares;
            this.Price = order.Price;
            this.Currency = order.Currency;
        }

        buy(order) {
            this.Shares += order.Shares;
        }

        sell(order) {
            this.Shares -= order.Shares;
        }
    },

    Order: function (event) {
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
        this.ID = event["ID"];
    },

    Dividend: function (event) {
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
    },

    Transaction: function (event) {
        this.Action = event["Action"];
        this.Time = event["Time"];
        this.Total = parseFloat(event["Total (GBP)"]);
        this.id = event["ID"]
    }
}