import fetch from "node-fetch";

const uri = "https://preview.api.dhsa.dstw.dev/trigger";
console.log("URI: " + uri);

try {
  console.log("start to poke partner_store");
  const partner_store = await fetch(uri + "/card/store", {
    method: "PATCH",
  }).then((x) => x.json());
  console.log("partner_store API says: " + partner_store);
} catch (err) {
  console.log("partner_store has some error: " + err);
}

try {
  console.log("start to poke has_paid_membership");
  const has_paid_membership = await fetch(uri + "/card/membership", {
    method: "PATCH",
  }).then((x) => x.json());
  console.log("has_paid_membership API says: " + has_paid_membership);
} catch (err) {
  console.log("has_paid_membership has some error: " + err);
}

console.log("All done!");
