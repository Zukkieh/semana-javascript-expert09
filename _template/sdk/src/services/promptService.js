
export class PromptService {
  #messages = [];
  #session = null;

  async init(initialPrompts) {
    if(!window.LanguageModel) return;

    this.#messages.push({
      role: 'system',
      content: initialPrompts
    });

    return this.#createSession();
  }

  async #createSession() {
    this.#session = await LanguageModel.create({
      initialPrompts: this.#messages,
      expectedInputLanguages: ['pt']
    });

    return this.#session;
  }

  prompt(text) {
    this.#messages.push({
      role: 'user',
      content: text
    });

    return this.#session.prompt(this.#messages);
  }
}
