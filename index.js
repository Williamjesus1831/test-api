const express = require('express')
const mongoose = require('mongoose');
const userSchema = require('./model/User')
const cors = require('cors')
require('dotenv').config();

const corsConfig = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

const usersRouter = require('./routes/UserRoutes')

const DbUri = process.env.MONGODB_URI;

const app = express()
app.use(cors(corsConfig))
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