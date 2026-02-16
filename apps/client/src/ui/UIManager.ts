/**
 * UIManager - Gestionnaire d'interface utilisateur
 * 
 * Gère :
 * - Les overlays HTML par-dessus le canvas
 * - Le chat
 * - Les notifications
 * - Les modales
 */
export class UIManager {
    private rootElement: HTMLElement | null = null;
    private chatContainer: HTMLElement | null = null;
    private notificationContainer: HTMLElement | null = null;

    constructor() {
        this.rootElement = document.getElementById('root');
        this.init();
    }

    private init(): void {
        this.createChatContainer();
        this.createNotificationContainer();
        console.log('🎨 UIManager initialisé');
    }

    /**
     * Crée le container du chat
     */
    private createChatContainer(): void {
        if (!this.rootElement) return;

        this.chatContainer = document.createElement('div');
        this.chatContainer.className = 'chat-container';
        this.chatContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 400px;
      max-height: 300px;
      background: rgba(10, 14, 26, 0.95);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      z-index: 100;
      font-family: 'Inter', sans-serif;
    `;

        // Messages
        const messagesDiv = document.createElement('div');
        messagesDiv.className = 'chat-messages';
        messagesDiv.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      max-height: 200px;
    `;

        // Input container
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
      padding: 12px;
      border-top: 1px solid rgba(0, 212, 255, 0.2);
      display: flex;
      gap: 8px;
    `;

        // Input
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Appuyez sur Entrée pour envoyer...';
        input.style.cssText = `
      flex: 1;
      background: #0A0E1A;
      border: 2px solid #374151;
      border-radius: 8px;
      padding: 8px 12px;
      color: #FFFFFF;
      font-size: 14px;
      outline: none;
    `;

        input.addEventListener('focus', () => {
            input.style.borderColor = '#00D4FF';
        });

        input.addEventListener('blur', () => {
            input.style.borderColor = '#374151';
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.sendChatMessage(input.value.trim());
                input.value = '';
            }
        });

        // Bouton envoyer
        const sendBtn = document.createElement('button');
        sendBtn.textContent = '→';
        sendBtn.style.cssText = `
      background: linear-gradient(135deg, #00D4FF, #0099CC);
      border: none;
      border-radius: 8px;
      color: #0A0E1A;
      padding: 8px 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    `;

        sendBtn.addEventListener('click', () => {
            if (input.value.trim()) {
                this.sendChatMessage(input.value.trim());
                input.value = '';
            }
        });

        inputContainer.appendChild(input);
        inputContainer.appendChild(sendBtn);
        this.chatContainer.appendChild(messagesDiv);
        this.chatContainer.appendChild(inputContainer);
        this.rootElement.appendChild(this.chatContainer);

        // Référence pour ajouter des messages
        (this.chatContainer as any).messagesDiv = messagesDiv;
    }

    /**
     * Crée le container des notifications
     */
    private createNotificationContainer(): void {
        if (!this.rootElement) return;

        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        this.notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 200;
      pointer-events: none;
    `;

        this.rootElement.appendChild(this.notificationContainer);
    }

    /**
     * Ajoute un message au chat
     */
    public addChatMessage(username: string, message: string, color: string = '#00D4FF'): void {
        if (!this.chatContainer) return;

        const messagesDiv = (this.chatContainer as any).messagesDiv;
        if (!messagesDiv) return;

        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
      padding: 6px 0;
      border-bottom: 1px solid rgba(55, 65, 81, 0.5);
      font-size: 14px;
      animation: fadeIn 0.3s ease;
    `;

        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = username + ': ';
        usernameSpan.style.cssText = `
      color: ${color};
      font-weight: 600;
    `;

        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        messageSpan.style.color = '#FFFFFF';

        messageEl.appendChild(usernameSpan);
        messageEl.appendChild(messageSpan);
        messagesDiv.appendChild(messageEl);

        // Scroll vers le bas
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Limiter le nombre de messages
        while (messagesDiv.children.length > 50) {
            messagesDiv.removeChild(messagesDiv.firstChild!);
        }
    }

    /**
     * Envoie un message (à connecter avec le serveur)
     */
    private sendChatMessage(message: string): void {
        // TODO: Envoyer au serveur via Socket.io
        console.log('💬 Message envoyé:', message);

        // Pour l'instant, on affiche localement
        this.addChatMessage('Vous', message, '#FF6B35');
    }

    /**
     * Affiche une notification
     */
    public showNotification(
        title: string,
        message: string,
        type: 'info' | 'success' | 'warning' | 'error' = 'info'
    ): void {
        if (!this.notificationContainer) return;

        const colors = {
            info: '#00D4FF',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
      background: rgba(17, 24, 39, 0.95);
      border-left: 4px solid ${colors[type]};
      border-radius: 8px;
      padding: 16px;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
      pointer-events: auto;
    `;

        const titleEl = document.createElement('div');
        titleEl.textContent = title;
        titleEl.style.cssText = `
      color: ${colors[type]};
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
    `;

        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
      color: #9CA3AF;
      font-size: 13px;
    `;

        notification.appendChild(titleEl);
        notification.appendChild(messageEl);
        this.notificationContainer.appendChild(notification);

        // Auto-suppression après 5 secondes
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Affiche/masque le chat
     */
    public toggleChat(): void {
        if (!this.chatContainer) return;
        const isVisible = this.chatContainer.style.display !== 'none';
        this.chatContainer.style.display = isVisible ? 'none' : 'flex';
    }

    /**
     * Affiche une modale
     */
    public showModal(title: string, content: string, onClose?: () => void): void {
        if (!this.rootElement) return;

        // Overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

        // Modal
        const modal = document.createElement('div');
        modal.style.cssText = `
      background: #111827;
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 16px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      animation: scaleIn 0.3s ease;
    `;

        // Titre
        const titleEl = document.createElement('h2');
        titleEl.textContent = title;
        titleEl.style.cssText = `
      color: #00D4FF;
      font-family: 'Press Start 2P', monospace;
      font-size: 18px;
      margin-bottom: 16px;
    `;

        // Contenu
        const contentEl = document.createElement('div');
        contentEl.innerHTML = content;
        contentEl.style.cssText = `
      color: #FFFFFF;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
    `;

        // Bouton fermer
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Fermer';
        closeBtn.style.cssText = `
      background: linear-gradient(135deg, #00D4FF, #0099CC);
      border: none;
      border-radius: 8px;
      color: #0A0E1A;
      padding: 12px 24px;
      font-weight: 600;
      cursor: pointer;
      float: right;
    `;

        closeBtn.addEventListener('click', () => {
            overlay.remove();
            if (onClose) onClose();
        });

        modal.appendChild(titleEl);
        modal.appendChild(contentEl);
        modal.appendChild(closeBtn);
        overlay.appendChild(modal);
        this.rootElement.appendChild(overlay);

        // Fermer en cliquant sur l'overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (onClose) onClose();
            }
        });
    }

    /**
     * Détruit l'UI manager
     */
    public destroy(): void {
        if (this.chatContainer) {
            this.chatContainer.remove();
        }
        if (this.notificationContainer) {
            this.notificationContainer.remove();
        }
    }
}