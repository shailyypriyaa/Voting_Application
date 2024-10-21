const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unqiue: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }

})

// pre is used just before saving
userSchema.pre('save',async function(next){
    const person = this;
    
    // has the password been modedfied earlier or not and its new
    if(!person.isModified('password')) return next();
    try {

        
        // hash password generate
        const salt = await bcrypt.genSalt(10);

        // hash
        const hashpassword = await bcrypt.hash(person.password,salt);
        // overridding the password
        person.password = hashpassword;


        next();
    } catch (error) {
        return next(error);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword){
try {
    const isMatch = await bcrypt.compare(candidatePassword,this.password);
    return isMatch;
} catch (error) {
    throw error;
}}


const user = mongoose.model('User',userSchema);
module.exports = user; 


