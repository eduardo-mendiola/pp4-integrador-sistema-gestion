// Socket.io client connection
const socket = io();

// Global variables
let currentUser = { id: null, name: 'Usuario' };
let activeConversation = null;
let allContacts = [];
let contactModal;
let deleteConfirmModal;

// DOM Elements (will be initialized on load)
let messagesList, chatForm, messageInput, currentContactName, contactsList, newChatBtn, contactSearch, contactList, deleteConversationBtn, conversationHeader, messagesContainer, inputArea, emptyState, confirmDeleteBtn;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize DOM elements
    messagesList = document.getElementById('messages');
    chatForm = document.getElementById('chatForm');
    messageInput = document.getElementById('messageInput');
    currentContactName = document.getElementById('current-contact-name');
    contactsList = document.getElementById('contactsList');
    newChatBtn = document.getElementById('newChatBtn');
    contactSearch = document.getElementById('contactSearch');
    contactList = document.getElementById('contactList');
    deleteConversationBtn = document.getElementById('deleteConversationBtn');
    conversationHeader = document.getElementById('conversationHeader');
    messagesContainer = document.getElementById('messagesContainer');
    inputArea = document.getElementById('inputArea');
    emptyState = document.getElementById('emptyState');
    confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Initialize Modals
    const contactModalEl = document.getElementById('contactModal');
    if (contactModalEl) {
        contactModal = new bootstrap.Modal(contactModalEl);
    }

    const deleteModalEl = document.getElementById('deleteConfirmModal');
    if (deleteModalEl) {
        deleteConfirmModal = new bootstrap.Modal(deleteModalEl);
    }

    // Set user data from session if available
    if (window.user) {
        currentUser.id = window.user._id;
        currentUser.name = window.user.username;
    } else {
        currentUser.id = document.querySelector('body').dataset.userId;
        currentUser.name = document.querySelector('body').dataset.userName;
    }

    // Event Listeners setup
    setupEventListeners();

    // Join user's conversation rooms
    if (currentUser.id) {
        socket.emit('join-conversations', currentUser.id);
    }

    // Load conversations
    await loadConversations();

    // Load all contacts for modal
    await loadAllContacts();

    // Setup socket event listeners AFTER all variables are initialized
    socket.on('chat-message', (data) => {
        const { message, conversationId } = data;

        // If message is for active conversation
        if (activeConversation && conversationId === activeConversation.conversationId) {
            const isSent = message.sender._id === currentUser.id;

            // Only show RECEIVED messages (sent messages already shown via optimistic update)
            if (!isSent) {
                appendMessage(message.text, isSent, message.timestamp, true);
                scrollToBottom();
            }
        }

        // Reload conversations to update last message
        loadConversations();
    });

    socket.on('new-message-notification', (data) => {
        console.log('New message notification received:', data);
        const { conversationId } = data;

        // Join the conversation room
        socket.emit('join-conversations', currentUser.id);

        // Reload conversations list
        loadConversations();
    });

    socket.on('connect', () => {
        console.log('✅ Connected to chat server');
    });

    socket.on('disconnect', () => {
        console.log('❌ Disconnected from chat server');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
        alert(error.message || 'Error en el chat');
    });
});

function setupEventListeners() {
    // New chat button
    if (newChatBtn) {
        newChatBtn.addEventListener('click', async () => {
            console.log('Opening contact modal...');
            await loadAllContacts();
            renderContactsModal(allContacts);
            if (contactModal) contactModal.show();
        });
    }

    // Delete conversation button
    if (deleteConversationBtn) {
        deleteConversationBtn.addEventListener('click', () => {
            if (!activeConversation) return;
            if (deleteConfirmModal) deleteConfirmModal.show();
        });
    }

    // Confirm delete button
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (deleteConfirmModal) deleteConfirmModal.hide();
            await handleDeleteConversation();
        });
    }

    // Search contacts
    if (contactSearch) {
        contactSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allContacts.filter(c =>
                (c.displayName && c.displayName.toLowerCase().includes(query)) ||
                c.username.toLowerCase().includes(query) ||
                (c.email && c.email.toLowerCase().includes(query))
            );
            renderContactsModal(filtered);
        });
    }

    // Chat form
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = messageInput.value.trim();

            if (message && activeConversation) {
                // Show message immediately in UI (optimistic update)
                appendMessage(message, true, new Date(), true);
                scrollToBottom();

                // Send via Socket.io
                socket.emit('chat-message', {
                    senderId: currentUser.id,
                    receiverId: activeConversation.contact._id,
                    text: message,
                    conversationId: activeConversation.conversationId
                });

                // Clear input
                messageInput.value = '';
            }
        });
    }
}

async function handleDeleteConversation() {
    if (!activeConversation) return;

    try {
        console.log(`Attempting to delete conversation: /chat/conversations/${activeConversation.conversationId}`);
        const response = await fetch(`/chat/conversations/${activeConversation.conversationId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            activeConversation = null;
            emptyState.style.display = '';
            emptyState.style.removeProperty('display');
            emptyState.style.display = 'flex';

            conversationHeader.style.display = 'none';
            messagesContainer.style.display = 'none';
            inputArea.style.display = 'none';
            messagesList.innerHTML = '';

            await loadConversations();
        } else {
            alert(data.message || 'Error al eliminar la conversación');
        }
    } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Error al eliminar la conversación');
    }
}

// Load conversations from API
async function loadConversations() {
    try {
        const response = await fetch('/chat/conversations');
        const data = await response.json();

        if (data.success) {
            renderConversations(data.conversations);
        }
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

// Render conversations list
function renderConversations(conversations) {
    contactsList.innerHTML = '';

    if (conversations.length === 0) {
        contactsList.innerHTML = '<p class="text-muted text-center p-3">No hay conversaciones</p>';
        return;
    }

    conversations.forEach(conv => {
        const item = document.createElement('div');
        item.className = 'contact-item';
        item.dataset.conversationId = conv.conversationId;
        item.dataset.contactId = conv.contact._id;
        item.dataset.contactName = conv.contact.username;

        const time = formatTime(conv.lastMessageTime);
        // Don't show badge for active conversation
        const isActive = activeConversation && activeConversation.conversationId === conv.conversationId;
        const unreadBadge = (conv.unreadCount > 0 && !isActive)
            ? `<span class="badge bg-primary rounded-pill">${conv.unreadCount}</span>`
            : '';

        const displayName = conv.contact.displayName || conv.contact.username;

        item.innerHTML = `
            <div class="d-flex align-items-center p-3">
                <div class="avatar me-3">
                    <i class="bi bi-person-circle fs-3 text-themed"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="contact-name text-themed">${displayName}</div>
                    <div class="last-message text-muted">${conv.lastMessage || 'Sin mensajes'}</div>
                </div>
                <div class="d-flex flex-column align-items-end">
                    <div class="time text-muted">${time}</div>
                    ${unreadBadge}
                </div>
            </div>
        `;

        item.addEventListener('click', () => selectConversation(conv));
        contactsList.appendChild(item);
    });
}

// Load all contacts for modal
async function loadAllContacts() {
    try {
        console.log('Fetching contacts from /chat/contacts...');
        const response = await fetch('/chat/contacts');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
            allContacts = data.contacts;
            console.log('All contacts set to:', allContacts);
            renderContactsModal(allContacts);
        } else {
            console.error('API returned success=false:', data);
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// Render contacts in modal
function renderContactsModal(contacts) {
    console.log('renderContactsModal called with:', contacts);
    console.log('contactList element:', contactList);

    contactList.innerHTML = '';

    if (contacts.length === 0) {
        contactList.innerHTML = '<p class="text-muted text-center p-3">No hay contactos disponibles</p>';
        console.log('No contacts to display');
        return;
    }

    console.log('Rendering', contacts.length, 'contacts');
    contacts.forEach((contact, index) => {
        console.log(`Rendering contact ${index}:`, contact);
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'list-group-item list-group-item-action';

        // Use displayName if available, otherwise username
        const name = contact.displayName || contact.username;
        const subtitle = contact.isEmployee ? contact.email : `@${contact.username}`;

        item.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-person-circle fs-4 me-3"></i>
                <div>
                    <div class="fw-bold">${name}</div>
                    <small class="text-muted">${subtitle}</small>
                </div>
            </div>
        `;

        item.addEventListener('click', (e) => {
            e.preventDefault();
            startNewConversation(contact);
        });

        contactList.appendChild(item);
        console.log('Contact item appended to contactList');
    });
    console.log('Finished rendering contacts. contactList.children.length:', contactList.children.length);
}

// Search contacts
contactSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allContacts.filter(c =>
        (c.displayName && c.displayName.toLowerCase().includes(query)) ||
        c.username.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query))
    );
    renderContactsModal(filtered);
});

// Start new conversation
async function startNewConversation(contact) {
    contactModal.hide();

    // Generate conversation ID
    const conversationId = generateConversationId(currentUser.id, contact._id);

    // Check if conversation already exists
    const existingConv = Array.from(contactsList.children).find(
        item => item.dataset.conversationId === conversationId
    );

    if (existingConv) {
        existingConv.click();
        return;
    }

    // Create new conversation object
    const newConv = {
        conversationId,
        contact: {
            _id: contact._id,
            username: contact.username,
            displayName: contact.displayName || contact.username,
            email: contact.email
        },
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0
    };

    // Add conversation to sidebar
    const item = document.createElement('div');
    item.className = 'contact-item active';
    item.dataset.conversationId = newConv.conversationId;
    item.dataset.contactId = newConv.contact._id;
    item.dataset.contactName = newConv.contact.username;

    const displayName = newConv.contact.displayName || newConv.contact.username;
    const time = formatTime(newConv.lastMessageTime);

    item.innerHTML = `
        <div class="d-flex align-items-center p-3">
            <div class="avatar me-3">
                <i class="bi bi-person-circle fs-3 text-themed"></i>
            </div>
            <div class="flex-grow-1">
                <div class="contact-name text-themed">${displayName}</div>
                <div class="last-message text-muted">Sin mensajes</div>
            </div>
            <div class="d-flex flex-column align-items-end">
                <div class="time text-muted">${time}</div>
            </div>
        </div>
    `;

    item.addEventListener('click', () => selectConversation(newConv));

    // Remove "No hay conversaciones" message if it exists
    const noConvMsg = contactsList.querySelector('p.text-muted');
    if (noConvMsg) {
        noConvMsg.remove();
    }

    contactsList.prepend(item);

    selectConversation(newConv);

    // Join the room
    socket.emit('join-conversations', currentUser.id);
}

// Select conversation
async function selectConversation(conversation) {
    console.log('selectConversation called with:', conversation);
    activeConversation = conversation;

    // Update UI
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
    });

    const selectedItem = document.querySelector(`[data-conversation-id="${conversation.conversationId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }

    // Show conversation UI
    console.log('Hiding emptyState:', emptyState);
    console.log('Showing conversationHeader:', conversationHeader);
    console.log('Showing messagesContainer:', messagesContainer);
    console.log('Showing inputArea:', inputArea);

    emptyState.style.display = 'none';
    conversationHeader.style.display = 'block';
    messagesContainer.style.display = 'block';
    inputArea.style.display = 'block';

    console.log('After setting display - emptyState.style.display:', emptyState.style.display);
    console.log('After setting display - messagesContainer.style.display:', messagesContainer.style.display);

    // Update header - use displayName if available
    const contactName = conversation.contact.displayName || conversation.contact.username;
    currentContactName.textContent = contactName;

    // Clear unread badge locally
    const badge = selectedItem ? selectedItem.querySelector('.badge') : null;
    if (badge) {
        badge.remove();
    }

    // Load messages
    await loadMessages(conversation.conversationId);
}

// Load messages for conversation
async function loadMessages(conversationId) {
    try {
        const response = await fetch(`/chat/messages/${conversationId}`);
        const data = await response.json();

        if (data.success) {
            messagesList.innerHTML = '';
            data.messages.forEach(msg => {
                const isSent = msg.sender._id === currentUser.id;
                appendMessage(msg.text, isSent, msg.timestamp, false);
            });
            scrollToBottom();
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Append message to the list
function appendMessage(text, isSent, timestamp = null, animate = true) {
    const li = document.createElement('li');
    li.className = `message-item ${isSent ? 'sent' : 'received'}`;
    if (animate) {
        li.style.animation = 'fadeIn 0.3s ease';
    }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    const messageText = document.createElement('p');
    messageText.className = 'message-text';
    messageText.textContent = text;

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = timestamp
        ? new Date(timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    bubble.appendChild(messageText);
    bubble.appendChild(messageTime);
    li.appendChild(bubble);
    messagesList.appendChild(li);
}

// Scroll to bottom of messages
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Helper functions
function generateConversationId(userId1, userId2) {
    const ids = [userId1, userId2].sort();
    return `${ids[0]}_${ids[1]}`;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Ayer';
    } else if (diffDays < 7) {
        return `${diffDays}d`;
    } else {
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    }
}
