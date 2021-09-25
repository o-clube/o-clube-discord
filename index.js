const fs = require('fs');

const {Client, Collection, Intents} = require('discord.js');

// Deploy commands to Discord API
require('./deployCommands');

// Init DB
console.log('Starting database.');
require('./database');
console.log('Database started.');


const client = new Client({intents: [Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_VOICE_STATES,
  Intents.FLAGS.GUILD_MEMBERS]});

// Load commands
client.commands = new Collection();
// eslint-disable-next-line semi
const commandFiles = fs.readdirSync('./commands')
    .filter((file) => file.endsWith('.js'));


for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  console.log(`Command ${command.data.name} loaded.`);
}


// Load events
const eventFiles = fs.readdirSync('./events')
    .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`Event ${event.name} loaded.`);
}

// Load tasks
const taskFiles = fs.readdirSync('./tasks')
    .filter((file) => file.endsWith('.js'));

for (const file of taskFiles) {
  const task = require(`./tasks/${file}`);
  try {
    task.run(client);
    console.log(`Task ${task.name} started.`);
  } catch (error) {
    console.error(`Error while starting ${task.name}.\n${error}`);
  }
}

// Handle interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await interaction.deferReply();
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.editReply({
      content: 'There was an error while executing this command!',
      ephemeral: true});
  }
});


client.login(process.env.DISCORD_TOKEN);
