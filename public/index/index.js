document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatContainer = document.getElementById('chat-container');
    const Form = document.getElementById('addform')
    const groupListContainer = document.getElementById('groupsList-container');
    let token = localStorage.getItem('token'); 
    let groupId;
    Form.addEventListener('submit', addGroup)

    function addGroup(e){
        e.preventDefault()
        var groupName = document.getElementById('create-group').value

        var groupDetails = {
            groupname:groupName,
        }
        axios.post('http://localhost:3000/group/add-group', groupDetails, {
            headers: {'Authorization' : token}})
        .then((response) => {
            console.log(response)
            alert('Group added Successfully!')
        })
    }
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
        chatContainer.innerHTML = ''; // Clearing existing messages
        console.log('Rendered Message',messages)
        //decoding the token to get the name of the user
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const current_user = payload.name;
        messages.forEach(message => {
            const isSent = (message.name === current_user);
            let name
            if (message.name === current_user){
                name = "You";
            }
            else{
                name = message.name;
            }
            const messageContent = message.message;
            const time = message.time;
            const getMessageElement = createMessageElement(`${name}:`, `${messageContent}`, `${time}`, isSent);
            chatContainer.appendChild(getMessageElement);
        });
    }

    // // Function to save messages to local storage
    // function saveMessagesToLocalStorage(messages) {
    //     localStorage.setItem('messages', JSON.stringify(messages));
    // }

    // // Function to get messages from local storage
    // function getMessagesFromLocalStorage() {
    //     const messages = localStorage.getItem('messages');
    //     return messages ? JSON.parse(messages) : [];
    // }

    // Function to fetch new messages from the server
    // function fetchNewMessages() {
    //     const lastMessageId = localStorage.getItem('lastMessageId') || -1;

    //     axios.get(`http://localhost:3000/messages/get-new-messages?lastMessageId=${lastMessageId}`, {
    //         headers: {'Authorization': token}
    //     })
    //         .then(response => {
    //             const newMessages = response.data.messages;
    //             if (newMessages.length > 0) {
    //                 const storedMessages = getMessagesFromLocalStorage();
    //                 const mergedMessages = [...storedMessages, ...newMessages];
    //                 saveMessagesToLocalStorage(mergedMessages);

    //                 renderMessages(mergedMessages);
                    
    //                 // Updating lastMessageId
    //                 const latestMessageId = newMessages[newMessages.length - 1].id;
    //                 localStorage.setItem('lastMessageId', latestMessageId);
    //             }
    //         })
    //         .catch(err => console.log('Error fetching new messages:', err));
    // }

    // Function to handle sending messages
    function sendMessage() {
        const messageContent = messageInput.value.trim();
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (!messageContent) {
            alert('Please enter a message');
            return;
        }
        console.log(messageContent)
        const selectedGroup = groupListContainer.querySelector('.active');
        if (!selectedGroup) {
            alert('Please select a group to send the message');
            return;
        }
        const groupId = selectedGroup.getAttribute('data-group-id');
        console.log(groupId)
        axios.post('http://localhost:3000/messages/add-message', {
            messageContent: messageContent,
            groupId: groupId,
            time: currentTime
        }, {
            headers: { 'Authorization': token }
        })
        .then(response => {
            console.log(response);
            fetchMessages(groupId);
            messageInput.value = ''; // Clearing the input field after sending the message
        })
        .catch(error => {
            console.error('Error sending message:', error);
            alert('Error sending message. Please try again.');
        });
    }
    
     // Function to fetch groups and render them
    function fetchGroups() {
        axios.get('http://localhost:3000/group/all-groups', {
            headers: { 'Authorization': token }
        })
        .then(response => {
            renderGroups(response.data.groups);
        })
        .catch(error => {
            console.error('Error fetching groups:', error);
        });
    }

    // Function to render groups
function renderGroups(groups) {
    groupListContainer.innerHTML = '';
    groups.forEach(group => {
        console.log(group.id)
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group-list');
        const groupSpan = document.createElement('span');
        groupSpan.classList.add('group-lists')
        groupSpan.textContent = group.groupName;
        groupDiv.setAttribute('data-group-id', group.id);
        groupDiv.appendChild(groupSpan);
        groupDiv.addEventListener('click', function() {
            const currentActive = groupListContainer.querySelector('.active');
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            this.classList.add('active');
            // Fetching and rendering messages for the selected group
            fetchMessages(group.id);
        });
        groupListContainer.appendChild(groupDiv);
    });
}

    // Function to fetch and render messages for a specific group
    function fetchMessages(groupId) {
        groupId = groupId;
        axios.get(`http://localhost:3000/messages/group/${groupId}`, {
            headers: { 'Authorization': token }
        })
        .then(response => {
            renderMessages(response.data.messages);
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
        });
    }

    // Event listener for the send button
    sendButton.addEventListener('click', sendMessage);

     // Optional: Allow sending messages by pressing Enter
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    fetchGroups();
    // Fetching new messages every second
    // setInterval(fetchNewMessages, 1000);
    // fetchNewMessages()

    // // When the page loads, rendering messages from local storage
    // renderMessages(getMessagesFromLocalStorage());

    const groupUsersContainer = document.getElementById('groupUsersContainer');
    const userSelect = document.getElementById('userSelect');
    const addUserButton = document.getElementById('addUserToGroup');
    let selectedGroupId;

    // Fetch users for the selected group
    function fetchUsersForGroup(groupId) {
        axios.get(`http://localhost:3000/groups/${groupId}/users`)
            .then(response => {
                renderUsers(response.data.users);
            })
            .catch(error => {
                console.error('Error fetching users for group:', error);
            });
    }

    // Render users for the selected group
    function renderUsers(users) {
        const userList = document.getElementById('groupUsersList');
        userList.innerHTML = '';
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const current_user = payload.name;
        users.forEach(user => {
            const listItem = document.createElement('li');
            let name
            if (user.username === current_user){
                name = "You";
            }
            else{
                name = user.username;
            }
            listItem.textContent = name;
            userList.appendChild(listItem);
        });
    }

    // Fetch users and populate the user select dropdown
    function fetchAndPopulateUsers() {
        axios.get('http://localhost:3000/user/all-users')
            .then(response => {
                populateUserSelect(response.data.users);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }

    // Populate the user select dropdown
    function populateUserSelect(users) {
        userSelect.innerHTML = '';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            setSelectedUserId(user.id);
            userSelect.appendChild(option);
        });
    }

    // Event listener for group selection
    groupListContainer.addEventListener('click', function(event) {
        const selectedGroup = event.target.closest('.group-list');
        if (selectedGroup) {
            const clickedGroupId = selectedGroup.getAttribute('data-group-id');
            groupId = clickedGroupId;
            selectedGroupId = groupId;
            
            fetchUsersForGroup(groupId);
        }
    });

    // Event listener for adding user to group
    addUserButton.addEventListener('click', function() {
        const userId = userSelect.value;
        if (!userId) {
            alert('Please select a user to add');
            return;
        }
        axios.post(`http://localhost:3000/groups/${selectedGroupId}/users`, { userId })
            .then(response => {
                alert('User added to group successfully');
                fetchUsersForGroup(selectedGroupId);
            })
            .catch(error => {
                console.error('Error adding user to group:', error);
            });
    });

    const makeAdminButton = document.getElementById('makeAdminButton');
    const removeUserButton = document.getElementById('removeUserButton');
    let selectedUserId;

    // Event listener for making a user admin
    makeAdminButton.addEventListener('click', function() {
        if (!selectedUserId) {
            alert('Please select a user to make admin.');
            return;
        }
        axios.post(`http://localhost:3000/groups/${groupId}/users/${selectedUserId}/make-admin`)
            .then(response => {
                alert('User has been made admin successfully.');
            })
            .catch(error => {
                console.error('Error making user admin:', error);
                alert('Error making user admin. Please try again.');
            });
    });

    // Event listener for removing a user from the group
    removeUserButton.addEventListener('click', function() {
        if (!selectedUserId) {
            alert('Please select a user to remove from the group.');
            return;
        }

        axios.delete(`http://localhost:3000/groups/${groupId}/users/${selectedUserId}`)
            .then(response => {
                alert('User has been removed from the group successfully.');

            })
            .catch(error => {
                console.error('Error removing user from group:', error);
                alert('Error removing user from group. Please try again.');
            });
    });

    // Function to set selectedUserId when a user is selected
    function setSelectedUserId(userId) {
        selectedUserId = userId;
    }
    // Fetching groups and populate user select dropdown
    fetchAndPopulateUsers();
});
