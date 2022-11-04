import fetch from "node-fetch";
import md5 from "md5";

async function ndhuLdapAuth(accountId, agent) {
  const response = JSON.stringify({ uid: "TESTER", status: "在學" });
  return response;
}

export { ndhuLdapAuth };
