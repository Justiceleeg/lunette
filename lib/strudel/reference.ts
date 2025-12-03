/**
 * Condensed Strudel API Reference for LLM System Prompt
 * Covers core functions, mini notation, pattern modifiers, and effects
 */

export const STRUDEL_REFERENCE = `
## Strudel Quick Reference

### Core Concepts
Strudel is a live coding language for music. Patterns cycle over time, and each cycle is divided evenly among the elements.

### Sound Sources

**Samples:**
\`\`\`js
s("bd hh sd hh")  // kick, hihat, snare, hihat
sound("bd hh sd hh")  // alias for s()
\`\`\`

**Synthesizers:**
\`\`\`js
note("c3 e3 g3").sound("sawtooth")  // saw wave synth
note("c3 e3 g3").sound("sine")      // sine wave
note("c3 e3 g3").sound("square")    // square wave
note("c3 e3 g3").sound("triangle")  // triangle wave
\`\`\`

### Mini Notation (inside quotes)

| Syntax | Meaning | Example |
|--------|---------|---------|
| \`a b c\` | sequence | \`s("bd sd hh")\` |
| \`a*n\` | repeat n times (faster) | \`s("bd*4")\` = 4 kicks per cycle |
| \`a!n\` | repeat n times (same speed) | \`s("bd!4")\` = bd bd bd bd |
| \`a/n\` | slow down n times | \`s("bd/2")\` = bd over 2 cycles |
| \`[a b]\` | group (fit in one step) | \`s("[bd sd] hh")\` |
| \`<a b>\` | alternate each cycle | \`s("<bd sd>")\` |
| \`a,b\` | play together (chord) | \`note("c3,e3,g3")\` |
| \`a?\` | 50% random chance | \`s("bd hh?")\` |
| \`a?0.25\` | custom probability | \`s("bd hh?0.25")\` = 25% chance |
| \`a\|b\` | random choice | \`s("bd\|sd")\` = random pick |
| \`a:n\` | sample variation | \`s("bd:2")\` = 3rd bd sample |
| \`~\` | rest/silence | \`s("bd ~ sd ~")\` |
| \`a@n\` | extend duration | \`s("bd@2 sd")\` = bd for 2 steps |
| \`(n,k)\` | Euclidean rhythm | \`s("bd(3,8)")\` = 3 hits in 8 steps |
| \`(n,k,r)\` | Euclidean with rotation | \`s("bd(3,8,2)")\` |
| \`{a b c}%n\` | polyrhythm | \`s("{bd sd hh}%8")\` |

### Pattern Modifiers

**Timing:**
\`\`\`js
s("bd sd").fast(2)        // double speed
s("bd sd").slow(2)        // half speed
s("bd sd").early(0.25)    // shift earlier in cycle
s("bd sd").late(0.25)     // shift later in cycle
s("bd sd").off(0.125, x => x.speed(2))  // delayed copy
\`\`\`

**Pitch & Notes:**
\`\`\`js
note("c3 e3 g3")          // chromatic notes
n("0 4 7").scale("C:minor") // scale degrees
note("c3").add(12)        // transpose up octave
note("c3").sub(12)        // transpose down octave
\`\`\`

**Scales:** C:major, C:minor, C:dorian, C:mixolydian, C:pentatonic, C:blues, etc.

**Dynamics:**
\`\`\`js
s("bd").gain(0.5)         // volume (0-1)
s("bd").velocity(0.8)     // MIDI velocity
\`\`\`

**Sample Manipulation:**
\`\`\`js
s("bd").speed(2)          // playback speed (2 = double, 0.5 = half)
s("bd").speed(-1)         // reverse playback
s("bd").begin(0.25)       // start at 25% of sample
s("bd").end(0.75)         // end at 75% of sample
s("bd").cut(1)            // cut group (stops overlapping)
s("bd").loop(1)           // loop the sample
s("bd").loopBegin(0.25)   // loop start point
s("bd").loopEnd(0.75)     // loop end point
\`\`\`

### Effects

**Filters:**
\`\`\`js
s("bd").lpf(800)          // low-pass filter (cutoff Hz)
s("bd").lpf(800).lpq(5)   // with resonance
s("bd").hpf(200)          // high-pass filter
s("bd").bpf(500)          // band-pass filter
s("bd").vowel("a e i o u") // vowel/formant filter
\`\`\`

**Filter Envelopes:**
\`\`\`js
s("bd").lpf(2000).lpenv(4).lpdecay(0.2)  // filter sweep
\`\`\`

**Delay & Reverb:**
\`\`\`js
s("bd").delay(0.5)        // delay amount (0-1)
s("bd").delaytime(0.125)  // delay time in cycles
s("bd").delayfeedback(0.5)// delay feedback
s("bd").room(0.5)         // reverb room size
s("bd").size(0.8)         // reverb decay/size
s("bd").roomlp(0.8)       // reverb low-pass damping
\`\`\`

**Distortion & Lo-fi:**
\`\`\`js
s("bd").distort(0.5)      // waveshaping distortion (0-1)
s("bd").crush(4)          // bit crush (lower = more crushed)
s("bd").coarse(8)         // sample rate reduction
\`\`\`

**Modulation:**
\`\`\`js
s("bd").phaser(2)         // phaser rate
s("bd").phaserdepth(0.5)  // phaser depth
s("bd").vibrato(4)        // vibrato rate
s("bd").tremolo(8)        // tremolo rate
\`\`\`

**Spatial:**
\`\`\`js
s("bd").pan("<0 1>")      // stereo pan (-1 to 1)
s("bd").jux(rev)          // play reversed in other speaker
s("bd").juxBy(0.5, fast(2)) // partial stereo separation
\`\`\`

**Envelopes:**
\`\`\`js
note("c3").sound("sawtooth")
  .attack(0.1)            // attack time
  .decay(0.2)             // decay time
  .sustain(0.5)           // sustain level
  .release(0.3)           // release time
\`\`\`

### Layering & Structure

\`\`\`js
stack(                    // play simultaneously
  s("bd sd"),
  s("hh*4"),
  note("c3 e3")
)

cat(                      // play in sequence over cycles
  s("bd*4"),
  s("sd*4")
)

seq(                      // alias for cat
  s("bd*4"),
  s("sd*4")
)
\`\`\`

### Pattern Transformations

**Conditional:**
\`\`\`js
s("bd").sometimes(x => x.speed(2))  // 50% apply
s("bd").rarely(x => x.speed(2))     // 25% apply
s("bd").often(x => x.speed(2))      // 75% apply
s("bd").almostAlways(x => x.speed(2)) // 90% apply
s("bd").almostNever(x => x.speed(2))  // 10% apply
s("bd").sometimesBy(0.3, x => x.speed(2)) // 30% apply
\`\`\`

**Cyclic:**
\`\`\`js
s("bd sd hh sd")
  .every(4, x => x.fast(2))    // every 4 cycles, double speed
  .every(3, x => x.rev())      // every 3 cycles, reverse
  .firstOf(4, x => x.speed(2)) // only first of every 4
  .lastOf(4, x => x.crush(4))  // only last of every 4
\`\`\`

**Order:**
\`\`\`js
s("bd sd hh cp")
  .rev()                      // reverse pattern order
  .palindrome()               // forward then backward
  .shuffle()                  // randomize order each cycle
  .iter(4)                    // rotate pattern each cycle
  .chunk(4, x => x.fast(2))   // apply to 1/4 of pattern, rotating
\`\`\`

**Structure:**
\`\`\`js
note("c3 e3 g3").struct("x ~ x x ~ x") // apply rhythm
s("bd sd").mask("<1 0 1 1>")           // mute some cycles
s("bd").degradeBy(0.25)                // 25% chance of silence
\`\`\`

### Signal Patterns (continuous values)

\`\`\`js
s("bd*4").lpf(sine.range(200, 2000))  // sine wave 200-2000
s("bd*4").pan(saw)          // sawtooth wave
s("bd*4").speed(tri)        // triangle wave
s("bd*4").gain(rand)        // random values
s("bd*4").speed(perlin)     // smooth random (Perlin noise)
\`\`\`

### Common Samples
- **Drums:** bd, sd, hh, oh, cp, rim, lt, mt, ht, cy, cr
- **Percussion:** tabla, tabla2, hand, perc
- **Bass:** bass, bass3, jvbass
- **Keys:** piano, rhodes, ep
- **Synth:** supersquare, supersaw
- **Misc:** pluck, jazz, metal, industrial, gtr, flick

### Quick Tips
1. Start simple: \`s("bd hh sd hh")\`
2. Add variation: \`s("bd hh? sd [hh hh]")\`
3. Layer sounds: \`stack(s("bd sd"), s("hh*4"))\`
4. Add effects: \`s("bd sd").room(0.3).lpf(800)\`
5. Create movement: \`s("bd*4").pan(sine)\`
6. Euclidean rhythms: \`s("hh(5,8)")\` = 5 hits in 8 steps
7. Chords: \`note("c3,e3,g3")\` or \`n("0,4,7").scale("C:major")\`

### Common Mistakes to Avoid
- Use \`.rev()\` NOT \`.reverse()\` - Strudel uses short names
- Use \`.s()\` or \`.sound()\` NOT \`.sample()\`
- Use \`.lpf()\` NOT \`.lowpass()\` or \`.lowPassFilter()\`
- Use \`.hpf()\` NOT \`.highpass()\`
- Use \`.bpf()\` NOT \`.bandpass()\`
- Use \`.gain()\` NOT \`.volume()\` or \`.amp()\`
- Callback functions use arrow syntax: \`.sometimes(x => x.rev())\` NOT \`.sometimes(rev)\`
`;

export default STRUDEL_REFERENCE;
