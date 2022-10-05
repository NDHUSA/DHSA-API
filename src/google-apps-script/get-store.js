function doGet(request){
  const targetSpreadSheet = SpreadsheetApp.openById("1j6_sbGFEdT00ldc3Aie-4B5ynwrpbtHhMcFnCnqMIq4");
  const sheetName = targetSpreadSheet.getSheetByName('sheet1');
  let sheetValues = sheetName.getDataRange().getValues();
  
  let jsonFormated = [];
  skipId = 0;
  sheetValues.forEach((data) => {
    if(skipId<=1){skipId+=1;return;};
    if(data[1]==""&&data[2]==""){return;};
    jsonFormated.push({
      ['id']: parseInt(data[0].split('-')[2]),
      ['semester']: parseInt(data[0].split('-')[1]),
      ['name']: {
        ['zh-tw']: data[1].toString(),
        ['en-us']: data[2].toString(),
      },
      ['type']: data[7].toString(),
      ['thumb']: data[11].toString() || "https://dhsa.ndhu.edu.tw/var/file/110/1110/img/4397/vipcard2021_merchant_image.png",
      ['discount']: {
        ['start']: new Date(data[3]).getTime(),
        ['end']: new Date(data[4]).getTime(),
        ['status']: data[8].toString(),
        ['contract']: data[9].toString(),
        ['note']: data[10].toString(),
      },
      ['location']: {
        ['address']: data[5].toString(),
        ['area']: data[6].toString(),
      },
      
    })
  })
  let exportFormat = JSON.stringify(jsonFormated);
  let final = ContentService.createTextOutput(exportFormat).setMimeType(ContentService.MimeType.JSON);
  Logger.log(final);
  return final;
}