import LinkKeeper from './main'

import { App, PluginSettingTab, Setting } from 'obsidian'

export class LinkKeeperSettingTab extends PluginSettingTab {
  plugin: LinkKeeper

  constructor (app: App, plugin: LinkKeeper) {
    super (app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl)
      .setName("Link Filepath")
      .setDesc("The file where saves the links.")
      .addText((text) =>
        text
          .setPlaceholder("Enter the full filepath")
          .setValue(this.plugin.settings.filepath)
          .onChange(async (value) => {
            this.plugin.settings.filepath = value
            await this.plugin.saveSettings()
          })
      )
  }
}