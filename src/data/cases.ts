/**
 * Pre-written murder cases for the game
 * Each case is logically consistent and fair to solve
 */

export interface Suspect {
  id: string;
  name: string;
  title: string;
  alibi: string;
  motive: string;
  clues: string[];
  appearance: string;
}

export interface MurderCase {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  victim: {
    name: string;
    title: string;
    description: string;
  };
  location: string;
  timeOfDeath: string;
  setting: string;
  introNarration: string;
  suspects: Suspect[];
  trueMurderer: string;
  keyFacts: string[];
  solution: string;
  revealNarration: string;
}

export const MURDER_CASES: MurderCase[] = [
  {
    id: 'screaming-death',
    level: 1,
    title: 'The Man Who Screamed After Death',
    subtitle: 'Truth does not arrive screaming',
    victim: {
      name: 'Arjun Mehra',
      title: 'Powerful Industrialist',
      description: 'Found lying peacefully on his bed, hands folded, as though death had come gently. Yet at 11:00 PM, his scream shattered the silence.',
    },
    location: 'Blackwood Manor - Top Floor Bedroom',
    timeOfDeath: 'Between 10:15 and 10:30 PM',
    setting: 'A rain-soaked night. The bedroom window faces the inner courtyard, curtains moving in the light wind.',
    introNarration: `Truth does not arrive screaming. It whispers… and waits to be noticed.

On this rain-soaked night, at exactly 10:30 PM, the heart of Arjun Mehra stopped beating. He was found in his bedroom, lying neatly on his bed, eyes closed, hands folded — as though death had come gently.

There were no signs of struggle. No wounds. No blood. The house fell silent.

Until 11:00 PM. At that hour, a scream tore through the corridors — a scream unmistakably belonging to Arjun Mehra. Loud. Agonized. Alive.

The scream was heard by three people. But when they reached the room… Arjun Mehra was already dead.

You may ask only three questions. Choose wisely, for the truth hides behind the impossible.`,
    suspects: [
      {
        id: 'kunal-mehra',
        name: 'Kunal Mehra',
        title: 'The Son',
        alibi: 'Was in the garden when the scream occurred, rushed inside with others.',
        motive: 'Had argued with his father over inheritance earlier that evening. Witnesses recall harsh words and slammed doors.',
        clues: [
          'He was seen arguing violently with his father at 9:30 PM.',
          'His fingerprints were on the wine glass.',
          'He stood to inherit everything if his father died.',
        ],
        appearance: 'A young man burdened by rage, hands that shake when he speaks of his father.',
      },
      {
        id: 'dr-sameer',
        name: 'Dr. Sameer Iyer',
        title: 'The Family Doctor',
        alibi: 'Left the house at 10:00 PM after administering medication.',
        motive: 'Arjun had discovered the doctor was prescribing unnecessary treatments for profit.',
        clues: [
          'He visited Arjun at 9:45 PM to administer medication.',
          'He left calmly, too calmly some thought.',
          'The medication bottle was found empty beside the bed.',
        ],
        appearance: 'A composed man with steady hands, eyes that reveal nothing.',
      },
      {
        id: 'rajiv-khanna',
        name: 'Rajiv Khanna',
        title: 'The Business Partner',
        alibi: 'Claims to have left the house at 10:15 PM, before the death.',
        motive: 'Had a major financial dispute with Arjun. The business was failing due to Arjun\'s decisions.',
        clues: [
          'He had access to the house and knew the layout well.',
          'A small audio recorder was found beneath the bed.',
          'He was seen near the courtyard at 11:05 PM by a neighbor.',
        ],
        appearance: 'A man of polished smiles and quiet greed, always checking his watch.',
      },
      {
        id: 'ramesh-caretaker',
        name: 'Ramesh',
        title: 'The Caretaker',
        alibi: 'Was cleaning the halls, heard everything from downstairs.',
        motive: 'Arjun was planning to fire him for stealing from the household.',
        clues: [
          'He had master keys to all rooms.',
          'The wine glass was wiped unusually clean.',
          'He was the first to reach the room after the scream.',
        ],
        appearance: 'Ever present, ever watching. A man who sees all and says little.',
      },
    ],
    trueMurderer: 'rajiv-khanna',
    keyFacts: [
      'Death occurred between 10:15-10:30 PM from cardiac arrest.',
      'The scream was heard at 11:00 PM, 30 minutes after death.',
      'An audio recorder was found beneath the bed.',
      'The courtyard amplifies sound unusually well.',
      'Rajiv was seen near the courtyard at 11:05 PM.',
      'The wine contained traces of a delayed-action poison.',
      'The bedroom window was open, facing the courtyard.',
    ],
    solution: `Rajiv Khanna poisoned the wine earlier in the evening with a delayed-action toxin that caused cardiac arrest. After Arjun died quietly at 10:30 PM, Rajiv returned secretly at 11:00 PM, placed a pre-recorded scream near the open window, and played it to shift the perceived time of death. This made everyone believe Arjun died after 11:00 PM, removing suspicion from those who had left earlier.`,
    revealNarration: `The dead do not scream. But the guilty make them scream… to hide the moment truth was born.

Rajiv Khanna's poison worked in silence, claiming Arjun's life at 10:30. But silence would not serve his purpose. He returned like a shadow, carrying with him the recorded agony of his victim, played through the window to deceive time itself.

The scream was not proof of life. It was proof of planning. The courtyard that amplified his deception now amplifies his guilt.`,
  },
  {
    id: 'bleeding-room',
    level: 2,
    title: 'The Room That Bled Before the Murder',
    subtitle: 'Some rooms remember violence before it happens',
    victim: {
      name: 'Professor Aditya Rao',
      title: 'Research Scholar',
      description: 'Found dead in his study chair at 11:30 PM. Earlier that evening, blood had seeped from beneath his door while he was still alive.',
    },
    location: 'Professor Rao\'s Private Study',
    timeOfDeath: '11:30 PM',
    setting: 'A locked study that bled before its occupant died. The room was cleaned, then became a tomb.',
    introNarration: `Some rooms remember violence… even before it happens.

At 8:40 PM, blood was found seeping from beneath the door of Professor Aditya Rao's private study. The door was locked. Police were called immediately.

When the door was broken open at 9:15 PM, Professor Rao was found sitting in his chair… alive. Confused. Uninjured. Shaken.

The room was cleaned. The night moved on. At 11:30 PM, Professor Aditya Rao was found dead in the same chair. There was no blood this time.

The room had bled before the murder… and remained clean afterward. You have three questions to solve what the room remembers.`,
    suspects: [
      {
        id: 'neha-rao',
        name: 'Neha Rao',
        title: 'The Wife',
        alibi: 'Supervised the cleaning after the blood incident, was in the kitchen during the murder.',
        motive: 'Aditya was planning to divorce her and leave everything to charity.',
        clues: [
          'She insisted on supervising the room cleaning personally.',
          'She had access to animal blood from her veterinary practice.',
          'The chair in the study was replaced during cleaning.',
        ],
        appearance: 'Cold and composed, a woman who plans three steps ahead.',
      },
      {
        id: 'aarav-assistant',
        name: 'Aarav',
        title: 'The Research Assistant',
        alibi: 'Was in the library during both incidents, has witnesses.',
        motive: 'Professor Rao was going to expose his plagiarized research.',
        clues: [
          'He was the last person with access to the study earlier.',
          'His research notes were found in the professor\'s desk.',
          'He had knowledge of the professor\'s heart condition.',
        ],
        appearance: 'Nervous young man, always fidgeting with his papers.',
      },
      {
        id: 'kapur-neighbor',
        name: 'Mr. Kapur',
        title: 'The Neighbor',
        alibi: 'Was at home, complained about noise that night.',
        motive: 'The professor was blocking his property development plans.',
        clues: [
          'He complained about unusual sounds from the study.',
          'He had a key to the house from years of friendship.',
          'His construction business was failing due to the professor\'s opposition.',
        ],
        appearance: 'A frustrated man with calloused hands and tired eyes.',
      },
      {
        id: 'shyam-cleaner',
        name: 'Shyam',
        title: 'The House Cleaner',
        alibi: 'Called in urgently after the blood incident, left after cleaning.',
        motive: 'The professor had caught him stealing and threatened to report him.',
        clues: [
          'He brought special cleaning chemicals that night.',
          'He was familiar with the house layout.',
          'The smell of his chemicals lingered in the room.',
        ],
        appearance: 'A quiet man who notices everything while pretending to see nothing.',
      },
    ],
    trueMurderer: 'neha-rao',
    keyFacts: [
      'The blood at 8:40 PM was animal blood, not human.',
      'The chair was replaced during the cleaning process.',
      'Professor Rao died of asphyxiation, not blood loss.',
      'The new chair was rigged with a slow-release gas mechanism.',
      'Neha had veterinary training and access to animal blood.',
      'The cleaning was used as cover to replace the chair.',
      'The professor\'s heart condition made him vulnerable to gas.',
    ],
    solution: `Neha Rao orchestrated an elaborate deception. She spilled animal blood under the door to force it open and justify cleaning the room. During the cleaning, she replaced the professor's chair with one rigged to slowly release a lethal gas. When he returned to his study later, the chair killed him silently through asphyxiation.`,
    revealNarration: `Blood without injury. Murder without blood. The room bled to hide its future hunger.

Neha Rao painted the floor with borrowed blood, not to create death, but to create opportunity. The cleaning was not to remove evidence—it was to plant it. The chair that welcomed her husband's final rest had been transformed into his tomb.

She made the room bleed first, so it would not need to bleed again.`,
  },
  {
    id: 'frozen-time',
    level: 3,
    title: 'The Clock That Refused to Move',
    subtitle: 'When time stands still, someone does not want truth to move',
    victim: {
      name: 'Judge Nitin Malhotra',
      title: 'High Court Judge',
      description: 'Found dead in his locked library at midnight. The grandfather clock had stopped at 11:40 PM, yet witnesses heard it chime after midnight.',
    },
    location: 'Judge Malhotra\'s Private Library',
    timeOfDeath: 'Disputed - Clock stopped at 11:40 PM',
    setting: 'A locked library where time itself became evidence. The grandfather clock holds the key to when death truly arrived.',
    introNarration: `When time stands still, it is because someone does not want the truth to move.

At exactly 12:00 midnight, Judge Nitin Malhotra was found dead in his locked library. The grandfather clock beside him had stopped at 11:40 PM.

Yet multiple witnesses claimed to hear the clock chime after midnight. The body was already cold. The fireplace had been recently used. The window was sealed.

Time itself seemed confused. The clock had stopped, but death had not waited. You have three questions to make time tell the truth.`,
    suspects: [
      {
        id: 'priya-daughter',
        name: 'Priya Malhotra',
        title: 'The Daughter',
        alibi: 'Was arguing with her father until 11:30 PM, then went to her room.',
        motive: 'Her father was going to disinherit her for her gambling debts.',
        clues: [
          'She was heard arguing violently with her father.',
          'Her room is directly above the library.',
          'She had gambling debts that her father refused to pay.',
        ],
        appearance: 'A desperate woman with expensive tastes and empty pockets.',
      },
      {
        id: 'mohan-butler',
        name: 'Mohan',
        title: 'The Butler',
        alibi: 'Was winding clocks throughout the house, as was his nightly routine.',
        motive: 'The judge had discovered he was selling information about legal cases.',
        clues: [
          'He was responsible for maintaining all the clocks in the house.',
          'A small mechanical device was found in the fireplace ashes.',
          'He had detailed knowledge of the judge\'s nightly routines.',
        ],
        appearance: 'An elderly man with precise movements and secrets behind his eyes.',
      },
      {
        id: 'sharma-lawyer',
        name: 'Mr. Sharma',
        title: 'The Lawyer',
        alibi: 'Was present for a late meeting, left at 11:45 PM.',
        motive: 'The judge was about to expose his client\'s illegal activities.',
        clues: [
          'He was present late at night for urgent legal matters.',
          'His briefcase contained documents about the judge\'s cases.',
          'He was seen leaving through the front door at 11:45 PM.',
        ],
        appearance: 'A nervous man in an expensive suit, constantly checking his watch.',
      },
      {
        id: 'ravi-friend',
        name: 'Ravi Kumar',
        title: 'The Old Friend',
        alibi: 'Was sleeping in the guest room, woke up when the body was discovered.',
        motive: 'The judge knew about his involvement in a decades-old corruption case.',
        clues: [
          'He was staying overnight in the guest room.',
          'He had access to the house and knew its layout well.',
          'Old legal documents about his case were found in the judge\'s desk.',
        ],
        appearance: 'A tired man carrying the weight of old sins.',
      },
    ],
    trueMurderer: 'mohan-butler',
    keyFacts: [
      'The grandfather clock was manually stopped at 11:40 PM.',
      'A mechanical chiming device was hidden and later burned.',
      'The judge was killed at 11:35 PM, before the clock stopped.',
      'The false chimes after midnight were from the hidden device.',
      'Mohan had access to clock mechanisms and the judge\'s routine.',
      'The fireplace was used to destroy the chiming device.',
      'The locked room was accessed using the butler\'s master key.',
    ],
    solution: `Mohan the butler killed Judge Malhotra at 11:35 PM with a blunt object. He then stopped the grandfather clock at 11:40 PM and planted a mechanical device that would chime after midnight, creating a false timeline. The device was later burned in the fireplace to destroy evidence. This made everyone believe the judge died after midnight, when Mohan had an alibi.`,
    revealNarration: `Time bends only for those who understand its mechanisms. Mohan knew every tick, every chime, every gear in the judge's house.

He struck at 11:35, then became time's architect. The stopped clock spoke of 11:40, while his hidden device sang false songs past midnight. He made time lie as easily as he wound its springs.

But time, like truth, leaves traces. The ashes in the fireplace remember what burned. The clock remembers when it was forced to stop. And justice remembers those who try to steal time itself.`,
  },
];

export function getCaseByLevel(level: number): MurderCase | undefined {
  return MURDER_CASES.find(c => c.level === level);
}

export function getCaseById(id: string): MurderCase | undefined {
  return MURDER_CASES.find(c => c.id === id);
}
