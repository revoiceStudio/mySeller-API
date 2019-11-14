const pool = require('./db');


const saveAPIkey = (ID, apikey, callback)=>{
    console.log("saveAPIkey 호출됨.")
    const data = [ID, apikey, apikey]
    const param = {}
    const sql = 'insert into users (ID, apikey) values (?,?) ON DUPLICATE KEY UPDATE apikey=?, count=count+1'
    executeSQL(sql,data,param,callback)
}

const findAPIkey = (ID, callback)=>{
    console.log("findAPIkey 호출됨.")
    const data = [ ID, ID ]
    const param = {}
    const sql = 'select apikey from users where ID=? for update; update users SET count=count+1 where ID=?'
    executeSQL(sql,data,param,callback)
}
// SQL문 실행
const executeSQL = (sql, data, param, callback)=> {
    pool.getConnection((err,conn)=>{
        if(err){
            if(conn){
                conn.release()
            }
            callback(err,null);
            return
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId)

        const exec = conn.query(sql, data,(err,result)=>{
            conn.release()
            console.log("실행 대상 SQL : " + exec.sql)

            if(err){
                console.log("SQL 실행 시 오류 발생함.")
                console.dir(err)

                callback(err, null)
                return
            }
            callback(null, result, param)
        })
    })
}

module.exports = {saveAPIkey, findAPIkey}