var express = require("express");
var app = express();
var bodyParser = require("body-parser");

var MongoClient = require("mongodb").MongoClient;
const { response } = require("express");
var url = "mongodb://localhost:27017/";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-COntrol-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(bodyParser.json());

app.use(express.static("public"));

app.post("/altaUsuario", function (req, res) {
  console.log("altaUsuario");

  var isFind = false;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("proyectfinal");
    var data = req.body;

    var resultBusqueda;
    dbo
      .collection("users")
      .find({ nombre: { $eq: data.nombre } })
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        resultBusqueda = result;
        //comprobar que el array dl resultado de la busqueda es mayor que 0 
        if (result.length > 0) {
          console.log("el usuario ya existe");
          isFind = true;
          res.end(JSON.stringify({ stateFind: isFind, data: data }));
        } else {
          //si no tiene ningun elemento el array de la busqeuda 
          //significa que no existe en la base de datos e insertamos...
          console.log("el usuario no existe");
          MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("proyectfinal");
            dbo.collection("users").insertOne(data, function (err, res) {
              if (err) throw err;
              console.log("1 document inserted");
              db.close();
            });
          });
          res.end(JSON.stringify({ stateFind: isFind, data: data }));
        }
      });
  });
});

//  app.get('/getLoggin', function(req, res) {
//    MongoClient.connect(url, function(err, db) {
//       if (err) throw err;
//       var dbo = db.db("proyectfinal");
//       dbo.collection("users").findOne({}).toArray(function(err, data) {
//         if (err) throw err;
//         console.log(data);
//         // para enviar cadenas de texto simple usamos res.end
//         // para enviar archivos o json usamos res.send
//         res.end(JSON.stringify(data));
//         // res.send(data)
//         db.close();
//       });
//     });
//     console.log("procesar contacto")
//    console.log("este es el console log del data")
// });

app.get("/getLoggin", function (req, res) {
  console.log(req.query);

  var isFindGet = false;

  const nombre = req.query.nombre;
  const password = req.query.password;
  console.log("este es el app.get", nombre, password);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("proyectfinal");
    var data = req.query;
    dbo
      .collection("users")
      .find({
        $and: [
          { nombre: { $eq: data.nombre } },
          { password: { $eq: data.password } },
        ],
      })
      .toArray(function (err, result) {
        if (err) throw err;
        console.log("este es el find del app.get", result);
        if(result.length > 0){
          console.log("el usuario ya existe del get del server");
          isFindGet = true;
          res.end(JSON.stringify({ stateFindGet: isFindGet }));
        }else{
          console.log("no existe el usuario introducido")
         res.end(JSON.stringify({ stateFindGet: isFindGet }));
        }
        db.close();
        
        // res.json({ result });
      });
  });
});

var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});
