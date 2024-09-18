import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required!"],
        unique: true,
        lowercase: true,
        trim: true, /* For example, if the input for username is " john_doe ", with trim: true, Mongoose will store "john_doe" (removing the spaces before and after the string). This is useful to avoid unwanted extra spaces in fields like usernames or emails. */
        index: true, /* creates an index on the 'username' field */
    },

    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: true,
        lowercase: true,
        trim: true, 
    },

    fullname: {
        type: String,
        required: [true, "Fullname is required!"],
        trim: true, 
        index: true,
    },

    avatar: {
        type: String,
        required: [true, "Avatar is required!"],
    },

    coverImage: {
        type: String,
    },

    watchHistory: [
        {
            type: Schema.Types.ObjectId, // "mongoose.Schema.Types.ObjectId" yeh poora likhne ki need nahin hai, since maine oopar Schema import kar liya hai toh fir main mongoose.Schema likhne ki jagah kewal Schema likh sakta hoon 
            ref: "Video"
        }
    ],

    password: {
        type: String,
        required: [true, "Password is required!"]
    },

    refreshToken: {
        type: String,
    },

}, {timestamps: true});





// ismein humnein "pre" naam kaa middleware/hoo use kiya hai 'userSchema' ke oopar, toh jab bhi mera data jo hai databse mein jaayega usse pehle mera 'pre' middleware chal jayega, i.e. mera data databse mein save hone se pehle 'pre' middkeware chal jaayega or maine password ko encrypt karne 'pre' middleware kaa use kiya hai, i.e. jaise hi user apna data bhejega databse mein toh usse pehle mera password encrypt hoga or fir mera encrypted password jaayega databse mein. 
userSchema.pre("save", async function(next){ // "save" isliye likha hai kyoki hum chahte hain ki databse mein data save hone se pehle hum kuch karna chahte hain. Or humne arrow function use nahin kiya because arrow function humein 'this' ki functionality nahin provide karata hai, isliye humne normal function use kiya hai, jisee ki hum 'this.password' karke user kaa entered password ko access kar sake or usko fir encrypt kar sake
    if(!this.isModified("password")){ // mera yeh 'pre' middleware har baar chalega, i.e. user agar password ke alawa kuch or kaam bhi kar raha hai tab bhi yeh middleware chalega or mera har baar password encrypt hota rahega, toh isse bachne ke liye hum 'this.isModified' functionality kaa use karenge or yeh check karta hai ki user kaa password modifiy hua hai kya, agar hua hai toh fir encryption dobara se run kardo otherwise dobara se encrypt karne ki need nahin hai
        return next();
    }

    else{
        this.password = await bcrypt.hash(this.password, 10)
        next();
    }
});
/*yeh "pre" middlware/hook mongoose kaa hai, aise hi "save" ek method hai jo ki pre hook/middleware mein mein support karta hai, 
aise hi or bhi methods hain, like "validate", "remove", "updateOne", "deleteOne", "init"
*/


// khud kaa ek method bana rahe hain "isPasswordCorrect" naam se
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = async function(){
    const token = jwt.sign({_id: this._id, email: this.email, username: this.username, fullname: this.fullname}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY});
    return token;
};


userSchema.methods.generateRefreshToken = async function(){
    const token = jwt.sign({_id: this._id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY});
    return token;
}

export const User = mongoose.model("User", userSchema);


/* NOTE:- 
--> index: true (oopar username object mein jo likha hai uski meaning kya hai, see below:-)
How Index Works Technically:
Let's say you have 1 million users in your collection, and you want to find a user by their username:

--> User.findOne({ username: "john_doe" });

--> Without Index:
MongoDB would perform a full collection scan, checking every single document until it finds one with
username: "john_doe". The time complexity is O(n), where n is the number of documents in the collection.


--> With Index:
With an index on username, MongoDB does not need to scan the entire collection. Instead, it checks the index
(which is structured like a B-tree), allowing it to find the document much faster. The time complexity here is 
O(log n) due to the binary search-like behavior of B-trees.
*/