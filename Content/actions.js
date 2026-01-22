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
    }
}