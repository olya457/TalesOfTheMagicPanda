import type { TaleParam } from '../navigation/types';

const THUMB_LOTUS = require('../assets/panda_lotus_thumb.png');
const THUMB_STAR  = require('../assets/panda_star_thumb.png');
const THUMB_GROVE = require('../assets/panda_grove_thumb.png');
const THUMB_MOON  = require('../assets/panda_moon_thumb.png');
const THUMB_WIND  = require('../assets/panda_wind_thumb.png');

export const TALES: TaleParam[] = [
  {
    id: 'lotus',
    category: 'lotus',
    title: 'The Panda and the Hidden Lotus',
    thumb: THUMB_LOTUS,
    start: 'start',
    nodes: {
      start: {
        text:
          'Once upon a time, deep inside a bamboo forest, there lived a wise panda named Lin. Every morning, Lin would walk to the river, watching the lotus flowers bloom and listening to the whispers of the wind. ' +
          'One day, Lin discovered a strange bud among the lotuses. It was glowing softly, as if hiding a secret. The panda felt that the flower was not ordinary but magical, waiting for someone to unlock its mystery.',
        choices: [
          { label: 'Lin decides to sit quietly and meditate by the glowing bud.', next: 'A1' },
          { label: 'Lin decides to ask the fireflies, the guardians of the forest, about the lotus.', next: 'B1' },
        ],
      },

      A1: {
        text:
          'Lin closed his eyes and took a deep breath. The forest fell silent, and the glowing bud pulsed in rhythm with his calm heart. Slowly, he began to feel warmth spreading through his paws. ' +
          'The bud opened slightly, showing golden light within. Lin understood: the lotus would only bloom for those who carried peace in their heart.',
        choices: [
          { label: 'Lin gently touches the lotus.', next: 'endA' },
          { label: 'Lin decides to sing a song of gratitude to the forest.', next: 'endB' },
        ],
      },

      B1: {
        text:
          'Lin followed the tiny sparks of fireflies until he found their leader, a bright green one named Lumi. “The lotus is ancient,” Lumi whispered. “It will open only to those who ask with kindness.” ' +
          'The fireflies surrounded the bud, lighting it with gentle glow. The lotus shimmered, and Lin felt it was ready to reveal its secret—but only if he chose wisely.',
        choices: [
          { label: 'Lin gently touches the lotus.', next: 'endA' },
          { label: 'Lin decides to sing a song of gratitude to the forest.', next: 'endB' },
        ],
      },

      endA: {
        text:
          'Lin reached out with his paw and touched the lotus. Instantly, the bud unfolded into a magnificent golden bloom. The light surrounded him, filling the forest with peace. ' +
          'From that day on, every animal who came to the river felt calmer and kinder, because the panda’s lotus spread wisdom across the land.',
        isEnding: true,
      },

      endB: {
        text:
          'Instead of touching the lotus, Lin began to sing softly, thanking the forest, the river, and the stars. His voice blended with the night wind, and the lotus bloomed on its own. ' +
          'The flower’s golden light rose into the sky, forming shining stars above the forest. From then on, the panda’s forest was known as the Valley of Gratitude, and travelers came from afar to feel its warmth.',
        isEnding: true,
      },
    },
  },

  {
    id: 'star',
    category: 'star',
    title: 'The Panda and the Lost Star',
    thumb: THUMB_STAR,
    start: 'start',
    nodes: {
      start: {
        text:
          'One quiet evening, Lin the panda noticed a star falling from the sky. It landed deep in the bamboo forest, glowing faintly between the trees. ' +
          'Curious, Lin approached and found a small crystal shard, still warm with starlight. The shard seemed to whisper, calling for help.',
        choices: [
          { label: 'Lin decides to keep the shard safe in his den.', next: 'A1' },
          { label: 'Lin decides to bring the shard back to the river’s reflection.', next: 'B1' },
        ],
      },

      A1: {
        text:
          'Lin carried the shard home, wrapping it in bamboo leaves. As night fell, the shard grew dim, as if it was losing its light. The panda worried—perhaps the star wanted freedom.',
        choices: [
          { label: 'Lin whispers a wish into the shard.', next: 'endA' },
          { label: 'Lin asks the owls to guide the shard back to the heavens.', next: 'endB' },
        ],
      },

      B1: {
        text:
          'Lin placed the shard into the river’s reflection. The water glowed, and the shard pulsed as if recognizing the night sky. Still, its light was incomplete.',
        choices: [
          { label: 'Lin whispers a wish into the shard.', next: 'endA' },
          { label: 'Lin asks the owls to guide the shard back to the heavens.', next: 'endB' },
        ],
      },

      endA: {
        text:
          'Lin whispered: “Shine again, little star.” The shard blazed, lifted from his paws, and shot into the sky. ' +
          'That night, a new bright star twinkled, known as Panda’s Star.',
        isEnding: true,
      },

      endB: {
        text:
          'The owls spread their wings, lifting the shard high above. Slowly, it merged with the sky and returned home. ' +
          'From then on, the owls became guardians of falling stars.',
        isEnding: true,
      },
    },
  },

  {
    id: 'grove',
    category: 'grove',
    title: 'The Panda and the Hidden Bamboo Grove',
    thumb: THUMB_GROVE,
    start: 'start',
    nodes: {
      start: {
        text:
          'Lin wandered deeper than ever before and stumbled upon a sealed bamboo gate covered with vines. Strange symbols glowed faintly on it. ' +
          'The panda touched the gate, and a soft voice whispered: “Only wisdom or courage will open the way.”',
        choices: [
          { label: 'Lin studies the glowing symbols carefully.', next: 'A1' },
          { label: 'Lin pushes the gate with all his strength.', next: 'B1' },
        ],
      },

      A1: {
        text:
          'As Lin traced the symbols, they rearranged into a riddle: “What grows tall but bends in storms?” Smiling, Lin whispered: “Bamboo.” ' +
          'The gate shimmered and loosened.',
        choices: [
          { label: 'Lin steps inside quietly.', next: 'endA' },
          { label: 'Lin calls the birds to explore first.', next: 'endB' },
        ],
      },

      B1: {
        text:
          'Lin pushed hard, his paws shaking. Suddenly, the vines broke, and the gate creaked open—but it seemed unstable.',
        choices: [
          { label: 'Lin steps inside quietly.', next: 'endA' },
          { label: 'Lin calls the birds to explore first.', next: 'endB' },
        ],
      },

      endA: {
        text:
          'Inside, Lin found a glowing bamboo grove where the shoots whispered stories of the forest. ' +
          'It became his secret meditation place.',
        isEnding: true,
      },

      endB: {
        text:
          'The birds flew inside and discovered golden bamboo seeds. Lin planted them near the river, and soon the forest grew even stronger.',
        isEnding: true,
      },
    },
  },

  {
    id: 'moon',
    category: 'moon',
    title: 'The Panda and the Moonlit Bridge',
    thumb: THUMB_MOON,
    start: 'start',
    nodes: {
      start: {
        text:
          'One night, Lin found a bridge made of moonlight stretching across the river. It shimmered softly, inviting him to cross. ' +
          'The panda placed one paw on the bridge—it felt real, but fragile like glass.',
        choices: [
          { label: 'Lin carefully walks across.', next: 'A1' },
          { label: 'Lin sits by the bridge, waiting to see what happens.', next: 'B1' },
        ],
      },

      A1: {
        text:
          'The panda stepped forward, and the bridge sparkled brighter. With each step, he saw visions of kind deeds he had done.',
        choices: [
          { label: 'Lin runs quickly to the other side.', next: 'endA' },
          { label: 'Lin bows to the moon before crossing.', next: 'endB' },
        ],
      },

      B1: {
        text:
          'Lin waited patiently. The moon rose higher, and the bridge slowly grew stronger, as if rewarding his patience.',
        choices: [
          { label: 'Lin runs quickly to the other side.', next: 'endA' },
          { label: 'Lin bows to the moon before crossing.', next: 'endB' },
        ],
      },

      endA: {
        text:
          'Lin reached the other side and found a silver lotus glowing under the moon. It became his token of courage.',
        isEnding: true,
      },

      endB: {
        text:
          'When Lin bowed, the moon smiled. The bridge transformed into a permanent stone path, a gift for all creatures of the forest.',
        isEnding: true,
      },
    },
  },


  {
    id: 'wind',
    category: 'wind',
    title: 'The Panda and the Whispering Wind',
    thumb: THUMB_WIND,
    start: 'start',
    nodes: {
      start: {
        text:
          'One breezy morning, Lin noticed the wind carrying faint voices. It was as if the forest itself was trying to speak. ' +
          'Following the sound, he found a hollow tree glowing with wind-spirits swirling inside.',
        choices: [
          { label: 'Lin puts his ear close to the hollow.', next: 'A1' },
          { label: 'Lin asks the wind-spirits directly: “What do you need?”', next: 'B1' },
        ],
      },

      A1: {
        text:
          'He heard whispers: “We are trapped, release us…” The panda realized the spirits needed freedom.',
        choices: [
          { label: 'Lin gently breaks the branch.', next: 'endA' },
          { label: 'Lin blows into the hollow with his breath.', next: 'endB' },
        ],
      },

      B1: {
        text:
          'The wind-spirits answered: “Break the branch that seals us, and we shall be free.”',
        choices: [
          { label: 'Lin gently breaks the branch.', next: 'endA' },
          { label: 'Lin blows into the hollow with his breath.', next: 'endB' },
        ],
      },

      endA: {
        text:
          'The spirits soared into the sky, creating gentle breezes that kept the forest cool. ' +
          'They named Lin their Wind Friend.',
        isEnding: true,
      },

      endB: {
        text:
          'Lin blew into the hollow, and the spirits rushed out, swirling joyfully. ' +
          'They gifted him a feather that always carried fresh air wherever he went.',
        isEnding: true,
      },
    },
  },
];

export const TALES_BY_ID: Record<string, TaleParam> = Object.fromEntries(
  TALES.map(t => [t.id, t])
);
