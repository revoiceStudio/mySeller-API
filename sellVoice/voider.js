require('json-dotenv')('.config.json')
require('dotenv').config({path:'credentials.env'})
const express = require('express')
const router = require('./router')
const redis = require('redis');

const client = redis.createClient();
client.auth(process.env.redisAuth)

const app = express()


app.use(express.json())

app.use('/sellVoice',(req,res,next)=>{
    req.cache = client
    next()
})
app.use('/sellVoice',router)

app.listen(process.env.port, ()=>{
    console.log("sellVoice port is "+ process.env.port)
})