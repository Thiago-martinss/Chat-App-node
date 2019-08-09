const socket = io()


//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageformButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $location = document.querySelector('#send-location')


//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoscroll = () => {
    //elemento da nova mensagem
    const $newMessage = $messages.lastElementChild
    //altura da nova mensagem
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //Altura visivel
    const visibleHeight = $messages.offsetHeight

    //Altura das mensagens do container
    const containerHeight = $messages.scrollHeight

    //Distancia do scroll

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {


    const html = Mustache.render(messageTemplate, {
        username: message.username,

        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {

    e.preventDefault()
    //disable
    $messageformButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value


    socket.emit('sendMessage', message, (error) => {
        $messageformButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log("Mensagem entregue!")
    })

})
socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$sendLocationButton.addEventListener('click', () => {

    if (!navigator.geolocation) {
        return alert('Geolocation não é suportado pelo seu navegador!')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')

            console.log("Localização compartilhada!")

        })

    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }



})