import e from "express";
import bodyParser from "body-parser";
import axios from "axios"
import pg from "pg"
import { format, render, cancel, register } from 'timeago.js';

const app = e();
const port = 3000;
var bookSearchList = [];
var db = new pg.Client(
    {
        user: "postgres",
        host: "localhost",
        database: "book-review-website",
        password: "anish2305@",
        port: 5432
    }
)
var orderBy = "newest" ;

db.connect();

app.use(e.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",async (req,res)=>{
    var response;
    if(orderBy === "newest")
    {
        response = await db.query("SELECT * FROM book_review ORDER BY date_stamp DESC")
    }
    else if (orderBy === "oldest")
    {
        response = await db.query("SELECT * FROM book_review ORDER BY date_stamp ASC")
    }
    else if(orderBy === "rating")
    {
        response = await db.query("SELECT * FROM book_review ORDER BY rating DESC")
    }
    response.rows.forEach(element=>{
        element.date_stamp = format(element.date_stamp);
    })
    res.render("index.ejs",
        {
            orderBy: orderBy,
            books: response.rows
        }
    );
});

app.get("/bookSearch", (req,res)=>{
    res.render("bookSearch.ejs",
        {
            bookSearchList: bookSearchList,
        }
    )
    bookSearchList = [];
})

app.post("/bookSearchResultList", async (req,res)=>{
    var bookName = req.body.bookName;
    const response = await axios.get("https://openlibrary.org/search.json?title="+bookName)
    var bookSearchResult = response.data.docs
    if(bookSearchResult.length>10)
    {
        bookSearchResult = bookSearchResult.slice(0,11);
    }
    bookSearchResult.forEach(element => {
        bookSearchList.push({cover_id:element.cover_edition_key,book_title:element.title});
    });
    res.redirect("/bookSearch")
});

app.post("/bookDetails", (req,res)=>{
    res.render("bookDetails.ejs",
        {
            book_title: req.body.book_title,
            cover_id: req.body.cover_id,
            book_id: req.body.id
        }
    )
});

app.post("/submitBookReview", async (req,res)=>{

    const date = new Date();
    let time = date.getTime();
    await db.query("INSERT INTO book_review (book_name,cover_id,book_review,rating,date_stamp) VALUES ($1,$2,$3,$4,$5)",[req.body.book_title,req.body.cover_id,req.body.reviewOfBook,req.body.rating,time]);
    // await db.query("UPDATE book_review SET likes = likes + ($1) WHERE id = ($2)",[parseInt(req.body.likes),req.body.book_id]);
    res.redirect("/");
});

app.post("/viewBookReview", async (req,res)=>{
    const response = await db.query("SELECT * FROM book_review WHERE id = ($1)",[req.body.book_id]);
    const responseListOfSameBookName = (await db.query("SELECT * FROM book_review WHERE cover_id = ($1)",[req.body.cover_id])).rows
    responseListOfSameBookName.forEach(element=>{
        element.date_stamp = format(element.date_stamp);
    })
    if(responseListOfSameBookName.length<1)
    {
        responseListOfSameBookName = null
    }
    res.render("viewBookReview.ejs",
        {
            cover_id : response.rows[0].cover_id,
            book_title : response.rows[0].book_name,
            book_review : response.rows[0].book_review,
            rating : response.rows[0].rating,
            book_id : response.rows[0].id,
            otherResponse : responseListOfSameBookName
        }
    );
})

app.get("/orderByNewest", (req,res)=>{
    orderBy = "newest";
    res.redirect("/");
});

app.get("/orderByOldest", (req,res)=>{
    orderBy = "oldest";
    res.redirect("/");
});

app.get("/orderByRating", (req,res)=>{
    orderBy = "rating";
    res.redirect("/");
});

app.get("/home", (req,res)=>{
    res.redirect("/");
})

app.listen(port, console.log(`Server started at port ${port}.`));