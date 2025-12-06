// Custom soundfont loader that uses @strudel/web's registerSound
// This avoids module duplication issues with @strudel/soundfonts

// GM soundfont data - maps sound names to font file names
// From @strudel/soundfonts/gm.mjs
const gm: Record<string, string[]> = {
  gm_piano: [
    "0000_JCLive_sf2_file",
    "0000_FluidR3_GM_sf2_file",
    "0000_Aspirin_sf2_file",
    "0000_Chaos_sf2_file",
    "0000_GeneralUserGS_sf2_file",
    "0001_FluidR3_GM_sf2_file",
    "0001_GeneralUserGS_sf2_file",
  ],
  gm_epiano1: [
    "0040_JCLive_sf2_file",
    "0040_FluidR3_GM_sf2_file",
    "0040_Aspirin_sf2_file",
  ],
  gm_epiano2: [
    "0050_JCLive_sf2_file",
    "0050_FluidR3_GM_sf2_file",
    "0050_Aspirin_sf2_file",
  ],
  gm_harpsichord: [
    "0060_JCLive_sf2_file",
    "0060_FluidR3_GM_sf2_file",
    "0060_Aspirin_sf2_file",
  ],
  gm_clavinet: [
    "0070_JCLive_sf2_file",
    "0070_FluidR3_GM_sf2_file",
    "0070_Aspirin_sf2_file",
  ],
  gm_celesta: [
    "0080_JCLive_sf2_file",
    "0080_FluidR3_GM_sf2_file",
    "0080_Aspirin_sf2_file",
  ],
  gm_glockenspiel: [
    "0090_JCLive_sf2_file",
    "0090_FluidR3_GM_sf2_file",
    "0090_Aspirin_sf2_file",
  ],
  gm_music_box: [
    "0100_JCLive_sf2_file",
    "0100_FluidR3_GM_sf2_file",
    "0100_Aspirin_sf2_file",
  ],
  gm_vibraphone: [
    "0110_JCLive_sf2_file",
    "0110_FluidR3_GM_sf2_file",
    "0110_Aspirin_sf2_file",
  ],
  gm_marimba: [
    "0120_JCLive_sf2_file",
    "0120_FluidR3_GM_sf2_file",
    "0120_Aspirin_sf2_file",
  ],
  gm_xylophone: [
    "0130_JCLive_sf2_file",
    "0130_FluidR3_GM_sf2_file",
    "0130_Aspirin_sf2_file",
  ],
  gm_tubular_bells: [
    "0140_JCLive_sf2_file",
    "0140_FluidR3_GM_sf2_file",
    "0140_Aspirin_sf2_file",
  ],
  gm_dulcimer: [
    "0150_JCLive_sf2_file",
    "0150_FluidR3_GM_sf2_file",
    "0150_Aspirin_sf2_file",
  ],
  gm_drawbar_organ: [
    "0160_JCLive_sf2_file",
    "0160_FluidR3_GM_sf2_file",
    "0160_Aspirin_sf2_file",
  ],
  gm_percussive_organ: [
    "0170_JCLive_sf2_file",
    "0170_FluidR3_GM_sf2_file",
    "0170_Aspirin_sf2_file",
  ],
  gm_rock_organ: [
    "0180_JCLive_sf2_file",
    "0180_FluidR3_GM_sf2_file",
    "0180_Aspirin_sf2_file",
  ],
  gm_church_organ: [
    "0190_JCLive_sf2_file",
    "0190_FluidR3_GM_sf2_file",
    "0190_Aspirin_sf2_file",
  ],
  gm_reed_organ: [
    "0200_JCLive_sf2_file",
    "0200_FluidR3_GM_sf2_file",
    "0200_Aspirin_sf2_file",
  ],
  gm_accordion: [
    "0210_JCLive_sf2_file",
    "0210_FluidR3_GM_sf2_file",
    "0210_Aspirin_sf2_file",
  ],
  gm_harmonica: [
    "0220_JCLive_sf2_file",
    "0220_FluidR3_GM_sf2_file",
    "0220_Aspirin_sf2_file",
  ],
  gm_bandoneon: [
    "0230_JCLive_sf2_file",
    "0230_FluidR3_GM_sf2_file",
    "0230_Aspirin_sf2_file",
  ],
  gm_acoustic_guitar_nylon: [
    "0240_JCLive_sf2_file",
    "0240_FluidR3_GM_sf2_file",
    "0240_Aspirin_sf2_file",
  ],
  gm_acoustic_guitar_steel: [
    "0250_JCLive_sf2_file",
    "0250_FluidR3_GM_sf2_file",
    "0250_Aspirin_sf2_file",
  ],
  gm_electric_guitar_jazz: [
    "0260_JCLive_sf2_file",
    "0260_FluidR3_GM_sf2_file",
    "0260_Aspirin_sf2_file",
  ],
  gm_electric_guitar_clean: [
    "0270_JCLive_sf2_file",
    "0270_FluidR3_GM_sf2_file",
    "0270_Aspirin_sf2_file",
  ],
  gm_electric_guitar_muted: [
    "0280_JCLive_sf2_file",
    "0280_FluidR3_GM_sf2_file",
    "0280_Aspirin_sf2_file",
  ],
  gm_overdriven_guitar: [
    "0290_JCLive_sf2_file",
    "0290_FluidR3_GM_sf2_file",
    "0290_Aspirin_sf2_file",
  ],
  gm_distortion_guitar: [
    "0300_JCLive_sf2_file",
    "0300_FluidR3_GM_sf2_file",
    "0300_Aspirin_sf2_file",
  ],
  gm_guitar_harmonics: [
    "0310_JCLive_sf2_file",
    "0310_FluidR3_GM_sf2_file",
  ],
  gm_acoustic_bass: [
    "0320_JCLive_sf2_file",
    "0320_FluidR3_GM_sf2_file",
    "0320_Aspirin_sf2_file",
  ],
  gm_electric_bass_finger: [
    "0330_JCLive_sf2_file",
    "0330_FluidR3_GM_sf2_file",
    "0330_Aspirin_sf2_file",
  ],
  gm_electric_bass_pick: [
    "0340_JCLive_sf2_file",
    "0340_FluidR3_GM_sf2_file",
    "0340_Aspirin_sf2_file",
  ],
  gm_fretless_bass: [
    "0350_JCLive_sf2_file",
    "0350_FluidR3_GM_sf2_file",
  ],
  gm_slap_bass_1: [
    "0360_JCLive_sf2_file",
    "0360_FluidR3_GM_sf2_file",
    "0360_Aspirin_sf2_file",
  ],
  gm_slap_bass_2: [
    "0370_JCLive_sf2_file",
    "0370_FluidR3_GM_sf2_file",
    "0370_Aspirin_sf2_file",
  ],
  gm_synth_bass_1: [
    "0380_JCLive_sf2_file",
    "0380_FluidR3_GM_sf2_file",
    "0380_Aspirin_sf2_file",
  ],
  gm_synth_bass_2: [
    "0390_JCLive_sf2_file",
    "0390_FluidR3_GM_sf2_file",
    "0390_Aspirin_sf2_file",
  ],
  gm_violin: [
    "0400_JCLive_sf2_file",
    "0400_FluidR3_GM_sf2_file",
    "0400_Aspirin_sf2_file",
  ],
  gm_viola: [
    "0410_JCLive_sf2_file",
    "0410_FluidR3_GM_sf2_file",
    "0410_Aspirin_sf2_file",
  ],
  gm_cello: [
    "0420_JCLive_sf2_file",
    "0420_FluidR3_GM_sf2_file",
    "0420_Aspirin_sf2_file",
  ],
  gm_contrabass: [
    "0430_JCLive_sf2_file",
    "0430_FluidR3_GM_sf2_file",
  ],
  gm_tremolo_strings: [
    "0440_JCLive_sf2_file",
    "0440_FluidR3_GM_sf2_file",
    "0440_Aspirin_sf2_file",
  ],
  gm_pizzicato_strings: [
    "0450_JCLive_sf2_file",
    "0450_FluidR3_GM_sf2_file",
    "0450_Aspirin_sf2_file",
  ],
  gm_orchestral_harp: [
    "0460_JCLive_sf2_file",
    "0460_FluidR3_GM_sf2_file",
    "0460_Aspirin_sf2_file",
  ],
  gm_timpani: [
    "0470_JCLive_sf2_file",
    "0470_FluidR3_GM_sf2_file",
    "0470_Aspirin_sf2_file",
  ],
  gm_string_ensemble_1: [
    "0480_JCLive_sf2_file",
    "0480_FluidR3_GM_sf2_file",
    "0480_Aspirin_sf2_file",
  ],
  gm_string_ensemble_2: [
    "0490_JCLive_sf2_file",
    "0490_FluidR3_GM_sf2_file",
    "0490_Aspirin_sf2_file",
  ],
  gm_synth_strings_1: [
    "0500_JCLive_sf2_file",
    "0500_FluidR3_GM_sf2_file",
    "0500_Aspirin_sf2_file",
  ],
  gm_synth_strings_2: [
    "0510_JCLive_sf2_file",
    "0510_FluidR3_GM_sf2_file",
  ],
  gm_choir_aahs: [
    "0520_JCLive_sf2_file",
    "0520_FluidR3_GM_sf2_file",
    "0520_Aspirin_sf2_file",
  ],
  gm_voice_oohs: [
    "0530_JCLive_sf2_file",
    "0530_FluidR3_GM_sf2_file",
    "0530_Aspirin_sf2_file",
  ],
  gm_synth_choir: [
    "0540_JCLive_sf2_file",
    "0540_FluidR3_GM_sf2_file",
    "0540_Aspirin_sf2_file",
  ],
  gm_orchestra_hit: [
    "0550_JCLive_sf2_file",
    "0550_FluidR3_GM_sf2_file",
    "0550_Aspirin_sf2_file",
  ],
  gm_trumpet: [
    "0560_JCLive_sf2_file",
    "0560_FluidR3_GM_sf2_file",
    "0560_Aspirin_sf2_file",
  ],
  gm_trombone: [
    "0570_JCLive_sf2_file",
    "0570_FluidR3_GM_sf2_file",
    "0570_Aspirin_sf2_file",
  ],
  gm_tuba: [
    "0580_JCLive_sf2_file",
    "0580_FluidR3_GM_sf2_file",
    "0580_Aspirin_sf2_file",
  ],
  gm_muted_trumpet: [
    "0590_JCLive_sf2_file",
    "0590_FluidR3_GM_sf2_file",
    "0590_Aspirin_sf2_file",
  ],
  gm_french_horn: [
    "0600_JCLive_sf2_file",
    "0600_FluidR3_GM_sf2_file",
    "0600_Aspirin_sf2_file",
  ],
  gm_brass_section: [
    "0610_JCLive_sf2_file",
    "0610_FluidR3_GM_sf2_file",
    "0610_Aspirin_sf2_file",
  ],
  gm_synth_brass_1: [
    "0620_JCLive_sf2_file",
    "0620_FluidR3_GM_sf2_file",
  ],
  gm_synth_brass_2: [
    "0630_JCLive_sf2_file",
    "0630_FluidR3_GM_sf2_file",
    "0630_Aspirin_sf2_file",
  ],
  gm_soprano_sax: [
    "0640_JCLive_sf2_file",
    "0640_FluidR3_GM_sf2_file",
    "0640_Aspirin_sf2_file",
  ],
  gm_alto_sax: [
    "0650_JCLive_sf2_file",
    "0650_FluidR3_GM_sf2_file",
    "0650_Aspirin_sf2_file",
  ],
  gm_tenor_sax: [
    "0660_JCLive_sf2_file",
    "0660_FluidR3_GM_sf2_file",
  ],
  gm_baritone_sax: [
    "0670_JCLive_sf2_file",
    "0670_FluidR3_GM_sf2_file",
    "0670_Aspirin_sf2_file",
  ],
  gm_oboe: [
    "0680_JCLive_sf2_file",
    "0680_FluidR3_GM_sf2_file",
    "0680_Aspirin_sf2_file",
  ],
  gm_english_horn: [
    "0690_JCLive_sf2_file",
    "0690_FluidR3_GM_sf2_file",
  ],
  gm_bassoon: [
    "0700_JCLive_sf2_file",
    "0700_FluidR3_GM_sf2_file",
  ],
  gm_clarinet: [
    "0710_JCLive_sf2_file",
    "0710_FluidR3_GM_sf2_file",
    "0710_Aspirin_sf2_file",
  ],
  gm_piccolo: [
    "0720_JCLive_sf2_file",
    "0720_FluidR3_GM_sf2_file",
    "0720_Aspirin_sf2_file",
  ],
  gm_flute: [
    "0730_JCLive_sf2_file",
    "0730_FluidR3_GM_sf2_file",
    "0730_Aspirin_sf2_file",
  ],
  gm_recorder: [
    "0740_JCLive_sf2_file",
    "0740_FluidR3_GM_sf2_file",
    "0740_Aspirin_sf2_file",
  ],
  gm_pan_flute: [
    "0750_JCLive_sf2_file",
    "0750_FluidR3_GM_sf2_file",
    "0750_Aspirin_sf2_file",
  ],
  gm_blown_bottle: [
    "0760_JCLive_sf2_file",
    "0760_FluidR3_GM_sf2_file",
    "0760_Aspirin_sf2_file",
  ],
  gm_shakuhachi: [
    "0770_JCLive_sf2_file",
    "0770_FluidR3_GM_sf2_file",
    "0770_Aspirin_sf2_file",
  ],
  gm_whistle: [
    "0780_JCLive_sf2_file",
    "0780_FluidR3_GM_sf2_file",
  ],
  gm_ocarina: [
    "0790_JCLive_sf2_file",
    "0790_FluidR3_GM_sf2_file",
  ],
  gm_lead_1_square: [
    "0800_JCLive_sf2_file",
    "0800_FluidR3_GM_sf2_file",
  ],
  gm_lead_2_sawtooth: [
    "0810_JCLive_sf2_file",
    "0810_FluidR3_GM_sf2_file",
    "0810_Aspirin_sf2_file",
  ],
  gm_lead_3_calliope: [
    "0820_JCLive_sf2_file",
    "0820_FluidR3_GM_sf2_file",
    "0820_Aspirin_sf2_file",
  ],
  gm_lead_4_chiff: [
    "0830_JCLive_sf2_file",
    "0830_FluidR3_GM_sf2_file",
    "0830_Aspirin_sf2_file",
  ],
  gm_lead_5_charang: [
    "0840_JCLive_sf2_file",
    "0840_FluidR3_GM_sf2_file",
    "0840_Aspirin_sf2_file",
  ],
  gm_lead_6_voice: [
    "0850_JCLive_sf2_file",
    "0850_FluidR3_GM_sf2_file",
    "0850_Aspirin_sf2_file",
  ],
  gm_lead_7_fifths: [
    "0860_JCLive_sf2_file",
    "0860_FluidR3_GM_sf2_file",
    "0860_Aspirin_sf2_file",
  ],
  gm_lead_8_bass_lead: [
    "0870_JCLive_sf2_file",
    "0870_FluidR3_GM_sf2_file",
    "0870_Aspirin_sf2_file",
  ],
  gm_pad_new_age: [
    "0880_JCLive_sf2_file",
    "0880_FluidR3_GM_sf2_file",
    "0880_Aspirin_sf2_file",
  ],
  gm_pad_warm: [
    "0890_JCLive_sf2_file",
    "0890_FluidR3_GM_sf2_file",
    "0890_Aspirin_sf2_file",
  ],
  gm_pad_poly: [
    "0900_JCLive_sf2_file",
    "0900_FluidR3_GM_sf2_file",
    "0900_Aspirin_sf2_file",
  ],
  gm_pad_choir: [
    "0910_JCLive_sf2_file",
    "0910_FluidR3_GM_sf2_file",
    "0910_Aspirin_sf2_file",
  ],
  gm_pad_bowed: [
    "0920_JCLive_sf2_file",
    "0920_FluidR3_GM_sf2_file",
    "0920_Aspirin_sf2_file",
  ],
  gm_pad_metallic: [
    "0930_JCLive_sf2_file",
    "0930_FluidR3_GM_sf2_file",
    "0930_Aspirin_sf2_file",
  ],
  gm_pad_halo: [
    "0940_JCLive_sf2_file",
    "0940_FluidR3_GM_sf2_file",
    "0940_Aspirin_sf2_file",
  ],
  gm_pad_sweep: [
    "0950_JCLive_sf2_file",
    "0950_FluidR3_GM_sf2_file",
    "0950_Aspirin_sf2_file",
  ],
  gm_fx_rain: [
    "0960_JCLive_sf2_file",
    "0960_FluidR3_GM_sf2_file",
    "0960_Aspirin_sf2_file",
  ],
  gm_fx_soundtrack: [
    "0970_JCLive_sf2_file",
    "0970_FluidR3_GM_sf2_file",
    "0970_Aspirin_sf2_file",
  ],
  gm_fx_crystal: [
    "0980_JCLive_sf2_file",
    "0980_FluidR3_GM_sf2_file",
    "0980_Aspirin_sf2_file",
  ],
  gm_fx_atmosphere: [
    "0990_JCLive_sf2_file",
    "0990_FluidR3_GM_sf2_file",
    "0990_Aspirin_sf2_file",
  ],
  gm_fx_brightness: [
    "1000_JCLive_sf2_file",
    "1000_FluidR3_GM_sf2_file",
    "1000_Aspirin_sf2_file",
  ],
  gm_fx_goblins: [
    "1010_JCLive_sf2_file",
    "1010_FluidR3_GM_sf2_file",
    "1010_Aspirin_sf2_file",
  ],
  gm_fx_echoes: [
    "1020_JCLive_sf2_file",
    "1020_FluidR3_GM_sf2_file",
    "1020_Aspirin_sf2_file",
  ],
  gm_fx_sci_fi: [
    "1030_JCLive_sf2_file",
    "1030_FluidR3_GM_sf2_file",
    "1030_Aspirin_sf2_file",
  ],
  gm_sitar: [
    "1040_JCLive_sf2_file",
    "1040_FluidR3_GM_sf2_file",
    "1040_Aspirin_sf2_file",
  ],
  gm_banjo: [
    "1050_JCLive_sf2_file",
    "1050_FluidR3_GM_sf2_file",
    "1050_Aspirin_sf2_file",
  ],
  gm_shamisen: [
    "1060_JCLive_sf2_file",
    "1060_FluidR3_GM_sf2_file",
    "1060_Aspirin_sf2_file",
  ],
  gm_koto: [
    "1070_JCLive_sf2_file",
    "1070_FluidR3_GM_sf2_file",
    "1070_Aspirin_sf2_file",
  ],
  gm_kalimba: [
    "1080_JCLive_sf2_file",
    "1080_FluidR3_GM_sf2_file",
    "1080_Aspirin_sf2_file",
  ],
  gm_bagpipe: ["1090_FluidR3_GM_sf2_file"],
  gm_fiddle: [
    "1100_JCLive_sf2_file",
    "1100_FluidR3_GM_sf2_file",
    "1100_Aspirin_sf2_file",
  ],
  gm_shanai: [
    "1110_JCLive_sf2_file",
    "1110_FluidR3_GM_sf2_file",
    "1110_Aspirin_sf2_file",
  ],
  gm_tinkle_bell: ["1120_FluidR3_GM_sf2_file"],
  gm_agogo: [
    "1130_JCLive_sf2_file",
    "1130_FluidR3_GM_sf2_file",
    "1130_Aspirin_sf2_file",
  ],
  gm_steel_drums: [
    "1140_JCLive_sf2_file",
    "1140_FluidR3_GM_sf2_file",
    "1140_Aspirin_sf2_file",
  ],
  gm_woodblock: [
    "1150_JCLive_sf2_file",
    "1150_FluidR3_GM_sf2_file",
    "1150_Aspirin_sf2_file",
  ],
  gm_taiko_drum: [
    "1160_JCLive_sf2_file",
    "1160_FluidR3_GM_sf2_file",
    "1160_Aspirin_sf2_file",
  ],
  gm_melodic_tom: [
    "1170_JCLive_sf2_file",
    "1170_FluidR3_GM_sf2_file",
    "1170_Aspirin_sf2_file",
  ],
  gm_synth_drum: [
    "1180_JCLive_sf2_file",
    "1180_FluidR3_GM_sf2_file",
    "1180_Aspirin_sf2_file",
  ],
  gm_reverse_cymbal: [
    "1190_JCLive_sf2_file",
    "1190_FluidR3_GM_sf2_file",
    "1190_Aspirin_sf2_file",
  ],
  gm_guitar_fret_noise: [
    "1200_JCLive_sf2_file",
    "1200_FluidR3_GM_sf2_file",
    "1200_Aspirin_sf2_file",
  ],
  gm_breath_noise: [
    "1210_JCLive_sf2_file",
    "1210_FluidR3_GM_sf2_file",
    "1210_Aspirin_sf2_file",
  ],
  gm_seashore: [
    "1220_JCLive_sf2_file",
    "1220_FluidR3_GM_sf2_file",
    "1220_Aspirin_sf2_file",
  ],
  gm_bird_tweet: [
    "1230_JCLive_sf2_file",
    "1230_FluidR3_GM_sf2_file",
    "1230_Aspirin_sf2_file",
  ],
  gm_telephone: [
    "1240_JCLive_sf2_file",
    "1240_FluidR3_GM_sf2_file",
    "1240_Aspirin_sf2_file",
  ],
  gm_helicopter: [
    "1250_JCLive_sf2_file",
    "1250_FluidR3_GM_sf2_file",
    "1250_Aspirin_sf2_file",
  ],
  gm_applause: [
    "1260_JCLive_sf2_file",
    "1260_FluidR3_GM_sf2_file",
    "1260_Aspirin_sf2_file",
  ],
  gm_gunshot: [
    "1270_JCLive_sf2_file",
    "1270_FluidR3_GM_sf2_file",
    "1270_Aspirin_sf2_file",
  ],
};

const soundfontUrl = "https://felixroos.github.io/webaudiofontdata/sound";
const loadCache: Record<string, Promise<unknown>> = {};

async function loadFont(name: string): Promise<unknown> {
  if (name in loadCache) {
    return loadCache[name];
  }
  const load = async () => {
    const url = `${soundfontUrl}/${name}.js`;
    const text = await fetch(url).then((res) => res.text());
    // The file format is: var _tone_XXXX={zones:[...]};
    // We need to extract the object after the first '='
    const match = text.match(/=\s*(\{[\s\S]*\})\s*;?\s*$/);
    if (!match) {
      throw new Error(`Could not parse soundfont file: ${name}`);
    }
    // eslint-disable-next-line no-eval
    return eval("(" + match[1] + ")");
  };
  loadCache[name] = load();
  return loadCache[name];
}

interface FontZone {
  keyRangeLow: number;
  keyRangeHigh: number;
  originalPitch: number;
  coarseTune: number;
  fineTune: number;
  loopStart: number;
  loopEnd: number;
  sampleRate: number;
  file: string;
}

interface FontPreset {
  zones: FontZone[];
}

const bufferCache: Record<string, Promise<{ buffer: AudioBuffer; zone: FontZone }>> = {};

async function getFontPitch(
  name: string,
  pitch: number,
  ac: AudioContext
): Promise<{ buffer: AudioBuffer; zone: FontZone }> {
  const key = `${name}:::${pitch}`;
  if (key in bufferCache) {
    return bufferCache[key];
  }
  const load = async () => {
    const preset = (await loadFont(name)) as FontPreset;
    if (!preset) {
      throw new Error(`Could not load soundfont "${name}"`);
    }
    const dominated = preset.zones.filter((zone) => {
      return zone.keyRangeLow <= pitch && zone.keyRangeHigh >= pitch;
    });
    if (!dominated.length) {
      throw new Error(`no zone for pitch ${pitch} in soundfont ${name}`);
    }
    const zone = dominated[0];
    const base64 = zone.file;
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const audioBuffer = await ac.decodeAudioData(buffer);
    return { buffer: audioBuffer, zone };
  };
  bufferCache[key] = load();
  return bufferCache[key];
}

function noteToMidi(note: string): number {
  const noteNames: Record<string, number> = {
    c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11,
  };
  const match = note.toLowerCase().match(/^([a-g])([#b]?)(-?\d+)?$/);
  if (!match) return 60;
  const [, name, accidental, octaveStr] = match;
  const base = noteNames[name];
  const acc = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  const octave = octaveStr ? parseInt(octaveStr) : 4;
  return base + acc + (octave + 1) * 12;
}

function freqToMidi(freq: number): number {
  return Math.round(12 * Math.log2(freq / 440) + 69);
}

// Register soundfonts using the provided registerSound function
export function registerSoundfontsWithRegister(
  registerSound: (
    name: string,
    trigger: (
      time: number,
      value: Record<string, unknown>,
      onended: () => void
    ) => Promise<{ node: AudioNode; stop: (time: number) => void }>
  ) => void,
  getAudioContext: () => AudioContext,
  getSoundIndex: (n: unknown, length: number) => number
): void {
  Object.entries(gm).forEach(([name, fonts]) => {
    registerSound(name, async (time, value, onended) => {
      const { duration = 1, note = "c3", freq, n, release: releaseParam, gain: gainParam } = value as {
        duration?: number;
        note?: string;
        freq?: number;
        n?: unknown;
        release?: number;
        gain?: number;
      };

      let midi: number;
      if (freq) {
        midi = freqToMidi(freq);
      } else if (typeof note === "string") {
        midi = noteToMidi(note);
      } else if (typeof note === "number") {
        midi = note;
      } else {
        midi = 60;
      }

      const fontIndex = getSoundIndex(n, fonts.length);
      const font = fonts[fontIndex];
      const ctx = getAudioContext();
      const { buffer, zone } = await getFontPitch(font, midi, ctx);

      const bufferSource = ctx.createBufferSource();
      bufferSource.buffer = buffer;

      const baseDetune =
        zone.originalPitch - 100.0 * zone.coarseTune - zone.fineTune;
      const playbackRate = Math.pow(2, (100.0 * midi - baseDetune) / 1200.0);
      bufferSource.playbackRate.value = playbackRate;

      const loop = zone.loopStart > 1 && zone.loopStart < zone.loopEnd;
      if (loop) {
        bufferSource.loop = true;
        bufferSource.loopStart = zone.loopStart / zone.sampleRate;
        bufferSource.loopEnd = zone.loopEnd / zone.sampleRate;
      }

      const gainNode = ctx.createGain();
      bufferSource.connect(gainNode);

      // ADSR envelope with pattern parameters
      const attack = 0.01;
      const release = releaseParam ?? 0.1;
      const gain = gainParam ?? 1.0;
      const holdEnd = time + duration;
      const envEnd = holdEnd + release + 0.01;

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(gain, time + attack);
      gainNode.gain.setValueAtTime(gain, holdEnd);
      gainNode.gain.linearRampToValueAtTime(0, envEnd);

      bufferSource.start(time);
      bufferSource.stop(envEnd);

      bufferSource.onended = onended;

      return {
        node: gainNode,
        stop: (stopTime: number) => {
          try {
            gainNode.gain.linearRampToValueAtTime(0, stopTime + release);
            bufferSource.stop(stopTime + release + 0.01);
          } catch {
            // Already stopped
          }
        },
      };
    });
  });
}
