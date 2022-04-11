import { App, Modal, Setting } from "obsidian"
import { noticeHandler } from './utils'

interface Options {
  [key: string]: string
}

// add link
export class AddLink extends Modal {
  linkName: string
  linkUrl: string

  onSubmit: (linkName: string, linkUrl: string) => void

  constructor(
    app: App,
    onSubmit: (linkName: string, linkUrl: string) => void
  ) {
    super(app)
    this.linkName = ''
    this.onSubmit = onSubmit
  }

  createAddLinkForm () {}

  createDeleteLinkForm () {}

  onOpen (): void {
    const { contentEl } = this

    contentEl.createEl("h1", { text: "Add Link", cls: "title" })

    new Setting(contentEl).setName("Link name").addText((text) => 
      text.setValue(this.linkName).setPlaceholder('name').onChange((value) => {
        this.linkName = value
      })
    )

    new Setting(contentEl).setName("Link url").addText((text) =>
      text.setValue(this.linkUrl).setPlaceholder('url').onChange((value) => {
        this.linkUrl = value
      })
    )

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText('Add')
        .setCta()
        .onClick(() => {
          const { linkName, linkUrl } = this
          if (!linkName) {
            noticeHandler('Link name is required!')
          } else if (!linkUrl) {
            noticeHandler('Link url is required!')
          } else {
            this.close()
            this.onSubmit(this.linkName, this.linkUrl)
          }
        })
    )
  }

  onClose(): void {
    this.contentEl.empty()
  }
}

// delete link
export class DeleteLink extends Modal {
  linkName: string
  options: Options

  onDelete: (linkName: string) => void

  constructor (
    app: App,
    options: Options,
    onDelete: (linkName: string) => void
  ) {
    super(app)
    this.onDelete = onDelete
    this.options = options
    this.linkName = Object.keys(options)[0] || ''
  }

  onOpen (): void {
    const { contentEl } = this

    contentEl.createEl("h1", { text: "Delete Link", cls: "title" })

    new Setting(contentEl).setName("Link name").addDropdown(dp => 
      dp.addOptions(this.options).onChange(value => {
        this.linkName = value
      })
    )

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText('Delete')
        .setCta()
        .onClick(() => {
          const { linkName } = this
          if (!linkName) {
            noticeHandler('Link name is required!')
          } else {
            this.close()
            this.onDelete(this.linkName)
          }
        })
    )
  }

  onClose(): void {
    this.contentEl.empty()
  }
}

// list all links
export class ListAllLinks extends Modal {
  options: Options

  constructor (
    app: App,
    options: Options
  ) {
    super(app)
    this.options = options
  }

  createListItem (container: Element, key: string, value: string, isLink = true) {
    const box = container.createEl("div", { cls: `list-item ${!isLink ? 'list-item-header' : ''}`})
    box.createEl("div", { text: key })
    const linkBox = box.createEl("div")
    if (isLink) {
      linkBox.createEl('a', { text: value, href: value})
    } else {
      linkBox.createSpan({ text: value })
    }
  }

  renderList (key = ''): Element {
    let options = this.options
    // filter options
    if (key) {
      options = Object.keys(options).reduce((obj: Options, item) => {
        if (item.includes(key)) obj = { ...obj, [item]: options[item] }
        return obj
      }, {})
    }
    const container = this.contentEl.createEl("div")
    this.createListItem(container, 'Name', 'Url', false)

    const listContainer = container.createEl('div', { cls: 'list-container'})
    const keys = Object.keys(options)
    if (keys.length) {
      keys.forEach(key => {
        this.createListItem(listContainer, key, options[key])
      })
    } else {
      listContainer.createEl('div', { text: 'No results!', cls: 'list-empty' })
    }

    return container
  }

  onOpen(): void {
    const { contentEl } = this

    contentEl.createEl("h1", { text: "All Links", cls: "title" })

    let contentBox: Element = null

    new Setting(contentEl).setName('Search').addSearch(el => {
      el.setPlaceholder('Input the link name...').onChange(val => {
        contentBox.empty()
        contentBox = this.renderList(val)
      })
    })

    contentBox = this.renderList()
  }

  onClose(): void {
    this.contentEl.empty()
  }
}