const handler = (m) => m;

export async function all(m) {
  for (const user of Object.values(global.db.data.users)) {
    if (user.premiumTime != 0 && user.premium) {
      if (new Date() * 1 >= user.premiumTime) {
        user.premiumTime = 0;
        user.premium = false;
        const JID = Object.keys(global.db.data.users).find((key) => global.db.data.users[key] === user);
        const usuarioJid = JID.split`@`[0];
        
        const textoo = `╭─「 💎 *MEMBRESÍA PREMIUM* 💎 」
│
│ ⚠️ *Estado:* Expirada
│ 👤 *Usuario:* @${usuarioJid}
│ 
│ 📅 *Tu suscripción premium ha llegado*
│ *a su fecha de expiración.*
│
│ 🎯 *Beneficios perdidos:*
│ ▸ Acceso a comandos exclusivos
│ ▸ Prioridad en soporte técnico  
│ ▸ Límites aumentados
│ ▸ Sin restricciones
│
│ 💳 *Para renovar:*
│ ▸ Contacta al administrador
│ ▸ Disfruta de beneficios exclusivos
│
╰─「 *KARBOT-MD - Sistema Premium* 」`;
        
        await this.sendMessage(JID, {text: textoo, mentions: [JID]}, {quoted: ''});
      }
    }
  }
}