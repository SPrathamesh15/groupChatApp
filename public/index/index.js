document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatContainer = document.getElementById('chat-container');
    let token = localStorage.getItem('token'); 

    // Function to create a new message element
    function createMessageElement(sender, content, time, isSent) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');

        const messageBodyDiv = document.createElement('div');
        messageBodyDiv.classList.add('message-body');

        if (isSent) {
            messageBodyDiv.classList.add('sent');
        } else {
            messageBodyDiv.classList.add('received');
        }

        const senderSpan = document.createElement('span');
        senderSpan.classList.add('sender');
        senderSpan.textContent = sender;

        const contentSpan = document.createElement('span');
        contentSpan.classList.add('message-content');
        contentSpan.textContent = content;

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('time');
        timeSpan.textContent = time;

        messageBodyDiv.appendChild(senderSpan);
        messageBodyDiv.appendChild(contentSpan);
        messageBodyDiv.appendChild(timeSpan);
        messageDiv.appendChild(messageBodyDiv);

        return messageDiv;
    }

    // Function to render messages
    function renderMessages(messages) {
        chatContainer.innerHTML = ''; // Clear existing messages
        messages.forEach(message => {
            const name = message.name;
            const messageContent = message.message;
            const time = message.time;
            const getMessageElement = createMessageElement(`${name}:`, `${messageContent}`, `${time}`);
            chatContainer.appendChild(getMessageElement);
        });
    }

    // Function to save messages to local storage
    function saveMessagesToLocalStorage(messages) {
        localStorage.setItem('messages', JSON.stringify(messages));
    }

    // Function to get messages from local storage
    function getMessagesFromLocalStorage() {
        const messages = localStorage.getItem('messages');
        return messages ? JSON.parse(messages) : [];
    }

    // Function to fetch new messages from the server
    function fetchNewMessages() {
        const lastMessageId = localStorage.getItem('lastMessageId') || -1;

        axios.get(`http://localhost:3000/messages/get-new-messages?lastMessageId=${lastMessageId}`, {
            headers: {'Authorization': token}
        })
            .then(response => {
                const newMessages = response.data.messages;
                if (newMessages.length > 0) {
                    const storedMessages = getMessagesFromLocalStorage();
                    const mergedMessages = [...storedMessages, ...newMessages];
                    saveMessagesToLocalStorage(mergedMessages);

                    renderMessages(mergedMessages);
                    
                    // Updating lastMessageId
                    const latestMessageId = newMessages[newMessages.length - 1].id;
                    localStorage.setItem('lastMessageId', latestMessageId);
                }
            })
            .catch(err => console.log('Error fetching new messages:', err));
    }

    // Function to handle sending messages
    function sendMessage() {
        const messageContent = messageInput.value.trim();
        if (messageContent === '') return;
    
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
        const sentMessageElement = createMessageElement('You:', messageContent, currentTime, true);
        chatContainer.appendChild(sentMessageElement);
    
        const Messages = {
            messageContent: messageContent,
            time: currentTime
        }
    
        console.log('Sending message:', Messages);
    
        axios.post("http://localhost:3000/messages/add-message", Messages, {
            headers: {'Authorization' : token}})
            .then(response => {
                console.log('Response from server:', response); 
                // If the message is successfully added, we will update the local storage and fetch new messages
                fetchNewMessages();
            })
            .catch(err => {
                console.log('Error sending message:', err); 
            })
    
        // Clearing the input field after sending the message
        messageInput.value = '';
    }
    

    // Event listener for the send button
    sendButton.addEventListener('click', sendMessage);

     // Optional: Allow sending messages by pressing Enter
     messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Fetching new messages every second
    setInterval(fetchNewMessages, 1000);

    // When the page loads, rendering messages from local storage
    renderMessages(getMessagesFromLocalStorage());
});
