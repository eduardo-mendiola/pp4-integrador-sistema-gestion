// Only run on non-chat pages to avoid conflicts with chat.js
if (!window.location.pathname.includes('/chat')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if user is logged in
        if (!window.user || !window.user._id) return;

        // Initialize socket ONLY for notifications
        const socket = io();
        const notificationDot = document.getElementById('chat-notification-dot');
        const userId = window.user._id;

        // Join user's room for notifications
        socket.emit('join-conversations', userId);

        // Listen for new message notifications
        socket.on('new-message-notification', (data) => {
            showNotificationDot();
        });

        // Also listen for direct messages
        socket.on('chat-message', (data) => {
            showNotificationDot();
        });

        function showNotificationDot() {
            if (notificationDot) {
                notificationDot.style.display = 'block';
            }
        }

        // Check for unread messages on load
        checkUnreadMessages();

        async function checkUnreadMessages() {
            try {
                const response = await fetch('/chat/conversations');
                const data = await response.json();
                if (data.success) {
                    const hasUnread = data.conversations.some(c => c.unreadCount > 0);
                    if (hasUnread) {
                        showNotificationDot();
                    }
                }
            } catch (error) {
                console.error('Error checking unread messages:', error);
            }
        }
    });
}
