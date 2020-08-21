import { app, remote } from 'electron'
import path from 'path'
import Datastore from 'nedb'

const APP = process.type === 'renderer' ? remote.app : app;
const DB_PATH = APP.getPath('userData')

export const User = new Datastore({ filename: path.join(DB_PATH, 'user.db'), autoload: true })
