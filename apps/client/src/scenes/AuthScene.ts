import Phaser from 'phaser';
import { NetworkManager } from '../network/NetworkManager';

/**
 * AuthScene - Scène d'authentification (Login/Register)
 * 
 * Permet aux joueurs de :
 * - Se connecter avec un compte existant
 * - Créer un nouveau compte
 * - Accéder au jeu après authentification
 */
export class AuthScene extends Phaser.Scene {
    private networkManager!: NetworkManager;
    private currentMode: 'login' | 'register' = 'login';
    private formContainer!: Phaser.GameObjects.Container;
    private inputs: {
        username?: HTMLInputElement;
        email?: HTMLInputElement;
        password?: HTMLInputElement;
    } = {};
    private errorText!: Phaser.GameObjects.Text;
    private loadingText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'AuthScene' });
    }

    init(): void {
        this.networkManager = new NetworkManager('http://localhost:3002');
    }

    create(): void {
        console.log('🔐 AuthScene: Page d\'authentification');

        this.createBackground();
        this.createForm();
        this.createToggleButtons();
        this.createErrorDisplay();

        // Animation d'entrée
        this.cameras.main.fadeIn(500, 10, 14, 26);
    }

    private createBackground(): void {
        const { width, height } = this.cameras.main;

        // Fond dégradé
        const graphics = this.add.graphics();
        for (let y = 0; y < height; y++) {
            const ratio = y / height;
            const r = Math.floor(10 + ratio * 8);
            const g = Math.floor(14 + ratio * 12);
            const b = Math.floor(26 + ratio * 18);

            graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            graphics.fillRect(0, y, width, 1);
        }

        // Grille cyberpunk
        graphics.lineStyle(1, 0x00D4FF, 0.05);
        for (let x = 0; x < width; x += 60) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, height);
        }
        for (let y = 0; y < height; y += 60) {
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
        }
        graphics.strokePath();

        // Logo
        const logoText = this.add.text(width / 2, 80, 'MECHAPIZZAI', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#00D4FF',
        });
        logoText.setOrigin(0.5);
        logoText.setShadow(0, 0, '#00D4FF', 10, true, true);

        const subtitleText = this.add.text(width / 2, 130, 'MMORPG', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '20px',
            color: '#FF6B35',
            letterSpacing: 8,
        });
        subtitleText.setOrigin(0.5);
    }

    private createForm(): void {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const startY = 200;

        this.formContainer = this.add.container(0, 0);

        // Titre du formulaire
        this.updateFormTitle();

        // Créer les inputs HTML
        this.createHTMLInputs();

        // Bouton de soumission
        this.createSubmitButton(centerX, startY + 280);

        // Bouton retour
        this.createBackButton(centerX, startY + 340);
    }

    private createHTMLInputs(): void {
        const { width, height } = this.cameras.main;
        const inputWidth = 300;
        const inputHeight = 45;

        // Container pour les inputs
        const inputContainer = document.createElement('div');
        inputContainer.id = 'auth-inputs';
        inputContainer.style.position = 'absolute';
        inputContainer.style.left = '50%';
        inputContainer.style.top = '220px';
        inputContainer.style.transform = 'translateX(-50%)';
        inputContainer.style.width = `${inputWidth}px`;
        inputContainer.style.display = 'flex';
        inputContainer.style.flexDirection = 'column';
        inputContainer.style.gap = '15px';

        // Style commun pour les inputs
        const inputStyle = `
            width: 100%;
            height: ${inputHeight}px;
            padding: 10px 15px;
            font-size: 16px;
            font-family: 'Segoe UI', sans-serif;
            background: rgba(17, 24, 39, 0.95);
            border: 2px solid rgba(0, 212, 255, 0.3);
            border-radius: 8px;
            color: #ffffff;
            outline: none;
            transition: all 0.3s ease;
            box-sizing: border-box;
        `;

        // Input Username
        this.inputs.username = document.createElement('input');
        this.inputs.username.type = 'text';
        this.inputs.username.placeholder = 'Nom d\'utilisateur';
        this.inputs.username.style.cssText = inputStyle;
        this.inputs.username.addEventListener('focus', () => {
            this.inputs.username!.style.borderColor = '#00D4FF';
            this.inputs.username!.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.3)';
        });
        this.inputs.username.addEventListener('blur', () => {
            this.inputs.username!.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            this.inputs.username!.style.boxShadow = 'none';
        });

        // Input Email (uniquement pour l'inscription)
        this.inputs.email = document.createElement('input');
        this.inputs.email.type = 'email';
        this.inputs.email.placeholder = 'Email';
        this.inputs.email.style.cssText = inputStyle;
        this.inputs.email.style.display = this.currentMode === 'register' ? 'block' : 'none';
        this.inputs.email.addEventListener('focus', () => {
            this.inputs.email!.style.borderColor = '#00D4FF';
            this.inputs.email!.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.3)';
        });
        this.inputs.email.addEventListener('blur', () => {
            this.inputs.email!.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            this.inputs.email!.style.boxShadow = 'none';
        });

        // Input Password
        this.inputs.password = document.createElement('input');
        this.inputs.password.type = 'password';
        this.inputs.password.placeholder = 'Mot de passe';
        this.inputs.password.style.cssText = inputStyle;
        this.inputs.password.addEventListener('focus', () => {
            this.inputs.password!.style.borderColor = '#00D4FF';
            this.inputs.password!.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.3)';
        });
        this.inputs.password.addEventListener('blur', () => {
            this.inputs.password!.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            this.inputs.password!.style.boxShadow = 'none';
        });
        this.inputs.password.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSubmit();
            }
        });

        inputContainer.appendChild(this.inputs.username);
        inputContainer.appendChild(this.inputs.email);
        inputContainer.appendChild(this.inputs.password);

        document.body.appendChild(inputContainer);
    }

    private updateFormTitle(): void {
        const { width } = this.cameras.main;

        // Supprimer l'ancien titre s'il existe
        const existingTitle = this.children.list.find(
            child => child instanceof Phaser.GameObjects.Text && (child as Phaser.GameObjects.Text).text.includes('CONNEXION') || (child as Phaser.GameObjects.Text).text.includes('INSCRIPTION')
        );
        if (existingTitle) {
            existingTitle.destroy();
        }

        const titleText = this.currentMode === 'login' ? 'CONNEXION' : 'INSCRIPTION';
        const title = this.add.text(width / 2, 180, titleText, {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFFFFF',
        });
        title.setOrigin(0.5);
    }

    private createSubmitButton(x: number, y: number): void {
        const buttonWidth = 300;
        const buttonHeight = 50;

        const container = this.add.container(x, y);

        // Glow
        const glow = this.add.rectangle(0, 0, buttonWidth + 10, buttonHeight + 10, 0x00D4FF, 0.2);
        glow.setInteractive({ useHandCursor: true });

        // Fond
        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x111827, 0.95);
        bg.setStrokeStyle(2, 0x00D4FF, 0.6);
        bg.setInteractive({ useHandCursor: true });

        // Texte
        const buttonText = this.add.text(0, 0, this.currentMode === 'login' ? 'SE CONNECTER' : 'S\'INSCRIRE', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF',
        });
        buttonText.setOrigin(0.5);

        container.add([glow, bg, buttonText]);

        // Événements
        bg.on('pointerover', () => {
            this.tweens.add({
                targets: [bg],
                scaleX: 1.02,
                scaleY: 1.02,
                duration: 150,
            });
            glow.setAlpha(0.5);
        });

        bg.on('pointerout', () => {
            this.tweens.add({
                targets: [bg],
                scaleX: 1,
                scaleY: 1,
                duration: 150,
            });
            glow.setAlpha(0.2);
        });

        bg.on('pointerdown', () => {
            this.animateButtonClick(container);
            this.handleSubmit();
        });

        (container as any).isSubmitButton = true;
        this.formContainer.add(container);
    }

    private createBackButton(x: number, y: number): void {
        const buttonWidth = 300;
        const buttonHeight = 45;

        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x111827, 0.8);
        bg.setStrokeStyle(1, 0x6B7280, 0.5);
        bg.setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(0, 0, 'RETOUR', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '16px',
            color: '#9CA3AF',
        });
        buttonText.setOrigin(0.5);

        container.add([bg, buttonText]);

        bg.on('pointerover', () => {
            bg.setStrokeStyle(1, 0xFF6B35, 0.8);
            buttonText.setColor('#FF6B35');
        });

        bg.on('pointerout', () => {
            bg.setStrokeStyle(1, 0x6B7280, 0.5);
            buttonText.setColor('#9CA3AF');
        });

        bg.on('pointerdown', () => {
            this.cleanupInputs();
            this.cameras.main.fadeOut(300, 10, 14, 26);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MenuScene');
            });
        });

        this.formContainer.add(container);
    }

    private createToggleButtons(): void {
        const { width, height } = this.cameras.main;

        const toggleText = this.add.text(width / 2, height - 100, '', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '14px',
            color: '#9CA3AF',
        });
        toggleText.setOrigin(0.5);

        this.updateToggleText(toggleText);

        toggleText.setInteractive({ useHandCursor: true });
        toggleText.on('pointerover', () => toggleText.setColor('#00D4FF'));
        toggleText.on('pointerout', () => toggleText.setColor('#9CA3AF'));
        toggleText.on('pointerdown', () => {
            this.currentMode = this.currentMode === 'login' ? 'register' : 'login';
            this.updateToggleText(toggleText);
            this.updateFormTitle();

            // Mettre à jour l'affichage de l'input email
            if (this.inputs.email) {
                this.inputs.email.style.display = this.currentMode === 'register' ? 'block' : 'none';
            }

            // Mettre à jour le texte du bouton
            const submitButton = this.formContainer.list.find(
                (child: any) => child.isSubmitButton
            ) as Phaser.GameObjects.Container;
            if (submitButton) {
                const text = submitButton.list.find(
                    (child) => child instanceof Phaser.GameObjects.Text
                ) as Phaser.GameObjects.Text;
                if (text) {
                    text.setText(this.currentMode === 'login' ? 'SE CONNECTER' : 'S\'INSCRIRE');
                }
            }

            this.hideError();
        });
    }

    private updateToggleText(text: Phaser.GameObjects.Text): void {
        if (this.currentMode === 'login') {
            text.setText('Pas de compte ? Cliquez pour vous inscrire');
        } else {
            text.setText('Déjà un compte ? Cliquez pour vous connecter');
        }
    }

    private createErrorDisplay(): void {
        const { width } = this.cameras.main;

        this.errorText = this.add.text(width / 2, 480, '', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '14px',
            color: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: { x: 12, y: 6 },
        });
        this.errorText.setOrigin(0.5);
        this.errorText.setVisible(false);

        this.loadingText = this.add.text(width / 2, 480, 'Chargement...', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '16px',
            color: '#00D4FF',
        });
        this.loadingText.setOrigin(0.5);
        this.loadingText.setVisible(false);
    }

    private showError(message: string): void {
        this.errorText.setText(message);
        this.errorText.setVisible(true);
        this.loadingText.setVisible(false);

        // Animation d'erreur
        this.tweens.add({
            targets: this.errorText,
            x: { from: this.errorText.x - 5, to: this.errorText.x + 5 },
            duration: 50,
            yoyo: true,
            repeat: 3,
        });
    }

    private hideError(): void {
        this.errorText.setVisible(false);
    }

    private showLoading(): void {
        this.loadingText.setVisible(true);
        this.errorText.setVisible(false);
    }

    private hideLoading(): void {
        this.loadingText.setVisible(false);
    }

    private async handleSubmit(): Promise<void> {
        const username = this.inputs.username?.value.trim();
        const email = this.inputs.email?.value.trim();
        const password = this.inputs.password?.value;

        // Validation
        if (!username) {
            this.showError('Veuillez entrer un nom d\'utilisateur');
            return;
        }

        if (this.currentMode === 'register' && !email) {
            this.showError('Veuillez entrer un email');
            return;
        }

        if (!password) {
            this.showError('Veuillez entrer un mot de passe');
            return;
        }

        if (password.length < 8) {
            this.showError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        this.showLoading();

        try {
            const serverUrl = 'http://localhost:3002';
            const endpoint = this.currentMode === 'login' ? '/api/auth/login' : '/api/auth/register';

            const body = this.currentMode === 'login'
                ? { usernameOrEmail: username, password }
                : { username, email, password };

            const response = await fetch(`${serverUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!data.success) {
                this.showError(data.error || 'Une erreur est survenue');
                return;
            }

            // Sauvegarder le token
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Connecter au serveur Socket.io avec le token
            await this.connectToGame(data.token);

        } catch (error) {
            console.error('Auth error:', error);
            this.showError('Erreur de connexion au serveur');
        }
    }

    private async connectToGame(token: string): Promise<void> {
        try {
            // Connecter au serveur
            const connected = await this.networkManager.connect();

            if (!connected) {
                this.showError('Impossible de se connecter au serveur de jeu');
                return;
            }

            // Authentifier avec le token
            this.networkManager.authenticate(token);

            // Attendre la réponse d'authentification
            this.networkManager.onAuthSuccess = (data: { userId: string; username: string; characterId?: string }) => {
                console.log('✅ Authentification réussie:', data);
                this.hideLoading();
                this.cleanupInputs();

                // Rediriger vers la scène de sélection de personnage ou le jeu
                this.cameras.main.fadeOut(500, 10, 14, 26);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('MenuScene');
                });
            };

            this.networkManager.onAuthError = (error: { message: string }) => {
                console.error('❌ Erreur d\'authentification:', error);
                this.showError('Erreur d\'authentification');
            };

        } catch (error) {
            console.error('Connection error:', error);
            this.showError('Erreur de connexion');
        }
    }

    private animateButtonClick(container: Phaser.GameObjects.Container): void {
        this.tweens.add({
            targets: container,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 50,
            yoyo: true,
        });
    }

    private cleanupInputs(): void {
        // Supprimer les inputs HTML
        const inputContainer = document.getElementById('auth-inputs');
        if (inputContainer) {
            inputContainer.remove();
        }
        this.inputs = {};
    }

    shutdown(): void {
        this.cleanupInputs();
    }
}
