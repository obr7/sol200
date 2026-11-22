[← Back to the main page](../README.md)

# Full Game Script

NASA Space Apps Challenge 2026, Junior Astronaut Mission Trainer. Audience: ages 7 to 12. Platform: web. Style: top-down pixel art.

This file is the latest source for the whole story (6 chapters). Chapter 1 is built and fully written, with all dialogue, in `script-01-intro.md` and `script-02-gameplay-start.md`, and is summarized here. Chapters 2 to 6 are written here as story and events, without dialogue. Dialogue can be written later if the team decides to.

---

## 0. Story Map (short version, ready to copy)

Four astronauts who know each other from Earth face crises on Mars while a shared secret from their past surfaces. The central question: does Damon deserve to lead?

**Chapter 1: The Commander (Playable prototype)**
Play Damon, who fears he doesn't deserve to lead. In a Sol 200 dust storm he chooses: go out to clean the panels (A) or stay in and share power (B). Players learn that leaders listen and asking for help is not weakness.

**Chapter 2: Damon's Past (Planned)**
Play Damon. A childhood flashback shows a lucky shortcut, unearned credit, and loss. Then Earth asks who decided: claim the credit (A) or share it with Marcus (B). Players learn that shortcuts have a cost.

**Chapter 3: Marcus (Planned)**
Play Marcus, who fears being ignored again. During a communications blackout he decides: send his full honest report (A) or hide the painful parts (B). Players learn that silence isn't innocent.

**Chapter 4: Diego (Planned)**
Play Diego, who avoids confrontation. A flashback of feeling like an outsider shows how humor became his shield. He hides a water leak: admit it and repair fully (A) or keep the quick patch (B). Players learn that half-solutions only delay problems.

**Chapter 5: Layla (Planned)**
Play Layla, the soul of the crew, who fears loss. Her flashback, a glued jar and her plant Hope reveal what she lost and what her grandmother passed on. She must save Hope (A) or protect the crew's water (B), and she finally breaks her silence. Players learn that broken things can be fixed together and hold new life, and that when a mistake comes out, help comes, not punishment.

**Chapter 6: The Sun (Planned)**
All four play together, building a radiation shelter during a solar flare as the full truth comes out. Players learn that teamwork decides what survives.

**Threads:** Earth's question "who made the decisions?", the secret of a past training accident, and the Team meter that decides the ending.

**Endings:** with Team trust at 50 or more, the crew opens up and sends one honest report; below 50, accusations fly and they part ways, never speaking again.

Radiation from the solar flare is Chapter 6's climax; Chapter 1 foreshadows it with live NASA DONKI data.

---

## 1. The Big Idea

**Central question:** Does Damon deserve to be a commander? The competition entry is about him, but every chapter reveals one of the four characters.

**Four characters who know each other from Earth (colleagues at the space agency for years):**

| Character | Role | Core wound | Loss |
|---|---|---|---|
| Damon Carter (42, American) | Commander | Fears he doesn't deserve to lead; says "I've got this" to be seen | His older brother, Ethan |
| Marcus Bell (45, American) | Deputy commander | Fears being ignored again; hides his anger | His friend Theo (lost trust) |
| Diego Ramirez (36, Mexican) | Mechanical engineer | Fears confrontation; protects himself with jokes | His father |
| Layla Haddad (33, Jordanian) | Botanist and spacesuit expert | Fears loss; gets deeply attached to what she loves | Her grandmother |

**A person in four sides:** the four crew members are four sides of one person, and the mission only succeeds when all four work together: Damon is the **Body**, Marcus the **Mind**, Diego the **Psyche**, and Layla the **Soul** (meaning, values and hope).

**Template for Chapters 2 to 5:** each chapter belongs to one character and has two halves:
1. **Flashback (age 11):** how the character was shaped, with one real space fact and a short interaction.
2. **Present-day challenge on Mars:** a real problem and a real technology, faced by the whole team.

**What ties the chapters together:**
- Earth's question "who made the decisions?" passes from chapter to chapter.
- The training accident is revealed gradually, from each character's point of view.
- The three meters (Safety, Mission, Team) and the decisions from earlier chapters carry forward and matter (Hades-style: characters remember). The **Team** meter is the "trust" that decides the ending.
- Every chapter ends with at least one A/B decision, and each option has a cost.
- The player learns from mistakes, events and characters, not from lecture screens.

**Who the player controls:** Chapters 1 and 2 are Damon. Chapter 3 is Marcus. Chapter 4 is Diego. Chapter 5 is Layla. Chapter 6 switches among all four.

**Memory idea:** a flashback is a memory that cannot be changed. If the player tries to do the right thing in it, the scene replays the way that character remembers it. This expresses that memory can be distorted, and the helplessness of facing the past.

---

## 2. The Shared Secret (The Training Accident)

Three years ago, in a test base in a desert on Earth, the air system failed.

- **Marcus** proposed a safe plan: evacuate the unit, then repair it step by step.
- **Damon** ignored it and opened the bypass valve quickly. It worked by luck.
- The instructors wrote in the report that Damon "saved the training," and chose him to command the Mars mission.
- **Diego** was there and saw everything. He stayed silent. Then he cracked a joke in the corridor to ease the tension.
- **Layla** read the report, knew it was incomplete, and stayed silent. Her grandmother was ill, and her soul had dimmed so far that she had no strength left for any confrontation.
- **Marcus** himself never corrected the report in front of the committee.

Each of them has a failure of silence, not just Damon. This is what comes out gradually until the finale.

---

## 3. Timeline

| Chapter | Character | Approx. Mars days |
|---|---|---|
| 1 | Damon (built) | Sol 200 |
| 2 | Damon | Sol 201 to 204 |
| 3 | Marcus | Sol 205 to 219 |
| 4 | Diego | Sol 212 to 217 |
| 5 | Layla | Sol 222 to 226 |
| 6 | All four | Sol 230 |

---

## 4. Chapter 1: The Commander (Built)

**Summary:** The intro (about 78 seconds, with a Skip button), then Sol 200. Damon walks around the base and meets the other three. Each meeting follows the same pattern: introduction card, short dialogue, "Real Data" card, mini-game, result.

**The intro:** Damon and Marcus argue. Damon is made commander at a ceremony on Earth, with a report saying he "saved the training." Launch, space, Mars, arrival at the base, the control room, then "Sol 200 on Mars."

**Events:**
1. **Control room, Marcus:** dust is building in the south. Mini-game: Storm Watch (classify readings for dust, live solar activity, and visibility).
2. **Workshop, Diego:** he introduces "Rosie," the oxygen machine. Mini-game: Feed Rosie. The suit locker (Suit Lab) holds a card about Salam Abu Alhayjaa.
3. **Garden, Layla:** the first leaves have appeared. Mini-game: Garden Check. She names a plant "Hope." She also warns Damon that his glove seal looks loose, and he brushes it off.
4. **The storm (first decision):** A: go out and clean the panels. B: stay in and share the power.
   - A: Suit Up, then Clean the Panels. Diego trips; whether he is hurt depends on how Suit Up went.
   - B: Storm Night. Two garden trays die.
5. **Rosie stops (second decision):** A: Damon repairs it alone. B: he asks Marcus for help. Then Restart Rosie.
6. **The ending:** the alarm stops. Depending on the Team meter (50 or more, or less), the dialogue ends warmly or in silence. A message from Earth: "who made the decisions?" Results screen, then "What did you learn today?", then "This Was Real."

**Notes:**
- **Salam Abu Alhayjaa:** a card and the Suit Up mini-game only, **with no quote from her**. The card presents her as a Jordanian spacesuit engineer.
- The end screen of Chapter 1 reads **"Chapter Two: Damon"**.

---

## 5. Chapter 2: The Boy No One Saw (Damon)

### Flashback: Damon at age 11

**Home.** A small suburb in Ohio. His father manages a hardware store; his mother is a nurse. Damon has an older brother, **Ethan**, 16, a top student, popular, a swimming champion, who dreams of becoming an astronaut. His room is covered in rocket posters, and every dinner revolves around his achievements. Damon is the second son. His parents love him, but nobody really notices him. He tries to be seen with stunts: jumping off the garage roof into a pile of leaves, riding his bike along the edge. His mother sighs, his father says "be careful," and then every eye returns to Ethan. He learns that people only see him when he does something dangerous.

**The bus.** Morning of a school trip to a NASA visitor center. His only friend moved away last year, so Damon sits alone at the back of the bus, looking out the window. The other kids talk about space. He listens and doesn't join in.

**The Mars hall.** The teacher splits the class into pairs, and Damon is left with **June**, a quiet girl who reads every sign and remembers what she reads. In the hall there is a big photo of the Martian horizon and a full-size rover model. Damon stands in front of the photo for a long time, thinking: *there is a place where no one knows me, and everyone who gets there is seen.*

**The simulator.** In a side room there is a simulator for driving a rover over a miniature Mars landscape. The guide, **Ms. Reyes**, explains that real rovers aren't driven live because signals take minutes to arrive; engineers write a sequence of steps ahead of time and send it to the rover. A card with the correct steps sits on the table. June reads the steps aloud. Damon wants to be the fastest, so he ignores the card and mashes the buttons.

**Player interaction.** The player controls young Damon and walks between three stations (the photo, the model, the simulator). At the simulator, if the player tries to follow the card, a message appears: *"This is not how Damon remembers it."* The simulation resets and the player is forced to ignore the steps. The rover stumbles, nearly falls, then crosses by luck.

**The sticker.** Ms. Reyes applauds and gives Damon alone a **gold star sticker** that reads "Ace Driver." June, who read all the steps, stands aside with a calm face and says nothing. Damon sees her face for a moment, then gets absorbed in the praise, and in that moment he says "I've got this" for the first time. Then he buries his guilt. This is his first mistake: taking credit for someone else's work.

**The evening.** He runs home with the sticker. His parents are busy with the results of Ethan's swim meet. His mother says "that's nice, sweetheart" without looking. Only Ethan notices and asks, "Did you follow the steps?" Damon lies: "I've got this." Ethan smiles and says quietly that luck runs out, and promises to take him to see a real launch one day if he becomes an astronaut. He sticks the sticker on Damon's jacket.

**Time jump (montage, no dialogue).** Three still shots: Ethan in a hospital room laughing and drawing a rocket, then an empty chair at the dinner table, then the rocket posters still on the wall. Ethan became seriously ill and died when Damon was fifteen. We don't show the death, only the absence and its effect. The house becomes very quiet, his parents sunk in grief, and Damon more invisible than before.

**End of the flashback.** At eighteen, Damon stands in front of Ethan's photo and promises to become an astronaut "for both of us." But since that day he carries an unspoken feeling: that he is living his brother's dream, and that he is not the one who deserved it. This is the root of his fear of not deserving.

### Present: Sol 201 (the morning after the storm)

1. **The base after the storm.** Dust on everything, the alarm silent. Damon hasn't slept, and Earth's question is open on his screen. He touches the star on his shoulder and remembers the sticker.
2. **Check-in round.** He visits each crew member, and their tone depends on his Chapter 1 decisions. Marcus is calm after path B and cold after path A. Diego still jokes. Layla checks on "Hope."
3. **The south solar field is dark.** It must be inspected, but it lies behind a ridge the radio can't reach. So he sends the small rover **Scout** with a pre-programmed sequence of steps, the same principle Ms. Reyes explained.
4. **Mini-game: Plan the Route.** The player arranges six step cards in the correct order: check the battery, scan the terrain, move, stop and photograph, and so on. There is a "fast mode" button that skips the checks. Whoever presses it gets the rover stuck in the dust and loses time. Whoever follows the sequence succeeds. It mirrors what the boy did, but this time he pays for ignoring the steps.
5. **Inspection result.** Scout's photos reveal that the northern panels are buried under heavy dust and that power is at about 60%.
6. **A confrontation with himself.** He sits alone in the control room in front of Earth's message. He reads the old training log, with Ethan's photo on his device.
7. **Main decision: the answer to Earth.**
   - **A:** He writes that the decisions were his, with no mention of Marcus's warning. Temporary relief, but Team drops later.
   - **B:** He writes that Marcus advised staying inside and that he chose to go out, and admits he should have listened. He loses some of his image, but Team rises.
8. **What changes.** This is June's moment all over again: take the credit or give it. Whoever picks A repeats the first mistake; whoever picks B begins to correct it.

### What the player learns
- Following steps is not slowness; it is what makes real rovers work far from humans.
- Taking credit for someone else's work has a price, even if it comes late.
- Someone who looks strong may carry a sadness he doesn't say out loud.

### Ending
A short reply comes from Marcus: he has started his own report, and it covers the training. Then the title appears: "Chapter Three: Marcus."

---

## 6. Chapter 3: The Plan No One Read (Marcus)

### Flashback: Marcus at age 11

**Home.** A small town in Pennsylvania. His father, **Raymond**, is an electrician; his mother is a school librarian. His father writes down every job in a small notebook: measurements, diagrams, lists. His constant saying: "Measure twice, cut once." His work is extremely precise and no one notices it, because the best work is the work that never fails. Marcus learns from him that a good plan is built with patience.

**The friend.** Marcus is quiet, and he has one friend, **Theo**, lively and popular and a natural talker. They team up for the school science day. Marcus loves numbers and Theo loves lights. Marcus is the planner and Theo is the face of the project.

**The project.** A miniature model of a base on Mars, with a **power budget table**: how many units each machine needs and how the base shares its little power (the same logic as Storm Night in Chapter 1). Marcus spent weeks getting the numbers right. Theo added colored lights and a small device that puffs steam so the model would look "amazing."

**Science day.** The school hall is full of projects: an erupting volcano, a circuit that lights up, a paper robot. Marcus came with Theo, and his father stands at the back. When the judges stop at their project, Theo talks excitedly about the lights, the steam and Mars. When one judge asks "Whose idea was the budget?", Theo hesitates a moment, then says "Mine." Marcus freezes and doesn't speak. The prize goes to the volcano. Marcus's project is praised for its "nice look."

**Player interaction.** The player walks between the projects until reaching theirs, and sees the judges pass by quickly, looking at the lights. At one point the player chooses: does young Marcus speak up in front of the judges? The option exists, but the memory **replays the scene** with him silent, so the player feels the same helplessness.

**The evening.** Marcus walks home with his father. His father doesn't say he was wronged. He says a good plan doesn't need applause. But Marcus sees in his father's eyes that this is about his own work too. The friendship with Theo fades gradually, with no fight, only silence and withdrawal. Here is his loss: trust in partners. He learns to work alone and keep his papers to himself.

### Present: Sol 205 to 219

1. **Solar conjunction.** On Sol 205 contact with Earth goes down for about two weeks because the Sun sits between the two planets. No one can hear them and they can't hear anyone.
2. **Marcus takes charge of the schedule.** The player becomes Marcus. Base power is at 60% after the storm, so he draws up a plan for fourteen days.
3. **Mini-game: Power Budget.** The player spreads the base's machines across the days within a daily power limit: garden, heating, communications, lights. It echoes his old project, but now their lives depend on it.
4. **His father's notebook.** The checklist on his device is styled like his father's notebook.
5. **His full report.** At night Marcus writes his report: his plan, Damon ignoring it, the valve, and the false report. Then he writes a line that surprises us: that he did not correct the report in front of the committee, so he too stayed silent.
6. **Damon reads the draft.** Marcus leaves his device open for a moment, and Damon reads part of it. A quiet confrontation, not shouting. Damon's reaction depends on his Chapter 2 decision: if he chose B, he goes silent and says he deserves what was written; if he chose A, he reacts angrily and demands the parts be deleted.
7. **Main decision:**
   - **A:** Keep the report whole and send it when contact returns, revealing the secret.
   - **B:** Delete the parts that hurt and send a safe report, so the silence continues.
8. **What it affects.** A: Team drops now, but the truth moves forward. B: Team looks stable, but the secret grows heavier.

### What the player learns
- Careful planning is what saves people, even if no one applauds it.
- Hidden anger doesn't solve anything, and silence isn't innocent even when the person is right.
- Loss isn't only death: losing trust is a wound too.

### Ending
On the last night of the blackout, Marcus sees Diego standing in front of the water tank with something in his hand, then hiding it. The next title: "Chapter Four: Diego."

---

## 7. Chapter 4: The Patch (Diego)

### Flashback: Diego at age 11

**Home.** A small town in Mexico. Life is hard: the house is small and money is tight. His father, **Ramón**, is a mechanic who fixes the neighbors' cars for symbolic prices. His mother, **María**, cleans houses, and he has a little sister, **Lupita**. But the home is full of laughter. His father tells a joke before every repair and calls his old truck **"Rosa"**, talking to her like a friend. **Diego learns to tell jokes from his father.**

**Diego and machines.** He sits beside his father in the workshop and hands him the wrenches. He learns that a machine fails and then gets fixed, and never gets angry.

**The incomplete sentence.** Once his father is repairing Rosa's engine and it is loud. He says something to Diego, but the engine drowns it, and Diego hears only "...laugh..." The player doesn't know the rest of the sentence yet. They will hear it in the present.

**The move.** His father finds work through a relative in Houston, so the family emigrates. Diego, at eleven, doesn't speak English well, the school is new, and everything is strange. He leaves his home, his friends and his neighborhood.

**Feeling like an outsider.** At school, **Kyle** and his group pick on him: they mimic his accent, laugh at his clothes, and leave him out of games. There is no graphic violence, only words, looks and exclusion.

**Player interaction: three attempts.** In each attempt the player chooses how Diego responds:
1. **Confront:** he gets into a scuffle and he is the one who gets punished.
2. **Stay silent:** it continues.
3. **Tell a joke:** he copies one of his father's jokes in front of everyone, the whole class laughs, Kyle stops, and for the first time he feels like he belongs.

Diego clings to the joke because it was the only thing that worked, and it came from his father. But it was only temporary success: Kyle came back later, and the problem was never solved. Here is the wrong lesson: confrontation is scary, and laughing is safe.

**The evening.** He tells his father the joke worked. His father is proud and laughs, but looks at him for a moment as if he wants to say something more. Then he stays quiet.

**End of the flashback.** We learn that his father died when Diego was twenty-four, studying mechanical engineering. A pain struck his chest while he worked in his workshop, and Diego wasn't there. Their last phone call was a joke. Since that day the joke has become everything he has left of his father, so he can't let go of it. And he named the oxygen machine "Rosie" in honor of his father's truck, "Rosa."

### Present: Sol 212 to 217

1. **The small secret.** Five days ago Diego noticed a slight drop in the water level of the system. He found a slow leak in a pipe. The proper repair means shutting down the water system for six hours and telling Marcus, so he put on a temporary **patch**, wrote a note in his private notebook, and stayed silent. He doesn't want a new fight during the blackout.
2. **Night with Rosie.** We see him standing beside the oxygen machine, talking to it and watching the pressure gauge.
3. **Marcus gets suspicious.** After what he saw at the end of Chapter 3, he watches the tank, and the water numbers don't add up.
4. **Mini-game: Find the Leak.** The player follows pressure bubbles through a network of pipes to find the leak. Then chooses: a quick patch (works for now) or a full repair (needs part of the network to be taken apart and reconnected).
5. **A real fact.** On the International Space Station, water is recycled. And in Chapter 1 Layla said water is precious and gets reused.
6. **The confrontation.** The team finds out. Damon's reaction depends on Chapter 2: if he chose B, he asks gently, "Why didn't you tell me?", and Diego answers with a joke, then adds an honest sentence. If he chose A, Damon gets angry, "How could you stay quiet?!", and Diego runs to humor and shuts down.
7. **Main decision:**
   - **A:** He admits he knew days ago and asks to shut the system down for a full repair. It costs him some of the team's trust for a while, but the repair holds and the crew's water is enough.
   - **B:** He stays with the patch and keeps joking. The leak widens later, and there is less water in Chapters 5 and 6.
8. **The training accident comes out.** On the night of the talk Diego admits he was at the training, heard Marcus's plan, saw Damon open the valve, and said nothing. Then he told a joke in the corridor to ease the tension, and noticed Marcus didn't laugh.

### The full sentence
After the repair (in A), Diego remembers the sentence that was lost in the noise, and this time the player hears it whole: his father used to say, **"Laugh after you fix it."** That is, a joke is fine after the solution, not instead of it. If the player chose B, the sentence stays incomplete, a symbol of what he lost.

### What the player learns
- Half-solutions don't solve the problem; they postpone it.
- Fear of confrontation starts from an old wound, and it can be faced with a small step.
- A joke isn't a flaw. The flaw is letting it replace the truth.

### Ending
Water is essential for everything, and plants need it most. The scene moves to the garden.

---

## 8. Chapter 5: The Seed (Layla)

**Layla's side: Soul.** Layla is the soul of the crew: meaning, hope, values and belonging. It is what keeps a person going when the body and the mind are tired. Her whole past is built on this side.

### Flashback: Layla at age 11

**The grandmother.** A summer in Amman. Layla spends the summer at her grandmother **Amal's** house (Teta Amal), an old house with a small courtyard: a lemon tree, a grape arbor, mint and lettuce beds. Her grandmother is tender and patient and loves everyone around her; she feeds the neighbors and the cats, and calls her "habibti." From her, Layla learns that every living thing has value, and that caring for others is part of life, not something extra.

**Morning routine.** They wake at dawn. Her grandmother teaches Layla to water in the morning, not at noon, and to watch the leaves before watering. She gives every plant a name and talks to it, which is where Layla's habit of naming plants comes from. She tells her that water in our country is precious, so laundry water is reused for the plants. (Jordan is one of the most water-scarce countries in the world.)

**The broken jar.** One day Layla breaks her grandmother's favorite jar while playing. She's scared, so she hides the pieces under the lemon leaves. Her grandmother finds them in the evening. She isn't angry, and she gives no lecture. She sits beside her calmly and says:

> "It's okay, habibti. What happened, happened. Come, let's fix it together."

They glue the jar back together, and its cracks stay visible. Then the grandmother does something Layla doesn't expect: she fills the jar with soil, plants mint in it, and puts it in the most beautiful corner of the courtyard.

**The heart of the scene:** the broken thing wasn't thrown away; it now holds new life. And when the mistake came out, what came was help, not punishment. A child understands this without being told.

**Player interaction.** The player waters the grandmother's beds and watches the leaves to learn which plant needs water. Then chooses whether to hide the pieces of the jar or tell her grandmother. If the player hides them, the memory plays out the same way: the grandmother finds them, says the same sentence, and they fix the jar together and plant the mint. There's no punishment here, only learning.

**The soul dims.** A year before Layla leaves for Mars, her grandmother becomes ill. In that time Layla's soul dims: she is exhausted, she withdraws, and she no longer has the strength for any confrontation. It is then that she reads the training accident report, knows it is incomplete, and stays silent.

**The loss.** Her grandmother dies while Layla is away in training, and she doesn't arrive in time to say goodbye. We don't show the death, only what comes after: following the funeral, a family member gives her a small cloth bag from her grandmother, holding **lettuce seeds** from her garden, which she had set aside for her, together with **the glued jar** itself.

**The meaning:** her grandmother is gone, but she left something that goes on. The soul doesn't die with loss; it is passed on.

**The plant Hope.** Layla convinced the mission team to add these seeds to the experiment. And she named the plant "Hope," meaning **"Amal,"** after her grandmother. The player only learns this hidden meaning here, even though Layla said in Chapter 1 that she named it Hope. The glued jar sits in her room on Mars.

### Present: Sol 222 to 226

1. **Contact with Earth returns.** The blackout is over and messages pour in. A warning arrives: the Sun's activity is changing.
2. **Hope blooms.** The first complete head of lettuce. Layla speaks to it quietly, the way her grandmother used to.
3. **Resource crisis.** After the leak, the blackout and the storm, water and power are limited. Layla has to decide how to divide what's left.
4. **Mini-game: Garden Balance.** She distributes water, light and heat between the garden and the crew's needs. Every increase for the garden reduces the team's reserve.
5. **Layla's confession.** She goes to Damon and tells him what she knew three years ago: she read the training report, knew it was incomplete, and stayed silent, because her grandmother was ill and her soul had dimmed. She apologizes. Then she says her grandmother's own words to him:
   > "What happened, happened. Come, let's fix it together."

   The player understands, without being told, that her grandmother's soul reached Layla, and that Layla now gives it to others.
6. **Damon's confession.** For the first time Damon talks about Ethan: the brother who wanted to be an astronaut, the sticker, the jealousy, the loss. He says he feels he is living his brother's place. Layla shows him the glued jar and tells him about her grandmother and the seeds. Loss brings them together: each lost someone who believed in them. After that scene Damon's tone changes, and he talks less about "I'm the commander."
7. **Main decision:**
   - **A:** She saves Hope with everything she can, taking a big share of the crew's water.
   - **B:** She puts the crew's safety first, and Hope may die.
   - In both cases Layla saves the seeds from Hope. The plant may end, but the life her grandmother gave goes on. The idea of the chapter: hope is not the thing itself but carrying on, and love doesn't end with loss.
8. **The harvest.** If Hope survives, the team decides to eat one small leaf from it together, the first food grown on Mars. If not, Layla keeps the seeds and the four sit in silence.

### What the player learns
- A mistake is not the end: broken things can be fixed, and can even hold new life.
- The truth doesn't bring punishment; it brings help.
- The people we love stay with us in what they leave us, and love goes on after they are gone.
- Sometimes we sacrifice what we love to protect those we love, and it doesn't mean we lost.

### Ending
A message arrives from Mission Control: a large solar flare is coming. The next title: "Chapter Six: The Sun."

---

## 9. Chapter 6: The Shelter Night (The Finale)

### Before the shelter (Sol 230)

1. **The real warning.** Mission Control confirms a strong solar flare is on its way to Mars. Radiation danger on Mars is real because its atmosphere is thin. The live solar activity level from DONKI appears, and its strength sets the difficulty of the tasks.
2. **Preparation.** The four must prepare a radiation shelter inside the base. Water is used as a barrier because it protects against radiation. Here the effect of earlier decisions shows: if Diego repaired the leak, there is enough water; if not, there isn't.
3. **Mini-game: Build the Shelter.** The player arranges water tanks around the central room and decides who stands where. Each character has a role: Marcus plans, Diego carries and installs, Layla protects what can be saved, and Damon coordinates.
4. **The garden.** It can't all fit in the shelter. One last decision for Layla about which plants and seeds to save. She takes the glued jar with Hope's seeds in it.
5. **Entering the shelter.** The four go in and close the door. They wait about thirteen hours. The lighting is dim, and Mission Control's question "who made the decisions?" is still hanging. Marcus holds his report, Damon touches the star, Diego is silent with no joke, and Layla holds the glued jar.
6. **Mini-game: Hold the Line.** During the wait, power in the shelter drops, and the player must manage lighting and ventilation with as little power as possible. The ventilation may fail, and then the four work together to restart it, like Restart Rosie but with four pairs of hands.

### What decides the ending
**The Team meter (trust) when entering the shelter:**
- **50 or more:** the first ending, "Opening Up."
- **Below 50:** the second ending, "Accusations."


### First ending: trust of 50 or more, "Opening Up"
The talk begins quietly, and each person says what they have kept hidden for years:

- **Layla** starts, because she is the soul of the crew and closest to everyone. She tells them she read the training report, knew it was incomplete, and stayed silent, and that her grandmother was ill at the time. She apologizes, then sets the glued jar between them and says her grandmother's words: "What happened, happened. Come, let's fix it together."
- **Diego** admits he saw everything and stayed silent because he fears confrontation. He talks about his father and says his last sentence in full: "Laugh after you fix it."
- **Marcus** says nobody read his plan and that he stayed angry for years. He admits he didn't correct the report in front of the committee and that he wanted to be seen. He talks about Theo and science day.
- **Damon** speaks last. He says he opened the valve so people would see what he was worth, and that he took the credit and never corrected it. He talks about Ethan in front of everyone, about the sticker and June, and about feeling like he is living his brother's place.

After that, nobody puts anyone on trial. Diego laughs for the first time after speaking, and this time it is a real laugh, not a shield. They write one joint report that tells the whole truth in the voice of all four, and send it to Earth.

**Closing cutscene:** The flare ends and the door opens. Layla goes out to the garden. If Hope survived, the four share one small leaf from it, the first food grown on Mars. If not, Layla opens the bag of seeds and they plant one together in the glued jar. And Damon sticks the old gold star sticker onto Marcus's notebook without a word.

### Second ending: trust below 50, "Accusations"
The conversation starts sharp, and every sentence opens a wound:

- **Marcus** accuses Damon of stealing his position and taking credit by luck.
- **Damon** answers that Marcus didn't speak when he should have, and that he wants to blame others for his own silence.
- **Diego** tries to joke and everyone cuts him off, so for the first time he snaps: why must he be the only one who eases the tension? Then he adds that he saw everything and stayed silent.
- **Layla** tries to calm things and breaks down, saying she knew too and stayed silent, and that she can't bear for them to lose each other the way she lost her grandmother. She holds out the glued jar to them, but nobody listens.

The conversation ends in a heavy silence, each in a corner. Earth's reply arrives, and each of them sends their own report separately, each telling a different version.

**Closing cutscene: each returns to Earth alone.** The mission ends, and they scatter and never speak again:

1. **Damon** stands at Ethan's grave with the sticker in his hand. He stays a long time and then doesn't stick it on anything. The seat beside him is empty.
2. **Marcus** is in his father's old house in front of his father's notebook of measurements. He closes the report he never sent and stays alone.
3. **Diego** is in an old workshop, standing in front of the truck "Rosa." He reaches for the key, then pulls back, and this time he doesn't tell a joke.
4. **Layla** is in her grandmother's courtyard, planting the seeds alone in the glued jar and looking at the empty seats around her.

Then a black screen: *"They never spoke again."*

### What the player learns
- In the first ending: honesty shared in both directions heals, even when it comes late.
- In the second: silence doesn't always end in survival. Wounds can stay open for years, and people lose each other over a word that wasn't said in time.

---

## 10. Mini-Game Table (all chapters)

| Chapter | Mini-game | Idea | Related real fact |
|---|---|---|---|
| 1 | Storm Watch | Classify danger readings | Dust storms + DONKI |
| 1 | Feed Rosie | Collect CO₂ bubbles | MOXIE on Perseverance |
| 1 | Garden Check | Water, light, heat | Lettuce on the ISS |
| 1 | Suit Up | Match problems to suit parts (with Salam's card) | Spacesuits |
| 1 | Clean the Panels | Clean 6 panels | Dust on solar panels |
| 1 | Storm Night | Split 6 units across 5 machines | Power limits |
| 1 | Restart Rosie | 4 wires in order | MOXIE |
| 2 | Plan the Route | Order the rover's steps | Rover command sequences |
| 3 | Power Budget | A 14-day power schedule | Solar conjunction blackout |
| 4 | Find the Leak | Trace pressure through pipes | Water recycling |
| 5 | Garden Balance | Split water, light and heat | Plants on the ISS |
| 6 | Build the Shelter | Arrange tanks around the room | Water as radiation shielding |
| 6 | Hold the Line | Manage power inside the shelter | Radiation risk on Mars |

---

## 11. Writing Principles

- Decisions are always between two options only, and each option has a cost. There is no fully correct option.
- Failing any mini-game doesn't stop the game; the meters drop and the story continues.
- We never show death or graphic violence. We show the effect and the absence.
- Bullying, loss and anger are told honestly but without details that would hurt ages 7 to 12.
- The lesson comes from the event and the character, not from a lecture screen.
- Every scientific fact was checked against NASA, ESA or other reliable sources.
