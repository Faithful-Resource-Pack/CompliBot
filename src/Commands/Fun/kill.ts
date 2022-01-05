import MessageEmbed from '~/Client/embed';
import { Command } from '~/Interfaces';
import { getMember } from '~/Functions/getMember';

const reasons = [
	'%player% was shot by %author%',
	'%player% was pummeled by %author%',
	'%player% was pricked to death',
	'%player% walked into a cactus whilst trying to escape %author%',
	'%player% drowned',
	'%player% drowned whilst trying to escape %author%',
	'%player% experienced kinetic energy',
	'%player% experienced kinetic energy whilst trying to escape %author%',
	'%player% blew up',
	'%player% was blown up by %author%',
	'%player% was killed by [Intentional Game Design]',
	'%player% hit the ground too hard',
	'%player% hit the ground too hard whilst trying to escape %author%',
	'%player% fell from a high place',
	'%player% fell off a ladder',
	'%player% fell off some vines',
	'%player% fell off some weeping vines',
	'%player% fell off some twisting vines',
	'%player% fell off scaffolding',
	'%player% fell while climbing',
	'death.fell.accident.water',
	'%player% was impaled on a stalagmite',
	'%player% was impaled on a stalagmite whilst fighting %author%',
	'%player% was squashed by a falling anvil',
	'%player% was squashed by a falling anvil whilst fighting %author%',
	'%player% was squashed by a falling block',
	'%player% as squashed by a falling block whilst fighting %author%',
	'%player% was skewered by a falling stalactite',
	'%player% was skewered by a falling stalactite whilst fighting %author%',
	'%player% went up in flames',
	'%player% walked into fire whilst fighting %author%',
	'%player% burned to death',
	'%player% was burnt to a crisp whilst fighting %author%',
	'%player% went off with a bang',
	'%player% tried to swim in lava',
	'%player% tried to swim in lava to escape %author%',
	'%player% was struck by lightning',
	'%player% was struck by lightning whilst fighting %author%',
	'%player% discovered the floor was lava',
	'%player% walked into danger zone due to %author%',
	'%player% was killed by magic',
	'%player% was killed by magic whilst trying to escape %author%',
	'%player% was killed by %author% using magic',
	'%player% froze to death',
	'%player% was frozen to death by %author%',
	'%player% was slain by %author%',
	'%player% was fireballed by %author%',
	'%player% was stung to death',
	'death.attack.sting.item',
	'%player% was shot by a skull from %author%',
	'death.attack.witherSkull.item',
	'%player% starved to death',
	'%player% starved to death whilst fighting %author%',
	'%player% suffocated in a wall',
	'%player% suffocated in a wall whilst fighting %author%',
	'%player% was squished too much',
	'%player% was squashed by %author%',
	'%player% was poked to death by a sweet berry bush',
	'%player% was poked to death by a sweet berry bush whilst trying to escape %author%',
	'%player% was killed trying to hurt %author%',
	'%player% was impaled by %author%',
	'%player% fell out of the world',
	'%player% didn\'t want to live in the same world as %author%',
	'%player% withered away',
	'%player% withered away whilst fighting %author%',
	'%player% died from dehydration',
	'%player% died from dehydration whilst trying to escape %author%',
	'%player% died',
	'%player% died because of %author%',
	'%player% was roasted in dragon breath',
	'%player% was roasted in dragon breath by %author%',
	'%player% was doomed to fall',
	'%player% was doomed to fall by %author%',
	'%player% fell too far and was finished by %author%',
	'%player% was stung to death by %author%',
	'%player% went off with a bang whilst fighting %author%',
	'%player% was killed by even more magic',
	'%player% was too soft for this world',
	'%player% was too soft for this world (%author% helped)'
];

const reasons_weapon = [
	'%player% was shot by %author% using %weapon%',
	'%player% was pummeled by %author% using %weapon%',
	'%player% was blown up by %author% using %weapon%',
	'%player% went off with a bang due to a firework fired from %weapon% by %author%',
	'%player% was killed by %author% using %weapon%',
	'%player% was slain by %author% using %weapon%',
	'%player% was fireballed by %author% using %weapon%',
	'%player% was killed by %weapon% trying to hurt %author%',
	'%player% was impaled by %author% with %weapon%',
	'%player% was doomed to fall by %author% using %weapon%',
	'%player% fell too far and was finished by %author% using %weapon%'
];

export const command: Command = {
	name: 'kill',
	description: 'not implemented yet',
	usage: ['kill <user> [weapon]'],
	run: async (client, message, args) => {
		if (!args.length) return message.warn('No args given');

		const memberId = await getMember(message, args[0]);
		if (memberId == undefined) return message.warn('I couldn\'t find anyone to kill!');

		const member = await message.guild.members.fetch(memberId);
		const author = await message.guild.members.fetch(message.author.id);

		const weapon = args.slice(1).join(' ');

		let result = weapon.length > 0 ? reasons_weapon[Math.floor(Math.random() * reasons_weapon.length)] : reasons[Math.floor(Math.random() * reasons.length)];

		result = result.replace('%player%', member.displayName);
		result = result.replace('%author%', author.displayName);
		result = result.replace('%weapon%', weapon);

		var embed = new MessageEmbed()
			.setDescription(result);

		const res = await message.reply({ embeds: [embed] });
		res.deleteReact({ authorMessage: message, deleteAuthorMessage: true });
	},
};
