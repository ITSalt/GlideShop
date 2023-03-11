// Скопируйте из браузера адрес к таблице GoogleSheet, в которой лежит база данных
const urlBook = "https://docs.google.com/spreadsheets/d/1t7dabPB46hx1niVfIKtLT8lLrrn0t-Z211kY7byQl7Q/";

// Скопируйте название страницы, на которую будут добавляться данные об оплате
const sheetName = "Оплаты";

const myBook = SpreadsheetApp.openByUrl(urlBook);
const doPost = (request = {}) => {
  console.log("Start");
  const { parameter, postData: { contents, type } = {} } = request;
  const { source } = parameter;

  const inputData = {};
  if (type === 'application/x-www-form-urlencoded') {    
    contents
      .split('&')
      .map((input) => input.split('='))
      .forEach(([key, value]) => {
        inputData[decodeURIComponent(key)] = decodeURIComponent(value);
      });
  }

  if (type === 'application/json') {
    inputData = JSON.parse(contents);
  }

  const mySheet = myBook.getSheetByName(sheetName);
   mySheet.appendRow([
     inputData.InvoiceId, // Номер заказа
     inputData.DateTime, // Дата и время оплаты
     inputData.Amount, // Сумма оплаты
     inputData.Currency, // Валюта оплаты
     inputData.Status, // Статус платежа
     inputData.Reason, // Причина отказа
     JSON.stringify(inputData) // Полный ответ от сервера
   ]);

  return ContentService.createTextOutput({"good" : 0}).setMimeType(ContentService.MimeType.JSON);
};

function doGet(e) {
  const tmpl = HtmlService.createTemplateFromFile('form.html');
  tmpl.amount = e.parameter.amount || 0;
  tmpl.currency = e.parameter.currency || "RUB";
  tmpl.accountId = e.parameter.accountId || "";
  tmpl.invoiceId = e.parameter.invoiceId || "";

  return tmpl.evaluate()
      .setTitle('Оплата за товары в Glide-приложении')
}

function searcher(sheetLink, range, searchPhrase) {
  const searchRange = sheetLink.getRange(range);
  const findData = searchRange.createTextFinder(searchPhrase);
  findData.matchEntireCell(true);
  findData.matchCase(false);

  const result = findData.findAll();
  return result;
}
