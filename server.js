var http = require('http')
var express = require('express')
var app = express()

app.get('',(req,res)=>{res.sendFile(__dirname+'/web.html')})

http.createServer(app).listen(8888,function(){
    console.log("http://127.0.0.1:8888")
})