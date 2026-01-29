//etapa 13 ok
window.Actions = {
    damage1: {
        name: "Whomp!",
        success: [
            { type:"textMessage", text:"{CASTER} usou {ACTION}!" },
            { type:"animation", animation:"spin" },
            { type:"stateChange", damage:10 }
        ]
    },
    saucyStatus: {
        name: "Aperto de Tomate",
        targetType: "friendly",
        success: [
            { type:"textMessage", text:"{CASTER} usou {ACTION}!" },
            { type:"stateChange", status:{type:"saucy", expiresIn:3}}
        ]
    },
    clumsyStatus: {
        name: "Azeite de Oliva",
        success: [
            { type:"textMessage", text:"{CASTER} usou {ACTION}!" },
            { type:"animation", animation:"glob", color:"#dafd2a"},
            { type:"stateChange", status:{type:"clumsy", expiresIn:3}},
            { type:"textMessage", text:"{TARGET} está escorregadio!"}
        ]
    },
    item_recoverStatus: {
        name: "Mini Forno",
        description: "Quentinha como se fosse nova",
        targetType: "friendly",
        success: [
            { type:"textMessage", text:"{CASTER} usou {ACTION}!" },
            { type:"stateChange", status:null},
            { type:"textMessage", text:"Novinha em folha!"}
        ]
    },
    item_recoverHp: {
        name: "Parmesão",
        targetType: "friendly",
        success: [
            { type:"textMessage", text:"{CASTER} salpicou um pouco de {ACTION}!"},
            { type:"stateChange", recover:10},
            { type:"textMessage", text:"{CASTER} recuperou HP!"}
        ]
    }
}