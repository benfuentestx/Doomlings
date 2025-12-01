# Card Test Tracker

## Status Legend
- ⬜ Not Tested
- ✅ Tested - No Changes Needed
- 🔧 Tested - Fixed
- ❌ Tested - Needs Manual Review
- 🚫 Not a Trait Card (Age/Catastrophe/Other)

## Test Progress
- **Total Cards:** 168
- **Tested:** 168 ✅ COMPLETE
- **Remaining:** 0

---

## Trait Cards

| # | Card Name | Status | Notes |
|---|-----------|--------|-------|
| 1 | ADORABLE | ✅ | No effect, just face value |
| 2 | ALTRUISTIC | ✅ | bonus_gene_pool correct |
| 3 | ANTLERS | ✅ | No effect, just face value |
| 4 | APEX PREDATOR | ✅ | Dominant +4 most traits correct |
| 5 | APPEALING | ✅ | No effect, just face value |
| 6 | AUTOMIMICRY | 🔧 | Changed to playWhen:'action' card |
| 7 | BAD | ✅ | Correct |
| 8 | BARK | ✅ | Correct |
| 9 | BIG EARS | ✅ | Correct |
| 10 | BLUBBER | ✅ | Correct |
| 11 | BOREDOM | ✅ | Correct |
| 12 | BRANCHES | ✅ | Correct |
| 13 | BRAVE | ✅ | Correct |
| 14 | BRUTE STRENGTH | ✅ | Correct |
| 15 | CAMOUFLAGE | ✅ | Correct |
| 16 | CERATOPSIAN HORNS | ✅ | Correct |
| 17 | CHROMATOPHORES | 🔧 | Changed playWhen to 'action' |
| 18 | CLEVER | 🔧 | Complete rewrite - was wrong effect |
| 19 | COLD BLOOD | 🔧 | Draw 1→3, added play_another_trait |
| 20 | CONFUSION | ✅ | Correct |
| 21 | COSTLY SIGNALING | 🔧 | Fixed + added return_opponent_trait_to_hand to engine |
| 22 | CRANIAL CREST | ✅ | Correct |
| 23 | DEEP ROOTS | ✅ | Correct |
| 24 | DELICIOUS | ✅ | Correct |
| 25 | DENIAL | ✅ | Correct |
| 26 | DESTINED | ✅ | Correct |
| 27 | DIAPHANOUS WINGS | ✅ | Correct |
| 28 | DIRECTLY REGISTER | 🔧 | Changed to steal_trait with face_value:1 filter |
| 29 | DOTING | 🔧 | num_cards 2→1 |
| 30 | DRAGON HEART | ✅ | Correct |
| 31 | DREAMER | ✅ | Correct |
| 32 | ECHOLOCATION | ✅ | Correct |
| 33 | EGG CLUSTERS | 🔧 | Fixed face value -1 → 1 |
| 34 | ELOQUENCE | 🔧 | Fixed World's End effect |
| 35 | ELVEN EARS | ✅ | Correct |
| 36 | ENDURANCE | 🔧 | Changed to return_when_discarded |
| 37 | FAITH | 🔧 | Fixed World's End effect |
| 38 | FANGS | ✅ | Correct |
| 39 | FEAR | ✅ | Correct |
| 40 | FECUNDITY | ✅ | Correct |
| 41 | FINE MOTOR SKILLS | ✅ | Correct |
| 42 | FIRE SKIN | ✅ | Correct |
| 43 | FLATULENCE | ✅ | Correct |
| 44 | FLIGHT | 🔧 | Changed to swap_hand action |
| 45 | FORTUNATE | ✅ | Correct |
| 46 | GILLS | ✅ | Correct |
| 47 | GRATITUDE | ✅ | Correct |
| 48 | HEAT VISION | ✅ | Correct |
| 49 | HEROIC | ✅ | Correct |
| 50 | HOT TEMPER | ✅ | Correct |
| 51 | HYPER-INTELLIGENCE | 🔧 | Fixed World's End effect |
| 52 | HYPER-MYELINATION | ✅ | Correct |
| 53 | ICY | ✅ | Correct |
| 54 | IMMUNITY | ✅ | Correct |
| 55 | IMPATIENCE | 🔧 | Enhanced to steal 2 random cards |
| 56 | INDOMITABLE | ✅ | Correct |
| 57 | INTROSPECTIVE | ✅ | Correct |
| 58 | INVENTIVE | 🔧 | New action play_opponent_trait_action |
| 59 | IRIDESCENT SCALES | ✅ | Tested by sub-agent - correct |
| 60 | JUST | ✅ | Correct |
| 61 | KIDNEY CHEFS TOQUE | 🔧 | Fixed bonus to count only own Kidneys |
| 62 | KIDNEY COMBOVER | 🔧 | Fixed bonus to count only own Kidneys |
| 63 | KIDNEY ELF HAT | 🔧 | Fixed bonus to count only own Kidneys |
| 64 | KIDNEY PARTY HAT | 🔧 | Fixed bonus to count only own Kidneys |
| 65 | KIDNEY TIARA | 🔧 | Fixed bonus to count only own Kidneys |
| 66 | KIDNEY TOPPER | 🔧 | Fixed bonus to count only own Kidneys |
| 67 | LATE | 🔧 | Changed playWhen to after_stabilize |
| 68 | LEAVES | ✅ | Correct |
| 69 | LEGENDARY | ✅ | Correct |
| 70 | MEMORY | 🔧 | New action discard_hand_and_stabilize |
| 71 | MIGRATORY | ✅ | Correct |
| 72 | MINDFUL | ✅ | Correct |
| 73 | MITOCHONDRION | ✅ | Correct |
| 74 | MORALITY | 🔧 | New action give_trait_to_opponent |
| 75 | NOCTURNAL | ✅ | Correct |
| 76 | NOSY | 🔧 | New action steal_and_play_card |
| 77 | OPTIMISTIC NIHILISM | 🔧 | Added World's End effect |
| 78 | OVERGROWTH | ✅ | Correct |
| 79 | PACK BEHAVIOR | ✅ | Correct |
| 80 | PAINTED SHELL | 🔧 | New action play_trait_action |
| 81 | PARASITIC | 🔧 | New action steal_trait_and_stop_action |
| 82 | PERSUASIVE | 🔧 | New action discard_color_from_hand |
| 83 | PHOTOSYNTHESIS | 🔧 | New action draw_and_play_if_color |
| 84 | PHREAKISH EYES | ✅ | Correct |
| 85 | POISONOUS | 🔧 | New action swap_self_with_opponent_trait |
| 86 | POLLINATION | ✅ | Correct |
| 87 | PREPPER | 🔧 | Fixed World's End effect |
| 88 | PROPAGATION | 🔧 | Removed unnecessary param |
| 89 | PROTOFEATHERS | ✅ | Correct |
| 90 | QUICK | ✅ | Correct |
| 91 | RANDOM FERTILIZATION | ✅ | Correct |
| 92 | RECKLESS | 🔧 | New action mutual_discard_trait |
| 93 | REGENERATIVE TISSUE | ✅ | Correct |
| 94 | RETRACTABLE CLAWS | 🔧 | Fixed: Changed to require 1 Red + discard action |
| 95 | SALIVA | ✅ | Correct |
| 96 | SAUDADE | ✅ | Correct |
| 97 | SCUTES | 🔧 | New action give_trait_to_opponent |
| 98 | SELECTIVE MEMORY | 🔧 | New action search_discard_and_play |
| 99 | SELF-AWARENESS | 🔧 | Fixed face value and playWhen |
| 100 | SELFISH | 🔧 | Added color filter to steal_trait |
| 101 | SELF-REPLICATING | 🔧 | Complete rewrite with persistent effect |
| 102 | SENTIENCE | 🔧 | Fixed World's End bonus |
| 103 | SERRATED TEETH | 🔧 | Fixed face value -1 → 1 |
| 104 | SNEAKY | 🔧 | Fixed World's End effect |
| 105 | SPINY | ✅ | Correct |
| 106 | STICKY SECRETIONS | 🔧 | Fixed face value -1 → 1 |
| 107 | STONE SKIN | ✅ | Correct |
| 108 | SUPER SPREADER | ✅ | Correct |
| 109 | SWARM FUR | ✅ | Correct |
| 110 | SWARM HORNS | ✅ | Correct |
| 111 | SWARM MINDLESS | ✅ | Correct |
| 112 | SWARM SPOTS | ✅ | Correct |
| 113 | SWARM STRIPES | ✅ | Correct |
| 114 | SWEAT | ✅ | Correct |
| 115 | SYMBIOSIS | ✅ | Correct |
| 116 | TALONS | ✅ | Correct |
| 117 | TEETH | ✅ | Correct |
| 118 | TELEKINETIC | 🔧 | Fixed swap_trait with same_color:false |
| 119 | TENTACLES | 🔧 | Fixed: Changed steal to swap same color |
| 120 | TERRITORIAL | 🔧 | Updated description |
| 121 | THE THIRD EYE | ✅ | Manually tested - correct |
| 122 | TINY | 🔧 | Updated description |
| 123 | TINY ARMS | 🔧 | Updated description |
| 124 | TINY LITTLE MELONS | 🔧 | Changed give_cards to steal_trait Green |
| 125 | TRUNK | 🔧 | Fixed face value, color, action |
| 126 | VENOMOUS | 🔧 | New action move_self_to_opponent |
| 127 | VORACIOUS | 🔧 | Fixed action order |
| 128 | WARM BLOOD | ✅ | Correct |
| 129 | WOODY STEMS | ✅ | Correct |

---

## Age Cards

| # | Card Name | Status | Notes |
|---|-----------|--------|-------|
| 1 | AGE OF DRACULA | 🔧 | Added - Vampirism steal effect |
| 2 | AGE OF NIETZSCHE | 🔧 | Added - Optional stabilization |
| 3 | AGE OF PEACE | ✅ | Correct |
| 4 | AGE OF REASON | 🔧 | Added - Draw 3 keep 1 |
| 5 | AGE OF WONDER | ✅ | Correct |
| 6 | ARID LANDS | ✅ | Correct |
| 7 | AWAKENING | 🔧 | Added - Preview next age |
| 8 | BADLANDS | 🔧 | Fixed discard-shuffle-deal |
| 9 | BIRTH OF A HERO | ✅ | Correct |
| 10 | COASTAL FORMATIONS | 🔧 | Added - Draw after stabilize |
| 11 | COMET SHOWERS | ✅ | Correct |
| 12 | ECLIPSE | ✅ | Correct |
| 13 | ENLIGHTENMENT | 🔧 | Added - Optional discard |
| 14 | FLOURISH | ✅ | Correct |
| 15 | GALACTIC DRIFT | 🔧 | Added - Colorless extra play |
| 16 | GLACIAL DRIFT | ✅ | Correct |
| 17 | HIGH TIDES | 🔧 | Added - Effectless extra play |
| 18 | LUNAR RETREAT | ✅ | Correct |
| 19 | NATURAL HARMONY | 🔧 | Added - No same color |
| 20 | NORTHERN WINDS | 🔧 | Fixed to draw + discard |
| 21 | PROSPERITY | 🔧 | Added - Optional stabilization |
| 22 | REFORESTATION | 🔧 | Added - Protect traits |
| 23 | TECTONIC SHIFT | ✅ | Correct |
| 24 | THE BIRTH OF LIFE | ✅ | Correct |
| 25 | TROPICAL LANDS | ✅ | Correct |

---

## Catastrophe Cards

| # | Card Name | Status | Notes |
|---|-----------|--------|-------|
| 1 | AI TAKEOVER | 🔧 | Added - Colorless worth 2 |
| 2 | ALIEN TERRAFORM | 🔧 | Added - Optional dominant discard |
| 3 | DEUS EX MACHINA | 🔧 | Added - Draw card add face value |
| 4 | GLACIAL MELTDOWN | 🔧 | Added - Random discard |
| 5 | GREY GOO | 🔧 | Added - Most traits penalty |
| 6 | ICE AGE | ✅ | Correct |
| 7 | IMPACT EVENT | ✅ | Correct |
| 8 | MASS EXTINCTION | ✅ | Correct |
| 9 | MEGA TSUNAMI | 🔧 | Added - Pass hand right |
| 10 | NUCLEAR WINTER | 🔧 | Added - Stabilize then discard |
| 11 | OVERPOPULATION | ✅ | Correct |
| 12 | PULSE EVENT | ✅ | Correct |
| 13 | RETROVIRUS | ✅ | Correct |
| 14 | SOLAR FLARE | 🔧 | Added - Discard half hand |
| 15 | SUPER VOLCANO | ✅ | Correct |
| 16 | THE BIG ONE | 🔧 | Added - Give to adjacent |
| 17 | THE FOUR HORSEMEN | 🔧 | Added - Discard trait by face value |
| 18 | THE MESSIAH | 🔧 | Added - Reverse turn order |
| 19 | VAMPIRISM | 🔧 | Added as Dominant Trait |
| 20 | VIRAL | 🔧 | Added as Dominant Trait |

---

## Other (Non-Card Images)

| File | Type |
|------|------|
| AGES.png | Reference |
| GENE POOL 1-8.png | Gene Pool markers |
| KIDNEY (1-7).png | Kidney variants |
| PLAYMAT.png | Playmat |
| SWARM (2-6).png | Swarm variants |
| THAGOMIZER.png | Unknown |
| TRAITS.png | Reference |

---

## Change Log

| Date | Card | Change | By |
|------|------|--------|-----|
| 2024 | TENTACLES | Changed steal_trait to swap_trait with same_color:true | Manual |
| 2024 | RETRACTABLE CLAWS | Changed to require 1 Red + added discard action | Manual |
| 2024 | THE THIRD EYE | Verified correct | Manual |
| 2024 | IRIDESCENT SCALES | Verified correct | Sub-agent |
| 2024 | ADORABLE | Verified correct | Sub-agent batch 1 |
| 2024 | ALTRUISTIC | Verified correct | Sub-agent batch 1 |
| 2024 | ANTLERS | Verified correct | Sub-agent batch 1 |
| 2024 | APEX PREDATOR | Verified correct | Sub-agent batch 1 |
| 2024 | APPEALING | Verified correct | Sub-agent batch 1 |
