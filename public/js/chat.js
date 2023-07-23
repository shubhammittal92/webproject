const socket = io()
// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


// templates

const messageTemplate =document.querySelector('#message-template').innerHTML
const locationMessageTemplate =document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML 

// options

const { username, room} =  Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild


    // height of the new message

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $newMessage.offsetHeight

    // height of messages container
    const containerHeight = $newMessage.scrollHeight
    // how far i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
           $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', (message) =>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
const html = Mustache.render(sidebarTemplate, {
   room,
    users 
})
document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
e.preventDefault()

$messageFormButton.setAttribute('disabled', 'disabled')

const message = e.target.elements.message.value

socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    if(error) {
        return console.log(error)
    }
    console.log('mesage deliverd')
})

})


$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('geolocation nit supported')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
console.log(position)
socket.emit('sendLocation',{
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
}, () => {
    $sendLocationButton.removeAttribute('disabled')
    console.log('location shared')
} )
    })

})


socket.emit('join', {username, room}, (error)  => {
    if(error){
        alert(error)
        location.href = '/'
    }
})

// socket.on('countUpdated',  (count) => {
//     console.log('the count has been updated', count)
// })



// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })