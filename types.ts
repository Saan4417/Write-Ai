
export interface Character {
  name: string;
  bio: string;
}

export interface Scene {
  scene_number: number;
  description: string;
  dialogues: string[];
  location: string;
  mood: string;
}

export interface ScriptOutput {
  title: string;
  characters: Character[];
  plot_outline: string;
  plot_outline_hindi: string;
  detailed_synopsis: string;
  scenes: Scene[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
