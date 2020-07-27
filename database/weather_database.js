var mysql = require('mysql');

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function connectToDatabase() {
    var con = mysql.createConnection({
        host: 'localhost',
        user: 'garen1',
        port: '8889',
        password: '',
        database: 'Weather_App'
    });
    con.connect(function (err) {
        if (err) throw err;
        console.log('Connected to "location_keys_V2" table...');
    });
    return con;
}

module.exports = {

    location_key_exists: async (param) => {
        const connection = connectToDatabase();
        var sql = `SELECT * FROM location_keys_V2 WHERE param = '${param}'`;
        const promise = new Promise((resolve, reject) => {
            connection.query(sql, (err, res) => {
                if (err) {
                    console.log(err);
                }
                if (isEmpty(res)) {
                    console.log(`Location Key for param : ${param} not found.`);
                    resolve(false);
                } else {
                    console.log(`Location Key for param : ${param} was found`);
                    resolve(true);
                }
            });
        });
        console.log('...ending connection to database');
        connection.end();
        return await promise;
    },

    get_location_key: async (param) => {
        const connection = connectToDatabase();
        var sql = `SELECT location_key FROM location_keys_V2 WHERE param = '${param}'`;
        const promise = new Promise((resolve, reject) => {
            connection.query(sql, (err, res) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log('Returning location key from database');
                    resolve(res[0].location_key);
                }
            });
        });
        console.log('...ending connection to database');
        connection.end();
        return await promise;
    },

    store_location_key: function (key, param) {
        const connection = connectToDatabase();
        var sql = `INSERT INTO location_keys_V2(location_key, param) VALUES ('${key}','${param}')`;
        connection.query(sql, (err, res) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(`Stored Location Key: ${key} and Param: ${param} in table `);
            }
        });
        console.log('...ending connection to database');
        connection.end();
    }
};