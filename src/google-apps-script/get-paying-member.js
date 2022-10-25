function doGet(request) {
  const targetSpreadSheet = SpreadsheetApp.openById(
    "1fy0wnGgLoWbGciNGoyvBNpD-nCKRlDMyxtUGBa_be1U"
  );
  const sheetName = targetSpreadSheet.getSheetByName("public(doNotRename)");
  let sheetValues = sheetName.getDataRange().getValues();

  let jsonFormated = [];
  let skipId = 0;
  sheetValues.forEach((data) => {
    if (skipId < 1) {
      skipId += 1;
      return;
    }
    jsonFormated.push({
      ["id"]: data[0],
      ["name"]: data[1].toString(),
    });
  });
  let exportFormat = JSON.stringify(jsonFormated);
  let final = ContentService.createTextOutput(exportFormat).setMimeType(
    ContentService.MimeType.JSON
  );
  Logger.log(final);
  return final;
}
