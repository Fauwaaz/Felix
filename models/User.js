const bcrypt = require('bcryptjs')
const usersCollection = require('../db').db().collection('users')
const validator = require("validator")
const md5  = require("md5")

let User = function (data, getAvatar) {
    this.data = data
    this.errors = []
    if(getAvatar == undefined) {getAvatar = false}
    if(getAvatar) {this.getAvatar()}
}

User.prototype.cleanUp = function () {
    if (typeof (this.data.username) != "string") { this.data.username = "" }
    if (typeof (this.data.email) != "string") { this.data.email = "" }
    if (typeof (this.data.password) != "string") { this.data.password = "" }

    // Get rid of bogus properties
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password.trim().toLowerCase()
    }
}

User.prototype.validate = function() {
    return new Promise(async (resolve, reject) => {
        if (this.data.username == "") { this.errors.push("You Just Provide and Username") }
        if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) { this.errors.push('Username must be only letters and numbers') }
        if (!validator.isEmail(this.data.email)) { this.errors.push("You Just Provide and email") }
        if (this.data.password == "") { this.errors.push("You Just Provide and password") }
        if (this.data.password.length > 0 && this.data.password.length < 10) { this.errors.push("Password must be atleast 12 characters") }
        if (this.data.password.length < 0) { this.errors.push("Password could not be greater than 100 characters") }
        if (this.data.username.length > 0 && this.data.username.length < 3) { this.errors.push("Username must be atleast 12 characters") }
        if (this.data.username.length > 10) { this.errors.push("username could not be greater than 10 characters") }
    
        // Only if username is valid then check to see if it's already taken
        if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
            let usernameExists = await usersCollection.findOne({ username: this.data.username })
            if (usernameExists) { this.errors.push("That username is already taken.") }
        } 
    
        if (validator.isAlphanumeric(this.data.email)) {
            let emailExists = await usersCollection.findOne({ email: this.data.email })
            if (emailExists) { this.errors.push("That Email is already being used.") }
        } 
        resolve()
    })
}

User.prototype.login = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        const attemptedUser = await usersCollection.findOne({ username: this.data.username })
        if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
            this.data = attemptedUser
            this.getAvatar()
            resolve('Congrats!')
        } else {
            reject("Invalid Username / Password")
        }
    })
}

User.prototype.register = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp();
        await this.validate();
    
        if (!this.errors.length) {
            // Hash user password
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            await usersCollection.insertOne(this.data)
            this.getAvatar()
            resolve()
        } else [
            reject(this.errors)
        ]
        
    })    
}

User.prototype.getAvatar = function() {
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=120`
}

User.findByUsername = function(username) {
    return new Promise(async (resolve, reject) => {
        if(typeof(username) != "string") {
            reject("Username must be a string")
            return
        }
        usersCollection.findOne({username: username})
        .then(function(userDoc){
            if(userDoc){
                userDoc = new User(userDoc, true)
                userDoc = {
                    _id: userDoc.data._id,
                    username: userDoc.data.username,
                    avatar: userDoc.avatar
                }
                resolve(userDoc)
            } else {
                reject("User not found")
            }
        })
        .catch(function(){
            reject("Username not found")

        })
    })
}


User.doesEmailExist = function(email) {
    return new Promise(async function(resolve, reject) {
        if(typeof(email) != "string") {
            resolve(false)
            return
        }

        let user = await usersCollection.findOne({email: email})
        if(user) {
            resolve(true)
        } else {
            resolve(false)
        }
    })
}

module.exports = User