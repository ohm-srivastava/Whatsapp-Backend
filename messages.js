import mongoose from 'mongoose'

const schema = mongoose.Schema({
    message: String,
    name: String, 
    timestamp: String,
    recevied: Boolean
});

export default mongoose.model("messagecontents", schema)