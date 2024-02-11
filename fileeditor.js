const http = require("http");
const fs = require("fs");
const path = require("path");
const { parseString, Builder } = require("xml2js");

function modifyXML(order) {
  const xmlFilePath = path.join("./ITPROG", "clientdb.xml");
  fs.readFile(xmlFilePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file: ", err);
      return;
    }
    parseString(data, (err, result) => {
      if (err) {
        console.error("Error parsing xml: ", err);
        return;
      }
      let i = 0;
      console.log(result.CATALOG.Order.length);
      for (i = 0; i < result.CATALOG.Order.length; i++) {
        console.log(JSON.stringify(result.CATALOG.Order[i].orderID[0]));
        console.log(JSON.stringify(order.Order.orderNum[i].toString()));
        result.CATALOG.Order[i].orderID = order.Order.orderNum[i].toString();
        result.CATALOG.Order[i].customerName = order.Order.customerName[i];
        result.CATALOG.Order[i].dateOfTransaction =
          order.Order.dateOfTransaction[i];
        result.CATALOG.Order[i].mainDish = order.Order.mainDish[i];
        result.CATALOG.Order[i].mainQty = order.Order.mainQty[i].toString();
        result.CATALOG.Order[i].sideDish = order.Order.sideDish[i];
        result.CATALOG.Order[i].sideQty = order.Order.sideQty[i].toString();
        result.CATALOG.Order[i].drink = order.Order.drink[i];
        result.CATALOG.Order[i].drinkQty = order.Order.drinkQty[i].toString();
        result.CATALOG.Order[i].comboMeal = order.Order.comboMeal[i];
        result.CATALOG.Order[i].totalPrice = order.Order.totalPrice[i];
        result.CATALOG.Order[i].discount = order.Order.discount[i];
        result.CATALOG.Order[i].payment = order.Order.payment[i];
        result.CATALOG.Order[i].change = order.Order.change[i].toString();
      }

      let j = i;
      for (j = i; j < order.Order.orderNum.length; j++) {
        console.log(j);
        result.CATALOG.Order[j] = {
          orderID: order.Order.orderNum[j].toString(),
          customerName: order.Order.customerName[j],
          dateOfTransaction: order.Order.dateOfTransaction[j],
          mainDish: order.Order.mainDish[j],
          mainQty: order.Order.mainQty[j].toString(),
          sideDish: order.Order.sideDish[j],
          sideQty: order.Order.sideQty[j].toString(),
          drink: order.Order.drink[j],
          drinkQty: order.Order.drinkQty[j].toString(),
          comboMeal: order.Order.comboMeal[j],
          totalPrice: order.Order.totalPrice[j],
          discount: order.Order.discount[j],
          payment: order.Order.payment[j],
          change: order.Order.change[j].toString(),
        };
        /*
                result.CATALOG.Order[j].push({orderID: order.Order.orderNum[j].toString()});
                result.CATALOG.Order[j].push({customerName: order.Order.customerName[j]});
                result.CATALOG.Order[j].push({dateOfTransaction: order.Order.dateOfTransaction[j]});
                result.CATALOG.Order[j].push({mainDish: order.Order.mainDish[j]});
                result.CATALOG.Order[j].push({mainQty: order.Order.mainQty[j].toString()});
                result.CATALOG.Order[j].push({sideDish: order.Order.sideDish[j]});
                result.CATALOG.Order[j].push({sideQty: order.Order.sideQty[j].toString()});
                result.CATALOG.Order[j].push({drink: order.Order.drink[j]});
                result.CATALOG.Order[j].push({drinkQty: order.Order.drinkQty[j].toString()});
                result.CATALOG.Order[j].push({comboMeal: order.Order.comboMeal[j].toString()});
                result.CATALOG.Order[j].push({totalPrice: order.Order.totalPrice[j]});
                result.CATALOG.Order[j].push({discount: order.Order.discount[j]});
                result.CATALOG.Order[j].push({payment: order.Order.payment[j]});
                result.CATALOG.Order[j].push({change: order.Order.change[j].toString()});*/
      }

      console.log("Hello");

      const builder = new Builder();
      const xml = builder.buildObject(result);

      fs.writeFile(xmlFilePath, xml, "utf-8", (err) => {
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log("File modified successfully.");
        }
      });
    });
  });
}

http
  .createServer(function (req, res) {
    const requestedUrl = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(__dirname, "ITPROG", requestedUrl);
    if (req.method == "POST") {
      let requestData = "";
      req.on("data", (chunk) => {
        requestData += chunk;
      });
      req.on("end", () => {
        console.log("Received POST data:", requestData);
        const parsedData = JSON.parse(requestData);
        const jsonFilePath = path.join("./ITPROG", "clientdb.json");
        fs.writeFile(jsonFilePath, requestData, (err) => {
          if (err) {
            console.error("Error writing file: ", err);
            res.writeHead(500);
            res.end("Error writing file.");
          } else {
            console.log("File modified successfully.");
            res.writeHead(200);
            modifyXML(parsedData);
            res.end("File modified successfully.");
          }
        });
        /*
            const response = {
                message: 'POST request received',
                data: parsedData
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));*/
      });
    } else {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          res.statusCode = 404;
          res.end("File not found");
        } else {
          fs.readFile(filePath, (err, data) => {
            if (err) {
              res.statusCode = 500;
              res.end("Internal server error");
            } else {
              const ext = path.extname(filePath);
              let contentType = "text/plain";
              if (ext === ".html") {
                contentType = "text/html";
              } else if (ext === ".css") {
                contentType = "text/css";
              } else if (ext === ".js") {
                contentType = "text/javascript";
              } else if (ext === ".json") {
                contentType = "text/json";
              }

              res.setHeader("Content-Type", contentType);
              res.end(data);
            }
          });
        }
      });
    }

    /*fs.readFile('Main.html', 'clientdb.json', function(err, data){
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.write(data);
        return res.end();
    });*/
  })
  .listen(8080);
/*
function updateOrder(order) {
    fs.writeFile('clientdb.json', order, 'utf8', (error) => {
        if (error) {
            console.error(`Sir, something's wrong in saving JSON file: `, error);
        } else {
            console.log(`Sir, JSON file is updated successfully!`);
        }
    });
}*/
