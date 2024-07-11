import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app=express();
const port=3000;
dotenv.config();
const db=new pg.Client({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE_NAME,
    port:5432
  });

  db.connect();
  

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
    res.render("index.ejs");``
});

 app.post("/add",async (req,res)=>{

  if(req.body["name"]!=='' ){
    const nam=req.body["name"];
    let  money=req.body["paisa"];
    if(!money){
     money=0;
    }

   const fin= await db.query(`SELECT * FROM friends_list WHERE name='${nam}'`);
   
   if(fin.rows.length>0){

    var old_money=parseFloat(fin.rows[0].money);
 
    var new_money=old_money+parseFloat(money);

    await db.query(" UPDATE friends_list SET money=$1 WHERE name=$2", [new_money, nam])
   }
   else{
    
    await db.query("INSERT INTO friends_list (name, money) VALUES ($1,$2)",[nam,money]);

   }
  
  const result=await db.query("SELECT sum(money) FROM friends_list");

  const mo=result.rows[0].sum;

  const tabl=await db.query("Select * FROM friends_list");

  res.render("index.ejs",{

    data:tabl.rows,
    mo:mo,
   });
  }
  else{
    res.render("index.ejs");

  }
 
  
})
app.post("/increase",async (req,res)=>{

const told=req.body.mon;

const nam=req.body.name;

const current=req.body.money;

let rise=parseFloat(told)+parseFloat(current);

await db.query("UPDATE friends_list SET money=$1 WHERE name=$2", [rise, nam]);


const result=await db.query("SELECT sum(money) FROM friends_list");

const mo=result.rows[0].sum;

const tabl=await db.query("Select * FROM friends_list");

res.render("index.ejs",{
  data:tabl.rows,
  mo:mo,
});


});
app.get("/result",async (req,res)=>{
    
  const result=await db.query("SELECT sum(money) FROM friends_list");

  const mo=result.rows[0].sum;

  const re=await db.query("Select * FROM friends_list");
  
  const num=re.rowCount;
  
  const money_per_head=mo/num;

  const dene=await db.query("Select ($1)-money from friends_list",[money_per_head]);
  
  const values = dene.rows;

  console.log(values);

   
    
  
 const tabl=await db.query("Select * FROM friends_list");

  res.render("index.ejs",{
    data:tabl.rows,
    mo:mo,
    left:values
   });


})
app.listen(port,()=>{
    console.log(`Server running at port ${port}`);
})
