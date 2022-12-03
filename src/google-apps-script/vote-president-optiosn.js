function MD5(input) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input);
  var txtHash = "";
  for (i = 0; i < rawHash.length; i++) {
    var hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += "0";
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

function doGet(request) {
  const targetSpreadSheet = SpreadsheetApp.openById(
    "1OdC_0F1yu5F_6poo4wb8hs61_tLP0jgNlzdZ3GejDhw"
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
      ["id"]: MD5(data[0] + data[1]),
      ["title"]: {
        ["zh-tw"]: data[0].toString(),
        ["en"]: data[1].toString(),
      },
      ["description"]: {
        ["zh-tw"]: data[2].toString(),
        ["en"]: data[3].toString(),
      },
    });
  });
  let exportFormat = JSON.stringify(jsonFormated);
  let final = ContentService.createTextOutput(exportFormat).setMimeType(
    ContentService.MimeType.JSON
  );
  Logger.log(final);
  return final;
}
