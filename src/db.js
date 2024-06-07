const Pool = require('pg').Pool;

let dbname, user, password, host, port;
if (process.env.DATABASE_URL !== undefined) {
    const databaseUrl = process.env.DATABASE_URL;

    // Parse the database URI
    const uri = new URL(databaseUrl);

    // Extract connection parameters
    dbname = uri.pathname.substring(1);
    user = uri.username;
    password = uri.password;
    host = uri.hostname;
    port = uri.port;
} else {
    dbname = 'whatsapp';
    host = 'localhost';
    user = 'chatbot';
    password = 'vba51b365al';
    port = 5432;

}
console.log("DBNAME ", "USER ", host, dbname, user, port)
const pool = new Pool({
    user: user,
    host: host,
    database: dbname,
    password: password,
    port: port, // or your PostgreSQL port
});

//save call log

exports.addMessage = (data, user_phone) => {
    console.log("enter_addMessage");
    if (data.call && data.call.customer && data.call.customer.number && data.call.customer.number != process.env.TWILIO_CALLER_ID) user_phone = data.call.customer.number.slice(1);
    let values = "";
    console.log(user_phone);
    try {
        for (var i = 1; i < data.messages.length; i++) {
            const date = new Date(data.messages[i].time);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            // let speaker = "bot";
            // if (data.messages[i].role == "user")
            //     speaker = "user";
            // if (i == data.messages.length - 1)
            //     values += "('" + user_phone + "', '" + speaker + "', '" + data.messages[i].message.replace(/'/g, "''") + "', '" + formattedDate + "')";
            // else
            //     values += "('" + user_phone + "', '" + speaker + "', '" + data.messages[i].message.replace(/'/g, "''") + "', '" + formattedDate + "'), ";
            let from_me = "TRUE";
            if (data.messages[i].role == "user")
                from_me = "FALSE";
            if (i == data.messages.length - 1)
                values += "('" + data.call.id + i + "', '" + user_phone + "', '" + from_me + "', '" + (data.messages[i].message ? data.messages[i].message.replace(/'/g, "''") : "") + "', '" + formattedDate + "')";
            else
                values += "('" + data.call.id + i + "', '" + user_phone + "', '" + from_me + "', '" + (data.messages[i].message ? data.messages[i].message.replace(/'/g, "''") : "") + "', '" + formattedDate + "'), ";
        }
    } catch (e) {
        console.log(e);
    }
    let query = 'INSERT INTO messages(id, chat_id, from_me, content, timestamp) VALUES ' + values
    console.log(query);
    return new Promise((resolve, reject) => {
        try {
            pool.query(query).then(response => {
                console.log("Successfully added a message " + data.call.id);
                resolve(true);
            }).catch(err => {
                console.log("error while addMessage ", err);
                reject(err);
            })
        } catch (e) {
            reject(e);
        }
    });
}

exports.viewHistory = (phone) => {
    let query = "SELECT * FROM messages WHERE chat_id = '" + phone + "' ORDER BY timestamp DESC LIMIT 10";
    return new Promise((resolve, reject) => {
        try {
            pool.query(query).then(response => {
                resolve(response.rows);
            }).catch(err => {
                console.log("error while addMessage ", err);
                reject(err);
            })
        } catch (e) {
            reject(e);
        }
    });
}
