const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tugasSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 1
    },
    judul: {
        type: String,
        required: true,
        unique: false,
        trim: false,
        minlength: 1
    },
    deadline: {
        type: Number,
        required: true,
        unique: false,
        trim: false,
        minlength: 1
    },
    deskripsi: {
        type: String,
        required: true,
        unique: false,
        trim: false,
        minlength: 1
    },
    email: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        minlength: 1
    },
}, {
    timestamps: true,
});

const Tugas = mongoose.model('Tugas', tugasSchema);

module.exports = Tugas;