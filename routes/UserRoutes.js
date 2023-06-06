const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken');

const userSchema = require('../model/User')
require('dotenv').config();

const User = mongoose.model('User', userSchema)

async function authMiddleware(req, res, next) {
  const token = req.body.token

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(500).send('logue novamente')
    }
    if (decoded) {
      req.user = decoded
    }
    next()
  })
}

router.post('/registrar', async (req, res) => {
  const user = req.body
  const userExist = await User.findOne({ name: user.name })

  if (userExist) {
    return res.status(200).send('usuario ja existe')
  }

  const passWordHash = await bcrypt.hash(user.passWord + process.env.BCRYPT_SECRET, 10)

  const newUser = new User({
    name: user.name,
    email: user.email,
    passWord: passWordHash,
    imageProfile: user.imageProfile
  })

  newUser.save().then(res.status(200).send('usuario criado'))
})

router.post('/login', async (req, res) => {
  try {
    const { passWord, email } = req.body

    const userExist = await User.findOne({ email: email })

    if (!userExist) {
      return res.status(200).send("nao existe usuario com este email")
    }

    const passWordIsCorrect = await bcrypt.compare(passWord + process.env.BCRYPT_SECRET, userExist.passWord)

    if (!passWordIsCorrect) {
      return res.status(200).send("a senha esta incorreta")
    }

    const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

    res.status(200).json({ token })

  } catch (error) {
    res.status(500).json({ message: 'Erro ao efetuar login.' });
  }
})

router.post('/info', authMiddleware, async (req, res) => {
  const userId = req.user.id
  const userData = await User.findById(userId, { passWord: 0 })

  res.status(200).send(userData)
})

module.exports = router