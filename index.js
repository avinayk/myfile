var module = require("module");
const express = require("express");
const nodemailer = require("nodemailer");
var router = express.Router();
const multer = require("multer");
const cors = require("cors");
var http = require("http");
var fs = require("fs");

var httpProxy = require("http-proxy");
const mysql = require("mysql2");
//const mysql = require("mysql");
const bodyParser = require("body-parser");
var request = require("request");
const app = (module.exports = express());
const https = require("https");
const md5 = require("md5");
const axios = require("axios");
const moment = require("moment");
const sgMail = require("@sendgrid/mail");
const uuid = require("uuid");
var timeout = require("connect-timeout");
//const ssl = require("ssl");
const SENDGRID_API_KEY =
  "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";

const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

const path = require("path");
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname));
});

// if not in production use the port 5000
const PORT = process.env.PORT || 3000;

console.log("server started on port:", PORT);
app.listen(PORT);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3002"); // update >
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//View image
app.use(express.static(__dirname + "/public"));
const db = mysql.createPool({
  connectionLimit: 10000, //important
  host: "roster.c6ehdxashsbh.ap-south-1.rds.amazonaws.com",
  user: "admin",
  password: ")DuMy5t?Ou00",
  database: "roster",
  port: "3306",
  debug: false,
});
db.getConnection(function (err, connection) {
  connection.release();
});

app.use(cors());
//app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuid.v4()}_${file.originalname}`;
    cb(null, uniqueFilename);
  },
});
const dynamicDestination = function (req, file, cb) {
  // Modify this logic to generate the desired dynamic folder name
  const dynamicFolder = req.dynamicFolder || ""; // Use a property from the request to determine the dynamic folder name
  const destinationPath = path.join("public/uploads/", dynamicFolder);
  console.log(dynamicFolder);
  cb(null, destinationPath);
};
const storagespecific = multer.diskStorage({
  destination: dynamicDestination, // Use the dynamic destination function
  filename: function (req, file, cb) {
    const uniqueFilename = `${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const uploadspecific = multer({
  storage: storagespecific,
  limits: {
    fileSize: 50 * 1024 * 1024, // Adjust the file size limit as needed
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Adjust the file size limit as needed
  },
});

//Elearn
const storage_l = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/elearning");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuid.v4()}_${file.originalname}`;
    cb(null, uniqueFilename);
  },
});
const uploade_leran = multer({
  storage: storage_l,
  limits: {
    fileSize: 50 * 1024 * 1024, // Adjust the file size limit as needed
  },
});
//Elearn

const storagedoc = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/incidentDocs/");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${file.originalname}`;
    cb(null, uniqueFilename);
  },
});
const upload_docs = multer({
  storage: storagedoc,
  limits: {
    fileSize: 50 * 1024 * 1024, // Adjust the file size limit as needed
  },
});

const storagelic = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/userlicence/");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${file.originalname}`;
    cb(null, uniqueFilename);
  },
});
const upload_lic = multer({
  storage: storagelic,
  limits: {
    fileSize: 50 * 1024 * 1024, // Adjust the file size limit as needed
  },
});
const storage_rep_hazard = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/reporthazard/");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${file.originalname}`;
    cb(null, uniqueFilename);
  },
});
const upload_rep_hazard = multer({
  storage: storage_rep_hazard,
  limits: {
    fileSize: 50 * 1024 * 1024, // Adjust the file size limit as needed
  },
});

const storage_userdoc = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/userdoc/");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${file.originalname}`;
    cb(null, uniqueFilename);
  },
});
const upload_userdoc = multer({
  storage: storage_userdoc,
  limits: {
    fileSize: 50 * 1024 * 1024, // Adjust the file size limit as needed
  },
});

const storagedocs = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/documents/");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${file.originalname}`;
    cb(null, uniqueFilename);
  },
});
const upload_documents = multer({
  storage: storagedocs,
  limits: {
    fileSize: 50 * 1024 * 1024, // Adjust the file size limit as needed
  },
});
app.post(
  "/register",
  upload.fields([
    { name: "licence_file" },
    { name: "trade_file" },
    { name: "machinery_file" },
    { name: "certificate_file" },
  ]),
  function (req, res) {
    var data = req.body;
    const skil = JSON.stringify(data.skills);

    var l_fpush = [];
    var t_fpush = [];
    var m_fpush = [];
    var mc_fpush = [];
    if (req.files["licence_file"]) {
      if (Array.isArray(req.files["licence_file"])) {
        for (let tt = 0; tt < req.files["licence_file"].length; tt++) {
          const t = req.files["licence_file"][tt];
          const uniqueFilename = `${uuid.v4()}_${t.originalname}`;

          l_fpush.push(t.filename);
        }
      }
    }
    if (req.files["trade_file"]) {
      if (Array.isArray(req.files["trade_file"])) {
        for (let ttt = 0; ttt < req.files["trade_file"].length; ttt++) {
          const tt = req.files["trade_file"][ttt];
          const uniqueFilename = `${uuid.v4()}_${tt.originalname}`;

          t_fpush.push(tt.filename);
        }
      }
    }
    if (req.files["machinery_file"]) {
      if (Array.isArray(req.files["machinery_file"])) {
        for (let tttm = 0; tttm < req.files["machinery_file"].length; tttm++) {
          const ttm = req.files["machinery_file"][tttm];
          const uniqueFilename = `${uuid.v4()}_${ttm.originalname}`;

          m_fpush.push(ttm.filename);
        }
      }
    }
    if (req.files["certificate_file"]) {
      if (Array.isArray(req.files["certificate_file"])) {
        for (
          let tttmc = 0;
          tttmc < req.files["certificate_file"].length;
          tttmc++
        ) {
          const ttmc = req.files["certificate_file"][tttmc];
          const uniqueFilename = `${uuid.v4()}_${ttmc.originalname}`;

          mc_fpush.push(ttmc.filename);
        }
      }
    }
    var sk = data.skills.split(",");
    var ml = data.licence.split(",");
    var mc = data.certificate.split(",");
    var tr = data.trade.split(",");
    var mach = data.machinery.split(",");
    var voct = data.vocational_training.split(",");
    var eqp = data.equipment_work.split(",");
    var pvw = data.previous_work.split(",");

    var refre = data.references.split(",");

    let users = {
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      email: data.email,
      password: md5(data.password),
      contact: data.contact,
      address: data.address,
      skills: JSON.stringify(sk),
      status: "Inactive",
      years: data.years,
      references: JSON.stringify(refre),
      employmentHistorySections: data.employmentHistorySections,
      education: data.education,
      licence: JSON.stringify(ml),
      licence_file: JSON.stringify(l_fpush),
      certificate: JSON.stringify(mc),
      certificate_file: JSON.stringify(mc_fpush),
      trade: JSON.stringify(tr),
      trade_file: JSON.stringify(t_fpush),
      machinery: JSON.stringify(mach),
      machinery_file: JSON.stringify(m_fpush),
      vocational_training: JSON.stringify(voct),
      equipment_work: JSON.stringify(eqp),
      previous_work: JSON.stringify(pvw),

      created_at: new Date(),
    };
    // //console.log(users);
    // return false;
    db.query(
      "SELECT * FROM users WHERE email=?",
      [data.email],
      function (err, row, fields) {
        if (err) throw err;
        // //console.log(row);
        if (row == "") {
          db.query(
            "INSERT INTO users SET ?",
            users,
            function (error, results, fields) {
              if (error) throw error;
              var idd = results.insertId;
              var status = "1";
              res.json({ status });
              createnewskills(skil);
              if (data.licence != "") {
                createnew_mentionlicence(JSON.stringify(data.licence));
              }
              if (data.certificate != "") {
                createnew_certificate(JSON.stringify(data.certificate));
              }

              if (data.trade != "") {
                createnew_trade(JSON.stringify(data.trade));
              }

              if (data.machinery != "") {
                createnew_machinery(JSON.stringify(data.machinery));
              }

              if (data.vocational_training != "") {
                createnew_vocational_training(
                  JSON.stringify(data.vocational_training)
                );
              }
              if (data.equipment_work != "") {
                createnew_equipment_work(JSON.stringify(data.equipment_work));
              }
              if (data.previous_work != "") {
                createnew_previous_work(JSON.stringify(data.previous_work));
              }

              // if (data.references != "") {
              //   createnew_references(JSON.stringify(data.references));
              // }
            }
          );
        } else {
          var status = "2";
          res.json({ status });
        }
      }
    );
  }
);
function createnewskills(skil) {
  const resultArray = skil.split(",");
  const resultArrays = resultArray.map((element) => element.replace(/"/g, ""));

  resultArrays.forEach((roww) => {
    db.query(
      "SELECT * FROM skills WHERE value=?",
      [roww],
      function (err, row, fields) {
        if (err) throw err;
        ////console.log(row[0].status);

        if (row == "") {
          let sk = {
            value: roww,
            label: roww,
          };
          db.query(
            "INSERT INTO skills SET ?",
            sk,
            function (error, results, fields) {
              if (error) throw error;
            }
          );
        }
      }
    );
  });
}

function createnew_mentionlicence(skil) {
  const resultArray = skil.split(",");
  const resultArrays = resultArray.map((element) => element.replace(/"/g, ""));

  resultArrays.forEach((roww) => {
    db.query(
      "SELECT * FROM mention_licenses WHERE value=?",
      [roww],
      function (err, row, fields) {
        if (err) throw err;
        ////console.log(row[0].status);

        if (row == "") {
          let sk = {
            value: roww,
            label: roww,
          };
          db.query(
            "INSERT INTO mention_licenses SET ?",
            sk,
            function (error, results, fields) {
              if (error) throw error;
            }
          );
        }
      }
    );
  });
}
function createnew_certificate(skil) {
  const resultArray = skil.split(",");
  const resultArrays = resultArray.map((element) => element.replace(/"/g, ""));

  resultArrays.forEach((roww) => {
    db.query(
      "SELECT * FROM mention_certification WHERE value=?",
      [roww],
      function (err, row, fields) {
        if (err) throw err;
        ////console.log(row[0].status);

        if (row == "") {
          let sk = {
            value: roww,
            label: roww,
          };
          db.query(
            "INSERT INTO mention_certification SET ?",
            sk,
            function (error, results, fields) {
              if (error) throw error;
            }
          );
        }
      }
    );
  });
}

function createnew_trade(skil) {
  const resultArray = skil.split(",");
  const resultArrays = resultArray.map((element) => element.replace(/"/g, ""));

  resultArrays.forEach((roww) => {
    db.query(
      "SELECT * FROM trade WHERE value=?",
      [roww],
      function (err, row, fields) {
        if (err) throw err;
        ////console.log(row[0].status);

        if (row == "") {
          let sk = {
            value: roww,
            label: roww,
          };
          db.query(
            "INSERT INTO trade SET ?",
            sk,
            function (error, results, fields) {
              if (error) throw error;
            }
          );
        }
      }
    );
  });
}

function createnew_machinery(skil) {
  const resultArray = skil.split(",");
  const resultArrays = resultArray.map((element) => element.replace(/"/g, ""));

  resultArrays.forEach((roww) => {
    db.query(
      "SELECT * FROM machinery WHERE value=?",
      [roww],
      function (err, row, fields) {
        if (err) throw err;
        ////console.log(row[0].status);

        if (row == "") {
          let sk = {
            value: roww,
            label: roww,
          };
          db.query(
            "INSERT INTO machinery SET ?",
            sk,
            function (error, results, fields) {
              if (error) throw error;
            }
          );
        }
      }
    );
  });
}
function createnew_vocational_training(skil) {
  const resultArray = skil.split(",");
  const resultArrays = resultArray.map((element) => element.replace(/"/g, ""));

  resultArrays.forEach((roww) => {
    db.query(
      "SELECT * FROM 	vocational_training WHERE value=?",
      [roww],
      function (err, row, fields) {
        if (err) throw err;
        ////console.log(row[0].status);

        if (row == "") {
          let sk = {
            value: roww,
            label: roww,
          };
          db.query(
            "INSERT INTO 	vocational_training SET ?",
            sk,
            function (error, results, fields) {
              if (error) throw error;
            }
          );
        }
      }
    );
  });
}

function createnew_references(skil) {
  const resultArray = skil.split(",");
  const resultArrays = resultArray.map((element) => element.replace(/"/g, ""));

  resultArrays.forEach((roww) => {
    db.query(
      "SELECT * FROM 	`references` WHERE value=?",
      [roww],
      function (err, row, fields) {
        if (err) throw err;
        ////console.log(row[0].status);

        if (row == "") {
          let sk = {
            value: roww,
            label: roww,
          };
          db.query(
            "INSERT INTO 	`references` SET ?",
            sk,
            function (error, results, fields) {
              if (error) throw error;
            }
          );
        }
      }
    );
  });
}
function createnew_equipment_work(skil) {
  const resultArray = skil.split(",");
  const resultArrays = resultArray.map((element) => element.replace(/"/g, ""));

  resultArrays.forEach((roww) => {
    db.query(
      "SELECT * FROM 	equipment_worked WHERE value=?",
      [roww],
      function (err, row, fields) {
        if (err) throw err;
        ////console.log(row[0].status);

        if (row == "") {
          let sk = {
            value: roww,
            label: roww,
          };
          db.query(
            "INSERT INTO 	equipment_worked SET ?",
            sk,
            function (error, results, fields) {
              if (error) throw error;
            }
          );
        }
      }
    );
  });
}
function createnew_previous_work(skil) {
  const resultArray = skil.split(",");
  const resultArrays = resultArray.map((element) => element.replace(/"/g, ""));

  resultArrays.forEach((roww) => {
    db.query(
      "SELECT * FROM 	previous_work WHERE value=?",
      [roww],
      function (err, row, fields) {
        if (err) throw err;
        ////console.log(row[0].status);

        if (row == "") {
          let sk = {
            value: roww,
            label: roww,
          };
          db.query(
            "INSERT INTO 	previous_work SET ?",
            sk,
            function (error, results, fields) {
              if (error) throw error;
            }
          );
        }
      }
    );
  });
}
app.post("/login", function (req, res) {
  ////console.log(req.body);
  var data = req.body;

  var pass = md5(data.password);
  ////console.log(pass);
  db.query(
    "SELECT * FROM users WHERE email=? And password=?",
    [data.email, pass],
    function (err, row, fields) {
      if (err) throw err;
      ////console.log(row[0].status);

      if (row != "") {
        if (row[0].status == "Inactive") {
          var status = 3;
        } else {
          var status = row;
        }
        res.json({ status });
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

//Admin Panel
app.post("/admin/login", function (req, res) {
  ////console.log(req.body);
  var data = req.body;

  var pass = md5(data.password);
  db.query(
    "SELECT * FROM admin WHERE email=? And password=?",
    [data.email, pass],
    function (err, row, fields) {
      if (err) throw err;

      if (row != "") {
        var status = row;
        ////console.log(row);
        res.json({ status });
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

app.post("/admin/addclient", function (req, res) {
  ////console.log(req.body);
  var data = req.body;

  var data = req.body;

  let formdata = {
    email: data.email,
    name: data.name,
    position: data.position,
    department: data.department,
    phone_number: data.phone_number,
    mobile_number: data.mobile_number,
    home_phone_number: data.home_phone_number,
    fax_number: data.fax_number,
    created_at: new Date(),
  };
  db.query(
    "SELECT * FROM clients WHERE email=?",
    [data.email],
    function (err, row, fields) {
      if (err) throw err;
      ////console.log(row);
      if (row == "") {
        db.query(
          "INSERT INTO clients SET ?",
          formdata,
          function (error, results, fields) {
            if (error) throw error;
            var idd = results.insertId;
            var status = "1";
            res.json({ status });
          }
        );
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});
app.get("/admin/getclient", (req, res) => {
  db.query(
    "SELECT * FROM clients  order by id desc",
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});

app.get("/admin/getemployee", (req, res) => {
  db.query(
    "SELECT * FROM users  order by id desc",
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.get("/admin/getemployeeAdmin", (req, res) => {
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  console.log(currentDate);
  db.query(
    `SELECT 
      users.*, 
      COALESCE(upload_counts.total_uploads, 0) AS total_uploads 
    FROM 
      users 
    LEFT JOIN 
      ( 
        SELECT 
          user_id, 
          COUNT(*) AS total_uploads 
        FROM 
          user_licence_document_upload 
        WHERE 
          expirydate < '${currentDate}'
        GROUP BY 
          user_id 
      ) AS upload_counts 
    ON 
      users.id = upload_counts.user_id 
    ORDER BY 
      users.id DESC;`,
    function (err, results, fields) {
      if (err) throw err;
      //console.log(results);
      res.json({ results });
    }
  );
});
app.get("/admin/getlocation", (req, res) => {
  db.query(
    "SELECT * FROM locations  order by id desc",
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.post("/admin/getclient", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var id = data.clientId;
  db.query(
    "SELECT * FROM clients WHERE id=?",
    [id],
    function (err, row, fields) {
      if (err) throw err;
      // //console.log(row);
      res.json({ row });
    }
  );
});
app.post("/admin/getidlocation", function (req, res) {
  ////console.log(req.body);

  var data = req.body;
  var id = data.locationId;
  db.query(
    "SELECT * FROM locations WHERE id=?",
    [id],
    function (err, row, fields) {
      if (err) throw err;
      var location = row;
      ////console.log(location[0].id);
      if (location != "") {
        db.query(
          "SELECT * FROM clients WHERE id=?",
          [location[0].client_id],
          function (err, row, fields) {
            if (err) throw err;
            var r = row;
            if (r != "") {
              // //console.log(r);
              const currentDate = location[0].duration_start;
              const formattedDate = currentDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              const currentDatee = location[0].duration_end;
              const formattedDatee = currentDatee.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              let locations = {
                id: location[0].id,
                client_id: location[0].client_id,
                location_name: location[0].location_name,
                nearest_town: location[0].nearest_town,
                commodity: location[0].commodity,
                contract_type: location[0].contract_type,
                duration_start: formattedDate,
                duration_end: formattedDatee,
                scope: location[0].scope,
                client_name: r[0].name,
              };
              ////console.log(locations);
              res.json({ locations });
            }
          }
        );
      }
    }
  );
});
app.post("/admin/getuser", function (req, res) {
  //console.log(req.body);
  var data = req.body;
  var id = data.userId;
  db.query("SELECT * FROM users WHERE id=?", [id], function (err, row, fields) {
    if (err) throw err;
    res.json({ row });
  });
});
app.post("/admin/userregister", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  const skil = JSON.stringify(data.skills);
  let users = {
    first_name: data.first_name,
    middle_name: data.middle_name,
    last_name: data.last_name,
    email: data.email,
    password: md5(data.password),
    contact: data.contact,
    address: data.address,
    status: "Inactive",
    skills: skil,
    years: data.years,
    created_at: new Date(),
  };
  db.query(
    "SELECT * FROM users WHERE email=?",
    [data.email],
    function (err, row, fields) {
      if (err) throw err;
      // //console.log(row);
      if (row == "") {
        db.query(
          "INSERT INTO users SET ?",
          users,
          function (error, results, fields) {
            if (error) throw error;
            var idd = results.insertId;
            var status = "1";
            res.json({ status });
          }
        );
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

app.post("/admin/addlocation", function (req, res) {
  ////console.log(req.body);
  var data = req.body;

  let locations = {
    client_id: data.client_id,
    location_name: data.location_name,
    nearest_town: data.nearest_town,
    commodity: data.commodity,
    contract_type: data.contract_type,
    duration_start: data.duration_start,
    duration_end: data.duration_end,
    scope: data.scope,
    created_at: new Date(),
  };
  db.query(
    "INSERT INTO locations SET ?",
    locations,
    function (error, results, fields) {
      if (error) throw error;
      var idd = results.insertId;
      var status = "1";
      res.json({ status });
    }
  );
});

app.post("/admin/getminesites", function (req, res) {
  ////console.log(req.body);
  var data = req.body;

  var id = data.clientId;
  db.query(
    "SELECT * FROM locations WHERE client_id=? order by id desc",
    [id],
    function (err, results, fields) {
      if (err) throw err;
      //  //console.log(results);
      res.json({ results });
    }
  );
});
function twodate_Diff(startdate, sldate) {
  var dt = getdays(startdate);
  var crd = getdays(sldate);
  // //console.log(dt);
  const givenDate = new Date(dt);

  // Get the current date
  const currentDate = new Date(crd);
  var getd = getdays(currentDate);
  const cd = new Date(getd);
  ////console.log(cd);
  // Calculate the time difference in milliseconds
  const timeDifference = cd - givenDate;

  // Calculate the difference in days
  const differenceInDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  // //console.log(differenceInDays);
  return differenceInDays;
}
app.post("/admin/setRoster", function (req, res) {
  ////console.log(req.body);

  var data = req.body;

  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];

  if (data.type == "2/2") {
    var number_day_start = "14";
    var number_day_end = "14";
  }
  if (data.type == "8/6") {
    var number_day_start = "8";
    var number_day_end = "6";
  }
  if (data.type == "3/1") {
    var number_day_start = "21";
    var number_day_end = "7";
  }
  if (data.type == "2/1") {
    var number_day_start = "14";
    var number_day_end = "7";
  }
  if (data.type == "15/13") {
    var number_day_start = "15";
    var number_day_end = "13";
  }
  if (data.type == "7/7") {
    var number_day_start = "7";
    var number_day_end = "7";
  }
  if (data.type == "5/7") {
    var number_day_start = "5";
    var number_day_end = "7";
  }

  db.query(
    "SELECT * FROM locations WHERE id=? And duration_end > ? order by id desc",
    [data.locationId, formattedDate],
    function (err, row, fields) {
      if (err) throw err;
      var ss = row;
      ////console.log(row);
      if (row != "") {
        db.query(
          "SELECT * FROM rosters WHERE user_id=? And month_end_date > ? order by id desc",
          [data.user_id, formattedDate],
          function (err, row, fields) {
            if (err) throw err;
            //console.log("row");
            //console.log(row);

            if (row == "") {
              var std = nextdaysget_vl(data.date, 84);
              const lastDate = std[std.length - 1];
              //console.log("ch");
              //console.log(lastDate);
              let rosters = {
                number_day_start: number_day_start,
                number_day_end: number_day_end,
                duration_date: ss[0].duration_end,
                location_id: data.locationId,
                client_id: data.clientID,
                user_id: data.user_id,
                startdate: data.date,
                month_end_date: new Date(lastDate),
                type: data.type,
                created_at: new Date(),
              };

              db.query(
                "INSERT INTO rosters SET ?",
                rosters,
                function (error, results, fields) {
                  if (error) throw error;
                  db.query(
                    "SELECT * FROM users WHERE id=?",
                    [data.user_id],
                    function (err, row, fields) {
                      if (err) throw err;
                      var em = row;
                      var msg = "is select the roster";
                      let notifications = {
                        user_id: data.user_id,
                        message: msg,
                        date: new Date(),
                      };
                      db.query(
                        "INSERT INTO notifications SET ?",
                        notifications,
                        function (error, results, fields) {
                          if (error) throw error;
                        }
                      );
                    }
                  );
                }
              );
              var status = "2";
              res.json({ status });
            } else {
              var status = "1";
              res.json({ status });
            }
          }
        );
      } else {
        var status = "3";
        res.json({ status });
      }
    }
  );
});
app.post("/admin/getroster", function (req, res) {
  ////console.log(req.body);
  var data = req.body;

  db.query(
    "SELECT * FROM rosters WHERE user_id=? order by id desc",
    [data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});

app.post("/admin/getallroster", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];
  db.query(
    "SELECT rosters.*,locations.location_name,locations.client_id,locations.id,clients.id,clients.name FROM rosters join locations on rosters.location_id = locations.id join clients on locations.client_id = clients.id WHERE rosters.user_id=? And locations.duration_end >=? order by rosters.id desc",
    [data.user_id, formattedDate],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/admin/getallrosterlimit", function (req, res) {
  //console.log(req.body);
  var data = req.body;
  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];
  db.query(
    "SELECT rosters.*,locations.location_name,locations.client_id,locations.id,clients.id,clients.name FROM rosters join locations on rosters.location_id = locations.id join clients on locations.client_id = clients.id WHERE rosters.user_id=? And locations.duration_end >=? And rosters.status = ? order by rosters.id desc",
    [data.user_id, formattedDate, "Incomplete"],
    function (err, results, fields) {
      if (err) throw err;
      const dataa = [];
      results.forEach((row) => {
        var dd = getdays(row.startdate);
        var checkmonth_end = getdays(row.month_end_date);
        var ch = twodate_Diff(dd, data.checkdate);
        ////console.log(ch);
        if (checkmonth_end >= formattedDate) {
          if (ch >= 0) {
            var mainvl = row.number_day_start;
            //console.log(mainvl);
            let alld = {
              client_id: row.client_id,
              name: row.name,
            };
            dataa.push(alld);
          }
        }
      });
      //console.log("chhhhh");
      //console.log(dataa);
      res.json({ dataa });
    }
  );
});
app.post("/admin/getclient_check", function (req, res) {
  //console.log(req.body);
  var data = req.body;
  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];
  db.query(
    "SELECT * from locations  where client_id =? And duration_end >= ?",
    [data.clientId, formattedDate],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/admin/getlocation_check", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];
  db.query(
    "SELECT rosters.*,locations.location_name,locations.client_id,locations.id,clients.id,clients.name FROM rosters join locations on rosters.location_id = locations.id join clients on locations.client_id = clients.id WHERE rosters.user_id=? And  rosters.client_id=? And locations.duration_end >=? And rosters.status = ? order by rosters.id desc",
    [data.user_id, data.client_id, formattedDate, "Incomplete"],
    function (err, row, fields) {
      if (err) throw err;
      //console.log("getlocat");
      //console.log(row);
      res.json({ row });
    }
  );
});

app.post(
  "/admin/userprofileupdate",
  upload.single("file"),
  function (req, res) {
    const dd = req.body;

    // var data = req.body;
    if (req.file != null) {
      const sourcePath = req.file.path;
      const targetPath = path.join(__dirname, "uploads", req.file.filename);
      var f = req.file.filename;
    } else {
      var f = dd.profiledate;
    }
    if (f == "") {
      var f = null;
    }

    db.query(
      "SELECT * from users  where id = ?",
      [dd.UserId],
      function (err, row, fields) {
        if (err) throw err;

        db.query(
          "UPDATE users SET image =? where id=?",
          [f, dd.UserId],
          function (err, result) {
            if (err) throw err;
            var status = "1";
            res.json({ status });
          }
        );
      }
    );
  }
);
app.post("/admin/timesheetupload", upload.single("file"), function (req, res) {
  ////console.log(req.body);
  const dd = req.body;
  //console.log(dd);
  // var data = req.body;
  if (req.file != null) {
    const sourcePath = req.file.path;
    const targetPath = path.join(__dirname, "uploads", req.file.filename);
    //console.log(targetPath);
    var f = req.file.filename;
  }
  if (f == "") {
    var f = null;
  }
  let user_timesheet = {
    user_id: dd.user_id,
    file: f,
    created_at: new Date(),
  };

  db.query(
    "INSERT INTO user_timesheet SET ?",
    user_timesheet,
    function (error, results, fields) {
      if (error) throw error;
      var status = "1";
      res.json({ status });
    }
  );
});
app.post("/admin/userroleupdate", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  //console.log(req.body);
  db.query(
    "UPDATE users SET role =? where id=?",
    [data.role, req.body.user_id],
    function (err, result) {
      if (err) throw err;
      var status = "1";
      res.json({ status });
    }
  );
});
app.post("/admin/getlocateroster", function (req, res) {
  ////console.log(req.body);
  var data = req.body;

  db.query(
    "SELECT * from rosters  where location_id =?",
    [data.clientId],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/admin/getcurrentroster", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var nd = new Date();
  var cj = getdays(nd);
  var s = "Incomplete";

  ////console.log(cj);
  db.query(
    "SELECT rosters.*, Count(attendance.id) as count,attendance.id as attend_id FROM `rosters` left join attendance on attendance.roster_id = rosters.id where rosters.user_id = ? And rosters.status=? And rosters.duration_date >= ?  And  (shift=? or shift=?)",
    [data.user_id, s, cj, "Day", "Edit"],
    function (err, row, fields) {
      if (err) throw err;

      // const filteredResults = row.filter(
      //   (row) => row.count !== row.number_day_start
      // );
      ////console.log("currentroster");
      ////console.log(filteredResults);
      var filteredResults = row;
      res.json({ filteredResults });
    }
  );
});
app.post("/admin/getlocaterostercheck", function (req, res) {
  //console.log(req.body);
  var data = req.body;
  var nd = new Date();
  var cj = getdays(nd);
  var s = "Incomplete";
  if (data.datess == cj) {
    db.query(
      "SELECT rosters.*, Count(attendance.id) as count FROM `rosters` left join attendance on attendance.roster_id = rosters.id where rosters.user_id = ? and rosters.location_id = ? And rosters.status=?",
      [data.user_id, data.clientId, s],
      function (err, results, fields) {
        if (err) throw err;

        const filteredResults = results;
        res.json({ filteredResults });
      }
    );
  } else {
    //console.log("ddd");
    db.query(
      "SELECT * from rosters  where location_id =? And user_id=?",
      [data.clientId, data.user_id],
      function (err, results, fields) {
        if (err) throw err;
        const filteredResults = results;
        res.json({ filteredResults });
      }
    );
  }
});
app.post("/admin/attendancesave", function (req, res) {
  var data = req.body;
  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];
  var dd = getdays(data.daystart);

  db.query(
    "SELECT * from attendance  where user_id =? And  date=?",
    [data.user_id, dd],
    function (err, row, fields) {
      if (err) throw err;
      if (row != "") {
        var d = getdays(data.daystart);
        db.query(
          "UPDATE attendance SET client_id=?,location_id=?,shift=? WHERE user_id = ? And date=?",
          [data.clientId, data.location, data.shift, data.user_id, d],
          function (err, result) {
            if (err) throw err;
            var msg = "";
            if (data.shift === "Sick Leave" || data.shift === "AL") {
              if (data.status === "Sick Leave") {
                var msg = " is Sick Leave";
              }
              if (data.status === "AL") {
                var msg = " is Annual Leave";
              }
            } else {
              var msg = " is " + data.shift + " shift ";
            }
            // //console.log(msg);

            let notifications = {
              user_id: data.user_id,
              message: msg,
              date: new Date(d),
            };
            db.query(
              "INSERT INTO notifications SET ?",
              notifications,
              function (error, results, fields) {
                if (error) throw error;
              }
            );
            res.json({ row });
          }
        );
        db.query(
          "SELECT * FROM attendance where user_id = ?  And date=?",
          [data.user_id, d],
          function (err, row, fields) {
            if (err) throw err;
            var rdd = row;
            //console.log("rdd");
            //console.log(rdd);
            let att = {
              user_id: rdd[0].user_id,
              client_id: rdd[0].client_id,
              location_id: rdd[0].location_id,
              roster: rdd[0].roster,
              roster_id: rdd[0].roster_id,
              shift: rdd[0].shift,
              date: new Date(d),
              created_at: new Date(d),
            };
            db.query(
              "INSERT INTO attendance_backup SET ?",
              att,
              function (error, results, fields) {
                if (error) throw error;
              }
            );
          }
        );
      } else {
        let att = {
          user_id: data.user_id,
          client_id: data.clientId,
          location_id: data.location,
          roster: data.roster,
          roster_id: ro[0].id,
          shift: data.shift,
          date: new Date(data.daystart),
          created_at: new Date(),
        };
        db.query(
          "INSERT INTO attendance SET ?",
          att,
          function (error, results, fields) {
            if (error) throw error;
            var status = "1";
            res.json({ row });
            db.query(
              "SELECT * FROM users WHERE id=?",
              [data.user_id],
              function (err, row, fields) {
                if (err) throw err;
                var em = row;
                var msg = "";
                if (data.shift === "Sick Leave" || data.shift === "AL") {
                  if (data.status === "Sick Leave") {
                    var msg = " is Sick Leave";
                  }
                  if (data.status === "AL") {
                    var msg = " is Annual Leave";
                  }
                } else {
                  var msg = " is " + data.shift + " shift ";
                }
                // //console.log(msg);

                let notifications = {
                  user_id: data.user_id,
                  message: msg,
                  date: new Date(),
                };
                db.query(
                  "INSERT INTO notifications SET ?",
                  notifications,
                  function (error, results, fields) {
                    if (error) throw error;
                  }
                );
              }
            );
          }
        );
        db.query(
          "INSERT INTO attendance_backup SET ?",
          att,
          function (error, results, fields) {
            if (error) throw error;
          }
        );
      }
      db.query(
        "SELECT rosters.*, Count(attendance.id) as count FROM `rosters` left join attendance on attendance.roster_id = rosters.id where rosters.user_id = ? and rosters.location_id = ? And rosters.client_id = ? And attendance.shift != ?",
        [data.user_id, data.location, data.clientId, "Edit"],
        function (err, row, fields) {
          if (err) throw err;
          if (row != "") {
            if (row[0].number_day_start == row[0].count) {
              var ss = "Complete";
              db.query(
                "UPDATE rosters SET status =? where id=?",
                [ss, row[0].id],
                function (err, result) {
                  if (err) throw err;
                }
              );
            }
          }
        }
      );
    }
  );
  ////console.log(data);
});

app.post("/admin/daystatus", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];
  db.query(
    "SELECT * from attendance  where user_id =? And date =?",
    [data.user_id, formattedDate],
    function (err, row, fields) {
      if (err) throw err;
      res.json({ row });
    }
  );
});

app.post("/admin/getAttendancedetailForDay", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Present";
  var day = "Day";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift =?  And user_id = ? And client_id = ? ORDER BY id asc",
    [day, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log("forday");
      ////console.log(data);
      res.json({ data });
    }
  );
});
app.post("/admin/getuserdetails", function (req, res) {
  ////console.log(req.body);
  var data = req.body;

  db.query(
    "SELECT * from users  where id =?",
    [data.user_id],
    function (err, row, fields) {
      if (err) throw err;
      ////console.log(row);
      res.json({ row });
    }
  );
});
app.post("/admin/getclientFuser", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];
  db.query(
    "SELECT rosters.type,attendance.*,clients.id,locations.location_name,locations.duration_end,clients.name FROM attendance join clients on attendance.client_id = clients.id join locations on attendance.location_id = locations.id join rosters on rosters.id = attendance.roster_id WHERE attendance.user_id=? And locations.duration_end >=? GROUP BY attendance.client_id",
    [data.user_id, formattedDate],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/admin/getclientroster", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  ////console.log(data);
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // January is 0, so we add 1
  const day = String(currentDate.getDate()).padStart(2, "0");

  // Form the desired format: YYYY-MM-DD
  const formattedDate = `${year}-${month}-${day}`;
  db.query(
    "SELECT attendance.*,rosters.type,clients.id,locations.location_name,locations.duration_end,clients.name FROM attendance join clients on attendance.client_id = clients.id join locations on attendance.location_id = locations.id join rosters on rosters.id = attendance.roster_id WHERE attendance.user_id=? And attendance.client_id=? And locations.duration_end >=? GROUP BY attendance.client_id",
    [data.user_id, data.client_id, formattedDate],
    function (err, row, fields) {
      if (err) throw err;
      res.json({ row });
    }
  );
});

//Night Shift
app.post("/admin/getAttendancedetailForNight", function (req, res) {
  //console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Present";
  var day = "Night";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift=?  And user_id = ? And client_id = ? ORDER BY date asc",
    [day, data.user_id, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};
      //console.log(results);
      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }

        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      //console.log("night");
      //console.log(data);
      res.json({ data });
    }
  );
});
//Sick Leave

app.post("/admin/getAttendancedetailsickLeave", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Sick Leave";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//For All Working Days
app.post("/admin/getAttendanceAllworkingDays", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Add";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift != ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});
//For All Days off
app.post("/admin/getAttendanceAlloffDays", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Add";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Annual Leave
app.post("/admin/getAttendancedetailannualLeave", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "AL";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Works Camp
app.post("/admin/getAttendancedetailworkerscomp", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Work Camp";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Fly in Pm
app.post("/admin/getAttendancedetailflyinpm", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "FLIPM";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Fly out Am
app.post("/admin/getAttendancedetailflyoutam", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "FLOAM";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Fly in am
app.post("/admin/getAttendancedetailflyinam", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "FLIAM";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//For Inisolation
app.post("/admin/getAttendancedetailinisolationonsite", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "In Isolation on site";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//For Without Pay
app.post("/admin/getAttendancedetailleavewithoutpay", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Leave Without Pay";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Fly out Pm
app.post("/admin/getAttendancedetailflyoutpm", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "FLOPM";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//For work of Site
app.post("/admin/getAttendancedetailworkoffsite", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Work Offsite";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Day Off
app.post("/admin/getuserdayoff", function (req, res) {
  var data = req.body;
  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];
  var status = "AL";
  var ss = "Sick Leave";
  db.query(
    "SELECT rosters.*,attendance.id,attendance.date from rosters left join attendance on attendance.roster_id = rosters.id where rosters.client_id =? And rosters.user_id =?  And attendance.shift=? group by rosters.id ORDER by rosters.id DESC",
    [data.client_id, data.user_id, "Add"],
    function (err, row, fields) {
      if (err) throw err;
      if (row != "") {
        var sid = row;

        db.query(
          "SELECT date from attendance where user_id = ? And client_id =? And shift =?",
          [data.user_id, data.client_id, "Add"],
          function (err, results, fields) {
            if (err) throw err;
            var maindata = results;
            if (maindata != "") {
              const data = {};
              var cud = new Date();
              var cds = getdays(cud);
              results.forEach((row) => {
                var d = row.date;
                var ddd = getdays(d);
                if (ddd < cds) {
                  const [year, month, day] = ddd.split("-");
                  if (!data[month]) {
                    data[month] = [];
                  }

                  data[month].push({
                    year: parseInt(year),
                    month: parseInt(month),
                    nd: day,
                  });
                }
              });

              res.json({ data });
            }
          }
        );
      }
    }
  );
});

//Missing days
function findMissingDays(dateList) {
  const missingDays = [];
  for (let i = 0; i < dateList.length - 1; i++) {
    const currentDate = new Date(dateList[i]);
    const nextDate = new Date(dateList[i + 1]);
    const differenceInTime = nextDate.getTime() - currentDate.getTime();
    const oneDay = 1000 * 60 * 60 * 24;

    if (differenceInTime > oneDay) {
      const daysDifference = differenceInTime / oneDay;
      for (let j = 1; j < daysDifference; j++) {
        const missingDate = new Date(currentDate.getTime() + j * oneDay);
        missingDays.push(missingDate.toISOString().split("T")[0]);
      }
    }
  }
  return missingDays;
}
//Missing days
//Day Off

//Employee Current Work
app.post("/admin/getEmployeeDetail", function (req, res) {
  var data = req.body;
  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];
  var ss = "Present";
  db.query(
    "SELECT attendance.*,locations.location_name from attendance join locations on locations.id = attendance.location_id where attendance.user_id =? And attendance.client_id=? And attendance.shift != ?",
    [data.user_id, data.client_id, "Edit"],
    function (err, row, fields) {
      if (err) throw err;
      var rw = row;
      if (rw != "") {
        // Get the day of the week as an index (0 to 6, where 0 represents Sunday)
        var currd = row[0].date;
        const dayIndex = currd.getDay();

        // Array of human-readable day names
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        // Get the day of the week as a human-readable string
        const dayName = daysOfWeek[dayIndex];

        const datee = new Date(row[0].date);

        // Set the timezone to UTC
        datee.setUTCHours(0, 0, 0, 0);

        const year = datee.getUTCFullYear();
        const month = String(datee.getUTCMonth() + 1).padStart(2, "0");
        const day = String(datee.getUTCDate()).padStart(2, "0");

        const formattedDatse = `${day}/${month}/${year}`;

        row[0].d = dayName;
        row[0].nd = formattedDatse;
        res.json({ row });
      } else {
        res.json({ row });
      }
    }
  );
});
//Employee Current Work

function getdformate(dd) {
  const datee = new Date(dd);
  // Set the timezone to UTC
  datee.setUTCHours(0, 0, 0, 0);
  const year = datee.getUTCFullYear();
  const month = String(datee.getUTCMonth() + 1).padStart(2, "0");
  const day = String(datee.getUTCDate()).padStart(2, "0");

  const formattedDatse = `${day}/${month}/${year}`;
  return formattedDatse;
}
//Employee Form Submit
app.post("/admin/employeAttendanceForm", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  // //console.log(data);
  // return false;
  const currentDate = new Date();
  const year = currentDate.getUTCFullYear();
  const month = String(currentDate.getUTCMonth() + 1).padStart(2, "0"); // January is 0, so we add 1
  const day = String(currentDate.getUTCDate()).padStart(2, "0");

  // Form the desired format: YYYY-MM-DD
  const formattedDate = `${year}-${month}-${day}`;

  db.query(
    "SELECT * FROM attendance WHERE user_id=? AND hours_status =? AND date BETWEEN ? AND ?",
    [data.user_id, "User", data.start, data.end],
    async function (err, results, fields) {
      if (err) throw err;

      if (results.length > 0) {
        // Create an array to store promises
        const updatePromises = [];

        for (const row of results) {
          try {
            const updatedRow = await updateRow(row, data);
            updatePromises.push(updatedRow);
          } catch (updateErr) {
            console.error("Error updating row:", updateErr);
            // Handle error appropriately
          }
        }

        // Execute all update promises
        Promise.all(updatePromises)
          .then(() => {
            var status = "1";
            res.json({ status });
          })
          .catch((err) => {
            console.error("Error updating rows:", err);
            var status = "2"; // or any other appropriate error status
            res.json({ status });
          });
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );

  // Function to update a single row with a promise
  function updateRow(row, data) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE attendance SET hours_status=?, admin_view_hours=?, signature_img=? WHERE id=?",
        ["Client", row.hours, data.signature_img, row.id],
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }
});

//Get All Notifications
app.post("/admin/getallnotifications", function (req, res) {
  ////console.log(req.body);

  db.query(
    "SELECT notifications.*,users.first_name,users.middle_name,users.last_name FROM notifications join users on users.id = notifications.user_id order by notifications.id desc",
    function (err, results, fields) {
      if (err) throw err;
      // //console.log(row);
      const data = [];
      results.forEach((row) => {
        var g = getdformate(row.date);
        const formattedDate = g;
        row.nd = formattedDate;

        ////console.log(row);
        data.push(row);
      });
      res.json({ data });
    }
  );
});

//User Approve
app.post("/admin/userApprove", function (req, res) {
  ////console.log(req.body);

  var data = req.body;
  sendEmail(data.email, (info) => {
    //console.log(`The mail`);
    res.send(info);
  });
  var s = "Active";
  db.query(
    "UPDATE users SET status =? where id=?",
    [s, data.user_id],
    function (err, result) {
      if (err) throw err;
      var status = "1";
      res.json({ status });
    }
  );
});

//Send Confimation Mail
async function sendEmail(too, callback) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jlmining001@gmail.com",
      pass: "rmyq bzzn cnbg xoyi",
    },
  });
  const mailOptions = {
    from: "jlmining001@gmail.com",
    to: too,
    subject: "Account Approved",
    text: "Your account has been successfully approved",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error);
    } else {
      //console.log("Email sent:", info.response);
    }
  });
}

//Get Time Sheet

app.post("/admin/getTimesheet", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT attendance.*,locations.location_name,clients.name from attendance join locations on locations.id = attendance.location_id join clients on clients.id = attendance.client_id where attendance.user_id =? And (attendance.shift !=? And attendance.Shift !=?)  order by attendance.date asc",
    [data.user_id, "Add", "Edit"],
    function (err, results, fields) {
      if (err) throw err;
      const data = [];
      results.forEach((row) => {
        var g = getdformate(row.date);
        const formattedDate = g;
        var currd = row.date;
        const dayIndex = currd.getUTCDay();

        // Array of human-readable day names
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        // Get the day of the week as a human-readable string
        const dayName = daysOfWeek[dayIndex];
        row.nd = formattedDate;
        row.dd = dayName;
        data.push(row);
      });
      res.json({ data });
    }
  );
});

app.post("/admin/getclientinfo", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * from clients where id =?",
    [data.clientId],
    function (err, row, fields) {
      if (err) throw err;
      res.json({ row });
    }
  );
});

//New Apis
// sendEmailforgot("avinayquicktech@gmail.com", "12345", (info) => {
//   //console.log(info)
// });
app.post("/forgotpassword", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * from users where email =?",
    [data.email],
    function (err, row, fields) {
      if (err) throw err;
      ////console.log(row);
      const pass = generateRandomPassword(8);
      db.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [md5(pass), data.email],
        function (err, result) {
          if (err) throw err;
          sendEmailforgot(data.email, pass, (info) => {
            res.send(info);
          });
        }
      );
      var status = "1";
      if (row == "") {
        var status = "2";
      }
      res.json({ status });
    }
  );
});

//User Delete
app.post("/admin/userdelete", function (req, res) {
  var data = req.body;
  db.query(
    "DELETE FROM users WHERE id= ?",
    [data.user_id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "DELETE FROM employeeWorkform WHERE user_id= ?",
        [data.user_id],
        function (err, result) {
          if (err) throw err;
          db.query(
            "DELETE FROM notifications WHERE user_id= ?",
            [data.user_id],
            function (err, result) {
              if (err) throw err;
              db.query(
                "DELETE FROM attendance WHERE user_id= ?",
                [data.user_id],
                function (err, result) {
                  if (err) throw err;
                  db.query(
                    "DELETE FROM rosters WHERE user_id= ?",
                    [data.user_id],
                    function (err, result) {
                      if (err) throw err;
                      ////console.log(result);
                    }
                  );
                }
              );
            }
          );
        }
      );
      var status = "1";
      res.json({ status });
    }
  );
});
app.post("/admin/clientdelete", function (req, res) {
  var data = req.body;
  ////console.log(data);
  db.query(
    "SELECT * from rosters where client_id =?",
    [data.client_id],
    function (err, row, fields) {
      if (err) throw err;

      if (row == "") {
        db.query(
          "DELETE FROM clients WHERE id= ?",
          [data.client_id],
          function (err, result) {
            if (err) throw err;
            db.query(
              "DELETE FROM locations WHERE client_id= ?",
              [data.client_id],
              function (err, result) {
                if (err) throw err;
                db.query(
                  "DELETE FROM rosters WHERE client_id= ?",
                  [data.client_id],
                  function (err, result) {
                    if (err) throw err;
                  }
                );
              }
            );
            var status = "1";
            res.json({ status });
          }
        );
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});
app.post("/admin/locationdelete", function (req, res) {
  var data = req.body;
  ////console.log(data);
  db.query(
    "SELECT * from rosters where location_id =?",
    [data.location_id],
    function (err, row, fields) {
      if (err) throw err;

      if (row == "") {
        db.query(
          "DELETE FROM locations WHERE id= ?",
          [data.location_id],
          function (err, result) {
            if (err) throw err;
            db.query(
              "DELETE FROM rosters WHERE client_id= ?",
              [data.location_id],
              function (err, result) {
                if (err) throw err;
                db.query(
                  "DELETE FROM rosters WHERE client_id= ?",
                  [data.location_id],
                  function (err, result) {
                    if (err) throw err;
                  }
                );
              }
            );
            var status = "1";
            res.json({ status });
          }
        );
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});
app.post("/admin/getlocationr", function (req, res) {
  ////console.log(req.body.data);
  var data = req.body;

  db.query(
    "SELECT * from locations  where id =?",
    [data.locationId],
    function (err, row, fields) {
      if (err) throw err;
      ////console.log(row);

      const currentDate = row[0].duration_start;
      const formattedDate = currentDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const currentDatee = row[0].duration_end;
      const formattedDatee = currentDatee.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      let ss = {
        id: row[0].id,
        location_name: row[0].location_name,
        nearest_town: row[0].nearest_town,
        commodity: row[0].commodity,
        contract_type: row[0].contract_type,
        duration_start: formattedDate,
        duration_end: formattedDatee,
        scope: row[0].scope,
      };
      res.json({ ss });
    }
  );
});
app.post("/admin/getallCalendardetail", function (req, res) {
  var data = req.body;
  var st = "Incomplete";
  const currentDate = new Date();
  const year = currentDate.getUTCFullYear();
  const month = String(currentDate.getUTCMonth() + 1).padStart(2, "0"); // January is 0, so we add 1
  const day = String(currentDate.getUTCDate()).padStart(2, "0");

  // Form the desired format: YYYY-MM-DD
  const formattedDate = `${year}-${month}-${day}`;
  db.query(
    "SELECT rosters.*, rosters.startdate AS stdate, subquery.total_count, attendance.id AS attend_id, attendance.roster, attendance.hours, attendance.shift, attendance.date, clients.name AS client_name FROM rosters  JOIN attendance ON rosters.id = attendance.roster_id JOIN locations ON locations.id = rosters.location_id JOIN clients ON clients.id = rosters.client_id LEFT JOIN ( SELECT roster_id, COUNT(*) AS total_count FROM attendance GROUP BY roster_id ) AS subquery ON rosters.id = subquery.roster_id WHERE rosters.user_id = ? AND locations.duration_end >= ?  ORDER BY rosters.id DESC;",
    [data.user_id, formattedDate],
    function (err, results, fields) {
      if (err) throw err;
      var cu = new Date();
      var currd = getdays(cu);
      let currentarray = {
        title: "",
        start: currd,
        end: currd,
        color: "white",
        pop: "Open",
        id: "",
        Shift: "Attend",
      };
      ////console.log(results);
      const check = [];
      results.forEach((row) => {
        var d = getdays(row.date);
        if (d === currd) {
          var ch = 1;
        }
        if (ch != undefined) {
          check.push(ch);
        }
      });
      ////console.log(currentarray);
      if (check == 1) {
        // //console.log("s");
        const maindata = results;
        res.json({ maindata });
      }
      if (check == "") {
        ////console.log("sa");
        const maindata = results.concat(currentarray);
        res.json({ maindata });
      }
    }
  );
});
function nextdaysget(startdate) {
  var strt = startdate;
  const today = new Date(strt);
  const dates = [];

  for (let i = 0; i < 8; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    const formattedDate = nextDate.toISOString().slice(0, 10);
    dates.push(formattedDate);
  }

  return dates;
}
function nextdaysget_vl(startdate, length) {
  var strt = startdate;
  const today = new Date(strt);
  const dates = [];
  var dcount = getDaysInNext3Months(startdate);
  for (let i = 0; i < dcount; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    const formattedDate = nextDate.toISOString().slice(0, 10);
    dates.push(formattedDate);
  }

  return dates;
}
function getDaysInNext3Months(dd) {
  // Get the current date
  const currentDate = new Date(dd);

  // Add 3 months to the current date
  currentDate.setUTCMonth(currentDate.getUTCMonth() + 3);

  // Calculate the difference in days between the original date and the updated date
  const timeDifference = currentDate - new Date(dd);
  const totalDaysCount = timeDifference / (1000 * 60 * 60 * 24);

  return totalDaysCount;
}
function nextdays_get_vl(startdate, length) {
  var strt = startdate;
  const today = new Date(strt);
  const dates = [];

  for (let i = 1; i <= length; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    const formattedDate = nextDate.toISOString().slice(0, 10);
    dates.push(formattedDate);
  }

  return dates;
}
function generateAlternateDates(startdate, numberOfDates) {
  const today = new Date(startdate);
  const dates = [];
  let daysToAdd = 8;

  for (let i = 0; i < numberOfDates; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i * daysToAdd);
    const formattedDate = nextDate.toISOString().slice(0, 10);
    dates.push(formattedDate);

    // Alternate between 8 days and 6 days
    daysToAdd = daysToAdd === 8 ? 6 : 8;
  }

  return dates;
}

app.post("/admin/addmissingDay", function (req, res) {
  var data = req.body;
  //var dd = getDaysInNext3Months();
  //res.json({dd});
  // return false;
  var st = "Incomplete";
  const currentDate = new Date();

  const date = new Date();
  const dateString = date.toISOString().split("T")[0];

  var uid = data.user_id;
  const formattedDate = dateString;
  db.query(
    "SELECT rosters.*, rosters.startdate AS stdate,rosters.id as r_id,rosters.type as r_type, subquery.total_count, attendance.id AS attend_id, attendance.roster_id,attendance.roster, attendance.hours, attendance.shift, attendance.date, clients.name AS client_name FROM rosters LEFT JOIN attendance ON rosters.id = attendance.roster_id JOIN locations ON locations.id = rosters.location_id JOIN clients ON clients.id = rosters.client_id LEFT JOIN ( SELECT roster_id, COUNT(*) AS total_count FROM attendance GROUP BY roster_id ) AS subquery ON rosters.id = subquery.roster_id WHERE rosters.user_id = ? AND locations.duration_end >= ? AND rosters.status = ? ORDER BY rosters.id asc",
    [data.user_id, formattedDate, st],
    function (err, results, fields) {
      if (err) throw err;

      const data = [];
      const mmdata = [];

      results.forEach((row) => {
        const currentDate = new Date(row.date);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // January is 0, so we add 1
        const day = String(currentDate.getDate()).padStart(2, "0");

        // Form the desired format: YYYY-MM-DD
        const formattedDate = dateString;

        missingday = formattedDate;

        if (row.date == null) {
          const ged = getdays(row.stdate);

          const getcuudate = nextdaysget_vl(ged, row.number_day_start);
          let mid = {
            client_id: row.client_id,
            number_day_start: row.number_day_start,
            count: row.total_count,
            attend_id: row.attend_id,
            date: getcuudate,
            user_id: row.user_id,
            location_id: row.location_id,
            roster: row.r_type,
            roster_id: row.r_id,
          };
          data.push(mid);
        }
      });
      const groupedData = data.reduce((acc, row) => {
        ////console.log(row);
        const {
          client_id,
          number_day_start,
          count,
          date,
          user_id,
          attend_id,
          location_id,
          roster,
          roster_id,
        } = row;
        const existingEntry = acc.find((item) => item.client_id === client_id);

        if (!existingEntry) {
          acc.push({
            client_id,
            number_day_start,
            count,
            dates: date,
            user_id,
            attend_id,
            location_id,
            roster,
            roster_id,
          });
        } else {
          existingEntry.number_day_start = number_day_start;
          existingEntry.count = count;
          existingEntry.dates.push(date);
        }

        return acc;
      }, []);
      ////console.log();

      if (groupedData != "") {
        const groupedDataa = groupedData[0].dates;
        const mnrr = groupedData[0];

        const resultArray = [];
        var dd = results[0].number_day_start + results[0].number_day_end;
        for (let i = 0; i < groupedDataa.length; i++) {
          const date = groupedDataa[i];
          let param = "";

          if (i % dd < results[0].number_day_start) {
            param = "Edit";
          } else if (i % dd < dd) {
            param = "Add";
          }

          resultArray.push({ param, date });
        }
        const ccc = removeDuplicatesFromArray(resultArray);

        insertAttendanceRecords(uid, ccc, mnrr);
      }
    }
  );
});
//Missingday query
async function processArraysave(ccc, mnrr, uid, callback) {
  ccc.forEach((rr) => {
    var dddd = getdays(rr.date);
    var sd = new Date(rr.date);

    db.query(
      "SELECT * from attendance where user_id =?  And date =?",
      [uid, dddd],
      function (err, row, fields) {
        if (err) throw err;
        //console.log("asdddd");
        if (row == "") {
          if (row == "") {
            var pp = rr.param;
            let inst = {
              user_id: mnrr.user_id,
              client_id: mnrr.client_id,
              location_id: mnrr.location_id,
              roster_id: mnrr.roster_id,
              roster: mnrr.roster,
              shift: pp,
              date: sd,
              status: null,
              hours: null,
              created_at: sd,
            };
            ////console.log(inst);
            ////console.log(inst);
            db.query(
              "INSERT INTO attendance SET ?",
              inst,
              function (error, results, fields) {
                db.query(
                  "UPDATE rosters SET month_end_date = ? WHERE id = ?",
                  [sd, mnrr.roster_id],
                  function (err, result) {
                    if (err) throw err;
                  }
                );
              }
            );
          }
        }
      }
    );
  });
  callback(info);
}

async function insertAttendanceRecords(uid, ccc, mnrr) {
  for (const rr of ccc) {
    const dddd = getdays(rr.date);
    const sd = new Date(rr.date);
    ////console.log("testt");
    try {
      const row = await queryAsync(
        "SELECT * FROM attendance WHERE user_id = ? AND date = ?",
        [uid, dddd]
      );

      if (!row.length) {
        const pp = rr.param;
        const inst = {
          user_id: mnrr.user_id,
          client_id: mnrr.client_id,
          location_id: mnrr.location_id,
          roster_id: mnrr.roster_id,
          roster: mnrr.roster,
          shift: pp,
          date: sd,
          status: null,
          hours: null,
          created_at: sd,
        };

        await queryAsync("INSERT INTO attendance SET ?", inst);
        await queryAsync("UPDATE rosters SET month_end_date = ? WHERE id = ?", [
          sd,
          mnrr.roster_id,
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // After the loop completes, run the delete query
  try {
    const results = await queryAsync(
      "SELECT date, id, COUNT(*) AS count FROM attendance WHERE user_id = ? AND client_id = ? AND location_id = ? AND roster_id = ? GROUP BY date HAVING count > 1",
      [mnrr.user_id, mnrr.client_id, mnrr.location_id, mnrr.roster_id]
    );
    for (const rowss of results) {
      await queryAsync("DELETE FROM attendance WHERE id = ?", [rowss.id]);
    }
  } catch (err) {
    console.error(err);
  }
}

function queryAsync(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function deleteprocess(mnrr) {
  for (const rr of arr) {
    try {
      db.query(
        "SELECT date,id, COUNT(*) AS count FROM attendance where user_id = ? And client_id = ? And location_id = ?  And roster_id = ? GROUP BY date HAVING count > 1",
        [mnrr.user_id, mnrr.client_id, mnrr.location_id, mnrr.roster_id],
        async (err, results) => {
          if (err) {
            console.error("Error:", err);
            return;
          }

          for (const rowss of results) {
            db.query(
              "DELETE FROM attendance WHERE id = ?",
              [rowss.id],
              (err) => {
                if (err) {
                  console.error("Error:", err);
                }
              }
            );
          }
        }
      );
    } catch (error) {
      console.error("Error:", error);
    }
  }
}

//Missingday query
async function saveToDatabase(date, uid, mnrr) {
  // Simulate an asynchronous database operation
  return new Promise((resolve, reject) => {
    //console.log("d");
    ////console.log(date);
    db.query(
      "SELECT * from attendance where user_id =?  And date =?",
      [uid, date],
      function (err, row, fields) {
        if (err) throw err;

        ////console.log(uid);
        var dfff = getdays(date);
        var sd = new Date(dfff);
        if (row == "") {
          if (row == "") {
            let inst = {
              user_id: mnrr.user_id,
              client_id: mnrr.client_id,
              location_id: mnrr.location_id,
              roster_id: mnrr.roster_id,
              roster: mnrr.roster,
              shift: "Edit",
              date: sd,
              status: null,
              hours: null,
              created_at: sd,
            };
            db.query(
              "INSERT INTO attendance SET ?",
              inst,
              function (error, results, fields) {
                //res.json();
              }
            );
          }
        } else {
          //res.json();
        }
      }
    );
    setTimeout(() => {
      ////console.log(`Saved ${date} to the database`);
      resolve();
    }, 1000);
  });
}

async function saveGroupedDataToDatabase(groupedDataa, uid, mnrr) {
  try {
    for (const date of groupedDataa) {
      await saveToDatabase(date, uid, mnrr);
    }
  } catch (error) {
    console.error("Error saving data:", error);
  }
}
function getMissingDates(dateArrasy, totalCount) {
  ////console.log(dateArrasy);
  // const dateArrasy = ["2023-07-26", "2023-07-28", "2023-08-03"];
  var curr = new Date();
  const getcurr = getdays(curr);
  const a1 = [getcurr];
  const dateArray = a1.concat(dateArrasy);
  ////console.log(dateArray);
  // Convert the current date to a JavaScript Date object
  const dates = dateArray.map((dateString) => new Date(dateString));

  // Step 2: Find the minimum and maximum dates
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  // Step 3: Generate an array of dates in the range
  const allDates = [];
  let currentDate = minDate;
  while (currentDate <= maxDate) {
    allDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Step 4: Find the missing dates
  const missingDates = allDates.filter(
    (date) => !dates.some((d) => d.toISOString() === date.toISOString())
  );

  // Step 5: Sort the missing dates in ascending order
  missingDates.sort((a, b) => a - b);

  // Return the required number of missing dates
  const m = missingDates.slice(0, totalCount);
  return m;
}
function removeDuplicatesFromArray(arr) {
  return Array.from(new Set(arr));
}
function getdays(forma) {
  const currentDate = new Date(forma);

  const formattedDate = currentDate.toISOString().split("T")[0];
  return formattedDate;
}
app.post("/getskills", function (req, res) {
  db.query("SELECT value,label FROM skills", function (err, results, fields) {
    if (err) throw err;
    res.json({ results });
  });
});
app.get("/getskillups", function (req, res) {
  db.query("SELECT * FROM skills", function (err, results, fields) {
    if (err) throw err;
    results.forEach((row) => {
      db.query(
        "UPDATE skills SET label = ? WHERE id = ?",
        [row.value, row.id],
        function (err, result) {
          if (err) throw err;
        }
      );
    });
  });
});
app.get("/checkmail", function (req, res) {
  const email = "bhartikumaritesting@gmail.com";
  const pass = "aa";
  smtpmail(email, (info) => {
    res.send(info);
  });
});
async function smtpmail(too, callback) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jlmining001@gmail.com",
      pass: "rmyq bzzn cnbg xoyi",
    },
  });
  const mailOptions = {
    from: "jlmining001@gmail.com",
    to: "bhartikumaritesting@gmail.com",
    subject: "Hello from Node.js",
    text: "This is a test email sent from Node.js using SMTP.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error);
    } else {
      //console.log("Email sent:", info.response);
    }
  });
}

async function sendEmailforgot(too, pass, callback) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jlmining001@gmail.com",
      pass: "rmyq bzzn cnbg xoyi",
    },
  });
  const mailOptions = {
    from: "jlmining001@gmail.com",
    to: too,
    subject: "Forgot Password",
    text: "Your new password is " + pass,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error);
    } else {
      //console.log("Email sent:", info.response);
    }
  });
}
function generateRandomPassword(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}
app.get("/admin/getallskill", function (req, res) {
  db.query(
    "SELECT * FROM skills order by id desc",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});

app.post("/admin/addskill", function (req, res) {
  db.query(
    "SELECT * FROM skills where value =?",
    [req.body.skills],
    function (err, row, fields) {
      if (err) throw err;
      if (row == "") {
        let inst = {
          value: req.body.skills,
          label: req.body.skills,
        };
        db.query(
          "INSERT INTO skills SET ?",
          inst,
          function (error, results, fields) {
            var status = "1";
            res.json({ status });
          }
        );
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});
app.post("/admin/texareaedit", function (req, res) {
  db.query(
    "SELECT * FROM setting",
    [req.body.skills],
    function (err, row, fields) {
      if (err) throw err;
      if (row == "") {
        let inst = {
          textarea: req.body.textarea,
        };
        db.query(
          "INSERT INTO setting SET ?",
          inst,
          function (error, results, fields) {
            db.query("SELECT * FROM setting", function (err, row, fields) {
              if (err) throw err;
              var status = "1";
              res.json({ row });
            });
          }
        );
      } else {
        db.query(
          "UPDATE setting SET textarea =? where id=?",
          [req.body.textarea, "1"],
          function (err, result) {
            if (err) throw err;
            db.query("SELECT * FROM setting", function (err, row, fields) {
              if (err) throw err;
              var status = "1";
              res.json({ row });
            });
          }
        );
      }
    }
  );
});
app.post("/admin/gettexareaedit", function (req, res) {
  db.query("SELECT * FROM setting", function (err, row, fields) {
    if (err) throw err;
    var status = "1";
    res.json({ row });
  });
});
app.post("/admin/getallrosters", function (req, res) {
  db.query(
    "SELECT * FROM rosters where user_id =?",
    [req.body.user_id],
    function (err, results, fields) {
      if (err) throw err;
      var status = "1";
      res.json({ results });
    }
  );
});
app.post("/admin/getallclients", function (req, res) {
  db.query(
    "SELECT rosters.*,clients.name as cname FROM rosters join clients on clients.id = rosters.client_id where rosters.user_id =?",
    [req.body.user_id],
    function (err, results, fields) {
      if (err) throw err;
      var status = "1";
      res.json({ results });
    }
  );
});
app.post("/admin/getallclients_admin", function (req, res) {
  var data = req.body;
  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];
  db.query(
    "SELECT attendance.location_id as id,attendance.roster_id,attendance.user_id,attendance.client_id,clients.name as cname FROM attendance  join rosters on rosters.id = attendance.roster_id join clients on clients.id = attendance.client_id where attendance.user_id = ? And rosters.month_end_date > ?  group by attendance.client_id",
    [data.user_id, formattedDate],
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.post("/admin/deleteroster", function (req, res) {
  db.query(
    "DELETE FROM rosters WHERE id= ?",
    [req.body.id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "DELETE FROM attendance WHERE roster_id= ?",
        [req.body.id],
        function (err, result) {
          if (err) throw err;
          var status = "1";
          res.json({ status });
        }
      );
    }
  );
});
app.post("/contactsupport", function (req, res) {
  var data = req.body;
  sendEmail_Support(data, (info) => {
    //console.log(`The mail`);
    res.send(info);
  });
  var status = "1";
  res.json({ status });
});

async function sendEmail_Support(too, callback) {
  var subs = " contact to support team";
  var sub = too.email + " " + subs;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jlmining001@gmail.com",
      pass: "rmyq bzzn cnbg xoyi",
    },
  });
  const mailOptions = {
    from: "jlmining001@gmail.com",
    to: too.email,
    subject: sub,
    html: `<table style="background:#fff; text-align: left; padding:30px; width: 600px; border: 1px solid #ccc; margin:30px auto;">
  
          <tr><td></td></tr>
          <tr style="height:50px;">
          <td><span style="margin-left: 15px;"> New Contact Information: </span></td>
          </tr>
          <tr>
            <td style="padding-left: 55px;">
              <p>Email : <span>${too.email}</span> </p>
              <p>Phone : <span>${too.phone}</span></p>
              <p>Address : <span>${too.address}</span></p>
            </td>
          </tr>
        </table>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error);
    } else {
      //console.log("Email sent:", info.response);
    }
  });
}

//Admin

//Night Shift
app.post("/admin/getAttendancedetailForNight_admin", function (req, res) {
  var data = req.body;
  var s = data.user_id;
  var status = "Present";
  var day = "Night";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift=?  And user_id = ? And client_id = ?  ORDER BY date asc",
    [day, data.user_id, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};
      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }

        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      res.json({ data });
    }
  );
});
//Sick Leave

app.post("/admin/getAttendancedetailsickLeave_admin", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Sick Leave";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? And client_id = ? ORDER BY date asc",
    [status, s, data.client_id],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Annual Leave
app.post("/admin/getAttendancedetailannualLeave_admin", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "AL";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? ORDER BY date asc",
    [status, s],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Works Camp
app.post("/admin/getAttendancedetailworkerscomp_admin", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Work Camp";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? ORDER BY date asc",
    [status, s],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Fly in Pm
app.post("/admin/getAttendancedetailflyinpm_admin", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "FLIPM";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? ORDER BY date asc",
    [status, s],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Fly out Am
app.post("/admin/getAttendancedetailflyoutam_admin", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "FLOAM";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ?  ORDER BY date asc",
    [status, s],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Fly in am
app.post("/admin/getAttendancedetailflyinam_admin", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "FLIAM";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ?  ORDER BY date asc",
    [status, s],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//For Inisolation
app.post(
  "/admin/getAttendancedetailinisolationonsite_admin",
  function (req, res) {
    ////console.log(req.body);
    var data = req.body;
    var s = data.user_id;
    var status = "In Isolation on site";
    db.query(
      "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? ORDER BY date asc",
      [status, s],
      function (err, results, fields) {
        if (err) throw err;
        const data = {};

        results.forEach((row) => {
          const month = row.month;
          if (!data[month]) {
            data[month] = [];
          }
          const currentDate = new Date(row.date);
          const day = String(currentDate.getDate()).padStart(2, "0");
          row.nd = day;
          ////console.log(row);
          data[month].push(row);
        });
        // //console.log(data);
        res.json({ data });
      }
    );
  }
);

//For Without Pay
app.post(
  "/admin/getAttendancedetailleavewithoutpay_admin",
  function (req, res) {
    ////console.log(req.body);
    var data = req.body;
    var s = data.user_id;
    var status = "Leave Without Pay";
    db.query(
      "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ? ORDER BY date asc",
      [status, s],
      function (err, results, fields) {
        if (err) throw err;
        const data = {};

        results.forEach((row) => {
          const month = row.month;
          if (!data[month]) {
            data[month] = [];
          }
          const currentDate = new Date(row.date);
          const day = String(currentDate.getDate()).padStart(2, "0");
          row.nd = day;
          ////console.log(row);
          data[month].push(row);
        });
        // //console.log(data);
        res.json({ data });
      }
    );
  }
);

//Fly out Pm
app.post("/admin/getAttendancedetailflyoutpm_admin", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "FLOPM";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ?  ORDER BY date asc",
    [status, s],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//For work of Site
app.post("/admin/getAttendancedetailworkoffsite_admin", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Work Offsite";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift = ? And user_id = ?  ORDER BY date asc",
    [status, s],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});

//Day Off
app.post("/admin/getuserdayoff_admin", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  //console.log(data);
  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];
  ////console.log(formattedDate);
  var status = "AL";
  var ss = "Sick Leave";
  db.query(
    "SELECT rosters.*,attendance.id,attendance.date from rosters left join attendance on attendance.roster_id = rosters.id where  rosters.user_id =?  And attendance.shift=? group by rosters.id ORDER by rosters.id DESC",
    [data.user_id, "Add"],
    function (err, row, fields) {
      if (err) throw err;
      if (row != "") {
        var sid = row;
        //console.log("tt");
        //console.log(sid);

        db.query(
          "SELECT date from attendance where user_id = ?  And shift =?",
          [data.user_id, "Add"],
          function (err, results, fields) {
            if (err) throw err;
            var maindata = results;
            // //console.log(maindata);
            // //console.log(sid[0].id);
            if (maindata != "") {
              const data = {};
              var cud = new Date();
              var cds = getdays(cud);
              results.forEach((row) => {
                var d = row.date;
                var ddd = getdays(d);
                if (ddd < cds) {
                  const [year, month, day] = ddd.split("-");
                  if (!data[month]) {
                    data[month] = [];
                  }

                  data[month].push({
                    year: parseInt(year),
                    month: parseInt(month),
                    nd: day,
                  });
                }
              });
              //console.log(data);
              res.json({ data });
            }
          }
        );
      }
    }
  );
});

app.post("/admin/getAttendancedetailForDay_admin", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var s = data.user_id;
  var status = "Present";
  var day = "Day";
  db.query(
    "SELECT YEAR(date) as year, MONTH(date) AS month ,id,status,date FROM  attendance where shift =?  And user_id = ? ORDER BY id asc",
    [day, s],
    function (err, results, fields) {
      if (err) throw err;
      const data = {};

      results.forEach((row) => {
        const month = row.month;
        if (!data[month]) {
          data[month] = [];
        }
        const currentDate = new Date(row.date);
        const day = String(currentDate.getDate()).padStart(2, "0");
        row.nd = day;
        ////console.log(row);
        data[month].push(row);
      });
      // //console.log("forday");
      ////console.log(data);
      res.json({ data });
    }
  );
});
app.post("/admin/getrosterrelated", function (req, res) {
  var data = req.body;
  const currentDate = new Date();
  const cr = getdays(currentDate);
  db.query(
    "SELECT rosters.*,clients.name as cname,locations.location_name FROM rosters join locations on locations.id = rosters.location_id join clients on clients.id = rosters.client_id where rosters.user_id = ?",
    [data.user_id, cr],
    function (err, row, fields) {
      if (err) throw err;

      res.json({ row });
    }
  );
});
//For Employee With Client and Location Start
app.post("/admin/getforEmp_client", function (req, res) {
  db.query("SELECT * from clients", function (err, results, fields) {
    if (err) throw err;
    ////console.log("checkemp");
    res.json({ results });
  });
});
app.post("/admin/getforEmp_locations", function (req, res) {
  db.query("SELECT * from locations", function (err, results, fields) {
    if (err) throw err;
    res.json({ results });
  });
});
//For Employee With Client and Location Start

//New Api For Cpanel

app.post("/admin/getuserroster", function (req, res) {
  var data = req.body;
  const currentDate = new Date();
  const cr = getdays(currentDate);
  //console.log(cr);
  db.query(
    "SELECT rosters.* FROM rosters where rosters.user_id = ? And rosters.month_end_date >= ?",
    [data.user_id, cr],
    function (err, row, fields) {
      if (err) throw err;

      res.json({ row });
    }
  );
});
app.post("/admin/multiplerosteradd", function (req, res) {
  var data = req.body;
  var d = getdays(data.checkdate);
  db.query(
    "UPDATE attendance SET shift =? where date=? And user_id=?",
    [data.shift, d, data.user_id],
    function (err, result) {
      if (err) throw err;

      var msg = "is " + data.shift;
      let notifications = {
        user_id: data.user_id,
        message: msg,
        date: new Date(data.checkdate),
      };
      db.query(
        "INSERT INTO notifications SET ?",
        notifications,
        function (error, results, fields) {
          if (error) throw error;
        }
      );
      var status = "1";
      res.json({ status });
    }
  );
});
app.post("/admin/calenderhoursadd", function (req, res) {
  var data = req.body;
  //console.log(data);
  var d = getdays(data.date);

  if (data.value == null) {
    var u = null;
  } else {
    var u = "User";
  }
  db.query(
    "UPDATE attendance SET shift =?,hours=?,hours_status=? where date=? And user_id=?",
    [data.shift, data.value, u, d, data.user_id],
    function (err, result) {
      if (err) throw err;

      var msg = "is update the " + data.value + " hours";
      let notifications = {
        user_id: data.user_id,
        message: msg,
        date: new Date(data.date),
      };
      db.query(
        "INSERT INTO notifications SET ?",
        notifications,
        function (error, results, fields) {
          if (error) throw error;
        }
      );
      var status = "1";
      res.json({ status });
    }
  );
});

app.post(
  "/admin/attendancesaveweekly",
  upload.fields([{ name: "ticket_file" }, { name: "other_file" }]),
  function (req, res) {
    const previousWeekDates = getPreviousWeekMondayToSunday();
    ////console.log(previousWeekDates);
    var data = req.body;
    const tpush = [];
    const opush = [];
    if (req.files["ticket_file"]) {
      if (Array.isArray(req.files["ticket_file"])) {
        for (let tt = 0; tt < req.files["ticket_file"].length; tt++) {
          const t = req.files["ticket_file"][tt];
          const uniqueFilename = `${uuid.v4()}_${t.originalname}`;
          ////console.log(t.originalname);
          tpush.push(t.filename);
        }
      }
    }
    if (req.files["other_file"]) {
      if (Array.isArray(req.files["other_file"])) {
        for (let tt = 0; tt < req.files["other_file"].length; tt++) {
          const t = req.files["other_file"][tt];
          const uniqueFilename = `${uuid.v4()}_${t.originalname}`;

          ////console.log(t.originalname);
          opush.push(t.filename);
        }
      }
    }

    // //console.log(opush);
    // //console.log(tpush);
    //return false;
    // You can use 't_f' and 'o_f' to reference the uploaded file names

    // If you want to move the uploaded files to a specific folder, you can use the 'fs' module

    weeklydates(previousWeekDates, data.user_id, data, opush, tpush);
    var status = "1";
    res.json({ status });
  }
);
async function weeklydates(previousWeekDates, userid, alldata, opush, tpush) {
  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];

  await updatefilecurrentRoster(
    formattedDate,
    previousWeekDates,
    userid,
    alldata,
    opush,
    tpush
  );
  var start = previousWeekDates[0];
  var end = previousWeekDates[6];
  try {
    const results = await queryAsync(
      "SELECT rosters.*,attendance.date,attendance.id as attend_id from rosters join attendance on  attendance.roster_id = rosters.id where rosters.month_end_date > ? And  attendance.date BETWEEN ? AND ? And rosters.user_id=? And (attendance.shift !=? And attendance.Shift !=?) limit 1",
      [formattedDate, start, end, userid, "Edit", "Add"]
    );

    for (const [index, rowss] of results.entries()) {
      await queryAsync("UPDATE attendance SET kms = ?,hrs=? WHERE id = ?", [
        alldata.kms,
        alldata.hrs,
        rowss.attend_id,
      ]);
    }
  } catch (err) {
    console.error(err);
  }
}

async function updatefilecurrentRoster(
  formattedDate,
  previousWeekDates,
  userid,
  alldata,
  opush,
  tpush
) {
  for (const [index, date] of previousWeekDates.entries()) {
    var mdate = getdays(date);

    try {
      const results = await queryAsync(
        "SELECT rosters.*,attendance.date,attendance.id as attend_id from rosters join attendance on  attendance.roster_id = rosters.id where rosters.month_end_date > ? And attendance.date =? And rosters.user_id=? And (attendance.shift !=? And attendance.Shift !=?)",
        [formattedDate, mdate, userid, "Edit", "Add"]
      );
      var tf = JSON.stringify(tpush);
      var o_f = JSON.stringify(opush);

      for (const [index, rowss] of results.entries()) {
        await queryAsync(
          "UPDATE attendance SET kms = ?,hrs=?,ticket_file=?,other_file=? WHERE id = ?",
          ["0", "0", tf, o_f, rowss.attend_id]
        );
      }
    } catch (err) {
      console.error(err);
    }
  }
}
// Create a function to get the dates of the previous week
function getPreviousWeekMondayToSunday(time = "24:00:00") {
  const lastWeekStart = new Date();
  lastWeekStart.setDate(lastWeekStart.getDate() - 7); // Go to previous week

  // Find the Monday of the previous week
  while (lastWeekStart.getDay() !== 1) {
    lastWeekStart.setDate(lastWeekStart.getDate() - 1);
  }

  lastWeekStart.setHours(18, 30, 0, 0); // Set desired time

  const previousWeekDates = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(lastWeekStart.getTime());
    previousWeekDates.push(currentDate.toISOString());
    lastWeekStart.setDate(lastWeekStart.getDate() + 1);
  }

  return previousWeekDates;
}

function getDatesForPreviousWeek() {
  const today = new Date();
  const lastWeekStartDate = new Date(today);
  lastWeekStartDate.setUTCDate(today.getUTCDate() - 7); // Subtract 7 days to get the start of the previous week

  const lastWeekEndDate = new Date(today);
  lastWeekEndDate.setUTCDate(today.getUTCDate() - 1); // Subtract 1 day to get the end of the previous week

  const datesArray = [];
  let currentDate = new Date(lastWeekStartDate);

  while (currentDate <= lastWeekEndDate) {
    datesArray.push(new Date(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return datesArray;
}

app.post("/admin/getweeklytimesheet", function (req, res) {
  var data = req.body;
  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];
  db.query(
    "SELECT attendance.date,attendance.user_id from rosters join attendance on  attendance.roster_id = rosters.id where rosters.user_id=? And attendance.hours != ?",
    [data.user_id, "null"],
    function (err, result, fields) {
      if (err) throw err;

      if (result != "") {
        //var arr = groupDatesByWeek(result);
        var arr = createWeeklyRanges(result);
        //console.log(arr);
      } else {
        var arr = [];
      }

      res.json({ arr });
    }
  );
});
function createWeeklyRangesadmin(data) {
  const result = [];
  let currentWeek = null;

  // Get the current date
  const currentDate = new Date();
  const currentWeekStartDate = new Date(currentDate);
  currentWeekStartDate.setDate(currentDate.getDate() - currentDate.getDay()); // Get the start of the current week (Monday)

  for (const entry of data) {
    const date = new Date(entry.date);
    const dayOfWeek = date.getUTCDay();

    if (dayOfWeek === 1 || currentWeek === null) {
      // Start of a new week (Monday) or the first entry
      if (currentWeek) {
        // Check if the week is in the previous week (not the current week)
        if (currentWeek[0].date < currentWeekStartDate) {
          result.push({
            start: getdays(currentWeek[0].date),
            end: getdays(currentWeek[currentWeek.length - 1].date),
            user_id: currentWeek[0].user_id,
          });
        }
      }
      currentWeek = [entry];
    } else if (currentWeek) {
      currentWeek.push(entry);
    }
  }

  // Add the last week if it's from the previous week
  if (currentWeek && currentWeek[0].date < currentWeekStartDate) {
    result.push({
      start: getdays(currentWeek[0].date),
      end: getdays(currentWeek[currentWeek.length - 1].date),
      user_id: currentWeek[0].user_id,
    });
  }

  return result;
}
function groupDatesByWeek(dates) {
  const weeklyIntervals = [];
  var d_d = getdays(dates[0].date);
  let startDate = new Date(d_d);
  startDate.setUTCHours(0, 0, 0, 0); // Start from the beginning of the day
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 6); // End after 6 days;

  for (let i = 1; i < dates.length; i++) {
    var dd = getdays(dates[i].date);
    const currentDate = new Date(dd);
    currentDate.setUTCHours(0, 0, 0, 0);

    if (currentDate > endDate) {
      weeklyIntervals.push({
        start: getdays(startDate),
        end: getdays(endDate),
        id: dates[i].user_id,
      });
      startDate = new Date(currentDate);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCDate(startDate.getUTCDate() + 6);
    }
  }

  // Push the last weekly interval
  weeklyIntervals.push({
    start: getdays(startDate),
    end: getdays(endDate),
    id: dates[0].user_id,
  });

  return weeklyIntervals;
}

app.post("/admin/getuserweeklydata", function (req, res) {
  var data = req.body;
  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];
  //console.log(data);
  db.query(
    "SELECT attendance.*,locations.location_name,clients.name from attendance join locations on locations.id = attendance.location_id join clients on clients.id = attendance.client_id where attendance.user_id =? And  attendance.date BETWEEN ? AND ?  order by attendance.date asc",
    [data.user_id, data.start, data.end],
    function (err, results, fields) {
      if (err) throw err;
      const data = [];
      //console.log(results);
      //console.log("s");
      results.forEach((row) => {
        var g = getdformate(row.date);

        const formattedDate = g;
        var currd = row.date;
        const dayIndex = currd.getUTCDay();

        // Array of human-readable day names
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        // Get the day of the week as a human-readable string
        const dayName = daysOfWeek[dayIndex];
        row.nd = formattedDate;
        row.dd = dayName;
        data.push(row);
      });
      // //console.log(data);
      res.json({ data });
    }
  );
});
app.post("/admin/getuserweeklytraveldata", function (req, res) {
  var data = req.body;
  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];
  // //console.log(formattedDate);
  db.query(
    "SELECT sum(attendance.kms) as kmss, sum(attendance.hrs) as hrs from attendance join locations on locations.id = attendance.location_id join clients on clients.id = attendance.client_id where attendance.user_id =? And  attendance.date BETWEEN ? AND ?  order by attendance.date asc",
    [data.user_id, data.start, data.end],
    function (err, row, fields) {
      if (err) throw err;
      const data = [];

      res.json({ row });
    }
  );
});
app.post("/admin/getuserweeklytravelrecipt", function (req, res) {
  var data = req.body;
  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];
  // //console.log(formattedDate);
  db.query(
    "SELECT attendance.ticket_file,attendance.other_file from attendance join locations on locations.id = attendance.location_id join clients on clients.id = attendance.client_id where attendance.user_id =? And  attendance.date BETWEEN ? AND ?  order by attendance.date asc",
    [data.user_id, data.start, data.end],
    function (err, result, fields) {
      if (err) throw err;
      const data = [];
      ////console.log(result);

      res.json({ result });
    }
  );
});

app.post("/admin/getclientforroster", function (req, res) {
  var data = req.body;
  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];
  db.query(
    "SELECT attendance.location_id as id,attendance.roster_id,attendance.user_id,attendance.client_id,clients.name FROM attendance  join rosters on rosters.id = attendance.roster_id join clients on clients.id = attendance.client_id where attendance.user_id = ? And rosters.month_end_date > ?  group by attendance.client_id",
    [data.user_id, formattedDate],
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});

app.post("/admin/getlocationcalender", function (req, res) {
  var data = req.body;
  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];
  db.query(
    "SELECT * from locations where id =?",
    [data.client_id],
    function (err, row, fields) {
      if (err) throw err;

      res.json({ row });
    }
  );
});
app.post("/admin/deletecurrentroster", function (req, res) {
  var data = req.body;
  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];
  db.query(
    "SELECT * FROM rosters where user_id = ? And month_end_date > ? ",
    [data.user_id, formattedDate],
    function (err, row, fields) {
      if (err) throw err;

      if (row != "") {
        db.query(
          "DELETE FROM rosters WHERE id= ?",
          [row[0].id],
          function (err, result) {
            if (err) throw err;
            ////console.log(result);
          }
        );
        db.query(
          "DELETE FROM attendance WHERE roster_id= ?",
          [row[0].id],
          function (err, result) {
            if (err) throw err;
            ////console.log(result);
          }
        );
        var status = "1";
        res.json({ status });
      }
    }
  );
});

function getWeekDaysWithDates(inputDate) {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const result = [];

  // Create a new Date object based on the input date
  const currentDate = new Date(inputDate);

  // Calculate the start and end dates of the week
  const startDate = new Date(currentDate);
  startDate.setDate(startDate.getDate() - ((currentDate.getDay() - 1 + 7) % 7)); // Go back to the beginning of the week (Monday)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6); // Go to the end of the week (Sunday)

  // Loop through the days of the week and store their names and dates
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);
    result.push({
      dayName: daysOfWeek[i],
      date: day.toISOString().slice(0, 10), // Format the date as 'YYYY-MM-DD'
    });
  }

  return result;
}
function createWeeklyRanges(dates) {
  const groups = dates.reduce((groups, dateObj) => {
    const date = new Date(dateObj.date);
    const week = getUTCISOWeek(date);
    groups[week] = groups[week] || [];
    groups[week].push(dateObj);
    return groups;
  }, {});

  const output = Object.entries(groups).map(([week, dates]) => {
    return {
      start: getdays(dates[0].date),
      end: getdays(dates[dates.length - 1].date),
      user_id: dates[0].user_id,
    };
  });

  return output;
}

// Helper function to get UTC ISO week number
function getUTCISOWeek(date) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

app.post("/users/getweeklytimesheetuser", function (req, res) {
  var data = req.body;
  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];
  db.query(
    "SELECT attendance.date,attendance.user_id from rosters join attendance on  attendance.roster_id = rosters.id where rosters.user_id=? And attendance.hours_status =? And attendance.client_id=?",
    [data.user_id, "User", data.client_id],
    function (err, result, fields) {
      if (err) throw err;

      if (result != "") {
        //var arr = groupDatesByWeek(result);
        var arr = createWeeklyRanges(result);
        //console.log(arr);
      } else {
        var arr = [];
      }

      res.json({ arr });
    }
  );
});

app.post("/user/getuserweeklydataclient", function (req, res) {
  var data = req.body;
  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];
  //console.log(data);
  db.query(
    "SELECT attendance.*,locations.location_name,clients.name from attendance join locations on locations.id = attendance.location_id join clients on clients.id = attendance.client_id where attendance.user_id =? And attendance.hours_status =? And attendance.date BETWEEN ? AND ?   order by attendance.date asc",
    [data.user_id, "User", data.start, data.end],
    function (err, results, fields) {
      if (err) throw err;
      const data = [];
      //console.log(results);
      results.forEach((row) => {
        var g = getdformate(row.date);

        const formattedDate = g;
        var currd = row.date;
        const dayIndex = currd.getUTCDay();

        // Array of human-readable day names
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        // Get the day of the week as a human-readable string
        const dayName = daysOfWeek[dayIndex];
        row.nd = formattedDate;
        row.dd = dayName;
        data.push(row);
      });
      //console.log("sd");
      //console.log(data);
      res.json({ data });
    }
  );
});
app.post("/admin/editclient", function (req, res) {
  ////console.log(req.body);
  var data = req.body;

  let formdata = {
    email: data.email,
    name: data.name,
    position: data.position,
    department: data.department,
    phone_number: data.phone_number,
    mobile_number: data.mobile_number,
    home_phone_number: data.home_phone_number,
    fax_number: data.fax_number,
    created_at: new Date(),
  };
  db.query(
    "SELECT * FROM clients WHERE email=? And id != ?",
    [data.email, data.client_id],
    function (err, row, fields) {
      if (err) throw err;
      ////console.log(row);
      if (row == "") {
        db.query(
          "UPDATE clients SET email =?,name=?,position=?,department=?,phone_number=?,mobile_number=?,home_phone_number=?,fax_number=? where id=?",
          [
            data.email,
            data.name,
            data.position,
            data.department,
            data.phone_number,
            data.mobile_number,
            data.home_phone_number,
            data.fax_number,
            data.client_id,
          ],
          function (err, result) {
            if (err) throw err;
            var status = "1";
            res.json({ status });
          }
        );
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

app.post("/admin/editlocation", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  ////console.log(data);
  //return false;
  let locations = {
    location_name: data.location_name,
    nearest_town: data.nearest_town,
    commodity: data.commodity,
    contract_type: data.contract_type,
    duration_start: data.duration_start,
    duration_end: data.duration_end,
    scope: data.scope,
  };
  db.query(
    "SELECT * FROM locations WHERE id=?",
    [data.location_id],
    function (err, row, fields) {
      if (err) throw err;
      if (row != "") {
        var r = row[0];

        if (r.client_id == data.client_id) {
          db.query(
            "UPDATE locations SET client_id=?,location_name =?,nearest_town=?,commodity=?,contract_type=?,duration_start=?,duration_end=?,scope=? where id=?",
            [
              data.client_id,
              data.location_name,
              data.nearest_town,
              data.commodity,
              data.contract_type,
              data.duration_start,
              data.duration_end,
              data.scope,
              data.location_id,
            ],
            function (err, result) {
              if (err) throw err;
              var status = "1";
              res.json({ status });
            }
          );
        } else {
          db.query(
            "SELECT * FROM rosters WHERE location_id=?",
            [data.location_id],
            function (err, row, fields) {
              if (err) throw err;
              if (row == "") {
                db.query(
                  "UPDATE locations SET client_id=?,location_name =?,nearest_town=?,commodity=?,contract_type=?,duration_start=?,duration_end=?,scope=? where id=?",
                  [
                    data.client_id,
                    data.location_name,
                    data.nearest_town,
                    data.commodity,
                    data.contract_type,
                    data.duration_start,
                    data.duration_end,
                    data.scope,
                    data.location_id,
                  ],
                  function (err, result) {
                    if (err) throw err;
                    var status = "1";
                    res.json({ status });
                  }
                );
              } else {
                var status = "2";
                res.json({ status });
              }
            }
          );
        }
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

app.post("/adduserskill", function (req, res) {
  var data = req.body;
  const searchTerm = data.skills_user;

  db.query(
    "SELECT * FROM skills WHERE value = ?",
    [searchTerm],
    function (err, row, fields) {
      if (row == "") {
        let d = {
          value: data.skills_user,
          label: data.skills_user,
        };
        db.query(
          "INSERT INTO skills SET ?",
          d,
          function (error, results, fields) {
            if (error) throw error;
          }
        );
        var status = "1";
        res.json({ status });
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

app.post("/admin/removeskill", function (req, res) {
  var data = req.body;

  db.query(
    "SELECT * FROM users WHERE skills LIKE ?",
    ["%" + data.skill + "%"],
    function (err, row, fields) {
      //console.log(row);
      if (row == "") {
        db.query(
          "DELETE FROM skills WHERE value= ?",
          [data.skill],
          function (err, result) {
            if (err) throw err;
          }
        );
        var status = "1";
        res.json({ status });
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

app.post("/getmentionlicence", function (req, res) {
  db.query(
    "SELECT value,label FROM mention_licenses",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});

app.post("/getmentioncertificate", function (req, res) {
  db.query(
    "SELECT value,label FROM mention_certification	",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/gettrade", function (req, res) {
  db.query("SELECT value,label FROM trade	", function (err, results, fields) {
    if (err) throw err;
    res.json({ results });
  });
});

app.post("/getvocationaltra", function (req, res) {
  db.query(
    "SELECT value,label FROM vocational_training	",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/getequipmentwork", function (req, res) {
  db.query(
    "SELECT value,label FROM equipment_worked	",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/getprevwork", function (req, res) {
  db.query(
    "SELECT value,label FROM previous_work	",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});

app.post("/getmachinery", function (req, res) {
  db.query(
    "SELECT value,label FROM machinery	",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});

app.get("/admin/getalllicence", function (req, res) {
  db.query(
    "SELECT * FROM mention_licenses order by id desc",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});

app.get("/admin/gettrades", function (req, res) {
  db.query(
    "SELECT * FROM trade order by id desc",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.get("/admin/getvocationtra", function (req, res) {
  db.query(
    "SELECT * FROM vocational_training order by id desc",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.get("/admin/getequpmentwork", function (req, res) {
  db.query(
    "SELECT * FROM 	equipment_worked order by id desc",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.get("/admin/getprevious_work", function (req, res) {
  db.query(
    "SELECT * FROM 	previous_work order by id desc",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.get("/admin/getmachineryy", function (req, res) {
  db.query(
    "SELECT * FROM 	machinery order by id desc",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.get("/admin/getmentioncert", function (req, res) {
  db.query(
    "SELECT * FROM 	mention_certification	 order by id desc",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.get("/admin/getrefre", function (req, res) {
  db.query(
    "SELECT * FROM 	`references`	 order by id desc",
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/getreferences", function (req, res) {
  //console.log(req.body);
  db.query("SELECT * FROM `references`", function (err, results, fields) {
    if (err) throw err;
    res.json({ results });
  });
});
app.post("/admin/removedata", function (req, res) {
  var data = req.body;
  //console.log(data);
  var fi = req.body.fi;
  var tablename = req.body.tablename;
  db.query(
    "DELETE FROM `" + tablename + "` WHERE value= ?",
    [data.skill],
    function (err, result) {
      if (err) throw err;
    }
  );
  var status = "1";
  res.json({ status });
});

app.post("/admin/addresults", function (req, res) {
  var tablename = req.body.tablename;
  db.query(
    "SELECT * FROM `" + tablename + "` where value =?",
    [req.body.skills],
    function (err, row, fields) {
      if (err) throw err;
      if (row == "") {
        let inst = {
          value: req.body.skills,
          label: req.body.skills,
        };
        db.query(
          "INSERT INTO  `" + tablename + "` SET ?",
          inst,
          function (error, results, fields) {
            var status = "1";
            res.json({ status });
          }
        );
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

app.post("/admin/convertimage", async (req, res) => {
  var data = "./public/uploads/" + req.body.url;

  if (fs.existsSync(data)) {
    const img = fs.readFileSync(data);

    var ret = "data:image/png;base64," + Buffer.from(img).toString("base64");
    //console.log("ss");
    res.json({ ret });
  } else {
    console.error("File does not exist:", data);
    // Handle the error appropriately
  }
});

app.post("/admin/convertimage_cert", async (req, res) => {
  var data = "./public/uploads/" + req.body.url;

  if (fs.existsSync(data)) {
    const img = fs.readFileSync(data);

    var ret = "data:image/png;base64," + Buffer.from(img).toString("base64");
    //console.log("ss");
    res.json({ ret });
  } else {
    console.error("File does not exist:", data);
    // Handle the error appropriately
  }
});
app.post("/admin/getuser_timesheet", function (req, res) {
  var userid = req.body.user_id;
  db.query(
    "SELECT * FROM user_timesheet where user_id =?",
    [userid],
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
function generateUniqueCode(length = 10) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}
app.post("/incident_step1", function (req, res) {
  var data = req.body;
  var code = generateUniqueCode();
  let formdata = {
    unique_code: code,
    user_id: data.user_id,
    injury_suffered: data.injury_suffered,
    reference: data.reference,
    au: data.au,
    state: data.state,
    created_at: new Date(),
    updated_at: new Date(),
  };
  //console.log(formdata);
  if (data.check_code == "" || data.check_code == undefined) {
    db.query(
      "INSERT INTO incident_report SET ?",
      formdata,
      function (error, results, fields) {
        if (error) throw error;
        var idd = results.insertId;
        if (idd !== "") {
          res.json({ code });
        }
      }
    );
  } else {
    db.query(
      "UPDATE incident_report SET injury_suffered =?,reference=?,au=?,state=? where unique_code=?",
      [
        data.injury_suffered,
        data.reference,
        data.au,
        data.state,
        data.check_code,
      ],
      function (err, result) {
        if (err) throw err;
        var code = data.check_code;
        res.json({ code });
      }
    );
  }
});
app.post("/incident_step2", function (req, res) {
  var data = req.body;

  db.query(
    "UPDATE incident_report SET employee_status=?,personal_details=?,full_name =?,occupation=?,address1=?,address2=?,town_city=?,state_step2=?,step2_country=?,postcode_step2=?,phone_number_step2=?,email_step2=? where unique_code=?",
    [
      data.employee_status,
      data.personal_details,
      data.full_name,
      data.occupation,
      data.address1,
      data.address2,
      data.town_city,
      data.state_step2,
      data.step2_country,
      data.postcode_step2,
      data.phone_number_step2,
      data.email_step2,
      data.check_code,
    ],
    function (err, result) {
      if (err) throw err;
      var code = data.check_code;
      res.json({ code });
    }
  );
});
app.post("/incident_step3", function (req, res) {
  var data = req.body;
  let formdata = {
    employee_name: data.employee_name,
    occupation_step3: data.occupation_step3,
    address1_step3: data.address1_step3,
    address2_step3: data.address2_step3,
    town_city_step3: data.town_city_step3,
    state_step3: data.state_step3,
    postcode_step3: data.postcode_step3,
    phone_step3: data.phone_step3,
    email_step3: data.email_step3,
    country_step3: data.country_step3,
  };
  db.query(
    "UPDATE incident_report SET employee_name=?,occupation_step3=?,address1_step3 =?,address2_step3=?,town_city_step3=?,state_step3=?,postcode_step3=?,phone_step3=?,email_step3=?,country_step3=? where unique_code=?",
    [
      formdata.employee_name,
      formdata.occupation_step3,
      formdata.address1_step3,
      formdata.address2_step3,
      formdata.town_city_step3,
      formdata.state_step3,
      formdata.postcode_step3,
      formdata.phone_step3,
      formdata.email_step3,
      formdata.country_step3,
      data.check_code,
    ],
    function (err, result) {
      if (err) throw err;
      var code = data.check_code;
      res.json({ code });
    }
  );
});
app.post("/incident_step4", function (req, res) {
  var data = req.body;
  let formdata = {
    site_step4: data.site_step4,
    site_reference: data.site_reference,
    locations: data.locations,
    step4_date: data.step4_date,
    step4_time: data.step4_time,
    chain_event: data.chain_event,
    was_first: data.was_first,
    first_aider: data.first_aider,
    treatment: data.treatment,
    other_person_involved: data.other_person_involved,
    detail_person_involved: data.detail_person_involved,
    witness: data.witness,
    detail_witness: data.detail_witness,
    incident_safe: data.incident_safe,
    action_token: data.action_token,
    time_zone: data.time_zone,
  };
  //console.log(formdata);
  db.query(
    "UPDATE incident_report SET time_zone=?,site_step4=?, site_reference=?, locations=?, step4_date=?, step4_time=?, chain_event=?, was_first=?, first_aider=?, treatment=?, other_person_involved=?, detail_person_involved=?, witness=?, detail_witness=?, incident_safe=?, action_token=? WHERE unique_code=?",
    [
      formdata.time_zone,
      formdata.site_step4,
      formdata.site_reference,
      formdata.locations,
      formdata.step4_date,
      formdata.step4_time,
      formdata.chain_event,
      formdata.was_first,
      formdata.first_aider,
      formdata.treatment,
      formdata.other_person_involved,
      formdata.detail_person_involved,
      formdata.witness,
      formdata.detail_witness,
      formdata.incident_safe,
      formdata.action_token,
      data.check_code,
    ],
    function (err, result) {
      if (err) throw err;
      var code = data.check_code;
      res.json({ code });
    }
  );
});

app.get("/country", (req, res) => {
  db.query(
    "SELECT * FROM countries  order by id asc",
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.post("/getincidentdata", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM incident_report  where unique_code=? And user_id=?",
    [data.code, data.user_id],
    function (err, row, fields) {
      if (err) throw err;

      res.json({ row });
    }
  );
});
app.post("/getAllincidentdata", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM incident_report  where user_id=? order by id desc",
    [data.user_id],
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});

app.post("/getlocationohs", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM locations order by id desc",
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.post("/completeincident", function (req, res) {
  var data = req.body;
  db.query(
    "UPDATE incident_report SET status=? WHERE unique_code=? And user_id=?",
    ["Open", data.code, data.user_id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM incident_report WHERE unique_code=? And user_id=?",
        [data.code, data.user_id],
        function (err, row, fields) {
          if (err) throw err;

          res.json({ row });
        }
      );
    }
  );
});
app.post("/incident_notes", function (req, res) {
  var data = req.body;
  let formdata = {
    user_id: data.user_id,
    incident_unique_code: data.code,
    notes: data.notes,
    created_at: new Date(),
  };
  //console.log(formdata);
  db.query(
    "INSERT INTO incident_note SET ?",
    formdata,
    function (error, results, fields) {
      if (error) throw error;
      var idd = results.insertId;
      if (idd !== "") {
        db.query(
          "SELECT * FROM incident_note WHERE incident_unique_code=? And user_id=? order by id desc",
          [data.code, data.user_id],
          function (err, results, fields) {
            if (err) throw err;
            res.json({ results });
          }
        );
      }
    }
  );
});
app.post("/nearDocs", upload_docs.single("file"), function (req, res) {
  var data = req.body;
  var f = "";
  if (req.file != null) {
    var f = req.file.filename;
  }
  //console.log(req.file);
  let formdata = {
    user_id: data.user_id,
    incident_unique_code: data.code,
    file: f,
    created_at: new Date(),
  };
  db.query(
    "INSERT INTO near_docs SET ?",
    formdata,
    function (error, results, fields) {
      if (error) throw error;
      var idd = results.insertId;
      if (idd !== "") {
        db.query(
          "SELECT * FROM near_docs WHERE incident_unique_code=? And user_id=? order by id desc",
          [data.code, data.user_id],
          function (err, results, fields) {
            if (err) throw err;
            res.json({ results });
          }
        );
      }
    }
  );
});
app.post("/getincidentDoc", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM incident_docs WHERE incident_unique_code=? And user_id=? order by id desc",
    [data.code, data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/getincident_notes", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM incident_note WHERE incident_unique_code=? And user_id=? order by id desc",
    [data.code, data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/incidentremove", function (req, res) {
  var data = req.body;
  db.query(
    "DELETE FROM incident_docs WHERE id= ?",
    [data.id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM incident_docs WHERE  user_id=? and incident_unique_code=? order by id desc",
        [data.user_id, data.code],
        function (err, results, fields) {
          if (err) throw err;
          res.json({ results });
        }
      );
    }
  );
});

app.post("/incidentnotesedit", function (req, res) {
  var data = req.body;
  //console.log(data);
  db.query(
    "UPDATE incident_note SET notes =? where id=?",
    [data.notes, data.id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM incident_note WHERE user_id=? and incident_unique_code =? order by id desc",
        [data.user_id, data.code],
        function (err, results, fields) {
          if (err) throw err;
          res.json({ results });
        }
      );
    }
  );
});
app.post("/getincident_notesdesc", function (req, res) {
  var data = req.body;
  var ds = data.desc;
  orderByClause = "ORDER BY id " + ds;

  // Construct and execute the query with parameterized values
  db.query(
    "SELECT * FROM incident_note WHERE incident_unique_code=? AND user_id=? " +
      orderByClause,
    [data.code, data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/incidentnotesremove", function (req, res) {
  var data = req.body;
  db.query(
    "DELETE FROM incident_note WHERE id= ?",
    [data.id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM incident_note WHERE  user_id=? and incident_unique_code=? order by id desc",
        [data.user_id, data.code],
        function (err, results, fields) {
          if (err) throw err;
          res.json({ results });
        }
      );
    }
  );
});

//Near Miss
app.post("/nearmiss_step1", function (req, res) {
  var data = req.body;
  var code = generateUniqueCode();
  let formdata = {
    unique_code: code,
    user_id: data.user_id,
    title: data.title,
    injury_suffered: data.injury_suffered,
    reference: data.reference,
    au: data.au,
    state: data.state,
    created_at: new Date(),
    updated_at: new Date(),
  };
  //console.log(formdata);
  if (data.check_code == "" || data.check_code == undefined) {
    db.query(
      "INSERT INTO nearmiss_report SET ?",
      formdata,
      function (error, results, fields) {
        if (error) throw error;
        var idd = results.insertId;
        if (idd !== "") {
          res.json({ code });
        }
      }
    );
  } else {
    db.query(
      "UPDATE nearmiss_report SET title=?,injury_suffered =?,reference=?,au=?,state=? where unique_code=?",
      [
        data.title,
        data.injury_suffered,
        data.reference,
        data.au,
        data.state,
        data.check_code,
      ],
      function (err, result) {
        if (err) throw err;
        var code = data.check_code;
        res.json({ code });
      }
    );
  }
});
app.post("/nearmiss_step3", function (req, res) {
  var data = req.body;
  let formdata = {
    employee_name: data.employee_name,
    occupation_step3: data.occupation_step3,
    address1_step3: data.address1_step3,
    address2_step3: data.address2_step3,
    town_city_step3: data.town_city_step3,
    state_step3: data.state_step3,
    postcode_step3: data.postcode_step3,
    phone_step3: data.phone_step3,
    email_step3: data.email_step3,
    country_step3: data.country_step3,
  };
  db.query(
    "UPDATE nearmiss_report SET employee_name=?,occupation_step3=?,address1_step3 =?,address2_step3=?,town_city_step3=?,state_step3=?,postcode_step3=?,phone_step3=?,email_step3=?,country_step3=? where unique_code=?",
    [
      formdata.employee_name,
      formdata.occupation_step3,
      formdata.address1_step3,
      formdata.address2_step3,
      formdata.town_city_step3,
      formdata.state_step3,
      formdata.postcode_step3,
      formdata.phone_step3,
      formdata.email_step3,
      formdata.country_step3,
      data.check_code,
    ],
    function (err, result) {
      if (err) throw err;
      var code = data.check_code;
      res.json({ code });
    }
  );
});

app.post("/getincidentdatamiss", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM nearmiss_report  where unique_code=? And user_id=?",
    [data.code, data.user_id],
    function (err, row, fields) {
      if (err) throw err;

      res.json({ row });
    }
  );
});

app.post("/witnessmiss", function (req, res) {
  var data = req.body;

  let formdata = {
    employee_status: data.employee_status,
    full_name: data.full_name,
    additional_information: data.additional_information,
    addressabout: data.addressabout,
    incident_unique_code: data.code,
    user_id: data.user_id,
    created_at: new Date(),
  };
  if (data.witn_id != "") {
    db.query(
      "UPDATE nearmiss_witness SET employee_status=?,full_name=?, additional_information=?, addressabout=? WHERE incident_unique_code=? And id=?",
      [
        formdata.employee_status,
        formdata.full_name,
        formdata.additional_information,
        formdata.addressabout,
        formdata.incident_unique_code,
        data.witn_id,
      ],
      function (err, result) {
        if (err) throw err;
        var code = data.check_code;
        db.query(
          "SELECT * FROM nearmiss_witness WHERE incident_unique_code=? And user_id=? order by id desc",
          [data.code, data.user_id],
          function (err, results, fields) {
            if (err) throw err;
            res.json({ results });
          }
        );
      }
    );
  } else {
    //console.log("ss");
    db.query(
      "INSERT INTO nearmiss_witness SET ?",
      formdata,
      function (error, results, fields) {
        if (error) throw error;
        var idd = results.insertId;
        if (idd !== "") {
          db.query(
            "SELECT * FROM nearmiss_witness WHERE incident_unique_code=? And user_id=? order by id desc",
            [data.code, data.user_id],
            function (err, results, fields) {
              if (err) throw err;
              res.json({ results });
            }
          );
        }
      }
    );
  }
});

app.post("/nearmiss_step33", function (req, res) {
  var data = req.body;
  ////console.log("ss");
  let formdata = {
    site_step4: data.site_step4,
    site_reference: data.site_reference,
    locations: data.locations,
    step4_date: data.step4_date,
    step4_time: data.step4_time,
    chain_event: data.chain_event,
    was_first: data.was_first,
    first_aider: data.first_aider,
    treatment: data.treatment,
    other_person_involved: data.other_person_involved,
    detail_person_involved: data.detail_person_involved,
    witness: data.witness,
    detail_witness: data.detail_witness,
    incident_safe: data.incident_safe,
    action_token: data.action_token,
    time_zone: data.time_zone,
  };

  db.query(
    "UPDATE nearmiss_report SET time_zone=?,site_step4=?, site_reference=?, locations=?, step4_date=?, step4_time=?, chain_event=?, was_first=?, first_aider=?, treatment=?, other_person_involved=?, detail_person_involved=?, witness=?, detail_witness=?, incident_safe=?, action_token=? WHERE unique_code=?",
    [
      formdata.time_zone,
      formdata.site_step4,
      formdata.site_reference,
      formdata.locations,
      formdata.step4_date,
      formdata.step4_time,
      formdata.chain_event,
      formdata.was_first,
      formdata.first_aider,
      formdata.treatment,
      formdata.other_person_involved,
      formdata.detail_person_involved,
      formdata.witness,
      formdata.detail_witness,
      formdata.incident_safe,
      formdata.action_token,
      data.check_code,
    ],
    function (err, result) {
      if (err) throw err;
      var code = data.check_code;
      res.json({ code });
    }
  );
});

app.post("/completenearmiss", function (req, res) {
  var data = req.body;
  db.query(
    "UPDATE nearmiss_report SET status=? WHERE unique_code=? And user_id=?",
    ["Open", data.code, data.user_id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM nearmiss_report WHERE unique_code=? And user_id=?",
        [data.code, data.user_id],
        function (err, row, fields) {
          if (err) throw err;

          res.json({ row });
        }
      );
    }
  );
});
app.post("/getnearDoc", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM near_docs WHERE incident_unique_code=? And user_id=? order by id desc",
    [data.code, data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/getnear_notes", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM near_note WHERE incident_unique_code=? And user_id=? order by id desc",
    [data.code, data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/near_notes", function (req, res) {
  var data = req.body;
  let formdata = {
    user_id: data.user_id,
    incident_unique_code: data.code,
    notes: data.notes,
    created_at: new Date(),
  };
  //console.log(formdata);
  db.query(
    "INSERT INTO near_note SET ?",
    formdata,
    function (error, results, fields) {
      if (error) throw error;
      var idd = results.insertId;
      if (idd !== "") {
        db.query(
          "SELECT * FROM near_note WHERE incident_unique_code=? And user_id=? order by id desc",
          [data.code, data.user_id],
          function (err, results, fields) {
            if (err) throw err;
            res.json({ results });
          }
        );
      }
    }
  );
});
app.post("/nearremove", function (req, res) {
  var data = req.body;
  db.query(
    "DELETE FROM near_docs WHERE id= ?",
    [data.id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM near_docs WHERE  user_id=? and incident_unique_code=? order by id desc",
        [data.user_id, data.code],
        function (err, results, fields) {
          if (err) throw err;
          res.json({ results });
        }
      );
    }
  );
});
app.post("/nearnotesremove", function (req, res) {
  var data = req.body;
  db.query(
    "DELETE FROM near_note WHERE id= ?",
    [data.id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM near_note WHERE  user_id=? and incident_unique_code=? order by id desc",
        [data.user_id, data.code],
        function (err, results, fields) {
          if (err) throw err;
          res.json({ results });
        }
      );
    }
  );
});
app.post("/nearnotesedit", function (req, res) {
  var data = req.body;
  //console.log(data);
  db.query(
    "UPDATE near_note SET notes =? where id=?",
    [data.notes, data.id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM near_note WHERE user_id=? and incident_unique_code =? order by id desc",
        [data.user_id, data.code],
        function (err, results, fields) {
          if (err) throw err;
          res.json({ results });
        }
      );
    }
  );
});

app.post("/getnear_notesdesc", function (req, res) {
  var data = req.body;
  var ds = data.desc;
  orderByClause = "ORDER BY id " + ds;

  // Construct and execute the query with parameterized values
  db.query(
    "SELECT * FROM near_note WHERE incident_unique_code=? AND user_id=? " +
      orderByClause,
    [data.code, data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});

app.post("/getAllneardata", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM nearmiss_report  where user_id=? order by id desc",
    [data.user_id],
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});

app.post("/getnearmiss_witness", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM nearmiss_witness  where user_id=? And incident_unique_code=? order by id desc",
    [data.user_id, data.code],
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});

app.post("/removewitnes", function (req, res) {
  var data = req.body;
  db.query(
    "DELETE FROM nearmiss_witness WHERE id= ? And user_id=?",
    [data.id, data.user_id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM nearmiss_witness WHERE  user_id=? and incident_unique_code=? order by id desc",
        [data.user_id, data.code],
        function (err, results, fields) {
          if (err) throw err;
          res.json({ results });
        }
      );
    }
  );
});

app.post(
  "/reporthazard",
  upload_rep_hazard.fields([{ name: "file" }]),
  function (req, res) {
    var data = req.body;
    const tpush = [];
    if (data.hazard_id == "") {
      if (req.files["file"]) {
        if (Array.isArray(req.files["file"])) {
          for (let tt = 0; tt < req.files["file"].length; tt++) {
            const t = req.files["file"][tt];
            const uniqueFilename = `${t.originalname}`;
            tpush.push(t.filename);
          }
        }
      }
    }

    var code = generateUniqueCode();
    let formdata = {
      user_id: data.user_id,
      unique_code: code,
      hazard_site: data.hazard_site,
      location: data.location,
      reporter: data.reporter,
      name: data.name,
      details: data.details,
      created_at: new Date(),
    };

    if (data.hazard_id == "") {
      db.query(
        "INSERT INTO report_hazard SET ?",
        formdata,
        function (error, results, fields) {
          if (error) throw error;
          var idd = results.insertId;
          if (idd !== "") {
            if (tpush.length > 0) {
              for (let i = 0; i < tpush.length; i++) {
                let sk = {
                  user_id: data.user_id,
                  unique_code: code,
                  name: tpush[i],
                  created_at: new Date(),
                };
                db.query(
                  "INSERT INTO  report_hazard_docs SET ?",
                  sk,
                  function (error, results, fields) {
                    if (error) throw error;
                  }
                );
              }
            }
            db.query(
              "SELECT * FROM report_hazard WHERE id=? order by id desc",
              [idd],
              function (err, row, fields) {
                if (err) throw err;
                //console.log(row);
                res.json({ row });
              }
            );
          }
        }
      );
    } else {
      //console.log(tpush);
      if (tpush.length > 0) {
        for (let i = 0; i < tpush.length; i++) {
          let sk = {
            user_id: data.user_id,
            unique_code: code,
            name: tpush[i],
            created_at: new Date(),
          };
          db.query(
            "INSERT INTO  report_hazard_docs SET ?",
            sk,
            function (error, results, fields) {
              if (error) throw error;
            }
          );
        }
      }
      db.query(
        "UPDATE report_hazard SET name=?,hazard_site=?,location=?,reporter=?,details=? WHERE unique_code=? And user_id=?",
        [
          data.name,
          formdata.hazard_site,
          formdata.location,
          formdata.reporter,
          formdata.details,
          data.code,
          data.user_id,
        ],
        function (err, result) {
          if (err) throw err;
          db.query(
            "SELECT * FROM report_hazard WHERE user_id=? And unique_code=? order by id desc",
            [data.user_id, data.code],
            function (err, row, fields) {
              if (err) throw err;
              res.json({ row });
            }
          );
        }
      );
    }
  }
);

app.post("/reporthazardUp", function (req, res) {
  var data = req.body;
  //console.log(data);
  const tpush = [];
  let formdata = {
    hazard_site: data.hazard_site,
    location: data.location,
    reporter: data.reporter,
    name: data.name,
    details: data.details,
    created_at: new Date(),
  };
  db.query(
    "UPDATE report_hazard SET name=?,hazard_site=?,location=?,details=? WHERE id=?",
    [
      data.name,
      formdata.hazard_site,
      formdata.location,
      formdata.details,
      data.id,
    ],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM report_hazard WHERE id=? order by id desc",
        [data.id],
        function (err, row, fields) {
          if (err) throw err;
          res.json({ row });
        }
      );
    }
  );
});

app.post("/getalluser", function (req, res) {
  var data = req.body;

  db.query(
    "SELECT * FROM users WHERE id !=? And status=? order by id desc",
    [data.user_id, "Active"],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/getalluseradmin", function (req, res) {
  var data = req.body;

  db.query(
    "SELECT * FROM users WHERE  status=? order by id desc",
    ["Active"],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});

app.post("/getAllreporthazard", function (req, res) {
  var data = req.body;

  db.query(
    "SELECT * FROM report_hazard WHERE user_id =? order by id desc",
    [data.user_id],
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.post("/removehazard", function (req, res) {
  var data = req.body;

  db.query(
    "DELETE FROM report_hazard WHERE id= ? And user_id=?",
    [data.id, data.user_id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "DELETE FROM report_hazard_docs WHERE unique_code= ? And user_id=?",
        [data.code, data.user_id],
        function (err, result) {
          if (err) throw err;
          db.query(
            "SELECT * FROM report_hazard WHERE user_id =?",
            [data.user_id],
            function (err, results, fields) {
              if (err) throw err;

              res.json({ results });
            }
          );
        }
      );
    }
  );
});
app.post("/gethazarddetail", function (req, res) {
  var data = req.body;

  db.query(
    "SELECT * FROM report_hazard WHERE user_id =? And unique_code=?",
    [data.user_id, data.code],
    function (err, row, fields) {
      if (err) throw err;

      res.json({ row });
    }
  );
});
app.post("/gethazardDocs", function (req, res) {
  var data = req.body;

  db.query(
    "SELECT * FROM report_hazard_docs WHERE user_id =? And unique_code=?",
    [data.user_id, data.code],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});

app.post(
  "/reporthazardUpdateFile",
  upload_rep_hazard.fields([{ name: "file" }]),
  function (req, res) {
    var data = req.body;

    const tpush = [];
    if (req.files["file"]) {
      if (Array.isArray(req.files["file"])) {
        for (let tt = 0; tt < req.files["file"].length; tt++) {
          const t = req.files["file"][tt];
          const uniqueFilename = `${t.originalname}`;
          tpush.push(t.filename);
        }
      }
    }
    //console.log(req.files["file"]);
    if (tpush.length > 0) {
      for (let i = 0; i < tpush.length; i++) {
        let sk = {
          user_id: data.user_id,
          unique_code: data.code,
          name: tpush[i],
          created_at: new Date(),
        };
        db.query(
          "INSERT INTO  report_hazard_docs SET ?",
          sk,
          function (error, results, fields) {
            if (error) throw error;
            db.query(
              "SELECT * FROM report_hazard_docs WHERE  user_id=? and unique_code=? order by id desc",
              [data.user_id, data.code],
              function (err, results, fields) {
                if (err) throw err;
                res.json({ results });
              }
            );
          }
        );
      }
    }
  }
);

app.post("/reporthazardRemoveFile", function (req, res) {
  var data = req.body;
  //console.log(data);
  db.query(
    "DELETE FROM report_hazard_docs WHERE id= ?",
    [data.id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM report_hazard_docs WHERE  user_id=? and unique_code=? order by id desc",
        [data.user_id, data.code],
        function (err, results, fields) {
          if (err) throw err;
          res.json({ results });
        }
      );
    }
  );
});

app.post("/hazardreportfilter", function (req, res) {
  var data = req.body;
  //console.log(data);
  var date = data.date;
  db.query(
    "SELECT * FROM report_hazard WHERE user_id=? And created_at LIKE ?",
    [data.user_id, `%${date}%`],
    function (err, results, fields) {
      //console.log(results);
      res.json({ results });
    }
  );
});
app.post("/hazardreportfiltersite", function (req, res) {
  var data = req.body;
  //console.log(data);
  db.query(
    "SELECT * FROM report_hazard WHERE user_id=? And hazard_site = ?",
    [data.user_id, data.search],
    function (err, results, fields) {
      //console.log(results);
      res.json({ results });
    }
  );
});
app.post("/removeNearmiss", function (req, res) {
  var data = req.body;

  db.query(
    "DELETE FROM nearmiss_report WHERE id= ? And user_id=?",
    [data.id, data.user_id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "DELETE FROM near_docs WHERE incident_unique_code= ? And user_id=?",
        [data.code, data.user_id],
        function (err, result) {
          if (err) throw err;
          db.query(
            "DELETE FROM near_note WHERE incident_unique_code= ? And user_id=?",
            [data.code, data.user_id],
            function (err, result) {
              if (err) throw err;
              db.query(
                "SELECT * FROM nearmiss_report WHERE user_id =?",
                [data.user_id],
                function (err, results, fields) {
                  if (err) throw err;

                  res.json({ results });
                }
              );
            }
          );
        }
      );
    }
  );
});
app.post("/removeIncident", function (req, res) {
  var data = req.body;

  db.query(
    "DELETE FROM incident_report WHERE id= ? And user_id=?",
    [data.id, data.user_id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "DELETE FROM incident_docs WHERE 	incident_unique_code= ? And user_id=?",
        [data.code, data.user_id],
        function (err, result) {
          if (err) throw err;
          db.query(
            "DELETE FROM 	incident_note WHERE incident_unique_code= ? And user_id=?",
            [data.code, data.user_id],
            function (err, result) {
              if (err) throw err;
              db.query(
                "SELECT * FROM incident_report WHERE user_id =?",
                [data.user_id],
                function (err, results, fields) {
                  if (err) throw err;

                  res.json({ results });
                }
              );
            }
          );
        }
      );
    }
  );
});
app.post("/documentsave", upload_documents.single("file"), function (req, res) {
  var data = req.body;
  var f = "";
  if (req.file != null) {
    var f = req.file.filename;
  }
  let sk = {
    file: f,
    category: data.category,
    assign_to: data.assign,
    site: data.form_site,
    type: data.type,
    created_at: new Date(),
  };
  db.query(
    "INSERT INTO  documents SET ?",
    sk,
    function (error, results, fields) {
      if (error) throw error;
      db.query(
        "SELECT * FROM documents  order by id desc",
        function (err, results, fields) {
          if (err) throw err;
          res.json({ results });
        }
      );
    }
  );
});
app.post(
  "/mannualDocumentsave",
  upload_documents.single("file"),
  function (req, res) {
    var data = req.body;
    var f = "";
    if (req.file != null) {
      var f = req.file.filename;
    }
    let sk = {
      file: f,
      created_at: new Date(),
    };
    db.query(
      "INSERT INTO  documents SET ?",
      sk,
      function (error, results, fields) {
        if (error) throw error;
        db.query(
          "SELECT * FROM documents  order by id desc",
          function (err, results, fields) {
            if (err) throw err;
            res.json({ results });
          }
        );
      }
    );
  }
);

app.post("/searchincident", function (req, res) {
  var data = req.body;
  var table = data.table;
  db.query(
    "SELECT * FROM `" +
      table +
      "` WHERE created_at LIKE ? And (status = ? OR status = ?)",
    ["%" + data.date + "%", "Open", "Closed"],
    function (err, results, fields) {
      //console.log(results);
      res.json({ results });
    }
  );
});
app.post("/getselectCommon", function (req, res) {
  var data = req.body;
  var table = data.table;
  db.query(
    "SELECT * FROM `" + table + "` where status =? order by id desc",
    ["Open"],
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.post("/getselectCommon_c", function (req, res) {
  var data = req.body;
  var table = data.table;
  db.query(
    "SELECT * FROM `" + table + "` where status =? order by id desc",
    [data.status],
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.post("/getselectCommonForhazard", function (req, res) {
  var data = req.body;
  var table = data.table;
  db.query(
    "SELECT * FROM `" + table + "` order by id desc",
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.post("/searchhazard", function (req, res) {
  var data = req.body;
  var table = data.table;
  //console.log(data);
  if (data.location == "") {
    db.query("SELECT * FROM `" + table + "`", function (err, results, fields) {
      res.json({ results });
    });
  } else {
    db.query(
      "SELECT * FROM `" + table + "` WHERE hazard_site =?",
      [data.location],
      function (err, results, fields) {
        res.json({ results });
      }
    );
  }
});
app.post("/searchdatehazard", function (req, res) {
  var data = req.body;
  var table = data.table;
  //console.log(data);
  db.query(
    "SELECT * FROM report_hazard WHERE created_at LIKE ?",
    ["%" + data.date + "%"],
    function (err, results, fields) {
      res.json({ results });
    }
  );
});
app.post("/getalldocuments", async function (req, res) {
  var data = req.body;

  try {
    const documents = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM documents WHERE type = ? ORDER BY id DESC",
        ["OHS"],
        function (err, results, fields) {
          if (err) {
            console.error("Error fetching documents:", err);
            reject(err);
            return;
          }
          resolve(results);
        }
      );
    });

    let documentsWithData = [];

    for (let rowwc of documents) {
      let dataa = {
        id: rowwc.id,
        file: rowwc.file,
        category: rowwc.category,
        site: rowwc.site, // Default site value
        assign_to: rowwc.assign_to,
        type: rowwc.type,
        created_at: rowwc.created_at,
      };

      if (rowwc.assign_to === "Yes") {
        const locations = await getlocations();
        let siteNames = locations
          .map((location) => location.location_name)
          .join(",");
        dataa.site = "All"; // Overwrite site value with locations
      }

      //console.log(dataa);
      documentsWithData.push(dataa);
    }

    //console.log(documents.length);
    res.json({ results: documentsWithData });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
async function getlocations() {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT location_name FROM locations ORDER BY id DESC",
      function (err, results, fields) {
        if (err) {
          reject(err);
          return;
        }
        resolve(results);
      }
    );
  });
}

app.post("/getalldocumentsiteaccess", async function (req, res) {
  var data = req.body;

  try {
    const documents = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM documents WHERE type = ? ORDER BY id DESC",
        ["Site Access"],
        function (err, results, fields) {
          if (err) {
            console.error("Error fetching documents:", err);
            reject(err);
            return;
          }
          resolve(results);
        }
      );
    });

    let documentsWithData = [];

    for (let rowwc of documents) {
      let dataa = {
        id: rowwc.id,
        file: rowwc.file,
        category: rowwc.category,
        site: rowwc.site, // Default site value
        assign_to: rowwc.assign_to,
        type: rowwc.type,
        created_at: rowwc.created_at,
      };

      if (rowwc.assign_to === "Yes") {
        const locations = await getlocations();
        let siteNames = locations
          .map((location) => location.location_name)
          .join(",");
        dataa.site = "All"; // Overwrite site value with locations
      }

      //console.log(dataa);
      documentsWithData.push(dataa);
    }

    //console.log(documents.length);
    res.json({ results: documentsWithData });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/getalldocumentusermannual", async function (req, res) {
  var data = req.body;

  try {
    const documents = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM documents WHERE type = ? ORDER BY id DESC",
        ["User Mannual"],
        function (err, results, fields) {
          if (err) {
            console.error("Error fetching documents:", err);
            reject(err);
            return;
          }
          resolve(results);
        }
      );
    });

    let documentsWithData = [];

    for (let rowwc of documents) {
      let dataa = {
        id: rowwc.id,
        file: rowwc.file,
        category: rowwc.category,
        site: rowwc.site, // Default site value
        assign_to: rowwc.assign_to,
        type: rowwc.type,
        created_at: rowwc.created_at,
      };

      if (rowwc.assign_to === "Yes") {
        const locations = await getlocations();
        let siteNames = locations
          .map((location) => location.location_name)
          .join(",");
        dataa.site = "All"; // Overwrite site value with locations
      }

      //console.log(dataa);
      documentsWithData.push(dataa);
    }

    //console.log(documents.length);
    res.json({ results: documentsWithData });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post(
  "/admin/elearningsave",
  uploade_leran.single("file"),
  function (req, res) {
    const dd = req.body;
    var f = "";
    if (req.file != null) {
      var f = req.file.filename;
    }
    var slug = generateSlug(dd.title);
    var code = generateUniqueCode();
    let fdata = {
      title: dd.title,
      slug: slug,
      description: dd.description,
      file: f,
      unique_code: code,
      created_at: new Date(),
    };
    db.query(
      "INSERT INTO elearningCourse SET ?",
      fdata,
      function (error, results, fields) {
        if (error) throw error;
        db.query(
          "SELECT * FROM elearningCourse  order by id desc",
          function (err, results, fields) {
            if (err) throw err;
            res.json({ results });
          }
        );
      }
    );
  }
);
app.post("/admin/removecourse", function (req, res) {
  var data = req.body;
  db.query(
    "DELETE FROM 	elearningCourse WHERE id= ?",
    [data.id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM elearningCourse order by id desc",
        function (err, results, fields) {
          if (err) throw err;

          res.json({ results });
        }
      );
    }
  );
});

app.post("/getallelearning", function (req, res) {
  var data = req.body;
  var currentDate = new Date().toISOString().split("T")[0];
  //console.log(currentDate);
  db.query(
    "SELECT elearningCourse.*,elearningCourse.id as e_id, assign_course.* FROM assign_course join elearningCourse on  assign_course.course_id = elearningCourse.id  WHERE assign_course.user_id=? And assign_course.status =?   order by assign_course.id desc",
    [data.user_id, "Complete"],
    function (err, results, fields) {
      if (err) throw err;
      const finalarray = [];
      const mainarrray = [];

      results.forEach((roww) => {
        if (roww !== "") {
          let data = {
            id: roww.e_id,
          };
          mainarrray.push(data);
        }
      });
      if (mainarrray !== "") {
        const idsArray = mainarrray.map((obj) => obj.id);

        // Convert to Set to remove duplicates
        const uniqueIdsSet = new Set(idsArray);

        // Convert back to array
        const uniqueIdsArray = Array.from(uniqueIdsSet);
        //console.log("a");

        if (uniqueIdsArray.length > 0) {
          const placeholders = uniqueIdsArray.map(() => "?").join(",");
          //console.log(uniqueIdsArray);

          db.query(
            "SELECT * FROM elearningCourse where id IN (" + placeholders + ")",
            uniqueIdsArray,
            function (err, results, fields) {
              if (err) throw err;

              res.json({ results });
            }
          );
        }
      }
      // res.json({ results });
    }
  );
});
app.post("/getcourseDetail", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM elearningCourse where unique_code=?",
    [data.code],
    function (err, row, fields) {
      if (err) throw err;

      res.json({ row });
    }
  );
});

function generateSlug(text) {
  return text
    .toString() // Ensure input is a string
    .toLowerCase() // Convert to lowercase
    .trim() // Trim leading/trailing whitespace
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

app.post("/searchQuery", function (req, res) {
  var data = req.body;
  ////console.log(data);
  var tablename = data.table;
  db.query(
    "SELECT * FROM ?? WHERE type = ? AND (file LIKE ? OR category LIKE ? OR site LIKE ? OR created_at LIKE ?)",
    [
      tablename,
      data.type,
      "%" + data.search + "%",
      "%" + data.search + "%",
      "%" + data.search + "%",
      "%" + data.search + "%",
      "%" + data.created_at + "%",
    ],
    function (err, results, fields) {
      //console.log(results);
      res.json({ results });
    }
  );
});

app.post("/getselectCommon_Count", function (req, res) {
  var data = req.body;
  var table = data.table;
  db.query(
    "SELECT * FROM `" +
      table +
      "` where status =? And notification_status=? order by id desc",
    ["Open", "Unread"],
    function (err, results, fields) {
      if (err) throw err;
      var length = results.length;
      res.json({ length });
    }
  );
});
app.post("/getselectCommon_reporthazard", function (req, res) {
  var data = req.body;
  var table = data.table;
  db.query(
    "SELECT * FROM `" +
      table +
      "` where notification_status=? order by id desc",
    ["Unread"],
    function (err, results, fields) {
      if (err) throw err;
      var length = results.length;
      res.json({ length });
    }
  );
});
app.post("/Unreadstatus", function (req, res) {
  var data = req.body;
  var table = data.table;
  db.query(
    "UPDATE `" + table + "` SET notification_status=?",
    ["Read"],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * FROM `" +
          table +
          "` where status =? And notification_status=? order by id desc",
        ["Open", "Unread"],
        function (err, results, fields) {
          if (err) throw err;
          var length = results.length;
          res.json({ length });
        }
      );
    }
  );
});
app.post("/getincidentdata_single", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM incident_report  where id=?",
    [data.id],
    function (err, row, fields) {
      if (err) throw err;

      res.json({ row });
    }
  );
});
app.post("/getnearmissdata_single", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM nearmiss_report  where id=?",
    [data.id],
    function (err, row, fields) {
      if (err) throw err;

      res.json({ row });
    }
  );
});

app.post("/closedstaus", function (req, res) {
  var data = req.body;
  var id = data.id;
  db.query(
    "UPDATE incident_report SET status =? where id=?",
    ["Closed", data.id],
    function (err, result) {
      if (err) throw err;
      var code = "test";
      res.json({ code });
    }
  );
});
app.post("/closedstaus_near", function (req, res) {
  var data = req.body;
  var id = data.id;
  db.query(
    "UPDATE nearmiss_report SET status =? where id=?",
    ["Closed", data.id],
    function (err, result) {
      if (err) throw err;
      var code = "test";
      res.json({ code });
    }
  );
});
app.post("/getsinglehazrad", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM report_hazard  where id=?",
    [data.id],
    function (err, row, fields) {
      if (err) throw err;

      res.json({ row });
    }
  );
});

app.post("/searchcourse", function (req, res) {
  var data = req.body;
  //console.log(req.body);
  //console.log("test");
  db.query(
    "SELECT * FROM elearningCourse WHERE title LIKE ? or description LIKE ?",
    ["%" + data.search + "%", "%" + data.search + "%"],
    function (err, results, fields) {
      res.json({ results });
    }
  );
});

app.post("/assignCourse", function (req, res) {
  var data = req.body;

  var resultArrays = data.users;
  var sel = data.course;
  const selectedDates = sel.map((item) => item.selectedDate);
  var counter = 0;
  var course_data = data.course;
  var responseData = [];
  resultArrays.forEach((roww) => {
    course_data.forEach((rowwc) => {
      let selectedDate = new Date(rowwc.selectedDate);
      const selectedDate_n = new Date(rowwc.selectedDate);
      const formattedDate = selectedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      // Adding 10 days to the selected date
      selectedDate.setDate(selectedDate.getDate() + 10);
      let dataa = {
        user_id: roww,
        course_id: rowwc.id,
        name: rowwc.name,
        assign_date: new Date(rowwc.selectedDate),
        created_at: new Date(),
        end_date: new Date(selectedDate),
      };
      var ms = rowwc.name + " course due date is " + formattedDate;
      let notif_user = {
        user_id: roww,
        message: ms,
        created_at: new Date(),
      };
      db.query(
        "SELECT * FROM assign_course WHERE user_id=? AND name =? ",
        [roww, rowwc.name],
        function (err, row, fields) {
          //console.log("s");
          //console.log(row.length);
          if (row.length === 0) {
            db.query(
              "INSERT INTO assign_course SET ?",
              dataa,
              function (error, results, fields) {
                if (error) {
                  console.error(error);
                  res.status(500).json({ error: "Internal Server Error" });
                  return;
                }
                db.query(
                  "INSERT INTO notificationuser SET ?",
                  notif_user,
                  function (error, results, fields) {
                    if (error) throw error;
                  }
                );
                counter++;

                if (counter === course_data.length) {
                  var status = "1";
                  res.json({ status, results: responseData });
                }
              }
            );
          } else {
            db.query(
              "SELECT * FROM users WHERE id=?",
              [roww],
              function (err, row, fields) {
                var r = row[0];
                var fn = r.first_name + " " + r.middle_name + " " + r.last_name;
                let arrr = {
                  name: fn,
                  course: rowwc.name,
                };

                responseData.push({ status: 2, arr: arrr }); // Pushing data to the response array
                counter++;

                if (counter === course_data.length) {
                  var status = "1";
                  res.json({ status, results: responseData });
                }
              }
            );
          }
        }
      );
    });
  });
});

app.post("/getassignCourseOverdue", function (req, res) {
  var data = req.body;
  var currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  db.query(
    "SELECT * FROM assign_course WHERE (user_id = ?) And (assign_date < ?) ORDER BY id DESC",
    [data.user_id, currentDate],
    function (err, results, fields) {
      res.json({ results });
    }
  );
});
app.post("/getassignCourseUpcoming", function (req, res) {
  var data = req.body;
  var currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  db.query(
    "SELECT * FROM assign_course WHERE (user_id = ?) And (end_date >= ?) And (status =?) ORDER BY created_at DESC",
    [data.user_id, currentDate, "Notcomplete"],
    function (err, results, fields) {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const mainarrray = new Array(results.length);
      const promises = [];

      results.forEach((roww, index) => {
        const promise = new Promise((resolve, reject) => {
          db.query(
            "SELECT * FROM elearningCourse WHERE id = ?",
            [roww.course_id],
            function (err, row, fields) {
              if (err) {
                reject(err);
              } else {
                if (row && row.length > 0) {
                  let data = {
                    unique_code: row[0].unique_code,
                    id: roww.id,
                    user_id: roww.user_id,
                    course_id: roww.course_id,
                    name: roww.name,
                    status: roww.status,
                    created_at: roww.created_at,
                    assign_date: roww.assign_date,
                    end_date: roww.end_date,
                  };
                  mainarrray[index] = data;
                }
                resolve();
              }
            }
          );
        });
        promises.push(promise);
      });

      Promise.all(promises)
        .then(() => {
          console.log("gt");
          console.log(mainarrray);
          res.json({ mainarrray });
        })
        .catch((err) => {
          console.error("Error:", err);
          res.status(500).json({ error: "Internal Server Error" });
        });
    }
  );
});

app.post("/getassignCourseComplete", function (req, res) {
  var data = req.body;
  var currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  db.query(
    "SELECT assign_course.*,course_pdf.user_id,course_pdf.course_id,course_pdf.name as cname,course_pdf.date FROM assign_course join course_pdf on course_pdf.course_id = assign_course.course_id WHERE assign_course.user_id = ?  And assign_course.status =? And course_pdf.user_id =? ORDER BY id DESC",
    [data.user_id, "Complete", data.user_id],
    function (err, results, fields) {
      console.log(results);
      res.json({ results });
    }
  );
});
app.post("/coursepdf", function (req, res) {
  var data = req.body;
  var currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  db.query(
    "SELECT * FROM elearningCourse WHERE unique_code = ?",
    [data.id],
    function (err, row, fields) {
      var r = row;
      db.query(
        "SELECT * FROM assign_course WHERE user_id = ? And course_id=?  And status =? And end_date >= ?",
        [data.user_id, r[0].id, "Notcomplete", currentDate],
        function (err, row, fields) {
          var rr = row;
          let sk = {
            user_id: data.user_id,
            course_id: r[0].id,
            date: new Date(),
            name: data.name,
          };

          if (rr.length > 0) {
            db.query(
              "UPDATE assign_course SET status =? where id=?",
              ["Complete", rr[0].id],
              function (err, result) {
                if (err) throw err;
                db.query(
                  "SELECT * FROM course_pdf WHERE user_id = ?  And course_id =?",
                  [data.user_id, rr[0].id],
                  function (err, row, fields) {
                    //console.log(row);
                    //console.log("sk");
                    if (row.length === 0) {
                      db.query(
                        "INSERT INTO course_pdf SET ?",
                        sk,
                        function (error, results, fields) {
                          if (error) throw error;
                          res.json({ results });
                        }
                      );
                    }
                  }
                );
              }
            );
          }
        }
      );
    }
  );
});

app.post("/getCourseComplete", function (req, res) {
  var data = req.body;
  var currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  db.query(
    "SELECT assign_course.*,course_pdf.user_id,course_pdf.course_id,course_pdf.name as cname,course_pdf.date FROM assign_course join course_pdf on course_pdf.course_id = assign_course.course_id WHERE assign_course.user_id = ?  And assign_course.status =? And course_pdf.user_id =? ORDER BY id DESC",
    [data.user_id, "Complete", data.user_id],
    function (err, results, fields) {
      res.json({ results });
    }
  );
});

app.post("/admin/getallcourse", function (req, res) {
  var data = req.body;
  var currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  db.query(
    "SELECT assign_course.*,count(assign_course.user_id) as coursecount,users.first_name,users.middle_name,users.last_name,users.id from assign_course join  users on users.id = assign_course.user_id where assign_course.status =? GROUP BY assign_course.user_id order BY assign_course.id desc",
    ["Notcomplete"],
    function (err, results, fields) {
      res.json({ results });
    }
  );
});
app.post("/admin/getallcourseUsersempty", function (req, res) {
  var data = req.body;

  var currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  db.query(
    "SELECT assign_course.*,  users.first_name, users.middle_name, users.last_name, users.id FROM assign_course JOIN users ON users.id = assign_course.user_id WHERE assign_course.status = ? order BY assign_course.id desc",
    ["Notcomplete"],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        return;
      }

      if (results.length > 0) {
        let ress = results; // Storing the results for later use
        let queriesCompleted = 0;

        // Iterate over each result
        results.forEach((result, index) => {
          db.query(
            "SELECT * FROM elearningCourse WHERE id = ?",
            [result.course_id],
            function (err, courseResults, fields) {
              if (err) {
                console.error(err);
                return;
              }
              let name = {
                first_name: ress[index].first_name,
                middle_name: ress[index].middle_name,
                last_name: ress[index].last_name,
              };

              // Add the names to the current result
              results[index].first_name = name.first_name;
              results[index].middle_name = name.middle_name;
              results[index].last_name = name.last_name;

              // Increment the counter for completed queries
              queriesCompleted++;

              // If all queries are completed, send the response
              if (queriesCompleted === results.length) {
                //console.log(results);
                res.json({ results });
              }
            }
          );
        });
      } else {
        var results = [];
        res.json({ results });
      }
    }
  );
});
app.post("/admin/getallcourseUsers", function (req, res) {
  var data = req.body;

  var currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  db.query(
    "SELECT assign_course.*,  users.first_name, users.middle_name, users.last_name, users.id FROM assign_course JOIN users ON users.id = assign_course.user_id WHERE assign_course.user_id = ? And assign_course.status = ? order BY assign_course.id desc",
    [data.userId, "Notcomplete"],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        return;
      }

      if (results.length > 0) {
        let ress = results; // Storing the results for later use
        let queriesCompleted = 0;

        // Iterate over each result
        results.forEach((result, index) => {
          db.query(
            "SELECT * FROM elearningCourse WHERE id = ?",
            [result.course_id],
            function (err, courseResults, fields) {
              if (err) {
                console.error(err);
                return;
              }
              let name = {
                first_name: ress[index].first_name,
                middle_name: ress[index].middle_name,
                last_name: ress[index].last_name,
              };

              // Add the names to the current result
              results[index].first_name = name.first_name;
              results[index].middle_name = name.middle_name;
              results[index].last_name = name.last_name;

              // Increment the counter for completed queries
              queriesCompleted++;

              // If all queries are completed, send the response
              if (queriesCompleted === results.length) {
                //console.log(results);
                res.json({ results });
              }
            }
          );
        });
      } else {
        var results = [];
        res.json({ results });
      }
    }
  );
});
app.post("/admin/getallcourseSearch", function (req, res) {
  var data = req.body;
  var currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  db.query(
    "SELECT assign_course.*, COUNT(assign_course.user_id) AS coursecount, users.first_name, users.middle_name, users.last_name, users.id FROM assign_course JOIN users ON users.id = assign_course.user_id WHERE assign_course.status = ? AND (assign_course.name LIKE ? OR users.first_name LIKE ? OR users.middle_name LIKE ? OR users.last_name LIKE ?) GROUP BY user_id",
    [
      "Notcomplete",
      "%" + data.search + "%",
      "%" + data.search + "%",
      "%" + data.search + "%",
      "%" + data.search + "%",
    ],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      //console.log(results);
      res.json({ results });
    }
  );
});
app.post("/admin/searchempl", function (req, res) {
  var data = req.body;
  var currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  db.query(
    "SELECT * from users where first_name LIKE ? or last_name LIKE ? And middle_name LIKE ? order by id desc",
    ["%" + data.search + "%", "%" + data.search + "%", "%" + data.search + "%"],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      //console.log(results);
      res.json({ results });
    }
  );
});
app.post("/admin/courseunassign", function (req, res) {
  var data = req.body;
  var currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  // Select records to be deleted
  db.query(
    "SELECT * FROM assign_course WHERE name=? And user_id=? AND status=?",
    [data.name, data.userId, "Notcomplete"],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      // Iterate through the selected records and delete them
      results.forEach((row) => {
        db.query(
          "DELETE FROM assign_course WHERE id=?",
          [row.id],
          function (err, result) {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: "Database error" });
            }
          }
        );
      });

      // After all deletions are done, send the response with the remaining results
      res.json({ results: results });
    }
  );
});

app.post("/removemention", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * from users where id=?",
    [data.id],
    function (err, row, fields) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      if (row[0].licence_file.length > 0) {
        const dataImg = data.img;
        const arrayy = JSON.parse(row[0].licence_file);
        let newArray = arrayy.filter((item) => item.trim() !== dataImg.trim());

        db.query(
          "UPDATE users SET licence_file =? where id=?",
          [JSON.stringify(newArray), data.id],
          function (err, result) {
            if (err) throw err;
            db.query(
              "SELECT * from users where id =?",
              [data.id],
              function (err, row, fields) {
                res.json({ row });
              }
            );
          }
        );
      } else {
        db.query(
          "SELECT * from users where id =?",
          [data.id],
          function (err, row, fields) {
            res.json({ row });
          }
        );
      }
    }
  );
});
app.post("/removecertificate", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * from users where id=?",
    [data.id],
    function (err, row, fields) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      if (row[0].certificate_file.length > 0) {
        const dataImg = data.img;
        const arrayy = JSON.parse(row[0].certificate_file);
        let newArray = arrayy.filter((item) => item.trim() !== dataImg.trim());

        db.query(
          "UPDATE users SET certificate_file =? where id=?",
          [JSON.stringify(newArray), data.id],
          function (err, result) {
            if (err) throw err;
            db.query(
              "SELECT * from users where id =?",
              [data.id],
              function (err, row, fields) {
                res.json({ row });
              }
            );
          }
        );
      } else {
        db.query(
          "SELECT * from users where id =?",
          [data.id],
          function (err, row, fields) {
            res.json({ row });
          }
        );
      }
    }
  );
});
app.post("/removetrade", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * from users where id=?",
    [data.id],
    function (err, row, fields) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      if (row[0].trade_file.length > 0) {
        const dataImg = data.img;
        const arrayy = JSON.parse(row[0].trade_file);
        let newArray = arrayy.filter((item) => item.trim() !== dataImg.trim());

        db.query(
          "UPDATE users SET trade_file =? where id=?",
          [JSON.stringify(newArray), data.id],
          function (err, result) {
            if (err) throw err;
            db.query(
              "SELECT * from users where id =?",
              [data.id],
              function (err, row, fields) {
                res.json({ row });
              }
            );
          }
        );
      } else {
        db.query(
          "SELECT * from users where id =?",
          [data.id],
          function (err, row, fields) {
            res.json({ row });
          }
        );
      }
    }
  );
});

app.post("/removemachine", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * from users where id=?",
    [data.id],
    function (err, row, fields) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      if (row[0].machinery_file.length > 0) {
        const dataImg = data.img;
        const arrayy = JSON.parse(row[0].machinery_file);
        let newArray = arrayy.filter((item) => item.trim() !== dataImg.trim());

        db.query(
          "UPDATE users SET machinery_file =? where id=?",
          [JSON.stringify(newArray), data.id],
          function (err, result) {
            if (err) throw err;
            db.query(
              "SELECT * from users where id =?",
              [data.id],
              function (err, row, fields) {
                res.json({ row });
              }
            );
          }
        );
      } else {
        db.query(
          "SELECT * from users where id =?",
          [data.id],
          function (err, row, fields) {
            res.json({ row });
          }
        );
      }
    }
  );
});

app.post(
  "/userUpdateprofile",

  upload.fields([
    { name: "licence_file" },
    { name: "trade_file" },
    { name: "machinery_file" },
    { name: "certificate_file" },
  ]),
  function (req, res) {
    var data = req.body;
    const skil = JSON.stringify(data.skills);

    var l_fpush = [];
    var t_fpush = [];
    var m_fpush = [];
    var mc_fpush = [];
    if (req.files["licence_file"]) {
      if (Array.isArray(req.files["licence_file"])) {
        for (let tt = 0; tt < req.files["licence_file"].length; tt++) {
          const t = req.files["licence_file"][tt];
          const uniqueFilename = `${uuid.v4()}_${t.originalname}`;

          l_fpush.push(t.filename);
        }
      }
    }
    if (req.files["trade_file"]) {
      if (Array.isArray(req.files["trade_file"])) {
        for (let ttt = 0; ttt < req.files["trade_file"].length; ttt++) {
          const tt = req.files["trade_file"][ttt];
          const uniqueFilename = `${uuid.v4()}_${tt.originalname}`;

          t_fpush.push(tt.filename);
        }
      }
    }
    if (req.files["machinery_file"]) {
      if (Array.isArray(req.files["machinery_file"])) {
        for (let tttm = 0; tttm < req.files["machinery_file"].length; tttm++) {
          const ttm = req.files["machinery_file"][tttm];
          const uniqueFilename = `${uuid.v4()}_${ttm.originalname}`;

          m_fpush.push(ttm.filename);
        }
      }
    }
    if (req.files["certificate_file"]) {
      if (Array.isArray(req.files["certificate_file"])) {
        for (
          let tttmc = 0;
          tttmc < req.files["certificate_file"].length;
          tttmc++
        ) {
          const ttmc = req.files["certificate_file"][tttmc];
          const uniqueFilename = `${uuid.v4()}_${ttmc.originalname}`;

          mc_fpush.push(ttmc.filename);
        }
      }
    }
    var sk = data.skills.split(",");
    var ml = data.licence.split(",");
    var mc = data.certificate.split(",");
    var tr = data.trade.split(",");
    var mach = data.machinery.split(",");
    var voct = data.vocational_training.split(",");
    var eqp = data.equipment_work.split(",");
    var pvw = data.previous_work.split(",");

    var refre = data.references.split(",");

    //console.log(refre);
    db.query(
      "SELECT * FROM users WHERE id=?",
      [data.UserId],
      function (err, row, fields) {
        if (err) throw err;
        var rr = row;

        if (mc_fpush.length > 0) {
          var mcfpush = JSON.parse(rr[0].certificate_file);
          console.log(mcfpush);

          if (mcfpush === null) {
            var mergedArray = mc_fpush;
          } else {
            var mergedArray = mcfpush.concat(mc_fpush);
          }
        } else {
          var mergedArray = JSON.parse(rr[0].certificate_file);
        }

        if (m_fpush.length > 0) {
          var mcfpush_m = JSON.parse(rr[0].machinery_file);
          if (mcfpush_m === null) {
            var mergedArray_m = m_fpush;
          } else {
            var mergedArray_m = mcfpush_m.concat(m_fpush);
          }
        } else {
          var mergedArray_m = JSON.parse(rr[0].machinery_file);
        }

        if (t_fpush.length > 0) {
          var mcfpush_t = JSON.parse(rr[0].trade_file);
          if (mcfpush_t === null) {
            var mergedArray_t = t_fpush;
          } else {
            var mergedArray_t = mcfpush_t.concat(t_fpush);
          }
        } else {
          var mergedArray_t = JSON.parse(rr[0].trade_file);
        }
        if (l_fpush.length > 0) {
          var mcfpush_l = JSON.parse(rr[0].licence_file);
          if (mcfpush_l === null) {
            var mergedArray_l = l_fpush;
          } else {
            var mergedArray_l = mcfpush_l.concat(l_fpush);
          }
        } else {
          var mergedArray_l = JSON.parse(rr[0].licence_file);
        }
        //return false;
        let users = {
          first_name: data.first_name,
          middle_name: data.middle_name,
          last_name: data.last_name,
          role: data.role,

          contact: data.contact,
          address: data.address,
          skills: JSON.stringify(sk),
          years: data.years,
          references: JSON.stringify(refre),
          employmentHistorySections: data.employmentHistorySections,
          education: data.education,
          licence: JSON.stringify(ml),
          licence_file: JSON.stringify(mergedArray_l),
          certificate: JSON.stringify(mc),
          certificate_file: JSON.stringify(mergedArray),
          trade: JSON.stringify(tr),
          trade_file: JSON.stringify(mergedArray_t),
          machinery: JSON.stringify(mach),
          machinery_file: JSON.stringify(mergedArray_m),
          vocational_training: JSON.stringify(voct),
          equipment_work: JSON.stringify(eqp),
          previous_work: JSON.stringify(pvw),
        };
        //console.log(users);
        //return false;
        if (rr.length !== 0) {
          db.query(
            "UPDATE users SET role = ?,first_name = ?, middle_name = ?, last_name = ?, contact = ?, address = ?, skills = ?, years = ?, `references` = ?, employmentHistorySections = ?, education = ?, licence = ?, licence_file = ?, certificate = ?, certificate_file = ?, trade = ?, trade_file = ?, machinery = ?, machinery_file = ?, vocational_training = ?, equipment_work = ?, previous_work = ? WHERE id = ?",
            [
              users.role,
              users.first_name,
              users.middle_name,
              users.last_name,
              users.contact,
              users.address,
              users.skills,
              users.years,
              users.references,
              users.employmentHistorySections,
              users.education,
              users.licence,
              users.licence_file,
              users.certificate,
              users.certificate_file,
              users.trade,
              users.trade_file,
              users.machinery,
              users.machinery_file,
              users.vocational_training,
              users.equipment_work,
              users.previous_work,
              data.UserId,
            ],
            function (error, results, fields) {
              if (error) throw error;
              var idd = results.insertId;
              var status = "1";
              res.json({ status });
              createnewskills(skil);
              if (data.licence != "") {
                createnew_mentionlicence(JSON.stringify(data.licence));
              }
              if (data.certificate != "") {
                createnew_certificate(JSON.stringify(data.certificate));
              }

              if (data.trade != "") {
                createnew_trade(JSON.stringify(data.trade));
              }

              if (data.machinery != "") {
                createnew_machinery(JSON.stringify(data.machinery));
              }

              if (data.vocational_training != "") {
                createnew_vocational_training(
                  JSON.stringify(data.vocational_training)
                );
              }
              if (data.equipment_work != "") {
                createnew_equipment_work(JSON.stringify(data.equipment_work));
              }
              if (data.previous_work != "") {
                createnew_previous_work(JSON.stringify(data.previous_work));
              }
            }
          );
        } else {
          var status = "2";
          res.json({ status });
        }
      }
    );
  }
);

app.post("/admin/creatfolder", function (req, res) {
  ////console.log(req.body);
  var data = req.body;

  let onboarding_folder = {
    name: data.folder,
    created_at: new Date(),
  };
  db.query(
    "SELECT * from onboarding_folder where name = ?",
    [data.folder],
    function (err, row, fields) {
      if (row.length == "0") {
        db.query(
          "INSERT INTO onboarding_folder SET ?",
          onboarding_folder,
          function (error, results, fields) {
            if (error) throw error;
            var idd = results.insertId;
            var fl = data.folder + "_" + idd;
            var dir = "./public/uploads/" + fl;

            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            db.query(
              "SELECT * from onboarding_folder order by id desc",
              function (err, results, fields) {
                res.json({ results });
              }
            );
          }
        );
      } else {
        var results = [];
        res.json({ results });
      }
    }
  );
});
app.post("/admin/getfolder", function (req, res) {
  ////console.log(req.body);
  db.query(
    "SELECT * from onboarding_folder order by id desc",
    function (err, results, fields) {
      res.json({ results });
    }
  );
});
app.post("/admin/deletefolder", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  db.query(
    "DELETE FROM onboarding_folder WHERE id= ?",
    [data.id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "DELETE FROM onboarding_folder_files WHERE folder_id= ?",
        [data.id],
        function (err, result) {
          if (err) throw err;
          db.query(
            "SELECT * from onboarding_folder order by id desc",
            function (err, results, fields) {
              res.json({ results });
            }
          );
        }
      );
    }
  );
});

app.post("/admin/deletefile", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  db.query(
    "DELETE FROM onboarding_folder_files WHERE id= ?",
    [data.id],
    function (err, result) {
      if (err) throw err;
      db.query(
        "SELECT * from onboarding_folder_files where folder_id=? order by id desc",
        [data.folderid],
        function (err, results, fields) {
          res.json({ results });
        }
      );
    }
  );
});
app.post("/admin/deletefileall", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var resultArrays = data.multi_Id;
  counter = 0;
  resultArrays.forEach((roww) => {
    console.log(roww);
    db.query(
      "DELETE FROM onboarding_folder_files WHERE id= ? And folder_id=?",
      [roww.fid, data.folderid],
      function (err, result) {
        if (err) throw err;
        counter++;
        if (counter === resultArrays.length) {
          db.query(
            "SELECT * from onboarding_folder_files where folder_id=? order by id desc",
            [data.folderid],
            function (err, results, fields) {
              res.json({ results });
            }
          );
        }
      }
    );
  });
});
app.post("/admin/deletefolderall", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  var resultArrays = data.multi_Id;
  counter = 0;
  resultArrays.forEach((roww) => {
    console.log(roww);
    db.query(
      "DELETE FROM onboarding_folder WHERE id= ?",
      [roww.id],
      function (err, result) {
        if (err) throw err;
        counter++;
        if (counter === resultArrays.length) {
          db.query(
            "DELETE FROM onboarding_folder_files WHERE folder_id= ?",
            [roww.id],
            function (err, result) {
              if (err) throw err;
              db.query(
                "SELECT * from onboarding_folder order by id desc",
                function (err, results, fields) {
                  res.json({ results });
                }
              );
            }
          );
        }
      }
    );
  });
});

app.post("/admin/getfolderfiles", function (req, res) {
  ////console.log(req.body);
  var data = req.body;
  db.query(
    "SELECT onboarding_folder_files.*,onboarding_folder_files.id as fid,onboarding_folder.id,onboarding_folder.name as folder_name from onboarding_folder_files Left join onboarding_folder on onboarding_folder.id = onboarding_folder_files.folder_id where onboarding_folder_files.folder_id=? order by onboarding_folder_files.id desc",
    [data.id],
    function (err, results, fields) {
      res.json({ results });
    }
  );
});

app.post(
  "/admin/creatfile",
  uploadspecific.fields([{ name: "files" }]),
  function (req, res) {
    const dd = req.body;

    var l_fpush = [];
    if (req.files["files"]) {
      if (Array.isArray(req.files["files"])) {
        for (let tt = 0; tt < req.files["files"].length; tt++) {
          const t = req.files["files"][tt];
          const uniqueFilename = `${t.originalname}`;
          let pp = {
            name: t.filename,
            path: req.files["files"][tt].path,
          };
          l_fpush.push(pp);
        }
      }
    }

    db.query(
      "SELECT * FROM onboarding_folder WHERE id = ?",
      [dd.id],
      function (err, rows, fields) {
        if (err) throw err;
        counter = 0;
        if (rows.length > 0) {
          l_fpush.forEach((roww) => {
            const row = rows[0];
            const fid = row.id;
            const f = roww.name;
            const fname = row.name;
            const fn = fname + "_" + fid;

            if (f != null) {
              const sourcePath = roww.path;
              const dynamicFolderPath = path.join(
                __dirname,
                "public/uploads",
                fn
              );
              if (!fs.existsSync(dynamicFolderPath)) {
                fs.mkdirSync(dynamicFolderPath, { recursive: true });
              }

              // Adjust target path to include the dynamic folder name
              const targetPath = path.join(dynamicFolderPath, f);
              console.log(targetPath);
              // Move the uploaded file to the target path
              fs.renameSync(sourcePath, targetPath);

              let onboarding_folder = {
                folder_id: dd.id,
                name: f,
                created_at: new Date(),
              };
              db.query(
                "INSERT INTO onboarding_folder_files SET ?",
                onboarding_folder,
                function (error, results, fields) {
                  if (error) throw error;
                  counter++;
                  if (counter == l_fpush.length) {
                    db.query(
                      "SELECT * from onboarding_folder_files where folder_id = ? order by id desc",
                      [dd.id],
                      function (err, results, fields) {
                        res.json({ results });
                      }
                    );
                  }
                }
              );
            } else {
              f = dd.profiledate || null;
            }
          });

          // Dynamic folder name

          // Continue with your file operations or other logic here
        }
      }
    );
  }
);

app.post("/admin/downloadfolder", function (req, res) {
  var data = req.body;
  var resultArrays = data.folder;

  // Create an object to store arrays of files where each key corresponds to the folder name
  var filesByFolder = {};

  // Counter to keep track of the number of folders processed
  var processedFolders = 0;

  resultArrays.forEach((roww) => {
    db.query(
      "SELECT * from onboarding_folder where id= ?",
      [roww.id],
      function (err, folderResults, fields) {
        if (err) {
          // Handle error
          console.error("Error fetching folder details:", err);
          return;
        }

        if (folderResults.length > 0) {
          // Store folder details
          var folder = folderResults[0];
          var folderName = folder.name;

          // Initialize array for this folder if not already initialized
          if (!filesByFolder[folderName]) {
            filesByFolder[folderName] = [];
          }

          db.query(
            "SELECT id,name,folder_id from onboarding_folder_files where folder_id= ?",
            [roww.id],
            function (err, fileResults, fields) {
              if (err) {
                // Handle error
                console.error("Error fetching files:", err);
                return;
              }

              // Store files in the corresponding folder array
              filesByFolder[folderName] =
                filesByFolder[folderName].concat(fileResults);

              // Check if all folders have been processed
              processedFolders++;
              if (processedFolders === resultArrays.length) {
                res.json(filesByFolder);
              }
            }
          );
        }
      }
    );
  });
});

app.post("/admin/downloadfile", function (req, res) {
  var data = req.body;
  var resultArrays = data.folder;

  // Create an object to store arrays of files where each key corresponds to the folder name
  var filesByFolder = {};

  // Counter to keep track of the number of folders processed
  var processedFolders = 0;

  resultArrays.forEach((roww) => {
    db.query(
      "SELECT onboarding_folder_files.*,onboarding_folder.name as folder_name,onboarding_folder.id FROM onboarding_folder_files LEFT JOIN onboarding_folder ON onboarding_folder_files.folder_id = onboarding_folder.id WHERE onboarding_folder_files.id= ?",
      [roww.id],
      function (err, folderResults, fields) {
        if (err) {
          // Handle error
          console.error("Error fetching folder details:", err);
          return;
        }

        if (folderResults.length > 0) {
          // Store folder details
          var folder = folderResults[0];
          var folderName = folder.folder_name;

          // Initialize array for this folder if not already initialized
          if (!filesByFolder[folderName]) {
            filesByFolder[folderName] = [];
          }

          // Extract file data from the folderResults
          var fileResults = folderResults.map((folderData) => ({
            id: folderData.id,
            name: folderData.folder_name,
            file: folderData.name,
            folder_id: folderData.folder_id,
          }));

          // Store files in the corresponding folder array
          filesByFolder[folderName] =
            filesByFolder[folderName].concat(fileResults);

          // Check if all folders have been processed
          processedFolders++;
          if (processedFolders === resultArrays.length) {
            console.log(filesByFolder);
            res.json(filesByFolder);
          }
        }
      }
    );
  });
});

app.get("/download", async (req, res) => {
  try {
    const imageUrl = req.query.imageUrl;
    const response = await fetch(imageUrl);
    const fileData = await response.blob();
    console.log(fileData);
    res.send(fileData);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Error downloading file");
  }
});

app.post("/admin/senfileemp", function (req, res) {
  var data = req.body;
  var emp = data.emp;
  var filee = data.files;
  console.log(data);
  counter = 0;
  emp.forEach((roww) => {
    if (roww !== null) {
      filee.forEach((row_w) => {
        if (row_w !== null && row_w !== undefined) {
          let dataa = {
            user_id: roww.id,
            folder_id: data.id,
            name: row_w.fname,
            created_at: new Date(),
          };
          db.query(
            "INSERT INTO user_onboarding_document SET ?",
            dataa,
            function (error, results, fields) {
              if (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
                return;
              }

              counter++;

              if (counter === emp.length) {
                var status = "1";
                res.json({ status });
              }
            }
          );
        }
      });
    }
  });
  // db.query(
  //   "SELECT onboarding_folder_files.*,onboarding_folder.id,onboarding_folder.name as folder_name from onboarding_folder_files Left join onboarding_folder on onboarding_folder.id = onboarding_folder_files.folder_id where onboarding_folder_files.folder_id=? order by onboarding_folder_files.folder_id desc",
  //   [data.id],
  //   function (err, results, fields) {
  //     res.json({ results });
  //   }
  // );
});

app.post("/getonboardingDoc", function (req, res) {
  var data = req.body;
  console.log(data);
  db.query(
    "SELECT user_onboarding_document.*,onboarding_folder.name as fname from user_onboarding_document join onboarding_folder on onboarding_folder.id = user_onboarding_document.folder_id where user_onboarding_document.user_id =? order by user_onboarding_document.id desc",
    [data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/getonboardinglic", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * from user_licence_document_upload where user_id=? order by id desc",
    [data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});

app.post(
  "/userUpdateDocfile",

  upload_userdoc.fields([{ name: "files" }]),
  function (req, res) {
    var data = req.body;

    var l_fpush = [];
    if (req.files["files"]) {
      if (Array.isArray(req.files["files"])) {
        for (let tt = 0; tt < req.files["files"].length; tt++) {
          const t = req.files["files"][tt];
          const uniqueFilename = `${uuid.v4()}_${t.originalname}`;

          l_fpush.push(t.filename);
        }
      }
    }
    counter = 0;
    l_fpush.forEach((roww) => {
      let userdoc = {
        user_id: data.user_id,
        name: roww,
        created_at: new Date(),
      };
      db.query(
        "INSERT INTO 	user_onboarding_document_upload SET ?",
        userdoc,
        function (error, results, fields) {
          if (error) throw error;
          counter++;
          if (l_fpush.length == counter) {
            var status = 1;
            res.json({ status });
          }
        }
      );
    });
  }
);
app.post(
  "/userlicence",
  upload_lic.fields([{ name: "file" }]),
  function (req, res) {
    var data = req.body;

    // Access uploaded files
    //console.log(req.files);
    const dataFromQuery = req.body;
    const filesFromQuery = req.files;
    const filesFromQueryy = filesFromQuery.file;
    var user_id = data.user_id;

    let counter = 0;

    let userdoc = {};

    dataFromQuery.name.forEach((name, index) => {
      const licence_number = dataFromQuery.licence_number[index];
      const expiryMonth = dataFromQuery.expiryMonth[index];
      const expiryYear = dataFromQuery.expiryYear[index];
      if (filesFromQueryy[index] !== undefined) {
        var ff = filesFromQueryy[index];
      } else {
        var ff = "";
      }
      const currentDate = new Date();
      const currentDay = currentDate.getDate();

      const expiryDate = new Date(expiryYear, expiryMonth - 1, currentDay); // Subtract 1 from expiryMonth since months are zero-based
      const formattedExpiryDate = expiryDate.toISOString().split("T")[0]; // Splitting and taking only the date part

      // Assign the formatted expiry date to userdoc
      var expirydate = formattedExpiryDate;
      const userdoc = {
        user_id,
        name,
        licence_number,
        expiryMonth,
        expiryYear,
        expirydate,
        file_name: ff.originalname,
        created_at: new Date(),
      };

      db.query(
        "INSERT INTO user_licence_document_upload SET ?",
        userdoc,
        (error, results) => {
          if (error) {
            counter++;
            if (dataFromQuery.name.length == counter) {
              var status = 1;

              res.json({ status });
            }
          }
        }
      );
    });
    setTimeout(() => {
      var status = 1;
      res.json({ status });
    }, 1100);
  }
);

app.post("/useruploadlic", upload_lic.single("file"), function (req, res) {
  const dd = req.body;
  console.log(dd);
  console.log(req.file);

  var expiryMonth = dd.expiryMonth;
  var expiryYear = dd.expiryYear;
  const currentDate = new Date();
  const currentDay = currentDate.getDate();

  const expiryDate = new Date(expiryYear, expiryMonth - 1, currentDay); // Subtract 1 from expiryMonth since months are zero-based
  const formattedExpiryDate = expiryDate.toISOString().split("T")[0];
  var user_id = dd.user_id;
  var name = dd.name;
  var licence_number = dd.licence_number;

  var expirydate = formattedExpiryDate;
  const userdoc = {
    user_id,
    name,
    licence_number,
    expiryMonth,
    expiryYear,
    expirydate,
    file_name: req.file.originalname,
    created_at: new Date(),
  };
  console.log(userdoc);

  db.query(
    "INSERT INTO user_licence_document_upload SET ?",
    userdoc,
    (error, results) => {
      if (error) {
        var status = 1;

        res.json({ status });
      }
    }
  );
  setTimeout(() => {
    var status = 1;
    res.json({ status });
  }, 1100);
});

app.post("/getusernotification", function (req, res) {
  var data = req.body;
  db.query(
    "SELECT * FROM notificationuser where  user_id =?  order by id desc",
    [data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      //console.log(results);
      res.json({ results });
    }
  );
});
app.post("/sendnotification", function (req, res) {
  var data = req.body;
  let usernoti = {
    user_id: data.user_id,
    message: data.notification,
    created_at: new Date(),
  };
  console.log(usernoti);
  db.query("INSERT INTO notificationuser SET ?", usernoti, (error, results) => {
    if (error) {
      console.error(error);

      var status = 1;
      res.json({ status });
    }
  });
  setTimeout(() => {
    var status = 1;
    res.json({ status });
  }, 500);
});

app.post("/adminUploadDoc", upload_userdoc.single("file"), function (req, res) {
  const dd = req.body;

  var user_id = dd.user_id;

  const userdoc = {
    user_id,
    name: req.file.originalname,
    created_at: new Date(),
  };
  db.query(
    "INSERT INTO user_onboarding_document_upload SET ?",
    userdoc,
    (error, results) => {
      if (error) {
        console.error(error);

        var status = 1;
        res.json({ status });
      }
    }
  );
  setTimeout(() => {
    var status = 1;
    res.json({ status });
  }, 500);
});
app.post("/adminUploadlic", upload_lic.single("file"), function (req, res) {
  const dd = req.body;
  var user_id = dd.user_id;
  var expiryYear = dd.expiryYear;
  var expiryMonth = dd.expiryMonth;
  const currentDate = new Date();
  const currentDay = currentDate.getDate();

  const expiryDate = new Date(expiryYear, expiryMonth - 1, currentDay); // Subtract 1 from expiryMonth since months are zero-based
  const formattedExpiryDate = expiryDate.toISOString().split("T")[0]; // Splitting and taking only the date part

  // Assign the formatted expiry date to userdoc
  var expirydate = formattedExpiryDate;

  const userdoc = {
    user_id,
    expiryYear,
    expiryMonth,
    expirydate,
    file_name: req.file.originalname,
    created_at: new Date(),
  };
  db.query(
    "INSERT INTO user_licence_document_upload SET ?",
    userdoc,
    (error, results) => {
      if (error) {
        console.error(error);

        var status = 1;
        res.json({ status });
      }
    }
  );
  setTimeout(() => {
    var status = 1;
    res.json({ status });
  }, 500);
});

app.post("/admindocdelete", function (req, res) {
  const dd = req.body;

  var resultArrays = dd.id;
  var ss = "";
  counter = 0;
  resultArrays.forEach((roww) => {
    if (roww.isChecked === true) {
      var ss = "1";
      db.query(
        "DELETE FROM user_onboarding_document_upload WHERE id= ?",
        [roww.id],
        function (err, result) {
          if (err) throw err;
          counter++;
          if (resultArrays.length === counter) {
            db.query(
              "SELECT * from user_onboarding_document_upload where user_id=? order by id desc",
              [dd.user_id],
              function (err, results, fields) {
                if (err) throw err;
                res.json({ results });
              }
            );
          }
        }
      );
    }
  });
});

app.post("/adminlicdelete", function (req, res) {
  const dd = req.body;

  var resultArrays = dd.id;
  var ss = "";
  counter = 0;
  resultArrays.forEach((roww) => {
    if (roww.isChecked === true) {
      var ss = "1";
      db.query(
        "DELETE FROM user_licence_document_upload WHERE id= ?",
        [roww.id],
        function (err, result) {
          if (err) throw err;
          counter++;
          if (resultArrays.length === counter) {
            db.query(
              "SELECT * from user_licence_document_upload where user_id=? order by id desc",
              [dd.user_id],
              function (err, results, fields) {
                if (err) throw err;
                res.json({ results });
              }
            );
          }
        }
      );
    }
  });
});

app.post("/getonboardingDocAdmin", function (req, res) {
  var data = req.body;
  console.log(data);
  db.query(
    "SELECT * from user_onboarding_document_upload where user_id = ? order by id desc",
    [data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      res.json({ results });
    }
  );
});
app.post("/seeAllnotification", function (req, res) {
  var data = req.body;
  //console.log("d");
  // console.log(data);

  db.query(
    "SELECT * from notificationuser where user_id = ? And status = ?",
    [data.user_id, "Unseen"],
    function (err, results, fields) {
      if (err) throw err;
      var resarray = results;
      // console.log(resarray);
      counter = 0;
      resarray.forEach((roww) => {
        db.query(
          "UPDATE notificationuser SET status =? where user_id=?",
          ["Seen", data.user_id],
          function (err, result) {
            if (err) throw err;
            counter++;
            if (resarray.length === counter) {
              db.query(
                "SELECT * FROM notificationuser where user_id=?  order by id desc",
                [data.user_id],
                function (err, results, fields) {
                  if (err) throw err;
                  console.log(results);
                  res.json({ results });
                }
              );
            }
          }
        );
      });
    }
  );
});

app.post("/admin/searchfile", function (req, res) {
  var data = req.body;

  db.query(
    "SELECT * FROM onboarding_folder_files WHERE folder_id = ? And name LIKE ?",
    [data.id, "%" + data.search + "%"],
    function (err, results, fields) {
      //console.log(row);
      res.json({ results });
    }
  );
});

app.post("/getuserdetailsEmail", function (req, res) {
  var data = req.body;
  var id = data.email;
  db.query(
    "SELECT * FROM users WHERE email=?",
    [id],
    function (err, row, fields) {
      if (err) throw err;
      console.log(row);
      var status = row;
      res.json({ status });
    }
  );
});
