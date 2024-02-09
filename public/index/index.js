document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatContainer = document.getElementById('chat-container');

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
    function renderMessages(messages) {
        // Clearing existing messages
        chatContainer.innerHTML = '';
        messages.forEach(message => {
            const name = message.name
            const messageContent = message.message
            const time = message.time
            const getMessageElement = createMessageElement(`${name}:`, `${messageContent}`, `${time}`);
            chatContainer.appendChild(getMessageElement);
        });
    }
    
    const token = localStorage.getItem('token')
    // Function to fetch all messages
    function getAllMessages() {
        axios.get("http://localhost:3000/messages/all-messages",{
        headers: {'Authorization' : token}
    })
            .then(response => {
                const messages = response.data.messages;
                console.log(messages)
                renderMessages(messages);
            })
            .catch(err => console.log('get messages frontend', err));
    }

    // Call the function to fetch all messages when the page loads
    getAllMessages();

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

        const token = localStorage.getItem('token');
        axios.post("http://localhost:3000/messages/add-message", Messages, {
            headers: {'Authorization' : token}})
            .then(response => console.log(response))
            .catch(err => console.log('postmessages frontend',err))
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
    // Continuously fetching messages every second
    setInterval(getAllMessages, 1000);
});
