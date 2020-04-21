const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  name: String,
  passwordHash: String
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject.passwordHash
    delete returnedObject.__v
    delete returnedObject._id
  }
})

module.exports = mongoose.model('User', userSchema)

