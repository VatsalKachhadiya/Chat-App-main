const genMsg = (username,text)=>{
    return {
        username,
        text,
        createdAt:new Date().getTime()
    }
}
const genImg = (username,url)=>{
    return {
        username,
        url,
        createdAt:new Date().getTime()
    }
} 
module.exports = {
    genMsg,
    genImg
}