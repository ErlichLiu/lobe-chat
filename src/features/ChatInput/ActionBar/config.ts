import STT from '../STT';
import Clear from './Clear';
import History from './History';
import Knowledge from './Knowledge';
import ModelSwitch from './ModelSwitch';
import QuotaDisplay from './QuotaDisplay';
import Temperature from './Temperature';
import Token from './Token';
import Tools from './Tools';
import Upload from './Upload';

export const actionMap = {
  clear: Clear,
  fileUpload: Upload,
  history: History,
  knowledgeBase: Knowledge,
  model: ModelSwitch,
  quota: QuotaDisplay,
  stt: STT,
  temperature: Temperature,
  token: Token,
  tools: Tools,
} as const;

type ActionMap = typeof actionMap;

export type ActionKeys = keyof ActionMap;

type getActionList = (mobile?: boolean) => ActionKeys[];

// we can make these action lists configurable in the future
export const getLeftActionList: getActionList = (mobile) =>
  [
    'model',
    'fileUpload',
    'knowledgeBase',
    'temperature',
    'history',
    !mobile && 'stt',
    'tools',
    'token',
    'quota',
  ].filter(Boolean) as ActionKeys[];

export const getRightActionList: getActionList = () =>
  ['clear', 'quota'].filter(Boolean) as ActionKeys[];
