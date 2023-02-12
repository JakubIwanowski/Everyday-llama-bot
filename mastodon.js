const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

class Mastodon {
    #token;
    constructor(config) {
        this.#token = config.token;
        this.baseUrl = config.baseUrl;
        this.params = new URLSearchParams({
            access_token: this.#token
        })
    }
    listen(stream) {
        const self = this;
const ws = new WebSocket(`wss://${this.baseUrl}/api/v1/streaming?access_token=${this.#token}&stream=${stream}&type=subscribe`);
ws.on('error', console.error);
ws.on('close', function close() {
    console.log('disconnected');
  });
  ws.on('open', function open() {
    console.log('connected');
  });
ws.addEventListener('message', (data)=> {
    
})
ws.on('message', function message(data) {   
    const str = data.toString()
    const stream = JSON.parse(str);
    const payload = JSON.parse(stream.payload);
    if(payload.type === 'mention' && !payload?.account?.bot) {
        const acct = payload?.account?.acct;
        const replyId = payload?.status?.id
        const reply = `@${acct} Nose boop!`
        self.publishStatus(reply,'unlisted',replyId);
    }
  
  });
}
publishStatus(status,  visibility='private',imgId=false, replyTo=false) {
    const formData = new FormData();
    formData.append('status',status);
    formData.append('visibility',visibility)
    if(imgId) {
        formData.append('media_ids[]', imgId);
    }
    if(replyTo) {
        formData.append('in_reply_to_id', replyTo);
    }
    fetch(`https://${this.baseUrl}/api/v1/statuses/?` + this.params, {
        method: 'POST',
        body: formData
    }).then((res)=>{
        if(res.ok) {
           return res.json()
        } else {
            return Promise.reject(res); 
        }
    })
    .then(result=>console.log('Everything went well', result))
    .catch(error=>console.log('Oops:', error))
}
async uploadMedia(file, link) {
    const extension = path.extname(file)
    const formData = new FormData();
    const descriptions = [
        "Happy llama",
        "Concerned llama",
        "Intrigued llama",
        "Fluffy llama",
        "Confused llama",
        "Angry llama",
        "Judgy llama",
        "Llama looking into the void",
        "Llama thinking about llamas",
        "Llama thinking about sheep",
        "Llama dreaming about frolicking",
        "Llama dreaming about grass",
        "Just llama doing llama things",
        "Pirate llama disguised as a regular llama",
        "Viking llama disguised as a regular llama",
        "An alien pretending to be a llama",
        "Llama pretending to be a llama"
    ]
    formData.set('file', {
        name: `image${extension}`,
        [Symbol.toStringTag]: 'File',
        stream: () => fs.createReadStream(file) 
      })
    formData.append('description', descriptions[Math.floor(Math.random() * (descriptions.length - 1))])
    fetch(`https://${this.baseUrl}/api/v2/media/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + this.#token
        },
        body:formData
    }).then((res)=>{
        if(res.ok) {
           return res.json()
        } else {
            return Promise.reject(res); 
        }
    })
    .then(result=>this.publishStatus(link,'public', result.id))
    .then(res=>console.log('Everything went well'))
    .catch(error=>console.log('Oops:', error))
}
}
module.exports = Mastodon;