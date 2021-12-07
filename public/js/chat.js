
//ELments
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messgaeFormButton = document.querySelector('#sub_btn')
const $sendLocBtn = document.querySelector('#loc')
const $messages = document.querySelector('#messages')


const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebar = document.querySelector('#sidebar').innerHTML
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const socket = io()

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomData',({room,users}) =>{
const html = Mustache.render(sidebar,{
    room,
    users
})


document.querySelector('#sidebar-left').innerHTML = html
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messgaeFormButton.setAttribute('disabled','disabled')
    const msg = e.target.elements.msg.value
    socket.emit('message',msg,(error)=>{
    $messgaeFormButton.removeAttribute('disabled')
    $messageFormInput.value =''
    $messageFormInput.focus()
        if(error)
        {
            return console.log(error)
        }
        console.log("Message has been delevirred")
    })
})
$sendLocBtn.addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('Gelocation is not supported by your Browser')
    }
    $sendLocBtn.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendLocation',{
            lat:position.coords.latitude,
            long:position.coords.longitude
        },()=>{
            $sendLocBtn.removeAttribute('disabled')
            console.log("Location Shared")
        })
    })

})
socket.emit('join',{username,room} ,(error)=>{
    if(error)
    {
        alert(error)
        location.href = '/'
    }
})