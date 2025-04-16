module.exports = function(RED) {
    function SendTextNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.baseUrl = config.baseUrl;
        node.instance = config.instance;
        node.number = config.number;
        node.text = config.text;

        node.on('input', async function(msg, send, done) {
            const axios = require('axios');
            // Se os campos não estiverem preenchidos na configuração do nó, tenta obtê-los de msg.
            let instance = node.instance || msg.instance;
            let number = node.number || msg.number;
            let text = node.text || msg.text;
            // Construindo a URL: /message/sendText/{{instance}}
            let url = node.baseUrl.replace(/\/+$/, '') + "/message/sendText/" + instance;
            
            let payload = {
                number: number,
                text: text
            };
            
            try {
                let response = await axios.post(url, payload, {
                    headers: {
                        "apikey": msg.globalApikey || process.env.GLOBAL_APIKEY || ""
                    }
                });
                msg.payload = response.data;
                send(msg);
                done();
            } catch (error) {
                node.error("Erro no Send Text Message: " + error, msg);
                done(error);
            }
        });
    }
    RED.nodes.registerType("send-text", SendTextNode);
}
