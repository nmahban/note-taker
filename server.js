const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");


const app = express();
const PORT = process.env.PORT || 3001;

//middleware// 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));



//HTML Routes//

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "notes.html"));
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});



//API Routes//

app.get("/api/notes", (req, res) => {
  fs.readFile(path.join(__dirname, "db", "db.json"), "utf8", (err, data) => {
    if (err) throw err;
    res.json(JSON.parse(data));
  });
});

app.post("/api/notes", (req, res) => {
  const newNote = { ...req.body, id: uuidv4() };
  fs.readFile(path.join(__dirname, "db", "db.json"), "utf8", (err, data) => {
    if (err) throw err;
    const notes = JSON.parse(data);
    notes.push(newNote);
    fs.writeFile(
      path.join(__dirname, "db", "db.json"),
      JSON.stringify(notes, null, 2),
      (err) => {
        if (err) throw err;
        res.json(newNote);
      }
    );
  });
});

//Delete Route//

app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  fs.readFile(path.join(__dirname, "db", "db.json"), "utf8", (err, data) => {
    if (err) {
      console.error("Error reading db.json:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    let notes = JSON.parse(data);
    const filteredNotes = notes.filter((note) => note.id !== id);

    fs.writeFile(
      path.join(__dirname, "db", "db.json"),
      JSON.stringify(filteredNotes, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing to db.json:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.status(200).json({ message: "Note deleted" });
      }
    );
  });
});

//server start//

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
