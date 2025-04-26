/**
 * @name DMUsernameColors
 * @author Mshl_Louis
 * @version 1.4.1.0
 * @description A plugin that allows users to change the color of usernames in private messages including groups
 */

module.exports = class DMUsernameColors {
    constructor() {
        this.defaultSettings = { usernames: [] };
        this.settings = { ...this.defaultSettings };
        this.observer = null;
    }

    start() {
        this.loadSettings();
        this.applyUsernameColors();
        this.startObserving();
    }

    stop() {
        if (this.observer) this.observer.disconnect();
        this.resetUsernameColors();
    }

    applyUsernameColors() {
        if (!this.isInPrivateMessage()) return;

        const usernameSelector = '[class*="username"], [class*="titleWrapper"], [class*="overflow"]';
        const elements = document.querySelectorAll(usernameSelector);

        elements.forEach(el => {
			const innerH1 = el.querySelector('h1');
            const innerH2 = el.querySelector('h2');
            const target = innerH1 || innerH2 || el;

            let username = target.textContent.trim();
            const tag = target.querySelector('[class*="chipletContainerInner"]');
            if (tag) username = username.replace(tag.textContent.trim(), '').trim();

            this.settings.usernames.forEach(u => {
                if (username === u.name) target.style.color = u.color;
            });
        });
    }

    resetUsernameColors() {
        const usernameSelector = '[class*="username"], [class*="titleWrapper"], [class*="overflow"]';
        const elements = document.querySelectorAll(usernameSelector);

        elements.forEach(el => {
			const innerH1 = el.querySelector('h1');
            const innerH2 = el.querySelector('h2');
            const target = innerH1 || innerH2 || el;

            let username = target.textContent.trim();
            const tag = target.querySelector('[class*="chipletContainerInner"]');
            if (tag) username = username.replace(tag.textContent.trim(), '').trim();

            this.settings.usernames.forEach(u => {
                if (username === u.name) target.style.color = '';
            });
        });
    }

    startObserving() {
        this.observer = new MutationObserver(() => this.applyUsernameColors());
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    isInPrivateMessage() {
        return !!document.querySelector('[class*="privateChannels"]');
    }

    loadSettings() {
        const saved = BdApi.Data.load(this.getName(), 'settings');
        this.settings = saved ? { ...this.defaultSettings, ...saved } : { ...this.defaultSettings };
    }

    saveSettings() {
        BdApi.Data.save(this.getName(), 'settings', this.settings);
    }

    getSettingsPanel() {
        const panel = document.createElement('div');
        panel.style.padding = '10px';
        panel.classList.add(`${this.getName()}-panel`);

        const rebuild = () => {
            panel.innerHTML = '';
            this.settings.usernames.forEach((u, idx) => {
                panel.appendChild(this.createUsernameInput(panel, u.name, u.color, idx));
            });
            panel.appendChild(addButton);
        };

        const addButton = document.createElement('button');
        addButton.textContent = 'Add Username';
        addButton.style.backgroundColor = '#7289da';
        addButton.style.border = 'none';
        addButton.style.borderRadius = '4px';
        addButton.style.padding = '6px 12px';
        addButton.style.color = 'white';
        addButton.style.fontWeight = '600';
        addButton.style.cursor = 'pointer';
        addButton.style.margin = '8px 0';
        addButton.addEventListener('mouseenter', () => addButton.style.opacity = '0.9');
        addButton.addEventListener('mouseleave', () => addButton.style.opacity = '1');
        addButton.onclick = () => {
            this.settings.usernames.push({ name: '', color: '#ffffff' });
            this.saveSettings();
            rebuild();
            BdApi.UI.showToast('Username added!', { type: 'info' });
        };

        rebuild();
        return panel;
    }

    createUsernameInput(panel, name, color, index) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.marginBottom = '6px';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Username';
        nameInput.value = name;
        nameInput.style.flex = '2';
        nameInput.style.marginRight = '6px';
        nameInput.oninput = () => {
            this.settings.usernames[index].name = nameInput.value.trim();
            this.saveSettings();
        };

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = /^#([0-9A-F]{6})$/i.test(color) ? color : '#ffffff';
        colorInput.style.marginRight = '6px';
        colorInput.oninput = () => {
            this.settings.usernames[index].color = colorInput.value;
            this.saveSettings();
        };

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✕';
        removeBtn.className = 'bd-button bd-danger';
        removeBtn.style.flex = '0 0 auto';
        removeBtn.onclick = () => {
            this.settings.usernames.splice(index, 1);
            this.saveSettings();
            BdApi.UI.showToast('Username removed!', { type: 'success' });
            const newPanel = this.getSettingsPanel();
            panel.replaceWith(newPanel);
        };

        container.append(nameInput, colorInput, removeBtn);
        return container;
    }

    getName() {
        return this.constructor.name;
    }
};
