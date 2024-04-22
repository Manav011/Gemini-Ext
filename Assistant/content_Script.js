var API;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.API) {
        API = request.API;
        // console.log('Message Listener ' + API);
    }
});

document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "'") {
        if(!API){
            // console.log('keydown ' + API);
            alert("Please set your API key in the extension options.");
        }else{
            sendSelectedText();
        }
    }
});

function sendSelectedText(){
    var msg = window.getSelection().toString();
    chrome.runtime.sendMessage({type: 'updateIcon', iconPath: 'images/waiting.png'});
    // console.log(msg);
    fetch('https://gemini-server-alpha.vercel.app/geminires', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ API,  msg })
    }).then(res => {
        chrome.runtime.sendMessage({type: 'updateIcon', iconPath: 'images/ready.png'});
        return res.json();
        
    }).then(data => {
        navigator.clipboard.writeText(data.text);
        // console.log(data.text);
    })
    .catch(err => {
        chrome.runtime.sendMessage({type: 'updateIcon', iconPath: 'images/error.png'});
        console.error('Error fetching or processing data: ', err);
    });
}