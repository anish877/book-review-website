import e from "express";
import bodyParser from "body-parser";
import axios from "axios"
import { format, render, cancel, register } from 'timeago.js';
import { createClient } from '@supabase/supabase-js'


const supabase = createClient('https://ilseygwhapzpptcmyvjs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsc2V5Z3doYXB6cHB0Y215dmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ1NTE2MjEsImV4cCI6MjA0MDEyNzYyMX0.fnDMsjPfjSaAo8-0iZfy_D35J90Qkyp-TUdPNls93_4')
const app = e();
const port = 3000;
var bookSearchList = [];
var orderBy = "newest" ;

app.use(e.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",async (req,res)=>{
    var response;
    if(orderBy === "newest")
    {
        response = await supabase
        .from('book_review')
        .select('*')
        .order('date_stamp', { ascending: false })


    }
    else if (orderBy === "oldest")
    {
        response = await supabase
        .from('book_review')
        .select('*')
        .order('date_stamp', { ascending: true })
    }
    else if(orderBy === "rating")
    {
        response = await supabase
        .from('book_review')
        .select('*')
        .order('rating', { ascending: false })
    }
    response.data.forEach(element=>{
        element.date_stamp = format(element.date_stamp);
    })
    res.render("index.ejs",
        {
            orderBy: orderBy,
            books: response.data
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
    await supabase
    .from('book_review')
    .insert([{book_name: req.body.book_title, cover_id: req.body.cover_id, book_review: req.body.reviewOfBook, rating: req.body.rating, date_stamp: time}])
    res.redirect("/");
});

app.post("/viewBookReview", async (req,res)=>{
    let { data: response, error } = await supabase
    .from('book_review')
    .select("*")
    .eq('id', req.body.book_id)
    let { data: responseListOfSameBookName, err } = await supabase
    .from('book_review')
    .select("*")
    .eq('cover_id', req.body.cover_id)    
    responseListOfSameBookName.forEach(element=>{
        element.date_stamp = format(element.date_stamp);
    })
    if(responseListOfSameBookName.length<1)
    {
        responseListOfSameBookName = null
    }
    res.render("viewBookReview.ejs",
        {
            cover_id : response[0].cover_id,
            book_title : response[0].book_name,
            book_review : response[0].book_review,
            rating : response[0].rating,
            book_id : response[0].id,
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
});

app.get("/github", (req,res)=>{
    res.redirect("https://github.com/anish877/book-review-website");
});

app.get("/contactUs", (req,res)=>{
    res.redirect("https://anish877.github.io/portfolio/");
})

app.listen(port, console.log(`Server started at port ${port}.`));