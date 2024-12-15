import {DB} from "./connect.js";
import express from "express";
import bodyParser from "body-parser";

const app = express(); //creer un petit serveur pour faire des req res
app.use(bodyParser.json()); // convertie le json en js object
var nmbJokes;
app.get("/", (req,res)=>{
    res.status(200);
    res.send("page de base online");
    
});

app.post("/jokes/addJoke", (req, res)=>{
    console.log("le req.body : ",req.body)

    res.set("content-type", "application/json"); //res.set = Express set Content-Type header to specified value, but won’t automatically convert the response body to JSON contrary to res.json
    const sql= "INSERT INTO jokes(question, answer) VALUES (?,?)";
    let newId; 
    try {
        DB.run(sql, [req.body.question, req.body.answer], function(err){
            if (err)throw err;

            newId = this.lastID;// donne auto increment pour id_joke
            console.log("la new Id est ", newId)
            res.status(201);
            let data = {status: 201, message: "Joke number "+newId+" registered."};
            let content =JSON.stringify(data);
            res.send(content);
        });
    } catch (err) {
        console.log(err.message);
        res.status(468); //468 code sans signification mais quand meme erreur qqchose
        res.send('{"code":468, "status": }'+ err.message);
    }
});
app.get("/jokes", ( req, res) =>{
    res.set("content-type", "application/json"); //res.set = Express set Content-Type header to specified value, but won’t automatically convert the response body to JSON contrary to res.json
    const sql= "SELECT * FROM jokes";
    let data = {jokes: []};
    try{
        DB.all(sql, [], (err, rows)=> {  //DB.all prend tout les rows tandis que DB.get n'en prend qu'un
            if (err) throw err; //balance a "catch";
            var i = 1;
            rows.forEach(row => {
                data.jokes.push({id: row.id_joke, question: row.question , answer: row.answer});
                
                console.log ("Dans le all Jokes le foreach est à", i);
                i++;
            });
            let content = JSON.stringify(data);
            res.send(content);
        })
    }catch(err){
        console.log(err.message);
        res.status(467); //467 code erreur sans signification mais quand meme erreur
        res.send('{"code":467, "status": }'+ err.message);
    }
});

app.get("/jokes/selectedJoke/:id", (req, res) =>{
    res.set("content-type", "application/json");
    const sql = "SELECT * FROM jokes WHERE id_joke = ?";
    let data = {jokes : []};
    try {
       DB.get(sql,[req.params.id],(err,row)=>{
        console.log("Dans le selected Joke l'id est à "+ req.params.id);
        if (err) throw err;
        data.jokes.push({id: row.id_joke, question: row.question, answer: row.answer})
        console.log("Dans le selected Joke apres le push l'id est à "+ req.params.id);
        let content = JSON.stringify(data);
        res.send(content);
       }); 
    } catch (err) {
        console.log(err.message);
        res.status(467); 
        res.send('{"code":467, "status": }'+ err.message);
    }
});



app.get("/jokes/count", (req,res) =>{
    res.set("content-type", "application/json");
    const sql = "SELECT COUNT(*) AS count FROM jokes";
    try{
        DB.get(sql, [], (err, row) => {
            if (err) throw err;
            res.status(200).json({count : row.count});
            nmbJokes = row.count;
            console.log("nmbJokes = " + row.count +" et est de type "+ typeof(nmbJokes));
        })
    }catch(err) {
        console.log(err.message);
        res.status(600); 
        res.send('{"code":600, "status": }'+ err.message);
    }

});

//------------------------
/*function countJokes(){
    const sql = "SELECT COUNT(*) AS count FROM jokes";
    try{
        DB.get(sql, [], (err, row) => {
            if (err) throw err;
            nmbJokes = row.count;
            console.log("nmbJokes = " + row.count +" et est de type "+ typeof(nmbJokes));
        })
    }catch(err) {
        console.log(err.message);
    }

}*/
//------------------------
app.get("/jokes/randomJoke", async(req,res) =>{

    res.set("content-type", "application/json");
    const sql = "SELECT * FROM jokes WHERE id_joke = ?";
    let data = {joke : []};
    //---
    await fetch("http://localhost:5000/jokes/count");
    try{
        var randomId = 1 + Math.floor(nmbJokes * Math.random());
        console.log("le randomId est " + randomId);
        DB.get(sql,[randomId],(err,row)=>{
            if (err) throw err;
            data.joke.push({id: row.id_joke, question: row.question, answer: row.answer})
            let content = JSON.stringify(data);
            res.send(content)
        });
    }catch(err) {
        console.log(err.message);
        res.status(600); 
        res.send('{"code":600, "status": }'+ err.message);
    }

});

app.delete("/jokes/delete", ( req, res) =>{
    res.set("content-type", "application/json");
    const sql = "DELETE FROM jokes WHERE id_joke=?";
    try {
        DB.run(sql, [req.query.id], function(err){
            if (err) throw err;
            if (this.changes === 1) {
                res.status(200); 
                res.send({"message":"Joke number "+ req.query.id +" deleted"});
            }else{
                res.status(200); 
                res.send('{"message":"nothing to delete"}');
            }
        })
        
    } catch (error) {
        console.log(err.message);
        res.status(468);
        res.send('{"code": 468, "status": }'+ err.message);
    }
});

/*app.get("/jokes/random", (req, res) => {
    const sql = "SELECT COUNT(*) AS count FROM jokes"; 
    
    DB.get(sql, [], (err, row) => {
        if (err) {
            console.error("Erreur lors du comptage des blagues :", err.message);
            return res.status(500).json({ 
                code: 500,
                message: "Erreur serveur",
                error: err.message
            });
        }

        // Renvoi du nombre total d'ID (blagues) dans la base de données
        return res.status(200).json({
            count: row.count // row.count contient le nombre d'ID (blagues) dans la table "jokes"
        });
    });
});*/

app.listen(5000, (err)=>{
    if (err) {
        console.log("errr", err.message);
    }
    console.log("listening on port 5000");
});