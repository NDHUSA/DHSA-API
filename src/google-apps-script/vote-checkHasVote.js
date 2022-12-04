function doGet(request) {
  const targetSpreadSheet = SpreadsheetApp.openById(
    "1Gacvuz4D3Sr7miqi7sWYUlcrxT8IPhL2NV7u9Xz2Pw8"
  );
  const sheetName = targetSpreadSheet.getSheetByName("public(doNotRename)");
  let sheetValues = sheetName.getDataRange().getValues();

  let jsonFormated = [];
  let skipId = 0;
  let hasVote = false;
  const { parameter } = request;
  const { uid } = parameter;
  sheetValues.forEach((data) => {
    if (skipId < 1) {
      skipId += 1;
      return;
    }
    if (uid == data[1]) {
      hasVote = true;
    }
  });
  const exportFormat = JSON.stringify({
    status: hasVote,
    uid: uid,
  });
  let final = ContentService.createTextOutput(exportFormat).setMimeType(
    ContentService.MimeType.JSON
  );
  Logger.log(final);
  return final;
}
