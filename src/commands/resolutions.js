// This code was written by Copilot. It may contain bugs.

// Description: This command allows users to set their own resolutions for the year. It also allows users to view other users' resolutions.
// It also allows users to mark their resolutions as completed. The command is called with the following syntax:
//
// /resolutions [add|remove|complete|uncomplete|view] [resolution or user]
//
// The add and remove subcommands allow users to add and remove resolutions from their list of resolutions.
// The complete and uncomplete subcommands allow users to mark their resolutions as completed or uncompleted.
// The view subcommand allows users to view their own resolutions or the resolutions of other users.

const {bold, SlashCommandBuilder} = require("@discordjs/builders");
const {ChannelType, PermissionsBitField} = require("discord.js");

const GuildResolutions = require("../models/guildResolutions.js");
const GuildMemberController = require("../controllers/GuildMemberController.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resolutions")
        .setDescription("Set your new year resolutions")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Add a new resolution")
                .addStringOption((option) =>
                    option.setName("resolution")
                        .setDescription("The resolution to add")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Remove a resolution")
                .addStringOption((option) =>
                    option.setName("resolution")
                        .setDescription("The resolution to remove")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("complete")
                .setDescription("Mark a resolution as completed")
                .addStringOption((option) =>
                    option.setName("resolution")
                        .setDescription("The resolution to mark as completed")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("uncomplete")
                .setDescription("Mark a resolution as uncompleted")
                .addStringOption((option) =>
                    option.setName("resolution")
                        .setDescription("The resolution to mark as uncompleted")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("view")
                .setDescription("View your resolutions or the resolutions of another user")
                .addUserOption((option) =>
                    option.setName("user")
                        .setDescription("The user whose resolutions to view"),
                ),
        ),
    async execute(interaction) {
        const guild = interaction.guild;
        const member = interaction.member;
        const subcommand = interaction.options.getSubcommand();
        const guildMemberController = new GuildMemberController(guild, member);

        if (!guildMemberController.hasPermission(PermissionsBitField.FLAGS.MANAGE_GUILD)) {
            return interaction.reply({content: "You do not have permission to use this command", ephemeral: true});
        }

        const guildResolutions = await GuildResolutions.findOne({
            where: {
                guild_id: guild.id,
                member_id: member.id,
            },
        });

        if (subcommand === "add") {
            const resolution = interaction.options.getString("resolution");

            if (guildResolutions.uncompleted_resolutions.includes(resolution)) {
                return interaction.reply({content: "You already have this resolution", ephemeral: true});
            }

            guildResolutions.uncompleted_resolutions.push(resolution);
            await guildResolutions.save();

            return interaction.reply({content: `Added resolution ${bold(resolution)}`, ephemeral: true});
        } else if (subcommand === "remove") {
            const resolution = interaction.options.getString("resolution");

            if (!guildResolutions.uncompleted_resolutions.includes(resolution)) {
                return interaction.reply({content: "You do not have this resolution", ephemeral: true});
            }

            guildResolutions.uncompleted_resolutions.splice(guildResolutions.uncompleted_resolutions.indexOf(resolution), 1);
            await guildResolutions.save();

            return interaction.reply({content: `Removed resolution ${bold(resolution)}`, ephemeral: true});
        } else if (subcommand === "complete") {
            const resolution = interaction.options.getString("resolution");

            if (!guildResolutions.uncompleted_resolutions.includes(resolution)) {
                return interaction.reply({content: "You do not have this resolution", ephemeral: true});
            }

            guildResolutions.uncompleted_resolutions.splice(guildResolutions.uncompleted_resolutions.indexOf(resolution), 1);
            guildResolutions.completed_resolutions.push(resolution);
            await guildResolutions.save();

            return interaction.reply({content: `Completed resolution ${bold(resolution)}`, ephemeral: true});
        }

        if (subcommand === "uncomplete") {
            const resolution = interaction.options.getString("resolution");

            if (!guildResolutions.completed_resolutions.includes(resolution)) {
                return interaction.reply({content: "You do not have this resolution", ephemeral: true});
            }

            guildResolutions.completed_resolutions.splice(guildResolutions.completed_resolutions.indexOf(resolution), 1);
            guildResolutions.uncompleted_resolutions.push(resolution);
            await guildResolutions.save();

            return interaction.reply({content: `Uncompleted resolution ${bold(resolution)}`, ephemeral: true});
        }

        if (subcommand === "view") {
            const user = interaction.options.getUser("user");

            if (user) {
                const guildMemberController = new GuildMemberController(guild, user);

                if (!guildMemberController.hasPermission(PermissionsBitField.FLAGS.MANAGE_GUILD)) {
                return interaction.reply({content: "You do not  have permission to use this command", ephemeral: true});
                }

                const guildResolutions = await GuildResolutions.findOne({
                    where: {
                        guild_id: guild.id,
                        member_id: user.id,
                    },
                });

                if (!guildResolutions) {
                    return interaction.reply({content: "This user does not have any resolutions", ephemeral: true});
                }

                const uncompletedResolutions = guildResolutions.uncompleted_resolutions;
                const completedResolutions = guildResolutions.completed_resolutions;

                let message = `**${user.username}'s resolutions**\n\n`;

                if (uncompletedResolutions.length > 0) {
                    message += "**Uncompleted resolutions**\n";
                    uncompletedResolutions.forEach((resolution) => {
                        message += `• ${resolution}\n`;
                    });
                }

                if (completedResolutions.length > 0) {
                    message += "\n**Completed resolutions**\n";
                    completedResolutions.forEach((resolution) => {
                        message += `• ${resolution}\n`;
                    });
                }

                return interaction.reply({content: message, ephemeral: true});
            }

            else{
                // if no user is specified, view the user's own resolutions
                if (!guildResolutions) {
                    return interaction.reply({content: "You do not have any resolutions", ephemeral: true});
                }

                const uncompletedResolutions = guildResolutions.uncompleted_resolutions;
                const completedResolutions = guildResolutions.completed_resolutions;

                let message = "**Your resolutions**\n\n";

                if (uncompletedResolutions.length > 0) {
                    message += "**Uncompleted resolutions**\n";
                    uncompletedResolutions.forEach((resolution) => {
                        message += `• ${resolution}\n`;
                    });
                }

                if (completedResolutions.length > 0) {
                    message += "\n**Completed resolutions**\n";
                    completedResolutions.forEach((resolution) => {
                        message += `• ${resolution}\n`;
                    });
                }

                return interaction.reply({content: message, ephemeral: true});
                
            }
        }
    },
};

module.exports = command;

