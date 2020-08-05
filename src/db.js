import { app, remote } from 'electron'
import path from 'path'
import Datastore from 'nedb'

const APP = process.type === 'renderer' ? remote.app : app;
const DB_PATH = APP.getPath('userData')
const db = {}

db.User = new Datastore({ filename: path.join(DB_PATH, 'user.db'), autoload: true })

export default db