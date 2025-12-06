/**
 * Structured Strudel Function Reference for Reference Panel
 * Organized by category with examples that can be played via CodeSuggestion
 */

export interface FunctionExample {
  code: string;
  description?: string;
}

export interface FunctionDef {
  name: string;
  description: string;
  signature?: string;
  examples: FunctionExample[];
  aliases?: string[];
  related?: string[];
}

export interface Category {
  name: string;
  description?: string;
  functions: FunctionDef[];
}

export const FUNCTION_REFERENCE: Category[] = [
  {
    name: "Sound Sources",
    description: "Create sounds using samples or synthesizers",
    functions: [
      {
        name: "s",
        description: "Play samples by name. The most common way to make sound in Strudel.",
        signature: "s(pattern: string)",
        aliases: ["sound"],
        examples: [
          { code: `s("bd hh sd hh")`, description: "Basic drum pattern" },
          { code: `s("bd:2 hh sd:1 hh")`, description: "Sample variations with :n" },
          { code: `s("bd*4")`, description: "Repeat 4 times per cycle" },
        ],
        related: ["note", "n"],
      },
      {
        name: "note",
        description: "Play notes using note names (c3, d#4, etc.) with a synth or sample.",
        signature: "note(pattern: string)",
        examples: [
          { code: `note("c3 e3 g3 b3").sound("sawtooth")`, description: "Saw wave arpeggio" },
          { code: `note("c3,e3,g3").sound("sine")`, description: "C major chord with sine" },
          { code: `note("c3 d3 e3 f3 g3").sound("piano")`, description: "Piano scale" },
        ],
        related: ["n", "sound"],
      },
      {
        name: "n",
        description: "Play notes using scale degrees (0, 1, 2, etc.) with a scale.",
        signature: "n(pattern: string)",
        examples: [
          { code: `n("0 2 4 7").scale("C:minor").sound("sawtooth")`, description: "Minor scale degrees" },
          { code: `n("0 4 7 11").scale("C:major").sound("triangle")`, description: "Major 7th arpeggio" },
          { code: `n("<0 3> 5 7").scale("D:dorian").sound("square")`, description: "Dorian mode melody" },
        ],
        related: ["note", "scale"],
      },
      {
        name: "sound",
        description: "Specify which synth or sample bank to use.",
        signature: ".sound(name: string)",
        aliases: ["s"],
        examples: [
          { code: `note("c3 e3 g3").sound("sawtooth")`, description: "Sawtooth synth" },
          { code: `note("c3 e3 g3").sound("sine")`, description: "Sine wave synth" },
          { code: `note("c3 e3 g3").sound("square")`, description: "Square wave synth" },
          { code: `note("c3 e3 g3").sound("triangle")`, description: "Triangle wave synth" },
        ],
      },
    ],
  },
  {
    name: "Mini Notation",
    description: "Special syntax used inside pattern strings",
    functions: [
      {
        name: "sequence",
        description: "Space-separated elements play one after another in each cycle.",
        signature: "a b c",
        examples: [
          { code: `s("bd sd hh cp")`, description: "4 sounds in one cycle" },
          { code: `s("bd sd")`, description: "2 sounds, half cycle each" },
        ],
      },
      {
        name: "repeat *",
        description: "Repeat an element n times, fitting them in the same time slot.",
        signature: "a*n",
        examples: [
          { code: `s("bd*4")`, description: "4 kicks per cycle" },
          { code: `s("hh*8 sd*2")`, description: "8 hihats, then 2 snares" },
          { code: `s("bd sd*3 cp")`, description: "Mixed repetition" },
        ],
      },
      {
        name: "replicate !",
        description: "Repeat element n times at the same speed (takes more time).",
        signature: "a!n",
        examples: [
          { code: `s("bd!4")`, description: "4 kicks, 1 per cycle step" },
          { code: `s("bd!2 sd")`, description: "2 kicks then 1 snare" },
        ],
      },
      {
        name: "slow /",
        description: "Stretch element over n cycles.",
        signature: "a/n",
        examples: [
          { code: `s("bd/2 sd")`, description: "Kick spans 2 cycles" },
          { code: `s("[bd sd]/2")`, description: "Whole pattern every 2 cycles" },
        ],
      },
      {
        name: "group []",
        description: "Group elements to fit in one step.",
        signature: "[a b]",
        examples: [
          { code: `s("[bd sd] hh")`, description: "bd+sd in first half, hh in second" },
          { code: `s("bd [hh hh hh]")`, description: "Kick, then 3 fast hihats" },
          { code: `s("[bd sd] [hh hh] cp")`, description: "Nested grouping" },
        ],
      },
      {
        name: "alternate <>",
        description: "Play different elements on alternating cycles.",
        signature: "<a b>",
        examples: [
          { code: `s("<bd sd>")`, description: "Kick on odd, snare on even cycles" },
          { code: `s("<bd sd cp>")`, description: "Rotate through 3 sounds" },
          { code: `s("hh*4 <bd sd>")`, description: "Alternating with constant pattern" },
        ],
      },
      {
        name: "chord ,",
        description: "Play multiple sounds simultaneously.",
        signature: "a,b",
        examples: [
          { code: `note("c3,e3,g3").sound("sine")`, description: "C major chord" },
          { code: `note("c3,e3,g3,b3").sound("sawtooth")`, description: "Cmaj7 chord" },
          { code: `s("bd,hh")`, description: "Kick and hihat together" },
        ],
      },
      {
        name: "random ?",
        description: "Play element with probability (default 50%).",
        signature: "a? or a?0.25",
        examples: [
          { code: `s("hh*8?")`, description: "Random 50% hihat pattern" },
          { code: `s("bd hh?0.25 sd hh")`, description: "25% chance hihat" },
          { code: `s("bd sd? hh? cp?0.8")`, description: "Mixed probabilities" },
        ],
      },
      {
        name: "random choice |",
        description: "Randomly choose between options.",
        signature: "a|b",
        examples: [
          { code: `s("bd|sd")`, description: "Random kick or snare" },
          { code: `s("[bd|sd] [hh|oh]")`, description: "Random choices per step" },
        ],
      },
      {
        name: "rest ~",
        description: "Silence for one step.",
        signature: "~",
        examples: [
          { code: `s("bd ~ sd ~")`, description: "Kick, rest, snare, rest" },
          { code: `s("hh*4 ~!4")`, description: "Hihats then silence" },
          { code: `s("bd [~ sd] ~ hh")`, description: "Rests in groups" },
        ],
      },
      {
        name: "extend @",
        description: "Extend element duration in steps.",
        signature: "a@n",
        examples: [
          { code: `s("bd@3 sd")`, description: "Kick for 3 steps, snare for 1" },
          { code: `note("c3@2 e3 g3").sound("sawtooth")`, description: "Extended first note" },
        ],
      },
      {
        name: "euclidean ()",
        description: "Euclidean rhythm - distribute n hits over k steps.",
        signature: "(n,k) or (n,k,r)",
        examples: [
          { code: `s("bd(3,8)")`, description: "3 kicks in 8 steps" },
          { code: `s("hh(5,8)")`, description: "5 hihats in 8 steps" },
          { code: `s("sd(2,5)")`, description: "2 snares in 5 steps" },
          { code: `s("bd(3,8,2)")`, description: "With rotation" },
        ],
      },
      {
        name: "polyrhythm {}",
        description: "Polyrhythm - stretch pattern over n steps.",
        signature: "{a b c}%n",
        examples: [
          { code: `s("{bd sd hh}%8")`, description: "3 sounds over 8 steps" },
          { code: `stack(s("bd*4"), s("{sd cp}%3"))`, description: "Polyrhythmic layering" },
        ],
      },
    ],
  },
  {
    name: "Timing",
    description: "Control speed and timing of patterns",
    functions: [
      {
        name: "fast",
        description: "Speed up pattern by multiplying.",
        signature: ".fast(factor: number)",
        examples: [
          { code: `s("bd sd hh cp").fast(2)`, description: "Double speed" },
          { code: `s("bd sd").fast(4)`, description: "4x speed" },
          { code: `s("bd sd hh cp").fast("<1 2 4>")`, description: "Changing speed" },
        ],
        related: ["slow"],
      },
      {
        name: "slow",
        description: "Slow down pattern by dividing.",
        signature: ".slow(factor: number)",
        examples: [
          { code: `s("bd sd hh cp").slow(2)`, description: "Half speed" },
          { code: `s("bd*8").slow(4)`, description: "Stretched pattern" },
        ],
        related: ["fast"],
      },
      {
        name: "early",
        description: "Shift pattern earlier in the cycle.",
        signature: ".early(amount: number)",
        examples: [
          { code: `s("bd sd hh cp").early(0.25)`, description: "Quarter cycle earlier" },
          { code: `stack(s("bd*4"), s("sd*4").early(0.125))`, description: "Offset layers" },
        ],
        related: ["late"],
      },
      {
        name: "late",
        description: "Shift pattern later in the cycle.",
        signature: ".late(amount: number)",
        examples: [
          { code: `s("bd sd hh cp").late(0.25)`, description: "Quarter cycle later" },
          { code: `stack(s("bd*4"), s("hh*4").late(0.0625))`, description: "Slightly delayed layer" },
        ],
        related: ["early"],
      },
      {
        name: "off",
        description: "Play a copy with delay and transformation.",
        signature: ".off(time: number, fn: (p) => p)",
        examples: [
          { code: `s("bd sd hh cp").off(0.125, x => x.speed(2))`, description: "Echo at double speed" },
          { code: `note("c3 e3 g3").sound("sawtooth").off(0.25, x => x.add(12))`, description: "Octave echo" },
        ],
      },
    ],
  },
  {
    name: "Pitch",
    description: "Control pitch and musical notes",
    functions: [
      {
        name: "add",
        description: "Transpose up by semitones.",
        signature: ".add(semitones: number)",
        examples: [
          { code: `note("c3 e3 g3").add(12).sound("sawtooth")`, description: "Up one octave" },
          { code: `note("c3 e3 g3").add("<0 5 7>").sound("sine")`, description: "Changing transpose" },
        ],
        related: ["sub"],
      },
      {
        name: "sub",
        description: "Transpose down by semitones.",
        signature: ".sub(semitones: number)",
        examples: [
          { code: `note("c4 e4 g4").sub(12).sound("sawtooth")`, description: "Down one octave" },
        ],
        related: ["add"],
      },
      {
        name: "scale",
        description: "Set the scale for n() patterns.",
        signature: ".scale(name: string)",
        examples: [
          { code: `n("0 2 4 7").scale("C:major").sound("sawtooth")`, description: "C major scale" },
          { code: `n("0 2 4 7").scale("A:minor").sound("triangle")`, description: "A minor scale" },
          { code: `n("0 1 2 3 4").scale("D:dorian").sound("square")`, description: "D dorian mode" },
          { code: `n("0 2 4 5 7").scale("G:mixolydian").sound("sine")`, description: "G mixolydian" },
          { code: `n("0 2 3 5 7").scale("E:pentatonic").sound("sawtooth")`, description: "Pentatonic" },
          { code: `n("0 3 5 6 7 10").scale("A:blues").sound("sawtooth")`, description: "Blues scale" },
        ],
      },
    ],
  },
  {
    name: "Dynamics",
    description: "Control volume and intensity",
    functions: [
      {
        name: "gain",
        description: "Set volume level (0 to 1+).",
        signature: ".gain(level: number)",
        examples: [
          { code: `s("bd sd hh cp").gain(0.5)`, description: "Half volume" },
          { code: `s("bd*4").gain("<0.3 0.5 0.7 1>")`, description: "Building dynamics" },
          { code: `s("hh*8").gain(sine.range(0.2, 0.8))`, description: "Swelling volume" },
        ],
        related: ["velocity"],
      },
      {
        name: "velocity",
        description: "Set MIDI-style velocity (affects tone on some synths).",
        signature: ".velocity(v: number)",
        examples: [
          { code: `note("c3*4").sound("piano").velocity("<0.3 0.5 0.7 1>")`, description: "Dynamic piano" },
        ],
        related: ["gain"],
      },
    ],
  },
  {
    name: "Sample Control",
    description: "Manipulate sample playback",
    functions: [
      {
        name: "speed",
        description: "Change playback speed (affects pitch). Negative = reverse.",
        signature: ".speed(rate: number)",
        examples: [
          { code: `s("bd sd").speed(2)`, description: "Double speed (up octave)" },
          { code: `s("bd sd").speed(0.5)`, description: "Half speed (down octave)" },
          { code: `s("bd").speed(-1)`, description: "Reverse playback" },
          { code: `s("bd*4").speed("<1 2 0.5 -1>")`, description: "Varying speeds" },
        ],
      },
      {
        name: "begin",
        description: "Start playback from position (0-1).",
        signature: ".begin(pos: number)",
        examples: [
          { code: `s("bd").begin(0.25)`, description: "Start at 25%" },
          { code: `s("bd*4").begin("<0 0.25 0.5 0.75>")`, description: "Slicing sample" },
        ],
        related: ["end"],
      },
      {
        name: "end",
        description: "End playback at position (0-1).",
        signature: ".end(pos: number)",
        examples: [
          { code: `s("bd").end(0.5)`, description: "Stop at halfway" },
          { code: `s("bd").begin(0.25).end(0.5)`, description: "Play middle section" },
        ],
        related: ["begin"],
      },
      {
        name: "cut",
        description: "Cut group - stops other sounds in same group.",
        signature: ".cut(group: number)",
        examples: [
          { code: `s("hh*4 oh").cut(1)`, description: "Open hihat cuts closed" },
        ],
      },
      {
        name: "loop",
        description: "Loop the sample.",
        signature: ".loop(1)",
        examples: [
          { code: `s("bd").loop(1)`, description: "Loop the kick" },
          { code: `s("bd").loop(1).loopBegin(0.2).loopEnd(0.4)`, description: "Loop section" },
        ],
        related: ["loopBegin", "loopEnd"],
      },
    ],
  },
  {
    name: "Filters",
    description: "Shape the frequency content",
    functions: [
      {
        name: "lpf",
        description: "Low-pass filter - cuts high frequencies.",
        signature: ".lpf(cutoff: number)",
        aliases: ["lowpass"],
        examples: [
          { code: `s("bd sd hh cp").lpf(800)`, description: "Muffled sound" },
          { code: `s("hh*8").lpf(sine.range(200, 4000))`, description: "Sweeping filter" },
          { code: `s("bd sd").lpf(1000).lpq(10)`, description: "With resonance" },
        ],
        related: ["hpf", "lpq"],
      },
      {
        name: "hpf",
        description: "High-pass filter - cuts low frequencies.",
        signature: ".hpf(cutoff: number)",
        aliases: ["highpass"],
        examples: [
          { code: `s("bd sd hh cp").hpf(500)`, description: "Thin, tinny sound" },
          { code: `s("bd*4").hpf(sine.range(100, 2000))`, description: "Filter sweep" },
        ],
        related: ["lpf", "hpq"],
      },
      {
        name: "bpf",
        description: "Band-pass filter - keeps frequencies around cutoff.",
        signature: ".bpf(cutoff: number)",
        aliases: ["bandpass"],
        examples: [
          { code: `s("bd sd hh cp").bpf(1000)`, description: "Telephone-like" },
        ],
        related: ["lpf", "hpf"],
      },
      {
        name: "vowel",
        description: "Formant filter - creates vowel sounds.",
        signature: ".vowel(vowels: string)",
        examples: [
          { code: `s("bd*4").vowel("a")`, description: "Ah sound" },
          { code: `s("bd*4").vowel("<a e i o u>")`, description: "Cycling vowels" },
          { code: `note("c3*4").sound("sawtooth").vowel("a e i o")`, description: "Vocal synth" },
        ],
      },
      {
        name: "lpenv",
        description: "Filter envelope amount - modulates filter over time.",
        signature: ".lpenv(amount: number)",
        examples: [
          { code: `s("bd*4").lpf(2000).lpenv(4).lpdecay(0.2)`, description: "Filter pluck" },
          { code: `note("c2").sound("sawtooth").lpf(500).lpenv(6).lpdecay(0.5)`, description: "Bass pluck" },
        ],
        related: ["lpdecay", "lpf"],
      },
    ],
  },
  {
    name: "Delay & Reverb",
    description: "Add space and echo effects",
    functions: [
      {
        name: "delay",
        description: "Delay effect amount (0-1).",
        signature: ".delay(amount: number)",
        examples: [
          { code: `s("bd sd").delay(0.5)`, description: "Medium delay" },
          { code: `s("cp").delay(0.8).delaytime(0.125).delayfeedback(0.6)`, description: "Rhythmic delay" },
        ],
        related: ["delaytime", "delayfeedback"],
      },
      {
        name: "delaytime",
        description: "Delay time in cycles.",
        signature: ".delaytime(cycles: number)",
        examples: [
          { code: `s("cp*2").delay(0.7).delaytime(0.25)`, description: "Quarter note delay" },
          { code: `s("cp*2").delay(0.7).delaytime(0.125)`, description: "Eighth note delay" },
        ],
        related: ["delay"],
      },
      {
        name: "delayfeedback",
        description: "Delay feedback amount (0-1).",
        signature: ".delayfeedback(amount: number)",
        examples: [
          { code: `s("rim").delay(0.6).delaytime(0.25).delayfeedback(0.7)`, description: "Long delay tail" },
        ],
        related: ["delay"],
      },
      {
        name: "room",
        description: "Reverb room size (0-1).",
        signature: ".room(size: number)",
        examples: [
          { code: `s("bd sd hh cp").room(0.5)`, description: "Medium room" },
          { code: `s("cp").room(0.9).size(0.9)`, description: "Large hall" },
        ],
        related: ["size", "roomlp"],
      },
      {
        name: "size",
        description: "Reverb decay time.",
        signature: ".size(amount: number)",
        examples: [
          { code: `s("cp").room(0.5).size(0.8)`, description: "Long reverb tail" },
        ],
        related: ["room"],
      },
    ],
  },
  {
    name: "Distortion",
    description: "Add grit and crunch",
    functions: [
      {
        name: "distort",
        description: "Waveshaping distortion (0-1).",
        signature: ".distort(amount: number)",
        examples: [
          { code: `s("bd sd").distort(0.4)`, description: "Light distortion" },
          { code: `note("c2 c2 c3 c2").sound("sawtooth").distort(0.7)`, description: "Dirty bass" },
        ],
      },
      {
        name: "crush",
        description: "Bit crusher - lower = more crushed.",
        signature: ".crush(bits: number)",
        examples: [
          { code: `s("bd sd hh cp").crush(4)`, description: "Heavy bit crush" },
          { code: `s("bd*4").crush(8)`, description: "Subtle bit crush" },
          { code: `s("bd*4").crush("<16 8 4 2>")`, description: "Increasing crush" },
        ],
        related: ["coarse"],
      },
      {
        name: "coarse",
        description: "Sample rate reduction.",
        signature: ".coarse(factor: number)",
        examples: [
          { code: `s("bd sd hh cp").coarse(8)`, description: "Lo-fi sound" },
          { code: `s("hh*8").coarse(16)`, description: "Very crunchy" },
        ],
        related: ["crush"],
      },
    ],
  },
  {
    name: "Modulation",
    description: "Add movement with modulation effects",
    functions: [
      {
        name: "phaser",
        description: "Phaser effect rate.",
        signature: ".phaser(rate: number)",
        examples: [
          { code: `note("c3,e3,g3").sound("sawtooth").phaser(2).phaserdepth(0.5)`, description: "Phased chord" },
        ],
        related: ["phaserdepth"],
      },
      {
        name: "vibrato",
        description: "Pitch vibrato rate.",
        signature: ".vibrato(rate: number)",
        examples: [
          { code: `note("c4").sound("sine").vibrato(6)`, description: "Vibrato sine" },
        ],
      },
      {
        name: "tremolo",
        description: "Volume tremolo rate.",
        signature: ".tremolo(rate: number)",
        examples: [
          { code: `note("c3,e3,g3").sound("triangle").tremolo(8)`, description: "Tremolo chord" },
        ],
      },
    ],
  },
  {
    name: "Spatial",
    description: "Control stereo position and space",
    functions: [
      {
        name: "pan",
        description: "Stereo position (-1 left, 0 center, 1 right).",
        signature: ".pan(position: number)",
        examples: [
          { code: `s("bd sd hh cp").pan("<-1 0 1 0>")`, description: "Panning drums" },
          { code: `s("hh*8").pan(sine)`, description: "Swirling hihat" },
        ],
        related: ["jux"],
      },
      {
        name: "jux",
        description: "Apply function to one stereo channel.",
        signature: ".jux(fn: (p) => p)",
        examples: [
          { code: `s("bd sd hh cp").jux(rev)`, description: "Reversed in right channel" },
          { code: `s("bd*4").jux(x => x.speed(1.5))`, description: "Faster in right" },
        ],
        related: ["juxBy", "pan"],
      },
      {
        name: "juxBy",
        description: "Partial stereo separation for jux.",
        signature: ".juxBy(amount: number, fn: (p) => p)",
        examples: [
          { code: `s("bd sd hh cp").juxBy(0.5, x => x.fast(2))`, description: "Subtle stereo variation" },
        ],
        related: ["jux"],
      },
    ],
  },
  {
    name: "Envelopes",
    description: "Shape sound over time",
    functions: [
      {
        name: "attack",
        description: "Attack time for synths.",
        signature: ".attack(time: number)",
        examples: [
          { code: `note("c3 e3 g3").sound("sawtooth").attack(0.1).release(0.3)`, description: "Soft attack pad" },
        ],
        related: ["decay", "sustain", "release"],
      },
      {
        name: "decay",
        description: "Decay time for synths.",
        signature: ".decay(time: number)",
        examples: [
          { code: `note("c3*4").sound("sine").decay(0.1).sustain(0)`, description: "Plucky sine" },
        ],
        related: ["attack", "sustain", "release"],
      },
      {
        name: "sustain",
        description: "Sustain level for synths (0-1).",
        signature: ".sustain(level: number)",
        examples: [
          { code: `note("c3@2").sound("sawtooth").attack(0.3).sustain(0.7).release(0.5)`, description: "Pad sound" },
        ],
        related: ["attack", "decay", "release"],
      },
      {
        name: "release",
        description: "Release time for synths.",
        signature: ".release(time: number)",
        examples: [
          { code: `note("c3 e3 g3 b3").sound("triangle").release(0.8)`, description: "Long release arp" },
        ],
        related: ["attack", "decay", "sustain"],
      },
    ],
  },
  {
    name: "Layering",
    description: "Combine multiple patterns",
    functions: [
      {
        name: "stack",
        description: "Play multiple patterns simultaneously.",
        signature: "stack(pattern1, pattern2, ...)",
        examples: [
          {
            code: `stack(
  s("bd sd bd sd"),
  s("hh*8"),
  s("~ cp ~ cp")
)`,
            description: "Layered drum kit",
          },
          {
            code: `stack(
  s("bd*4"),
  note("c2 c2 g2 c2").sound("sawtooth").lpf(400)
)`,
            description: "Drums with bass",
          },
        ],
        related: ["cat", "seq"],
      },
      {
        name: "cat",
        description: "Play patterns in sequence, one per cycle.",
        signature: "cat(pattern1, pattern2, ...)",
        aliases: ["seq"],
        examples: [
          {
            code: `cat(
  s("bd*4"),
  s("sd*4"),
  s("hh*8"),
  s("cp*2")
)`,
            description: "4-bar sequence",
          },
        ],
        related: ["stack", "seq"],
      },
      {
        name: "seq",
        description: "Alias for cat - play patterns in sequence.",
        signature: "seq(pattern1, pattern2, ...)",
        aliases: ["cat"],
        examples: [
          {
            code: `seq(
  note("c3 e3 g3 e3").sound("sine"),
  note("d3 f3 a3 f3").sound("sine")
)`,
            description: "Two-bar melody",
          },
        ],
        related: ["stack", "cat"],
      },
    ],
  },
  {
    name: "Randomness",
    description: "Add controlled unpredictability",
    functions: [
      {
        name: "sometimes",
        description: "Apply transformation 50% of the time.",
        signature: ".sometimes(fn: (p) => p)",
        examples: [
          { code: `s("hh*8").sometimes(x => x.speed(2))`, description: "Random double speed" },
          { code: `s("bd sd hh cp").sometimes(x => x.gain(0.3))`, description: "Random quiet hits" },
        ],
        related: ["rarely", "often", "sometimesBy"],
      },
      {
        name: "rarely",
        description: "Apply transformation 25% of the time.",
        signature: ".rarely(fn: (p) => p)",
        examples: [
          { code: `s("bd*4").rarely(x => x.speed(-1))`, description: "Occasional reverse" },
        ],
        related: ["sometimes", "often"],
      },
      {
        name: "often",
        description: "Apply transformation 75% of the time.",
        signature: ".often(fn: (p) => p)",
        examples: [
          { code: `s("hh*8").often(x => x.gain(0.5))`, description: "Usually quieter" },
        ],
        related: ["sometimes", "rarely"],
      },
      {
        name: "sometimesBy",
        description: "Apply transformation with custom probability.",
        signature: ".sometimesBy(prob: number, fn: (p) => p)",
        examples: [
          { code: `s("sd*4").sometimesBy(0.3, x => x.crush(4))`, description: "30% crushed snares" },
        ],
        related: ["sometimes"],
      },
      {
        name: "degradeBy",
        description: "Randomly remove events by probability.",
        signature: ".degradeBy(prob: number)",
        examples: [
          { code: `s("hh*16").degradeBy(0.3)`, description: "30% of hihats removed" },
        ],
      },
      {
        name: "shuffle",
        description: "Randomize pattern order each cycle.",
        signature: ".shuffle()",
        examples: [
          { code: `s("bd sd hh cp").shuffle()`, description: "Random order each cycle" },
          { code: `note("c3 e3 g3 b3").sound("sine").shuffle()`, description: "Shuffled melody" },
        ],
      },
    ],
  },
  {
    name: "Cyclic",
    description: "Apply changes on specific cycles",
    functions: [
      {
        name: "every",
        description: "Apply transformation every n cycles.",
        signature: ".every(n: number, fn: (p) => p)",
        examples: [
          { code: `s("bd sd hh cp").every(4, x => x.fast(2))`, description: "Fast every 4 cycles" },
          { code: `s("bd*4").every(3, x => x.rev())`, description: "Reverse every 3" },
          { code: `s("hh*8").every(4, x => x.crush(4)).every(2, x => x.speed(1.5))`, description: "Stacked transforms" },
        ],
        related: ["firstOf", "lastOf"],
      },
      {
        name: "firstOf",
        description: "Apply transformation only on first of every n cycles.",
        signature: ".firstOf(n: number, fn: (p) => p)",
        examples: [
          { code: `s("bd sd hh cp").firstOf(4, x => x.speed(2))`, description: "Fast on first of 4" },
        ],
        related: ["every", "lastOf"],
      },
      {
        name: "lastOf",
        description: "Apply transformation only on last of every n cycles.",
        signature: ".lastOf(n: number, fn: (p) => p)",
        examples: [
          { code: `s("bd sd hh cp").lastOf(4, x => x.crush(4))`, description: "Crushed on last of 4" },
        ],
        related: ["every", "firstOf"],
      },
    ],
  },
  {
    name: "Order",
    description: "Rearrange pattern elements",
    functions: [
      {
        name: "rev",
        description: "Reverse the pattern order.",
        signature: ".rev()",
        examples: [
          { code: `s("bd sd hh cp").rev()`, description: "Reversed drums" },
          { code: `note("c3 d3 e3 f3 g3").sound("sine").rev()`, description: "Descending" },
        ],
        related: ["palindrome"],
      },
      {
        name: "palindrome",
        description: "Play forward then backward.",
        signature: ".palindrome()",
        examples: [
          { code: `s("bd sd hh cp").palindrome()`, description: "Ping-pong pattern" },
          { code: `note("c3 e3 g3 b3").sound("triangle").palindrome()`, description: "Rising and falling" },
        ],
        related: ["rev"],
      },
      {
        name: "iter",
        description: "Rotate pattern by one step each cycle.",
        signature: ".iter(steps: number)",
        examples: [
          { code: `s("bd sd hh cp").iter(4)`, description: "Rotating 4-step pattern" },
        ],
        related: ["rev"],
      },
      {
        name: "chunk",
        description: "Apply transformation to rotating chunk.",
        signature: ".chunk(n: number, fn: (p) => p)",
        examples: [
          { code: `s("bd sd hh cp").chunk(4, x => x.fast(2))`, description: "Fast chunk rotates" },
        ],
      },
    ],
  },
  {
    name: "Structure",
    description: "Control pattern structure and timing",
    functions: [
      {
        name: "struct",
        description: "Apply rhythmic structure to pattern.",
        signature: ".struct(pattern: string)",
        examples: [
          { code: `note("c3").sound("sawtooth").struct("x ~ x x ~ x ~ x")`, description: "Rhythmic gating" },
          { code: `note("c3 e3 g3 b3").sound("sine").struct("x x ~ x")`, description: "Structured arpeggio" },
        ],
        related: ["mask"],
      },
      {
        name: "mask",
        description: "Mute pattern on some cycles.",
        signature: ".mask(pattern: string)",
        examples: [
          { code: `s("bd sd hh cp").mask("<1 1 0 1>")`, description: "Mute third cycle" },
        ],
        related: ["struct"],
      },
    ],
  },
  {
    name: "Signals",
    description: "Continuous control patterns",
    functions: [
      {
        name: "sine",
        description: "Sine wave oscillator (0-1).",
        signature: "sine",
        examples: [
          { code: `s("bd*4").lpf(sine.range(200, 2000))`, description: "Sweeping filter" },
          { code: `s("bd*4").pan(sine)`, description: "Panning" },
          { code: `s("hh*8").gain(sine.range(0.2, 0.8))`, description: "Volume swell" },
        ],
        related: ["saw", "tri", "rand"],
      },
      {
        name: "saw",
        description: "Sawtooth wave oscillator.",
        signature: "saw",
        examples: [
          { code: `s("bd*4").speed(saw.range(0.5, 2))`, description: "Rising pitch" },
        ],
        related: ["sine", "tri"],
      },
      {
        name: "tri",
        description: "Triangle wave oscillator.",
        signature: "tri",
        examples: [
          { code: `s("bd*4").lpf(tri.range(200, 2000))`, description: "Triangle LFO filter" },
        ],
        related: ["sine", "saw"],
      },
      {
        name: "rand",
        description: "Random values each event.",
        signature: "rand",
        examples: [
          { code: `s("hh*8").pan(rand)`, description: "Random panning" },
          { code: `s("bd*4").speed(rand.range(0.8, 1.2))`, description: "Slight pitch variation" },
        ],
        related: ["perlin"],
      },
      {
        name: "perlin",
        description: "Smooth random (Perlin noise).",
        signature: "perlin",
        examples: [
          { code: `s("bd*4").lpf(perlin.range(400, 2000))`, description: "Smooth filter movement" },
          { code: `note("c3").sound("sine").add(perlin.range(-1, 1))`, description: "Wandering pitch" },
        ],
        related: ["rand"],
      },
      {
        name: "range",
        description: "Scale a signal to a range.",
        signature: ".range(min: number, max: number)",
        examples: [
          { code: `s("bd*4").lpf(sine.range(400, 2000))`, description: "Filter 400-2000 Hz" },
          { code: `s("hh*8").gain(sine.range(0.3, 1))`, description: "Volume 0.3-1" },
        ],
      },
    ],
  },
];

export default FUNCTION_REFERENCE;
