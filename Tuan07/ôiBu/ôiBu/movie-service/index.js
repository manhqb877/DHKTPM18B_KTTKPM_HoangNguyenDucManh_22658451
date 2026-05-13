require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database giả lập (In-memory)
let movies = [
    { id: 'M01', title: 'Dune: Part Two', genre: 'Sci-Fi', price: 100000 },
    { id: 'M02', title: 'Kung Fu Panda 4', genre: 'Animation', price: 90000 },
    { id: 'M03', title: 'Godzilla x Kong', genre: 'Action', price: 120000 }
];

// API: Lấy danh sách phim (GET /movies)
app.get('/movies', (req, res) => {
    console.log('🎬 Lấy danh sách phim');
    res.status(200).json({
        message: "Lấy danh sách phim thành công",
        data: movies
    });
});

// API: Thêm phim mới (POST /movies)
app.post('/movies', (req, res) => {
    const { title, genre, price } = req.body;
    
    // Tạo ID ngẫu nhiên cho phim mới
    const newMovie = {
        id: `M${Date.now().toString().slice(-4)}`, // Lấy 4 số cuối của timestamp làm ID
        title,
        genre,
        price
    };
    
    movies.push(newMovie);
    console.log(`🎬 Đã thêm phim mới: ${title}`);
    
    res.status(201).json({
        message: "Thêm phim thành công",
        data: newMovie
    });
});

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
    console.log(`🍿 Movie Service đang chạy tại port ${PORT}`);
});