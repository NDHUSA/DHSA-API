function doGet(request){
  const targetSpreadSheet = SpreadsheetApp.openById("1j6_sbGFEdT00ldc3Aie-4B5ynwrpbtHhMcFnCnqMIq4");
  const sheetName = targetSpreadSheet.getSheetByName('sheet1');
  let sheetValues = sheetName.getDataRange().getValues();
  
  let jsonFormated = [];
  skipId = 0;
  sheetValues.forEach((data) => {
    if(skipId==0){skipId+=1;return;};
    if(data[1]==""&&data[2]==""){return;};
    jsonFormated.push({
      ['id']:data[0].split('-')[2].toString(),
      ['semester']:data[0].split('-')[1].toString(),
      ['name']:{
        ['zh-tw']:data[1].toString(),
        ['en-us']:data[2].toString(),
      },
      ['discount']:data[3].toString(),
    })
  })
  let exportFormat = JSON.stringify(jsonFormated);
    let final = ContentService.createTextOutput(exportFormat).setMimeType(ContentService.MimeType.JSON);
    Logger.log(final);
    return final;
}