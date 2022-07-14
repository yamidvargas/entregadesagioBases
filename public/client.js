// Lado cliente
const socket = io()
    //Fecha

const tiempoTranscurrido = Date.now()
const hoy = new Date(tiempoTranscurrido)
const fecha = hoy.toLocaleDateString()
const tiempo = new Date()
const argHora = tiempo.toLocaleTimeString('it-IT')

// const hora= hoy.getHours()
// const horafinal= hora.toString().padStart(2,"0")

//CHAT 
const formChat = document.querySelector('#formChat')
const mailInput = document.querySelector('#mailInput')
const messageInput = document.querySelector('#messageInput')


const totalMessages = document.querySelector('#totalMessages')
    // EMITO MENSAJES AL SERVIDOR
function sendMessage() {
    try {
        const mail = mailInput.value
        const message = messageInput.value
        const tiempochat = `${fecha}, ${argHora}`
        console.log(tiempochat)
        socket.emit('client:message', { mail, tiempochat, message }) //emito el mensaje al servidor
    } catch (error) {
        console.log(`Hubo un error ${error}`)
    }
}
//RENDER MENSAJES E INSERTO HTML
function renderMessages(messagesArray) {
    try {
        const html = messagesArray.map(messageInfo => {
            return (`<div>
                <strong style="color: blue;" >${messageInfo.mail}</strong>[
                <span style="color: brown;">${fecha}, ${argHora}</span>]:
                <em style="color: green;font-style: italic;">${messageInfo.message}</em> </div>`)
        }).join(" ");

        totalMessages.innerHTML = html
    } catch (error) {
        console.log(`Hubo un error ${error}`)
    }
}

formChat.addEventListener('submit', event => {
    event.preventDefault()
    sendMessage()
    messageInput.value = ""
})


socket.on('serverSend:message', renderMessages);


const formProducts = document.querySelector('#formProducts')
const titleInput = document.querySelector('#title')
const priceInput = document.querySelector('#price')
const thumbnailInput = document.querySelector('#thumbnail')

const productosInsert = document.querySelector('#productosTabla')


function sendProduct() {
    try {
        const title = titleInput.value
        const price = priceInput.value
        const thumbnail = thumbnailInput.value

        socket.emit('client:enterProduct', { title, price, thumbnail })
    } catch (error) {
        console.log(`Hubo un error ${error}`)
    }
}

async function renderProducts(productsArray) {
    try {
        const response = await fetch('/plantilla.hbs')

        const plantilla = await response.text()

        if (productsArray.length > 0) {
            document.querySelector('#noProducts').innerHTML = ""
            document.querySelector('#productosTabla').innerHTML = ""
            productsArray.forEach(product => {
                const template = Handlebars.compile(plantilla)
                const filled = template(product)
                document.querySelector('#productosTabla').innerHTML += filled
            });
        } else {
            document.querySelector('#noProducts').innerHTML = ("<h4>No hay ninguna producto :(</h4>")
        }

    } catch (error) {
        console.log(`Hubo un error ${error}`)
    }
}

formProducts.addEventListener('submit', event => {
    event.preventDefault()
    sendProduct()
    formProducts.value = ""
})


socket.on('serverSend:Products', productos => {
    renderProducts(productos)
});