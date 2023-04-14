import fetch from "node-fetch";

const uri = "https://preview.api.dhsa.ndhu.me/trigger";
console.log("URI: " + uri);

const routes = ["/card/store", "/card/membership", "/poem"];

for (let i = 0; i < routes.length; i++) {
  try {
    console.log("\n[#" + (i + 1) + "]");
    console.log(`start to poke ${routes[i]}`);
    let resp = await fetch(uri + routes[i], {
      method: "PATCH",
    }).then((x) => x.json());
    console.log(`${routes[i]} says: ` + JSON.stringify(resp));
  } catch (err) {
    console.log(`${routes[i]} occurred some error: ` + err);
  }
}

console.log("\nAll done!");
