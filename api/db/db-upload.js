import pool from './pool';
import fs from 'fs';
import * as fastcsv from 'fast-csv';
import * as path from 'path';

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

export function uploadData() {
    const filePath = "UPLOAD/external_id.csv";
    const tableName = "members";
    
    
    let stream = fs.createReadStream(path.resolve(__dirname, filePath));
    let csvData = [];
    let csvStream = fastcsv
      .parse()
      // .transform(data => {
      //   console.log(data)
      //   console.log("---")

      //   return data;
      // })
      .on("data", function(data) {
        let row = [...data];
        // make id not strings but actually ints
          row[0] = isNumeric(row[0]) ? parseInt(row[0]) : row[0];

          for (var i = 0; i < row.length; i++) {
            // change empty strings into nulls
            row[i] = (row[i] == '') ? null : row[i];
          }
        console.log("row", row)
        csvData.push(row);
      })
      .on("end", function() {
        let headers = csvData.shift();
        let numFields = headers.length;
        let fieldNames = "";
        for (let i = 1; i <= numFields; i++) fieldNames += ("$" + i + ", ");
        fieldNames = fieldNames.slice(0, -2);

        // FIXME 
        // THIS IS BAD FORM AND SHOULDNT GO INTO PROD
        const query =
          `INSERT INTO ${tableName}(${headers.toString()}) VALUES (${fieldNames})`;

        console.log(query);
        //return;
        pool.connect((err, client, done) => {
          if (err) throw err;
    
          try {
            csvData.forEach(row => {
              let values = row.map(val => (val == "") ? null : val);
              client.query(query, values, (err, res) => {
                if (err) {
                  console.warn("ERROR: Failed to insert")
                  console.warn("ROW: " + row.toString());
                  //console.warn("DETAIL: " + err.detail + "\n")
                  console.warn("STACK: " + err.stack + "\n")
                } else {
                  console.log("inserted " + res.rowCount + " row:", row.toString());
                }
              });
            });
          } catch(err) {
            console.log("oops")
            console.log(err)
            return;
          } finally {
            done();
          }
        });
      });
    
    stream.pipe(csvStream);
    
}

export function updateData() {
  const filePath = "UPLOAD/external_id.csv";
  const tableName = "members";
  
  
  let stream = fs.createReadStream(path.resolve(__dirname, filePath));
  let csvData = [];
  let csvStream = fastcsv
    .parse()
    // .transform(data => {
    //   console.log(data)
    //   console.log("---")

    //   return data;
    // })
    .on("data", function(data) {
      let row = [...data];
      // make id not strings but actually ints
        row[0] = isNumeric(row[0]) ? parseInt(row[0]) : row[0];

        for (var i = 0; i < row.length; i++) {
          // change empty strings into nulls
          row[i] = (row[i] == '') ? null : row[i];
        }
      console.log("row", row)
      csvData.push(row);
    })
    .on("end", function() {
      let headers = csvData.shift();
      let numFields = headers.length;
      let fieldNamePlaceholders = "";
      for (let i = 1; i <= numFields; i++) fieldNamePlaceholders += ("$" + i + ", ");
      fieldNamePlaceholders = fieldNamePlaceholders.slice(0, -2);  // get rid of trailing comma

      // FIXME 
      // THIS IS BAD FORM AND SHOULDNT GO INTO PROD
      let query = ""

      console.log(query);
      //return;
      pool.connect((err, client, done) => {
        if (err) throw err;
  
        try {
          csvData.forEach(row => {
            let values = row.map(val => (val == "") ? null : val);
            query = ` UPDATE contact_info
                      SET forum_name = '${values[1]}'
                      WHERE email = '${values[2]}'`
            console.log(query)
            client.query(query, (err, res) => {
              if (err) {
                console.warn("ERROR: Failed to insert")
                console.warn("ROW: " + row.toString());
                //console.warn("DETAIL: " + err.detail + "\n")
                console.warn("STACK: " + err.stack + "\n")
              } else {
                console.log("inserted " + res.rowCount + " row:", row.toString());
              }
            });
          });
        } catch(err) {
          console.log("oops")
          console.log(err)

        } finally {
          done();
        }
      });
    });
  
  stream.pipe(csvStream);
  
}

require('make-runnable');