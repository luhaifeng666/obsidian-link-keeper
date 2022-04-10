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

  onOpen(): void {
    const { contentEl } = this

    contentEl.createEl("h1", { text: "All Links", cls: "title" })
    
    const contentBox = contentEl.createEl("div")
    this.createListItem(contentBox, 'Name', 'Url', false)

    const listContainer = contentBox.createEl('div', { cls: 'list-container'})
    Object.keys(this.options).forEach(key => {
      this.createListItem(listContainer, key, this.options[key])
    })
  }

  onClose(): void {
    this.contentEl.empty()
  }
}