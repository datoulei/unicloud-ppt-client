import { app, remote } from 'electron'
import path from 'path'
import Datastore from 'nedb'

const APP = process.type === 'renderer' ? remote.app : app;
const DB_PATH = APP.getPath('userData')

export const CacheFile = new Datastore({ filename: path.join(DB_PATH, 'cachefile.db'), autoload: true })
