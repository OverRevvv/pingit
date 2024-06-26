import express, { response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import * as https from 'https';
// import path from "path";
// import { dirname } from "path";
// import { fileURLToPath } from "url";

const port = process.env.PORT || 3001;
const app = express();
// const __dirname = dirname(fileURLToPath(import.meta.url));

// app.use(express.static(path.resolve(__dirname, './public'), { maxAge: '1y', etag: false }));
app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  await res.send(
    "this is ping it, simple app that pings to keep activity of servers running"
  );
});

app.post("/setping", async (req, res) => {
  const { url, interval } = req.body;
  let JSONData = await fs.readFileSync("./src/data.json", "utf8");
  let jsonData = JSON.parse(JSONData);

  //   check if url and interval already exist
  if (jsonData.some((item) => item.url === url && item.interval === interval)) {
    await res.send("Url and interval already exist");
    return;
  }
  // else write the data into the data.json
  jsonData.push({ url, interval });
  await fs.writeFileSync("./src/data.json", JSON.stringify(jsonData));
  await res.send("success");
});

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, './public/index.html'));
// })

async function ping(url) {
  await https
    .get(url, (response) => {
      console.log(`Status Code: ${response.statusCode}`);

      response.on("data", (chunk) => {
        console.log(`Body: ${chunk}`);
      });

      response.on("end", () => {
        return `Pinged ${url} successfully!`;
      });
    })
    .on("error", (e) => {
      console.error(`Got error: ${e.message}`);
    //   res.status(500).send("Error pinging URL");
      return statusCode(500) `Error pinging URL : ${e.message}`;
    });
}

app.post("/ping", async (req, res) => {
  const { url } = req.body;
  const statusCode = await ping(url);
  res.send(statusCode);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

setInterval(() => {
   ping("https://rentzenserver.onrender.com/");
}, 60*1000*14);