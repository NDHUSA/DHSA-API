var apiAuthToken = "";

function onFormSubmit(e) {
  var form = FormApp.getActiveForm();
  var allResponses = form.getResponses();
  var latestResponse = allResponses[allResponses.length - 1];
  var response = latestResponse.getItemResponses();
  var payload = {};
  for (var i = 0; i < response.length; i++) {
    var question = response[i].getItem().getTitle();
    if (question == "請描述問題及事情經過") {
      payload[1] = response[i].getResponse();
    } else if (question == "可附上截圖、影片等說明資料") {
      payload[2] = response[i].getResponse();
    } else if (question == "我們該如何稱呼您？") {
      payload[3] = response[i].getResponse();
    } else if (question == "向您聯繫的 Email") {
      payload[4] = response[i].getResponse();
    } else if (question == "發生問題的路徑（請勿更動）") {
      payload[5] = response[i].getResponse();
    } else {
    }
  }

  var issueTitle = "User Report Submit At " + latestResponse.getTimestamp();
  var issueBody =
    "| TimeStamp | Description | Attachment | Path |\n" +
    "|---|---|---|---|\n" +
    "| " +
    latestResponse.getTimestamp() +
    " | " +
    payload[1] +
    " | " +
    (payload[2] ? "https://drive.google.com/open?id=" + payload[2] : "false") +
    " | " +
    payload[5].split(".")[6] +
    " |";

  var response = UrlFetchApp.fetch(
    "https://api.dhsa.dstw.dev/workflow/github/issue",
    {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify({
        title: issueTitle,
        content: issueBody,
        repo: "yc97463/DHSA-API",
        labels: ["user report"],
      }),
      headers: {
        Authorization: apiAuthToken,
      },
    }
  );
}
