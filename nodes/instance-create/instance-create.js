module.exports = function(RED) {
    function InstanceCreateNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.baseUrl = config.baseUrl;
        node.instanceName = config.instanceName;
        node.includeQR = config.includeQR;

        node.on('input', async function(msg, send, done) {
            const axios = require('axios');
            // Constrói a URL do endpoint (garantindo que não haja barras duplicadas)
            let url = node.baseUrl.replace(/\/+$/, '') + "/instance/create";
            // Payload baseado na configuração do nó ou msg (se estiver dinâmico)
            let payload = {
                instanceName: node.instanceName || msg.instanceName,
                qrcode: node.includeQR || msg.includeQR || false,
                integration: "WHATSAPP-BAILEYS"  // Valor default; pode ser adaptado conforme necessidade
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
                node.error("Erro no Instance Create: " + error, msg);
                done(error);
            }
        });
    }
    RED.nodes.registerType("instance-create", InstanceCreateNode);
}
