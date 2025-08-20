import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import env from "dotenv";
env.config();


const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

let books=[];

const app=express();
const port=3000;
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.get("/",async(req,res)=>{
    try{
   const result= await db.query("select * from Books order by book_rating desc");
   books=result.rows;
   
    res.render("index.ejs",{
        header:"BOOKS READ",
        booksList:books,

    });
}catch(err){
    console.log(err);
}
});

app.post ("/add",async(req,res)=>{
   const newTitle= req.body.newBook;
   const notes=req.body.newNotes;
   const rate=req.body.newRating;
   const date=req.body.newDate;
   try{
   await db.query("insert into books (book_title,book_notes,book_rating,book_date) values ($1,$2,$3,$4)",[newTitle,notes,rate,date]);
   res.redirect("/");
   }catch(err){
    console.log(err);
   }
});

app.post("/delete",async(req,res)=>{
    const id=req.body.deleteBookId;
    try{
     await db.query("delete from books where id = $1",[id]);
    res.redirect("/");
    }catch(err){
        console.log(err);
    }
});

app.post("/edit",async(req,res)=>{
   const id=req.body.bookid;
  
   const result=await db.query("select * from books where id=$1",[id]);
   const lists=result.rows;
    
   
    
  res.render("edit.ejs",{
    editTitle:"EDIT FORM",
    submit:"UPDATE FORM",
    lists:lists
   
});
    
});
app.post("/update",async(req,res)=>{
    const bookId=req.body.updatedId;
    const bookTitle=req.body.updateTitle;
    const bookNotes=req.body.updateNotes;
    const bookRate=req.body.updateRating;
    const bookDate=req.body.updateDate;
    await db.query("update books set book_title=$1,book_notes=$2,book_rating=$3,book_date=$4 where id=$5",[bookTitle,bookNotes,bookRate,bookDate,bookId]);
    res.redirect("/");

});

app.listen(port,()=>{
    console.log(`server running on port${port}`);
});