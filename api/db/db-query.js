
const pool = require("./pool");

const transact = async (q) => {
  console.log('transaction:', q)
  const client = await pool.connect()
  let res
  try {
    await client.query('BEGIN')
    try {
      res = await client.query(q)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  } finally {
    client.release()
  }
  return res
}


const runTransaction = async (q) => {
  // little helper so if you add on a semicolon at the end of your query
  // string like a sane person, it won't fart out on you
  q = q.endsWith(";") ? q.slice(0, -1) : q;

  console.log("\n"+ q + "\n");
  
  try {
      const { rows } = await transact(q)
  } catch (err) {
      console.error('Database ' + err + " in query:")
      console.log(q)
    }  
  return rows;
}


const runQuery = (query) => {
  console.log("querying db: " + query)
  return pool
    .query(query)
    .then((res) => {
      return resParser(res)
    })
    .catch((err) => {
      console.log(err);
      return {status: "Error connecting to PG Database", ...err}
    });
}


function resParser(rawRes) {
  if (rawRes.rowCount === 0) return {status: "NoRecordsMatch"}
  else return {status: "Found", ...rawRes}
}


// async function runTransaction(q) {    
//   return pool.runTransaction(q) 
// }
// const runQuery = q => {pool.runQuery(q)} 

const dbQuery = (queryText, params) => {
  /**
   * DB Query
   * @param {object} req
   * @param {object} res
   * @returns {object} object
   */
    return new Promise((resolve, reject) => {
      pool.query(queryText, params)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
};

module.exports = {
  dbQuery,
  runQuery,
  runTransaction
};