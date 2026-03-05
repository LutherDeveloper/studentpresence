const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"attendance_system"
});

db.connect(err=>{
    if(err) console.log(err);
    else console.log("Database Connected ✅");
});

/* =========================
   MIDDLEWARE
========================= */

function adminAuth(req,res,next){
    if(req.session.admin) next();
    else res.status(401).json({message:"Admin Unauthorized"});
}

function studentAuth(req,res,next){
    if(req.session.student) next();
    else res.status(401).json({message:"Student Unauthorized"});
}

/* =========================
   ADMIN LOGIN
========================= */

app.post("/admin/login",(req,res)=>{
    const {username,password} = req.body;

    db.query("SELECT * FROM admin WHERE username=?",[username],
    async(err,result)=>{
        if(result.length==0) return res.json({message:"Admin not found"});
        const valid = await bcrypt.compare(password,result[0].password);
        if(valid){
            req.session.admin = username;
            res.json({message:"Admin login success"});
        }else{
            res.json({message:"Wrong password"});
        }
    });
});

/* =========================
   STUDENT LOGIN
========================= */

app.post("/student/login",(req,res)=>{
    const {student_id,password} = req.body;

    db.query("SELECT * FROM students WHERE student_id=?",[student_id],
    async(err,result)=>{
        if(result.length==0) return res.json({message:"Student not found"});
        const valid = await bcrypt.compare(password,result[0].password);
        if(valid){
            req.session.student = student_id;
            res.json({message:"Student login success"});
        }else{
            res.json({message:"Wrong password"});
        }
    });
});

/* =========================
   STUDENT ATTENDANCE
========================= */

app.post("/attendance",studentAuth,(req,res)=>{
    const {status} = req.body;
    const student_id = req.session.student;

    db.query("SELECT name FROM students WHERE student_id=?",[student_id],
    (err,result)=>{
        const name = result[0].name;

    const now = new Date();
    const hour = now.getHours();
    let finalStatus = status;

    if(status === "Check In" && hour >= 9){
    finalStatus = "Late";
    }

    db.query(
    "INSERT INTO attendance (student_id,name,time,status) VALUES (?, ?, NOW(), ?)",
    [student_id,name,finalStatus],
            ()=> res.json({message:"Attendance recorded"})
        );
    });
});

/* =========================
   ADMIN VIEW ATTENDANCE
========================= */

app.get("/attendance",adminAuth,(req,res)=>{
    db.query("SELECT * FROM attendance ORDER BY time DESC",
    (err,result)=>{
        res.json(result);
    });
});

app.listen(3000,()=>console.log("Running on http://localhost:3000 🚀"));