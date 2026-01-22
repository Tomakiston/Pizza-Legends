//etapa 13 ok
class SubmissionMenu {
    constructor({caster, enemy, onComplete}) {
        this.caster = caster;
        this.enemy = enemy;
        this.onComplete = onComplete;
    }

    getPages() {
        const backOption = {
            label: "Voltar",
            description: "Retorne para a página anterior",
            handler: () => {
                this.keyboardMenu.setOptions(this.getPages().root);
            }
        }

        return {
            root: [
                {
                    label: "Ataque",
                    description: "Escolha um ataque",
                    handler: () => {
                        this.keyboardMenu.setOptions(this.getPages().attacks);
                    }
                },
                {
                    label: "Itens",
                    description: "Escolha um item",
                    handler: () => {
                        this.keyboardMenu.setOptions(this.getPages().items);
                    }
                },
                {
                    label: "Trocar",
                    description: "Troque para uma outra pizza",
                    handler: () => {
                        //ver opções de pizza
                    }
                }
            ],
            attacks: [
                ...this.caster.actions.map(key => {
                    const action = Actions[key];
                    return {
                        label: action.name,
                        description: action.description,
                        handler: () => {
                            this.menuSubmit(action);
                        }
                    }
                }),
                backOption
            ],
            items: [
                backOption
            ]
        }
    }

    menuSubmit(action, instanceId = null) {
        this.keyBirdMenu?.end();
        this.onComplete({
            action,
            target: action.targetType === "friendly" ? this.caster : this.enemy
        })
    }

    decide() {
        /*this.onComplete({
            action: Actions[this.caster.actions[0]],
            target: this.enemy
        })*/
       
       this.menuSubmit(Actions[this.caster.actions[0]]);
    }
    
    showMenu(container) {
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(container);
        this.keyboardMenu.setOptions(this.getPages().root);
    }

    init(container) {
        if(this.caster.isPlayerControlled) {
            this.showMenu(container);
        } else {
            this.decide();
        }
    }
}