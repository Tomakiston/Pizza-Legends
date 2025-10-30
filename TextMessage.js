class TextMessage {
    constructor({text,onComplete}) {
        this.text = text;
        this.onComplete = onComplete;
        this.element = null;
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");
        this.element.innerHTML = (`
            <p class="TextMessage_p">${this.text}</p>
            <button class="TextMessage_button">Next</button>
        `);
    }//paramos aqui. Atualizar o css e seus caminhos e o arquivo KeyPressListener
}