const Discordcloody = require('discord.js');
const cloodymta = require('gamedig');
const cloodyconfig = require('./config.json');

const cloodybot = new Discordcloody.Client({ intents: [Discordcloody.Intents.FLAGS.GUILDS] });const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { config } = require('process');

const commands = [
	new SlashCommandBuilder().setName('server').setDescription('mta server status'),
    new SlashCommandBuilder().setName('player').setDescription('player name'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(cloodyconfig.token);

cloodybot.once('ready', () => {
	console.log(`Logged : ${cloodybot.user.tag}`);
    setInterval(() => {
        cloodymta.query({
            type: 'mtasa',
            host: cloodyconfig.server_ip,
            port: cloodyconfig.server_port
        }).then((state) => {
            cloodybot.user.setActivity(`Player : ${state.raw.numplayers}/${state.maxplayers}`);
        }).catch(err => {
            console.log(err);
        });
    }, 5000);
    (async () => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(cloodybot.user.id, cloodyconfig.guildId),
                { body: commands },
            );
    
            console.log('Successfully registered application commands.');
        } catch (error) {
            console.error(error);
        }
    })();
});


cloodybot.on('interactionCreate', async cloodymsg => {
	if (!cloodymsg.isCommand()) return;

	const { commandName } = cloodymsg;

	if (commandName === 'server') {
		cloodymta.query({
            type: 'mtasa',
            host: cloodyconfig.server_ip,
            port: cloodyconfig.server_port
        }).then(async (state) => {
            console.log(state)
            var cloodyembed = new Discordcloody.MessageEmbed()
            .setTitle(state.name)
            .setColor(`BLUE`)
            .addField(`Map :`,` - ${state.map}`,true)
            .addField(`Gametype :`,` - ${state.raw.gametype}`,true)
            .addField(`Developer :`,` - ${state.raw.Developer}`,true)
            .addField(`Player :`,` - ${state.raw.numplayers}/${state.maxplayers}`,true)
            .addField(`Ping:`,` - ${state.ping}ms`,true)
            .addField(`IP:`,` - ${state.connect}`,true)
            .setTimestamp()
            .setFooter(`Requested by ${cloodymsg.member.user.tag}`,cloodymsg.member.user.avatarURL());

            await cloodymsg.reply({ embeds: [cloodyembed] });
        }).catch(err => {
            console.log(err);
        });
	} 
});
cloodybot.on('interactionCreate', async cloodymsg => {
	if (!cloodymsg.isCommand()) return;

	const { commandName } = cloodymsg;

	if (commandName === 'player') {
		cloodymta.query({
            type: 'mtasa',
            host: cloodyconfig.server_ip,
            port: cloodyconfig.server_port
        }).then(async (state) => {
            console.log(state)
            var players = [];
     state.players.forEach(p => {
    players.push(`${p.name}\n`)
});
            var cloodyembed = new Discordcloody.MessageEmbed()
            .setTitle(state.name)
            .setColor(`BLUE`)
            .addFields(
                { name: 'Players name', value: `\`\`\`${players}\`\`\``, inline: true },   
                )
        
            .setTimestamp()
            .setFooter(`Requested by ${cloodymsg.member.user.tag}`,cloodymsg.member.user.avatarURL());

            await cloodymsg.reply({ embeds: [cloodyembed] });
        }).catch(err => {
            console.log(err);
        });
	} 
});


cloodybot.login(cloodyconfig.token);