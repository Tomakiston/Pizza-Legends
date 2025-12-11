window.Actions = {
    damage1: {
        name: "Whomp!",
        success: [
            { type:"textMessage", text:"{CASTER} usou {ACTION}!" },
            { type:"animation", animation:"spin" },
            { type:"stateChange", damage:10 }
        ]
    }
}