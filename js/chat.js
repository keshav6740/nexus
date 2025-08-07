class ChatManager {
    constructor(userId) {
        this.userId = userId;
        this.ws = null;
        this.activeChat = null;
        this.initializeWebSocket();
        this.initializeEventListeners();
    }

    initializeWebSocket() {
        this.ws = new WebSocket(`ws://localhost:8000/ws/${this.userId}`);
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.sender_id === this.activeChat) {
                this.addMessageToChat(message, false);
            }
            this.updateMessagePreview(message);
        };

        this.ws.onclose = () => {
            // Attempt to reconnect
            setTimeout(() => this.initializeWebSocket(), 1000);
        };
    }

    initializeEventListeners() {
        // Send message button
        document.querySelector('.chat-input-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // Input field enter key
        document.querySelector('.chat-input-field input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Message list items
        document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', () => this.loadChat(item));
        });

        // Attachment button
        document.querySelector('.chat-input-action:has(.fa-paperclip)').addEventListener('click', () => {
            this.handleAttachment();
        });

        // Emoji button
        document.querySelector('.chat-input-action:has(.fa-smile)').addEventListener('click', () => {
            this.toggleEmojiPicker();
        });

        // Call buttons
        document.querySelector('.chat-action:has(.fa-phone)').addEventListener('click', () => {
            this.initiateCall('audio');
        });

        document.querySelector('.chat-action:has(.fa-video)').addEventListener('click', () => {
            this.initiateCall('video');
        });
    }

    async sendMessage() {
        const input = document.querySelector('.chat-input-field input');
        const content = input.value.trim();
        
        if (content && this.activeChat) {
            const message = {
                receiver_id: this.activeChat,
                content: content
            };

            this.ws.send(JSON.stringify(message));
            this.addMessageToChat({
                content: content,
                timestamp: new Date().toISOString()
            }, true);
            
            input.value = '';
        }
    }

    addMessageToChat(message, isSent) {
        const chatMessages = document.querySelector('.chat-messages');
        const messageHTML = `
            <div class="message ${isSent ? 'sent' : 'received'}">
                <div class="message-content">
                    <div class="message-bubble">
                        ${message.content}
                    </div>
                    <div class="message-meta">
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                        ${isSent ? '<span class="message-status"><i class="fas fa-check-double"></i></span>' : ''}
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.insertAdjacentHTML('beforeend', messageHTML);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async loadChat(item) {
        const userId = item.dataset.userId;
        const userName = item.querySelector('.message-name').textContent;
        const userStatus = item.querySelector('.message-status').classList.contains('online') ? 'online' : 'offline';
        const userAvatar = item.querySelector('img').src;

        // Update chat header with user info
        document.querySelector('.chat-user-name').textContent = userName;
        document.querySelector('.chat-user-status-text').textContent = userStatus;
        document.querySelector('.chat-avatar img').src = userAvatar;
        document.querySelector('.chat-user-status').className = `chat-user-status ${userStatus}`;

        this.activeChat = userId;
        
        // Update UI to show active chat
        document.querySelectorAll('.message-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Load chat history
        const response = await fetch(`/api/users/${this.userId}/messages?other_user_id=${userId}`);
        const messages = await response.json();
        
        // Clear current chat
        const chatMessages = document.querySelector('.chat-messages');
        chatMessages.innerHTML = '<div class="chat-date"><span>Today</span></div>';
        
        // Add messages to chat
        messages.forEach(message => {
            this.addMessageToChat(message, message.sender_id === this.userId);
        });
        
        // Mark messages as read
        fetch('/api/messages/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: this.userId, sender_id: userId })
        });
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    // Additional methods for other functionalities
    handleAttachment() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
            // Handle file upload
            const files = Array.from(e.target.files);
            // Implement file upload logic
        };
        input.click();
    }

    toggleEmojiPicker() {
        // Implement emoji picker
        console.log('Emoji picker not implemented');
    }

    initiateCall(type) {
        // Implement call functionality
        console.log(`Initiating ${type} call...`);
    }
}