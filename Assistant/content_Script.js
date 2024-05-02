document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "'") {
        chrome.storage.local.get(['API'], (res) => {
            if(res.API){
                sendSelectedText(res.API);
            }else{
                    alert("Please set your API key in the extension options.");
            }
        })
    }
});

function sendSelectedText(API){
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