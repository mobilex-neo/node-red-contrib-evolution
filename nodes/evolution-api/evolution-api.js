module.exports = function(RED) {
    function EvolutionApiNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.baseUrl = config.baseUrl;
        node.globalApikey = config.globalApikey;
        node.operation = config.operation;
        node.params = config.params;

        const axios = require('axios');

        // Mapeamento das operações suportadas
        const opMapping = {
            // Instance
            "instance_create": { method: "POST", path: "/instance/create" },
            "instance_fetch": { method: "GET",  path: "/instance/fetchInstances" },
            "instance_connect": { method: "GET",  path: "/instance/connect/{{instance}}" },
            "instance_restart": { method: "POST", path: "/instance/restart/{{instance}}" },
            "instance_setPresence": { method: "POST", path: "/instance/setPresence/{{instance}}" },
            "instance_connectionStatus": { method: "GET", path: "/instance/connectionState/{{instance}}" },
            "instance_logout": { method: "DELETE", path: "/instance/logout/{{instance}}" },
            "instance_delete": { method: "DELETE", path: "/instance/delete/{{instance}}" },

            // Proxy
            "proxy_set": { method: "POST", path: "/proxy/set/{{instance}}" },
            "proxy_find": { method: "GET", path: "/proxy/find/{{instance}}" },

            // Settings
            "settings_set": { method: "POST", path: "/settings/set/{{instance}}" },
            "settings_find": { method: "GET", path: "/settings/find/{{instance}}" },

            // Send Message
            "send_text": { method: "POST", path: "/message/sendText/{{instance}}" },
            "send_media_url": { method: "POST", path: "/message/sendMedia/{{instance}}" },
            "send_ptv": { method: "POST", path: "/message/sendPtv/{{instance}}" },
            "send_narrated_audio": { method: "POST", path: "/message/sendWhatsAppAudio/{{instance}}" },
            "send_status_stories": { method: "POST", path: "/message/sendStatus/{{instance}}" },
            "send_sticker": { method: "POST", path: "/message/sendSticker/{{instance}}" },
            "send_location": { method: "POST", path: "/message/sendLocation/{{instance}}" },
            "send_contact": { method: "POST", path: "/message/sendContact/{{instance}}" },
            "send_reaction": { method: "POST", path: "/message/sendReaction/{{instance}}" },
            "send_poll": { method: "POST", path: "/message/sendPoll/{{instance}}" },
            "send_list": { method: "POST", path: "/message/sendList/{{instance}}" },
            "send_button": { method: "POST", path: "/message/sendButtons/{{instance}}" },

            // Call
            "call_fake": { method: "POST", path: "/call/offer/{{instance}}" },

            // Chat
            "chat_check_whatsapp": { method: "POST", path: "/chat/whatsappNumbers/{{instance}}" },
            "chat_read_messages": { method: "POST", path: "/chat/markMessageAsRead/{{instance}}" },
            "chat_archive": { method: "POST", path: "/chat/archiveChat/{{instance}}" },
            "chat_mark_unread": { method: "POST", path: "/chat/markChatUnread/{{instance}}" },
            "chat_delete_message": { method: "DELETE", path: "/chat/deleteMessageForEveryone/{{instance}}" },
            "chat_fetch_profile_picture": { method: "POST", path: "/chat/fetchProfilePictureUrl/{{instance}}" },
            "chat_get_base64_media": { method: "POST", path: "/chat/getBase64FromMediaMessage/{{instance}}" },
            "chat_update_message": { method: "POST", path: "/chat/updateMessage/{{instance}}" },
            "chat_send_presence": { method: "POST", path: "/chat/sendPresence/{{instance}}" },
            "chat_update_block_status": { method: "POST", path: "/message/updateBlockStatus/{{instance}}" },
            "chat_find_contacts": { method: "POST", path: "/chat/findContacts/{{instance}}" },
            "chat_find_messages": { method: "POST", path: "/chat/findMessages/{{instance}}" },
            "chat_find_status_message": { method: "POST", path: "/chat/findStatusMessage/{{instance}}" },
            "chat_find_chats": { method: "POST", path: "/chat/findChats/{{instance}}" },

            // Label
            "label_find": { method: "GET", path: "/label/findLabels/{{instance}}" },
            "label_handle": { method: "POST", path: "/label/handleLabel/{{instance}}" },

            // Profile Settings
            "profile_fetch_business": { method: "POST", path: "/chat/fetchBusinessProfile/{{instance}}" },
            "profile_fetch": { method: "POST", path: "/chat/fetchProfile/{{instance}}" },
            "profile_update_name": { method: "POST", path: "/chat/updateProfileName/{{instance}}" },
            "profile_update_status": { method: "POST", path: "/chat/updateProfileStatus/{{instance}}" },
            "profile_update_picture": { method: "POST", path: "/chat/updateProfilePicture/{{instance}}" },
            "profile_remove_picture": { method: "DELETE", path: "/chat/removeProfilePicture/{{instance}}" },
            "profile_fetch_privacy": { method: "GET", path: "/chat/fetchPrivacySettings/{{instance}}" },
            "profile_update_privacy": { method: "POST", path: "/chat/updatePrivacySettings/{{instance}}" },

            // Group
            "group_create": { method: "POST", path: "/group/create/{{instance}}" },
            "group_update_picture": { method: "POST", path: "/group/updateGroupPicture/{{instance}}" },
            "group_update_subject": { method: "POST", path: "/group/updateGroupSubject/{{instance}}" },
            "group_update_description": { method: "POST", path: "/group/updateGroupDescription/{{instance}}" },
            "group_fetch_invite": { method: "GET", path: "/group/inviteCode/{{instance}}" },
            "group_revoke_invite": { method: "POST", path: "/group/revokeInviteCode/{{instance}}" },
            "group_send_invite_url": { method: "POST", path: "/group/sendInvite/{{instance}}" },
            "group_find_invite": { method: "GET", path: "/group/inviteInfo/{{instance}}" },
            "group_find_by_jid": { method: "GET", path: "/group/findGroupInfos/{{instance}}" },
            "group_fetch_all": { method: "GET", path: "/group/fetchAllGroups/{{instance}}" },
            "group_find_participants": { method: "GET", path: "/group/participants/{{instance}}" },
            "group_update_participant": { method: "POST", path: "/group/updateParticipant/{{instance}}" },
            "group_update_setting": { method: "POST", path: "/group/updateSetting/{{instance}}" },
            "group_toggle_ephemeral": { method: "POST", path: "/group/toggleEphemeral/{{instance}}" },
            "group_leave": { method: "DELETE", path: "/group/leaveGroup/{{instance}}" },

            // Integrations (exemplo para websocket – demais podem ser incluídos de forma similar)
            "websocket_set": { method: "POST", path: "/websocket/set/{{instance}}" },
            "websocket_find": { method: "GET", path: "/websocket/find/{{instance}}" },

            // Channel
            "send_template": { method: "POST", path: "/message/sendTemplate/{{instance}}" },
            "create_template": { method: "POST", path: "/template/create/{{instance}}" },
            "find_templates": { method: "GET", path: "/template/find/{{instance}}" },

            // Storage
            "s3_get_media": { method: "POST", path: "/s3/getMedia/{{instance}}" },
            "s3_get_media_url": { method: "POST", path: "/s3/getMediaUrl/{{instance}}" },

            // Get Informations
            "get_informations": { method: "GET", path: "/" }
        };

        // Função para substituir placeholders (ex.: {{instance}}) usando os parâmetros
        function replacePlaceholders(str, params) {
            return str.replace(/{{(.*?)}}/g, function(match, p1) {
                return params[p1] || "";
            });
        }

        node.on('input', async function(msg, send, done) {
            // Obtenha as configurações, podendo ser sobrescritas via msg.
            let baseUrl = node.baseUrl || msg.baseUrl || "https://evolution-api.com";
            let apikey = node.globalApikey || msg.globalApikey || process.env.GLOBAL_APIKEY || "";
            let operation = node.operation || msg.operation;

            if (!operation || !opMapping[operation]) {
                let errorMsg = "Operação inválida: " + operation;
                node.error(errorMsg, msg);
                return done(new Error(errorMsg));
            }
            let opDetails = opMapping[operation];
            let method = opDetails.method;
            let pathTemplate = opDetails.path;

            // Parse dos parâmetros em JSON
            let params = {};
            try {
                if (node.params) {
                    params = JSON.parse(node.params);
                } else if (msg.params) {
                    params = msg.params;
                }
            } catch(e) {
                let errorMsg = "Parâmetros inválidos. Certifique-se de que o JSON está correto.";
                node.error(errorMsg, msg);
                return done(new Error(errorMsg));
            }

            // Permite que msg.params sobrescreva os parâmetros configurados.
            params = Object.assign({}, params, msg.params);
            
            // Substitui placeholders na URL
            let path = replacePlaceholders(pathTemplate, params);
            baseUrl = baseUrl.replace(/\/+$/, ''); // remove barras finais
            let url = baseUrl + path;

            // Define o payload para métodos não GET (para GET, assume que os parâmetros podem ser enviados via query string se necessário)
            let data = null;
            if (method !== "GET") {
                data = params;
            }
            
            try {
                let response = await axios({
                    method: method,
                    url: url,
                    data: data,
                    headers: {
                        "apikey": apikey
                    }
                });
                msg.payload = response.data;
                send(msg);
                done();
            } catch (error) {
                node.error("Erro na operação '" + operation + "': " + error, msg);
                done(error);
            }
        });
    }
    RED.nodes.registerType("evolution-api", EvolutionApiNode);
}
