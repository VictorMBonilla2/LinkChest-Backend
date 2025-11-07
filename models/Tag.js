import mongoose from "mongoose";

const TagEsquema= new mongoose.Schema({
    name : {type: String, require: true},
    fechaGuardado: {type: Date , default: Date.now}
});

export default mongoose.model("Tag",TagEsquema)