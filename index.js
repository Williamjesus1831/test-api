const express = require('express')
const mongoose = require('mongoose');
const userSchema = require('./model/User')
require('dotenv').config();

const usersRouter = require('./routes/UserRoutes')

const DbUri = process.env.MONGODB_URI;

const app = express()
app.use(express.static('public'));
app.use(express.json())

const User = mongoose.model('User', userSchema)

const PORT = 4000

mongoose.connect(DbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexão bem-sucedida com o MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Erro ao conectar com o MongoDB Atlas:', error);
  });

app.use('/users', usersRouter)

app.get('/usuarios', async (req, res) => {
  const users = await User.find()
  if (users.length > 0) {
    res.status(200).send({ "lista de usuarios: ": users })
  } else {
    res.status(404).send('nao ha usuarios')
  }

})

app.post("/registrar", async (req, res) => {
  const json = req.body
  const userExist = await User.findOne({ name: json.name })

  if (userExist) {
    console.log(userExist)
    return res.status(500).send('ja existe este usuario')
  }

  const newUser = new User({
    name: json.name,
    age: json.age
  })

  newUser.save().then(() => {
    res.status(200).send('usuario criado')
  })

})

app.delete('/deletar', (req, res) => {
  const userToDelete = req.body

  User.findOneAndDelete({ name: userToDelete.name }).then((deletedUser) => {
    if (deletedUser) {
      res.status(200).send('usuário apagado');
    } else {
      res.status(404).send('usuário não encontrado');
    }
  }).catch((err) => {
    res.status(500).send('nao foi possivel apagar usuariol')
  })



})

app.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `)
})

module.exports = app