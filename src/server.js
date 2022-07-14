const express = require('express')
const app = express()

const puerto = process.env.PORT || 8080
const path = require('path')
const database = require('../db/db-sqlite.js');
const dbMariadb = require('../db/db-maria')


const { Server: IOServer } = require('socket.io')
const { engine } = require("express-handlebars")

const Contenedor = require('../controllers/Contenedor')
const productosContenedor = new Contenedor(dbMariadb, "producto")
const ContainerMessages = require('../controllers/messageContainer')
const messagesContainer = new ContainerMessages(database, "mensaje")

const expressServer = app.listen(puerto, (err) => {
    if (err) {
        console.log(`Se produjo un error al iniciar el servidor: ${err}`)
    } else {
        console.log(`Servidor escuchando puerto: ${puerto}`)
    }
})

const io = new IOServer(expressServer)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/public')))


const error404 = (req, res, next) => {
        let mensajeError = {
            error: "-2",
            descripcion: `ruta: ${req.url} método: ${req.method} no implementado`
        }
        res.status(404).json(mensajeError)
        next()
    }
    //Ruta NO encontrada
app.use(error404)

// LADO SERVIDOR
io.on('connection', async socket => {
    console.log('se conecto un usuario')
    const productos = await productosContenedor.getAll()

    io.emit('serverSend:Products', productos) //envio todos los productos

    socket.on('client:enterProduct', async(productInfo) => {
        const { title, price, thumbnail } = productInfo
        await productosContenedor.newProduct(title, price, thumbnail)
        const productos = await productosContenedor.getAll()
        io.emit('serverSend:Products', productos)
    })

    const messages = await messagesContainer.getAllMessages()
    io.emit('serverSend:message', messages)

    socket.on('client:message', async(messageInfo) => {
        const { mail, tiempochat, message } = messageInfo
        await messagesContainer.newMessages(mail, tiempochat, message)
        const messages = await messagesContainer.getAllMessages()
        io.emit('serverSend:message', messages)
    })
})