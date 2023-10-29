"use strict";
// from https://www.currencyfreaks.com/
let apiKey = "your_api_key";

async function getAvailableCurrencies() {
    let url = `https://api.currencyfreaks.com/v2.0/currency-symbols`;
    let data = await fetch(url).then(response => response.json());
    let availableCurrencies = data.currencySymbols;
    let currencyCodes = Object.keys(availableCurrencies);
    currencyCodes.sort();
    let sortedAvailableCurrencies = {};
    for (let code of currencyCodes) {
        sortedAvailableCurrencies[code] = availableCurrencies[code];
    }
    return sortedAvailableCurrencies;
}

getAvailableCurrencies().then(availableCurrencies => {
    let exchangeSelect = document.getElementById("exchange-currency");
    for (let currency in availableCurrencies) {
        let option = document.createElement("option");
        option.value = currency;
        option.text = `${currency}: ${availableCurrencies[currency]}`;
        exchangeSelect.appendChild(option);
    }
});

async function getExchangeRate(exchange) {
    let url = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${apiKey}&symbols=${exchange}`;
    let data = await fetch(url).then(response => response.json());
    let exchangeRate = parseFloat(data.rates[exchange]);
    return exchangeRate.toFixed(2);
}

document.forms[0].addEventListener("submit", async event => {
    event.preventDefault();
    let exchange = document.getElementById("exchange-currency").value;
    let amount = document.getElementById("amount").value;
    let exchangeRate = await getExchangeRate(exchange);
    let result = amount * exchangeRate;
    document.getElementById("result").innerHTML = `${amount} USD = ${result.toFixed(2)} ${exchange}`;
    document.getElementById("exchange-rate").innerHTML = `1 USD = ${exchangeRate} ${exchange}`;
});