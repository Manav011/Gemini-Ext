var isResponding = false;
let API;

document.getElementById('getStartedBtn').addEventListener('click', () => {
    chrome.storage.local.get(['API'], (res) => {
        if(res.API){
            API = res.API
            renderApiKeyOptions(res.API);
        }else{
            document.getElementById('carouselContainer').style.display = 'flex';
            document.getElementById('initial').style.display = 'none';
            initCarousel();
        }
    })
});

document.getElementById('chat').addEventListener('click', () => {
    chrome.storage.local.get(['API'], (res) => {
        if(res.API){
            API = res.API
            showChatWindow();
        }else{
            alert("Please provide your gemini API key first, Click on Get Started");
        }
    })
});



function renderApiKeyForm() {
    document.body.innerHTML = '';

    var form = document.createElement('form');
    form.style.width = '100%';
    form.style.textAlign = 'center';
    document.body.appendChild(form);

    var apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'text';
    apiKeyInput.placeholder = 'Paste your Gemini API key here...';
    apiKeyInput.className = 'input-field';
    apiKeyInput.style.marginTop = '20px';
    form.appendChild(apiKeyInput);

    var submitBtn = document.createElement('button');
    submitBtn.textContent = 'Save';
    submitBtn.className = 'button';
    submitBtn.style.marginTop = '20px';
    form.appendChild(submitBtn);

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        var newApiKey = apiKeyInput.value.trim();
        if (newApiKey) {
            chrome.storage.local.set({"API" : newApiKey})
            renderApiKeyOptions(newApiKey);
        }
    });
}

function renderApiKeyOptions(apiKey) {
    document.body.innerHTML = '';

    var apiKeyDisplay = document.createElement('div');
    apiKeyDisplay.textContent = 'Current API Key: ' + apiKey.substring(0, 5) + '...';
    apiKeyDisplay.style.marginTop = '20px';
    document.body.appendChild(apiKeyDisplay);

    var deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete API Key';
    deleteBtn.className = 'button';
    deleteBtn.style.marginTop = '20px';
    document.body.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', function() {
        chrome.storage.local.remove('API', () => {
            console.log("API deleted successfully");
        })
        renderApiKeyForm();
    });
}

function showChatWindow() {
    document.body.innerHTML = '';

    var chatContainer = document.createElement('div');
    chatContainer.id = 'chatContainer';

    var chatHeader = document.createElement('div');
    chatHeader.textContent = 'Chat with Bot';
    chatHeader.className = 'chat-header';

    var chatMessages = document.createElement('div');
    chatMessages.id = 'chatMessages';
    chatMessages.className = 'chat-messages';

    var userInput = document.createElement('input');
    userInput.placeholder = 'Type your message...';
    userInput.className = 'user-input';
    userInput.id = 'userInput';
    userInput.type = 'text';

    var sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send';
    sendBtn.className = 'button';
    sendBtn.id = 'sendBtn';

    var clearBtn = document.createElement('button');
    clearBtn.style.backgroundImage = "url('images/delete.png')";
    clearBtn.style.backgroundSize = 'cover';
    clearBtn.id = 'clearBtn';

    chatHeader.appendChild(clearBtn);
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chatMessages);
    chatContainer.appendChild(userInput);
    chatContainer.appendChild(sendBtn);

    document.body.appendChild(chatContainer);

    sendBtn.addEventListener('click', isResponding ? null : sendPrompt);

    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && isResponding === false) {
            sendPrompt();
        }
    });

    clearBtn.addEventListener('click', function() {
        chatMessages.innerHTML = '';
    });
}

function displayMessage(sender, message, isUser) {
    var chatMessages = document.getElementById('chatMessages');
    var messageElement = document.createElement('div');
    messageElement.style.padding = '5px 0';
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    
    messageElement.innerHTML = `<strong>${sender}</strong><br/>${message}`;
    messageElement.style.textAlign = isUser ? 'right' : 'left';
    // messageElement.style.borderBottom = "1px solid #ccc";

    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendPrompt() {
    var msg = userInput.value.trim();
    var sndbtn = document.getElementById('sendBtn'); 
    if (msg !== '') {
        displayMessage('You', msg, true);
        userInput.value = ''; 
        isResponding = true;
        sndbtn.style.backgroundColor = "#B6D9FF";
        chrome.runtime.sendMessage({type: 'updateIcon', iconPath: 'images/waiting.png'});
        sndbtn.textContent = 'Responding...';
        
        fetch('https://gemini-server-alpha.vercel.app/geminires', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ API,  msg })
        }).then(res => {
            chrome.runtime.sendMessage({type: 'updateIcon', iconPath: 'images/icon.png'});
            return res.json();
            
        }).then(data => {
            displayMessage('Bot', data.text, false);
            sndbtn.style.backgroundColor = "#007bff";
            sndbtn.textContent = 'Send';
            isResponding = false;
        })
        .catch(err => {
            chrome.runtime.sendMessage({type: 'updateIcon', iconPath: 'images/error.png'});
            console.error(err);
        });

        // setTimeout(function() {

        //     displayMessage('Bot', 'bot response', false);
        //     sndbtn.style.backgroundColor = "#007bff";
        //     chrome.runtime.sendMessage({type: 'updateIcon', iconPath: 'images/icon.png'});
        //     sndbtn.textContent = 'Send';
        //     isResponding = false;
        // }, 1000);
    }
}

function initCarousel() {
    var slides = document.querySelectorAll('.carousel-slide');
    var currentSlideIndex = 0;

    slides[currentSlideIndex].style.display = 'block';

    document.getElementById('prevBtn').addEventListener('click', function() {
        goToSlide(currentSlideIndex - 1);
    });

    document.getElementById('nextBtn').addEventListener('click', function() {
        goToSlide(currentSlideIndex + 1);
    });

    function goToSlide(index) {
        if(index == slides.length - 1){
            renderApiKeyForm();
        }
        else{

            slides[currentSlideIndex].style.display = 'none';
            
            currentSlideIndex = (index + slides.length) % slides.length;
            
            slides[currentSlideIndex].style.display = 'block';
        }
    }
}