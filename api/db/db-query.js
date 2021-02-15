
const pool = require("./pool");

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
  dbQuery
};