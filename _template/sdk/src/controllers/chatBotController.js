// @ts-check

/**
 * @typedef {import("../views/chatBotView.js").ChatbotView} ChatBotView
 * @typedef {import("../services/promptService.js").PromptService} PromptService
 */

export class ChatbotController {

    #chatbotView;
    #promptService;

    /**
    * @param {Object} deps - Dependencies for the class.
    * @param {ChatBotView} deps.chatbotView - The chatbot view instance.
    * @param {PromptService} deps.promptService - The prompt service instance.
    */
    constructor({ chatbotView, promptService }) {
        this.#chatbotView = chatbotView;
        this.#promptService = promptService;
    }

    async init({ firstBotMessage, text }) {
        this.#setupEvents();
        this.#chatbotView.renderWelcomeBubble();
        this.#chatbotView.setInputEnabled(true);
        this.#chatbotView.appendBotMessage(firstBotMessage, null, false);
        return this.#promptService.init(text);
    }

    #setupEvents() {
        this.#chatbotView.setupEventHandlers({
            onOpen: this.#onOpen.bind(this),
            onSend: this.#chatBotReply.bind(this),
            onStop: this.#handleStop.bind(this),
        });
    }

    #handleStop() {
    }

    async #chatBotReply(userMsg) {
        console.log('received', userMsg)
        this.#chatbotView.showTypingIndicator();
        this.#chatbotView.setInputEnabled(false);

        const response = await this.#promptService.prompt(userMsg);
        console.log('response', response)
        this.#chatbotView.appendBotMessage(response);
        this.#chatbotView.setInputEnabled(true);
        this.#chatbotView.hideTypingIndicator();
    }

    async #onOpen() {
        const errors = this.#checkRequirements();
        if(errors.length) {
            const messages = errors.join('\n\n');
            this.#chatbotView.appendBotMessage(messages);
            this.#chatbotView.setInputEnabled(false);
            return;
        }
        this.#chatbotView.setInputEnabled(true);
    }

    #checkRequirements() {
        const errors = []
        // @ts-ignore
        const iChrome = window.chrome
        if (!iChrome) {
            errors.push(
                '⚠️ Este recurso só funciona no Google Chrome ou Chrome Canary (versão recente).'
            )
        }
        if (!('LanguageModel' in window)) {
            errors.push("⚠️ As APIs nativas de IA não estão ativas.");
            errors.push("Ative a seguinte flag em chrome://flags/:");
            errors.push("- Prompt API for Gemini Nano (chrome://flags/#prompt-api-for-gemini-nano)");
            errors.push("Depois reinicie o Chrome e tente novamente.");
        }

        return errors
    }
}
