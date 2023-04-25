function doGet(request) {
  const targetSpreadSheet = SpreadsheetApp.openById(
    "1j6_sbGFEdT00ldc3Aie-4B5ynwrpbtHhMcFnCnqMIq4"
  );
  const sheetName = targetSpreadSheet.getSheetByName("public(doNotRename)");
  let sheetValues = sheetName.getDataRange().getValues();

  let jsonFormated = [];
  let skipId = 0;
  const hostPrefix = "https://dhsa.ndhu.edu.tw";
  sheetValues.forEach((data) => {
    if (skipId <= 1) {
      skipId += 1;
      return;
    }
    if (data[1] == "" && data[2] == "") {
      return;
    }
    jsonFormated.push({
      ["id"]: parseInt(data[0].split("-")[2]),
      ["semester"]: parseInt(data[0].split("-")[1]),
      ["name"]: {
        ["zh-tw"]: data[1].toString(),
        ["en"]: data[2].toString(),
      },
      ["type"]: data[8].toString(),
      ["thumb"]:
        hostPrefix +
        (data[11].toString() ||
          "/var/file/110/1110/img/4397/vipcard2021_merchant_image.png"),
      ["discount"]: {
        ["start"]: new Date(data[3]).getTime(),
        ["end"]: new Date(data[4]).getTime(),
        ["status"]: data[9].toString(),
        ["contract"]: data[10].toString(),
        ["note"]: data[11].toString(),
      },
      ["location"]: {
        ["address"]: data[6].toString(),
        ["area"]: data[7].toString(),
      },
      ["updated_at"]: new Date(data[5]),
    });
  });
  let exportFormat = JSON.stringify(jsonFormated);
  let final = ContentService.createTextOutput(exportFormat).setMimeType(
    ContentService.MimeType.JSON
  );
  Logger.log(final);
  return final;
}
