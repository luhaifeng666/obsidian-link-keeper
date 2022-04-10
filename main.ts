import { Plugin } from "obsidian"
import { AddLink, DeleteLink } from "./modals"
import { LinkKeeperSettingTab } from './settings'
import { readFile, writeFile } from 'fs/promises'
import { noticeHandler } from './utils'
interface LinkKeeperSettings {
  filepath: string
}

interface Options {
  [key: string]: string
}

const DEFAULT_SETTINGS: Partial<LinkKeeperSettings> = {
  filepath: `${process.env.HOME}/etl.json`
}

export default class InsertLinkPlugin extends Plugin {
  settings: LinkKeeperSettings

  /**
   * get all links
   * @param cb 
   */
  async getLinks (cb: (data: Options) => void) {
    try {
      const data = await readFile(this.settings.filepath, { encoding: 'utf-8'})
      cb(JSON.parse(data || '{}'))
    } catch (err) {
      noticeHandler(err.message)
    }
  }
  
  /**
   * save link
   * @param data 
   * @param message 
   */
  async saveLink (data: Options, message: string) {
    try {
      await writeFile(this.settings.filepath, JSON.stringify(data))
      noticeHandler(message)
    } catch (err) {
      noticeHandler(err.message)
    }
  }

  /**
   * add link submission
   * @param name 
   * @param url 
   */
  onSubmit (name: string, url: string) {
    this.getLinks(async (data: Options) => {
      if (Object.prototype.toString.call(data) === '[object Object]') {
        this.saveLink({...data, [name]: url}, 'Add Link successfully!')
      } else {
        noticeHandler('Data format error! It must be a json object.')
      }
    })
  }

  /**
   * get the keys of all links
   * @returns Options
   */
  getOptions () {
    let options = {}
    this.getLinks(async (data: Options) => {
      options = Object.keys(data).reduce((obj, key) => ({
        ...obj,
        key
      }), options)
    })
    return options
  }

  /**
   * delete link by name
   * @param name 
   */
  async onDelete (name: string) {
    await this.getLinks(async (data: Options) => {
      delete data[name]
      this.saveLink(data, `Link named ${name} has been deleted!`)
    })
  }

  /**
   * init modal
   * @param type 
   * @param options 
   * @returns 
   */
  initModal (type: string, options?: Options) {
    switch (type) {
      case 'addLink':
        return new AddLink(this.app, this.onSubmit.bind(this))

      case 'deleteLink':
        return new DeleteLink(this.app, options, this.onDelete.bind(this))

      default: break
    }
  }

  async onload() {
    // load settings
    await this.loadSettings()
    // add setting tab
    this.addSettingTab(new LinkKeeperSettingTab(this.app, this))
    // add command
    this.addCommand({
      id: "add-link",
      name: "Add link",
      callback: () => {
        this.initModal('addLink').open()
      },
    })

    this.addCommand({
      id: "delete-link",
      name: 'Delete link',
      callback: () => {
        this.getLinks(async (data: Options) => {
          const options = Object.keys(data).reduce((obj, key) => ({
            ...obj,
            [key]: key
          }), {})
          this.initModal('deleteLink', options).open()
        })
      }
    })
  }

  async loadSettings () {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...await this.loadData()
    }
  }

  async saveSettings () {
    await this.saveData(this.settings)
  }
}