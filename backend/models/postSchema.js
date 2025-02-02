const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    authorId: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    link: {
        type: String,
    },
    description: {
        type: String,
    },
    content: {
        type: String,
        required: true
    },
    images: {
        type: [String],
    },
    timeStamp: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;